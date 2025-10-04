# AI Tutor Backend

Backend service for generating educational animations using Gemini AI and Manim.

## Features

- **Gemini AI Integration**: Converts user questions into Manim animation code
- **Manim Rendering**: Renders educational animations as MP4 videos
- **REST API**: FastAPI-based API for frontend integration
- **Error Handling**: Comprehensive error handling and validation
- **Video Management**: Automatic cleanup of old video files

## Setup

### Prerequisites

- Python 3.8+
- FFmpeg (for video processing)
- ManimCE

### Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install ManimCE:
```bash
pip install manim
```

3. Install FFmpeg:
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### Configuration

The API key is configured in `config.py`. For production, use environment variables.

### Running the Server

```bash
python main.py
```

The server will start on `http://localhost:8000`

## API Endpoints

### POST `/generate-code`
Generate Manim code from a question.

**Request:**
```json
{
    "question": "Explain the Pythagorean theorem",
    "subject": "mathematics",
    "difficulty": "beginner"
}
```

**Response:**
```json
{
    "code": "from manim import *\n\nclass Explanation(Scene):\n    def construct(self):\n        # Generated Manim code",
    "narration": "The Pythagorean theorem states that...",
    "estimated_duration": 30
}
```

### POST `/render-video`
Generate code and render video in one step.

**Request:**
```json
{
    "question": "Explain the Pythagorean theorem",
    "subject": "mathematics"
}
```

**Response:**
```json
{
    "video_url": "/videos/Explanation_1234567890.mp4",
    "duration": 25.5,
    "file_size": 2048576,
    "created_at": "2024-01-01T12:00:00"
}
```

### GET `/videos/{filename}`
Serve video files.

### POST `/validate-code`
Validate Manim code syntax.

### GET `/cleanup`
Trigger cleanup of old video files.

## Error Handling

The API includes comprehensive error handling for:
- Invalid Manim code syntax
- Rendering failures
- API timeouts
- File system errors

## Development

### Testing

Test the API using curl or a tool like Postman:

```bash
curl -X POST "http://localhost:8000/render-video" \
     -H "Content-Type: application/json" \
     -d '{"question": "Explain derivatives in calculus"}'
```

### Logging

The application logs important events and errors. Check the console output for debugging information.

## Production Considerations

- Configure CORS appropriately for your frontend domain
- Use environment variables for sensitive configuration
- Implement proper authentication and rate limiting
- Set up monitoring and logging
- Consider using a reverse proxy (nginx) for serving static files
- Implement proper backup strategies for generated content

