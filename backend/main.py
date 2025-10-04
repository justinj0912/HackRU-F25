from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
from datetime import datetime
import os
from pathlib import Path

from models import QuestionRequest, VideoResponse, ErrorResponse, ManimCodeResponse, ImageAnalysisRequest, ImageAnalysisResponse
from gemini_client import GeminiClient
from manim_renderer import ManimRenderer
from config import HOST, PORT, DEBUG

app = FastAPI(
    title="AI Tutor Backend",
    description="Backend for AI-powered educational animations",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize clients
gemini_client = GeminiClient()
manim_renderer = ManimRenderer()

# Mount static files for serving videos
output_dir = Path("output")
output_dir.mkdir(exist_ok=True)
app.mount("/videos", StaticFiles(directory=str(output_dir)), name="videos")

@app.get("/")
async def root():
    return {"message": "AI Tutor Backend is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/generate-code", response_model=ManimCodeResponse)
async def generate_manim_code(request: QuestionRequest):
    """
    Generate Manim code and narration from a user question
    """
    try:
        response = gemini_client.generate_manim_code(
            question=request.question,
            subject=request.subject
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/render-video", response_model=VideoResponse)
async def render_video(request: QuestionRequest, background_tasks: BackgroundTasks):
    """
    Generate Manim code and render video in one step
    """
    try:
        # Generate Manim code
        code_response = gemini_client.generate_manim_code(
            question=request.question,
            subject=request.subject
        )
        
        # Validate code before rendering
        is_valid, error_msg = manim_renderer.validate_manim_code(code_response.code)
        if not is_valid:
            raise HTTPException(status_code=400, detail=f"Invalid Manim code: {error_msg}")
        
        # Extract scene name from code
        scene_name = manim_renderer.extract_scene_name(code_response.code)
        
        # Render animation
        video_path, duration, file_size = manim_renderer.render_animation(
            manim_code=code_response.code,
            scene_name=scene_name
        )
        
        # Generate video URL - use relative path from output directory
        video_path_obj = Path(video_path)
        video_relative_path = video_path_obj.relative_to(manim_renderer.output_dir)
        video_url = f"/videos/{video_relative_path}"
        
        # Schedule cleanup task
        background_tasks.add_task(manim_renderer.cleanup_old_videos)
        
        return VideoResponse(
            video_url=video_url,
            duration=duration,
            file_size=file_size,
            created_at=datetime.now()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to render video: {str(e)}")

@app.get("/videos/{file_path:path}")
async def serve_video(file_path: str):
    """
    Serve video files from the output directory
    """
    video_path = manim_renderer.output_dir / file_path
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")
    
    return FileResponse(
        path=str(video_path),
        media_type="video/mp4",
        filename=Path(file_path).name
    )

@app.post("/tutor-response")
async def tutor_response(request: QuestionRequest):
    """
    Generate AI tutor response with ELI5 approach
    """
    try:
        response = gemini_client.generate_tutor_response(
            question=request.question,
            subject=request.subject,
            style="ELI5"
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate tutor response: {e}")

@app.post("/validate-code")
async def validate_code(request: dict):
    """
    Validate Manim code syntax
    """
    try:
        code = request.get("code", "")
        is_valid, message = manim_renderer.validate_manim_code(code)
        return {
            "is_valid": is_valid,
            "message": message
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_image(request: ImageAnalysisRequest):
    """
    Analyze an image (equation, diagram, etc.) and return AI explanation
    """
    try:
        result = gemini_client.analyze_image(request.image_data, request.question)
        return ImageAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cleanup")
async def cleanup_videos(background_tasks: BackgroundTasks):
    """
    Manually trigger video cleanup
    """
    background_tasks.add_task(manim_renderer.cleanup_old_videos)
    return {"message": "Cleanup task scheduled"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=DEBUG
    )
