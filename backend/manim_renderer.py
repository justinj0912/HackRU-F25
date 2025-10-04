import os
import subprocess
import tempfile
import shutil
from typing import Optional, Tuple
from pathlib import Path
import time
from config import MANIM_OUTPUT_DIR, MAX_VIDEO_DURATION
# from moviepy.editor import VideoFileClip, AudioFileClip  # Removed - using ffmpeg directly

class ManimRenderer:
    def __init__(self):
        self.output_dir = Path(MANIM_OUTPUT_DIR)
        self.output_dir.mkdir(exist_ok=True)
        
    def render_animation(self, manim_code: str, scene_name: str = "Explanation") -> Tuple[str, float, int]:
        """
        Render Manim animation and return video path, duration, and file size
        """
        # Create temporary directory for this render
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Write Manim code to file
            script_path = temp_path / "animation.py"
            with open(script_path, 'w') as f:
                f.write(manim_code)
            
            try:
                # Run Manim command with Windows compatibility
                cmd = [
                    "manim",
                    str(script_path),
                    scene_name,
                    "--format", "mp4",
                    "--media_dir", str(self.output_dir),
                    "--quality", "l",  # Low quality for speed
                    "--disable_caching"  # Ensure fresh render
                ]
                
                # Windows-specific: Use shell=True if needed
                use_shell = os.name == 'nt'
                
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=MAX_VIDEO_DURATION + 60,  # Add buffer for processing
                    shell=use_shell  # Use shell on Windows
                )
                
                if result.returncode != 0:
                    error_msg = f"Manim rendering failed (exit code {result.returncode}):\n"
                    error_msg += f"STDOUT: {result.stdout}\n"
                    error_msg += f"STDERR: {result.stderr}"
                    raise Exception(error_msg)
                
                # Find the generated video file
                video_path = self._find_video_file(scene_name)
                if not video_path:
                    raise Exception("Video file not found after rendering")
                
                # Get video metadata
                duration = self._get_video_duration(video_path)
                file_size = video_path.stat().st_size
                
                return str(video_path), duration, file_size
                
            except subprocess.TimeoutExpired:
                raise Exception("Manim rendering timed out")
            except Exception as e:
                raise Exception(f"Failed to render animation: {str(e)}")
    
    def _find_video_file(self, scene_name: str) -> Optional[Path]:
        """Find the generated video file"""
        # Manim creates files in output/videos/script_name/quality/
        media_dir = self.output_dir / "videos" / "animation"
        
        if not media_dir.exists():
            return None
            
        # Look for the video file in different quality directories
        quality_dirs = ["480p15", "720p30", "1080p60"]
        
        for quality in quality_dirs:
            quality_dir = media_dir / quality
            if quality_dir.exists():
                for file in quality_dir.glob(f"{scene_name}.mp4"):
                    return file
                    
        return None
    
    def _get_video_duration(self, video_path: Path) -> float:
        """Get video duration using ffprobe"""
        try:
            cmd = [
                "ffprobe",
                "-v", "quiet",
                "-show_entries", "format=duration",
                "-of", "csv=p=0",
                str(video_path)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                return float(result.stdout.strip())
            else:
                # Fallback: estimate based on file size (rough approximation)
                return 30.0
                
        except Exception:
            return 30.0  # Default fallback
    
    def cleanup_old_videos(self, max_age_hours: int = 24):
        """Clean up old video files to save disk space"""
        try:
            media_dir = self.output_dir / "media"
            if not media_dir.exists():
                return
                
            cutoff_time = time.time() - (max_age_hours * 3600)
            
            for video_file in media_dir.rglob("*.mp4"):
                if video_file.stat().st_mtime < cutoff_time:
                    video_file.unlink()
                    
        except Exception as e:
            print(f"Warning: Failed to cleanup old videos: {e}")
    
    def extract_scene_name(self, code: str) -> str:
        """Extract the scene class name from Manim code"""
        import re
        match = re.search(r'class\s+(\w+)\s*\([^)]*Scene[^)]*\)', code)
        if match:
            return match.group(1)
        return "Explanation"  # Default fallback
    
    def validate_manim_code(self, code: str) -> Tuple[bool, str]:
        """Validate Manim code syntax before rendering"""
        try:
            # Basic syntax check
            compile(code, '<string>', 'exec')
            
            # Check for required imports
            if 'from manim import' not in code and 'import manim' not in code:
                return False, "Missing Manim import"
            
            # Check for Scene class
            if 'class' not in code or 'Scene' not in code:
                return False, "Missing Scene class definition"
            
            # Check for construct method
            if 'def construct' not in code:
                return False, "Missing construct method"
            
            return True, "Code is valid"
            
        except SyntaxError as e:
            return False, f"Syntax error: {str(e)}"
        except Exception as e:
            return False, f"Validation error: {str(e)}"

    def combine_video_audio(self, video_path: str, audio_path: str) -> str:
        """
        Combine video and audio files into a single video with audio using ffmpeg
        
        Args:
            video_path: Path to the video file
            audio_path: Path to the audio file
            
        Returns:
            Path to the combined video file
        """
        try:
            # Create output path
            video_path_obj = Path(video_path)
            output_path = video_path_obj.parent / f"{video_path_obj.stem}_with_audio{video_path_obj.suffix}"
            
            # Use ffmpeg to combine video and audio
            # -c:v copy: copy video stream without re-encoding
            # -c:a aac: encode audio as AAC
            # -map 0:v:0: map video from first input
            # -map 1:a:0: map audio from second input
            # -y: overwrite output file
            cmd = [
                'ffmpeg',
                '-i', video_path,
                '-i', audio_path,
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-map', '0:v:0',
                '-map', '1:a:0',
                '-y',
                str(output_path)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                # Replace original video with the one that has audio
                shutil.move(str(output_path), video_path)
                return video_path
            else:
                print(f"FFmpeg error: {result.stderr}")
                return video_path  # Return original video if combination fails
                
        except Exception as e:
            print(f"Error combining video and audio: {e}")
            return video_path  # Return original video if combination fails
