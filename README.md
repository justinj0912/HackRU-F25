# AI Tutor Website - HackRU F25

This is an AI-powered tutoring system that converts text questions into animated explanations with voice narration. The system features a Python backend (FastAPI) for LLM integration (Gemini API) to generate Manim code, render animations, and return video URLs. It also includes voice integration using ElevenLabs to add narration to the animations. The frontend is a React application with a simple UI for asking questions, displaying videos, and providing feedback.

## Features

- **AI Video Generation**: Convert text questions into animated explanations using Manim and Gemini 2.0 Flash
- **Interactive Whiteboard**: Draw equations and diagrams with AI analysis
- **Whiteboard-to-Chat Integration**: Send drawings to chat for AI explanation
- **ELI5 Tutor Responses**: Explain Like I'm 5 responses for non-video mode
- **Responsive Frontend**: React application with multiple themes
- **Real-time Chat**: Chat interface with video playback
- **Comprehensive Error Handling**: Graceful degradation and user feedback

## Technical Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: FastAPI, Python, ManimCE, Gemini 2.0 Flash
- **Video**: Manim animations with MP4 output
- **AI**: Google Gemini for code generation and image analysis

## Running the Application

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python3 main.py
```

### Frontend Setup
```bash
npm install
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Usage

1. **Video Mode**: Toggle video mode on to generate animated explanations for topics
2. **Tutor Mode**: Toggle video mode off for ELI5 text responses
3. **Whiteboard**: Draw equations or diagrams and send to chat for AI analysis
4. **Chat Interface**: Ask questions and receive responses with embedded videos

## Project Structure

```
├── backend/           # FastAPI backend
│   ├── main.py       # Main application
│   ├── gemini_client.py  # Gemini API integration
│   ├── manim_renderer.py # Manim video rendering
│   └── models.py     # Pydantic models
├── src/              # React frontend
│   ├── components/   # React components
│   └── styles/       # CSS styles
└── README.md
```

## Contributing

This project was developed for HackRU F25. Feel free to contribute and improve the AI tutoring experience!
