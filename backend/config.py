import os
from dotenv import load_dotenv

load_dotenv()

# Gemini API Configuration
GEMINI_API_KEY = "AIzaSyAUjVQ5_y8R7tynxqe9DBV9WqMLwmaAOZE"

# Manim Configuration
MANIM_OUTPUT_DIR = os.getenv("MANIM_OUTPUT_DIR", "./output")
MAX_VIDEO_DURATION = int(os.getenv("MAX_VIDEO_DURATION", "300"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))

# Server Configuration
HOST = "0.0.0.0"
PORT = 8000
DEBUG = True

