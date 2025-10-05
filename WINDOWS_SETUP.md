# Windows Setup Guide for Cognify

This guide helps you set up the Cognify AI Tutor application on Windows with full Manim video generation support.

## Prerequisites

### 1. Python 3.8+
- Download from [python.org](https://www.python.org/downloads/)
- **Important**: Check "Add Python to PATH" during installation
- Verify installation: `python --version`

### 2. Node.js 18+
- Download from [nodejs.org](https://nodejs.org/)
- Verify installation: `node --version`

## Backend Dependencies

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Install FFmpeg
**Option A: Using Chocolatey (Recommended)**
```bash
# Install Chocolatey first: https://chocolatey.org/install
choco install ffmpeg
```

**Option B: Manual Installation**
1. Download FFmpeg from [ffmpeg.org](https://ffmpeg.org/download.html)
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your PATH environment variable

**Verify FFmpeg:**
```bash
ffmpeg -version
```

### 3. Install LaTeX (Optional but Recommended)
**MiKTeX (Recommended for Windows)**
1. Download from [miktex.org](https://miktex.org/download)
2. Install with default settings
3. Let MiKTeX install packages automatically when prompted

**Verify LaTeX:**
```bash
pdflatex --version
```

## Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Testing the Setup

### 1. Run Windows Setup Check
```bash
cd backend
python windows_setup.py
```

This script will verify all dependencies and test Manim rendering.

### 2. Start the Backend
```bash
cd backend
python main.py
```

### 3. Start the Frontend
```bash
npm run dev
```

## Common Windows Issues & Solutions

### Issue: "FFmpeg not found"
**Solution:**
- Ensure FFmpeg is in your PATH
- Restart your terminal/command prompt
- Try running as administrator

### Issue: "Permission denied" errors
**Solution:**
- Run command prompt as administrator
- Check antivirus settings (may block subprocess calls)
- Ensure output directory is writable

### Issue: "LaTeX not found"
**Solution:**
- Install MiKTeX or TeX Live
- Allow MiKTeX to install packages automatically
- Restart after installation

### Issue: Antivirus blocking subprocess
**Solution:**
- Add Python and the project folder to antivirus exclusions
- Temporarily disable real-time protection for testing

### Issue: Long path errors
**Solution:**
- Enable long path support in Windows 10/11
- Or move project to a shorter path (e.g., `C:\dev\cognify`)

## Environment Variables

Create a `.env` file in the backend directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

## Verification

Once everything is set up:

1. ✅ Python dependencies installed
2. ✅ FFmpeg accessible via command line
3. ✅ LaTeX installed (optional)
4. ✅ Backend starts without errors
5. ✅ Frontend loads at http://localhost:3000
6. ✅ Mind map generation works
7. ✅ Video generation works (test with simple equation)

## Getting Help

If you encounter issues:

1. Run `python backend/windows_setup.py` for diagnostics
2. Check the console output for detailed error messages
3. Ensure all dependencies are properly installed
4. Try running as administrator
5. Check Windows Event Viewer for system errors

## Performance Tips

- Use SSD storage for better performance
- Close unnecessary applications during video generation
- Consider using WSL2 if you prefer Linux-like environment
- Increase virtual memory if you encounter out-of-memory errors
