from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
from datetime import datetime
import os
from pathlib import Path

from models import QuestionRequest, VideoResponse, ErrorResponse, ManimCodeResponse, ImageAnalysisRequest, ImageAnalysisResponse, TextToSpeechRequest, TextToSpeechResponse, MindMapRequest, MindMapResponse
from gemini_client import GeminiClient
from manim_renderer import ManimRenderer
from elevenlabs_client import elevenlabs_client
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
        # Generate Manim code and narration
        manim_code, narration = gemini_client.generate_manim_code_with_narration(request.question)
        
        # Validate code before rendering
        is_valid, error_msg = manim_renderer.validate_manim_code(manim_code)
        if not is_valid:
            raise HTTPException(status_code=400, detail=f"Invalid Manim code: {error_msg}")
        
        # Extract scene name from code
        scene_name = manim_renderer.extract_scene_name(manim_code)
        
        # Generate narration audio (only if narration is substantial)
        narration_audio_path = None
        if elevenlabs_client.should_generate_audio(narration):
            narration_audio_path = elevenlabs_client.generate_speech(narration)
        
        # Render animation
        video_path, duration, file_size = manim_renderer.render_animation(
            manim_code=manim_code,
            scene_name=scene_name
        )
        
        # Combine video with narration audio
        if narration_audio_path and Path(narration_audio_path).exists():
            video_path = manim_renderer.combine_video_audio(video_path, narration_audio_path)
        
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
            created_at=datetime.now(),
            narration_audio_url=None  # Audio is now embedded in video
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
    Generate AI tutor response with friendly, simple explanations
    """
    try:
        response = gemini_client.generate_tutor_response(
            question=request.question,
            subject=request.subject
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

@app.post("/render-video-from-image", response_model=VideoResponse)
async def render_video_from_image(request: ImageAnalysisRequest):
    """Generate and render a Manim video from an image"""
    try:
        # Validate and clean image data
        if not request.image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        # Clean base64 data
        image_data = request.image_data
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Add padding if needed
        missing_padding = len(image_data) % 4
        if missing_padding:
            image_data += '=' * (4 - missing_padding)
        
        # Generate Manim code and narration
        manim_code, narration = gemini_client.generate_manim_code_with_narration_from_image(image_data, request.question)
        scene_name = manim_renderer.extract_scene_name(manim_code)
        
        # Render video first
        video_path_str, duration, file_size = manim_renderer.render_animation(manim_code, scene_name)
        
        # Always generate audio and combine with video
        try:
            print(f"Generating audio for: {narration}")
            audio_path = elevenlabs_client.generate_speech(narration)
            
            if Path(audio_path).exists():
                print(f"Audio generated: {audio_path}")
                # Combine video and audio
                final_video_path = manim_renderer.combine_video_audio(video_path_str, audio_path)
                video_path_str = final_video_path
                print(f"Video with audio: {video_path_str}")
            else:
                print("Audio file not found, using video without audio")
                
        except Exception as e:
            print(f"Audio generation failed: {e}, using video without audio")
        
        return VideoResponse(
            video_url=f"/videos/{Path(video_path_str).relative_to(manim_renderer.output_dir)}",
            duration=duration,
            file_size=file_size,
            created_at=datetime.now(),
            narration_audio_url=None
        )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video generation failed: {str(e)}")

@app.post("/text-to-speech", response_model=TextToSpeechResponse)
async def text_to_speech(request: TextToSpeechRequest):
    """
    Convert text to speech using ElevenLabs
    """
    try:
        # Check if audio should be generated
        if not elevenlabs_client.should_generate_audio(request.text):
            raise HTTPException(status_code=400, detail="Text too short for audio generation")
        
        # Generate audio file
        audio_path = elevenlabs_client.generate_speech(request.text, request.voice_id)
        
        # Create URL for the audio file
        audio_url = f"/audio/{Path(audio_path).name}"
        
        return TextToSpeechResponse(
            audio_url=audio_url,
            duration=None  # Could be calculated if needed
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate speech: {e}")

@app.get("/audio/{filename}")
async def serve_audio(filename: str):
    """
    Serve audio files
    """
    audio_path = Path("output/audio") / filename
    if audio_path.exists():
        return FileResponse(audio_path, media_type="audio/mpeg")
    else:
        raise HTTPException(status_code=404, detail="Audio file not found")

@app.get("/cleanup")
async def cleanup_videos(background_tasks: BackgroundTasks):
    """
    Manually trigger video cleanup
    """
    background_tasks.add_task(manim_renderer.cleanup_old_videos)
    return {"message": "Cleanup task scheduled"}

@app.post("/generate-mind-map", response_model=MindMapResponse)
async def generate_mind_map(request: MindMapRequest):
    """
    Generate a mind map structure for a given topic
    """
    try:
        # Generate mind map nodes using Gemini
        nodes = gemini_client.generate_mind_map(
            topic=request.topic,
            depth=request.depth,
            max_branches=request.max_branches
        )
        
        return MindMapResponse(
            nodes=nodes,
            topic=request.topic,
            created_at=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate mind map: {str(e)}"
        )

@app.post("/generate-subtopics")
async def generate_subtopics(request: dict):
    """Generate 2-4 related subtopic titles for a given topic"""
    try:
        topic = request.get("topic", "")
        if not topic:
            raise HTTPException(status_code=400, detail="Topic is required")
        
        subtopics = gemini_client.generate_subtopics(topic)
        
        return {
            "subtopics": subtopics,
            "topic": topic,
            "created_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate subtopics: {str(e)}")

@app.post("/generate-summary")
async def generate_summary(request: dict):
    """Generate a 2-3 sentence summary for a given title"""
    try:
        title = request.get("title", "")
        if not title:
            raise HTTPException(status_code=400, detail="Title is required")
        
        summary = gemini_client.generate_summary(title)
        
        return {
            "summary": summary,
            "title": title,
            "created_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=DEBUG
    )
