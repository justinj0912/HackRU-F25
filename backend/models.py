from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class QuestionRequest(BaseModel):
    question: str
    subject: Optional[str] = None
    difficulty: Optional[str] = "beginner"

class ManimCodeResponse(BaseModel):
    code: str
    narration: str
    estimated_duration: Optional[int] = None

class VideoGenerationRequest(BaseModel):
    question: str
    manim_code: str
    narration: Optional[str] = None

class VideoResponse(BaseModel):
    video_url: str
    duration: float
    file_size: int
    created_at: datetime
    scene_metadata: Optional[List[dict]] = None
    narration_audio_url: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None
    error_code: Optional[str] = None

class SceneMetadata(BaseModel):
    scene_id: str
    start_time: float
    end_time: float
    description: str
    manim_scene_name: str

class ImageAnalysisRequest(BaseModel):
    image_data: str  # Base64 encoded image
    question: Optional[str] = None

class ImageAnalysisResponse(BaseModel):
    analysis: str
    equation: Optional[str] = None
    solution: Optional[str] = None
    explanation: str

class TextToSpeechRequest(BaseModel):
    text: str
    voice_id: Optional[str] = "21m00Tcm4TlvDq8ikWAM"  # Default to Rachel voice

class TextToSpeechResponse(BaseModel):
    audio_url: str
    duration: Optional[float] = None

