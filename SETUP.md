# Environment Setup Instructions

## API Keys Configuration

To run this application, you need to set up your API keys as environment variables.

### Option 1: Using .env file (Recommended)

1. Create a `.env` file in the `backend/` directory:
```bash
cd backend
cp env_template.py .env
```

2. Edit the `.env` file and replace the placeholder values with your actual API keys:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key_here
MANIM_OUTPUT_DIR=./output
MAX_VIDEO_DURATION=300
MAX_RETRIES=3
```

### Option 2: Using system environment variables

Set the environment variables in your shell:

**Linux/Mac:**
```bash
export GEMINI_API_KEY="your_actual_gemini_api_key_here"
export ELEVENLABS_API_KEY="your_actual_elevenlabs_api_key_here"
```

**Windows:**
```cmd
set GEMINI_API_KEY=your_actual_gemini_api_key_here
set ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key_here
```

### Getting API Keys

1. **Gemini API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key and set it as `GEMINI_API_KEY`

2. **ElevenLabs API Key:**
   - Go to [ElevenLabs](https://elevenlabs.io/)
   - Sign up/login and go to your profile
   - Copy your API key and set it as `ELEVENLABS_API_KEY`

## Running the Application

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
npm install
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Security Notes

- Never commit your `.env` file to version control
- The `.gitignore` file is configured to exclude `.env` files
- Keep your API keys secure and don't share them publicly
