import os
from dotenv import load_dotenv

load_dotenv()

# Gemini API Configuration
GEMINI_API_KEY = "AIzaSyAUjVQ5_y8R7tynxqe9DBV9WqMLwmaAOZE"

# ElevenLabs API Configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "your_elevenlabs_api_key_here")

# Manim Configuration
MANIM_OUTPUT_DIR = os.getenv("MANIM_OUTPUT_DIR", "./output")
MAX_VIDEO_DURATION = int(os.getenv("MAX_VIDEO_DURATION", "300"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))

# Server Configuration
HOST = "0.0.0.0"
PORT = 8000
DEBUG = True

