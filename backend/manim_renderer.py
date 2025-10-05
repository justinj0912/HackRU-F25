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
        # Ensure output directory exists and is writable
        try:
            self.output_dir.mkdir(parents=True, exist_ok=True)
            # Test write permissions
            test_file = self.output_dir / "test_write.tmp"
            test_file.touch()
            test_file.unlink()
        except Exception as e:
            raise Exception(f"Cannot create or write to output directory {self.output_dir}: {e}")
        
    def render_animation(self, manim_code: str, scene_name: str = "Explanation") -> Tuple[str, float, int]:
        """
        Render Manim animation and return video path, duration, and file size
        """
        # Create temporary directory for this render
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Update code with unique scene name
            updated_code = self._update_scene_name_in_code(manim_code, scene_name)
            
            # Write Manim code to file
            script_path = temp_path / "animation.py"
            with open(script_path, 'w') as f:
                f.write(updated_code)
            
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
                
                # On Windows, ensure we use the correct command format
                if use_shell:
                    # Join command for Windows shell
                    cmd_str = ' '.join(f'"{arg}"' if ' ' in arg else arg for arg in cmd)
                    result = subprocess.run(
                        cmd_str,
                        capture_output=True,
                        text=True,
                        timeout=MAX_VIDEO_DURATION + 60,
                        shell=True
                    )
                else:
                    result = subprocess.run(
                        cmd,
                        capture_output=True,
                        text=True,
                        timeout=MAX_VIDEO_DURATION + 60,
                        shell=False
                    )
                
                if result.returncode != 0:
                    error_msg = f"Manim rendering failed (exit code {result.returncode}):\n"
                    error_msg += f"STDOUT: {result.stdout}\n"
                    error_msg += f"STDERR: {result.stderr}\n"
                    error_msg += f"Platform: {os.name}\n"
                    error_msg += f"Command: {' '.join(cmd)}\n"
                    
                    # Windows-specific troubleshooting hints
                    if os.name == 'nt':
                        error_msg += "\nWindows troubleshooting:\n"
                        error_msg += "- Make sure FFmpeg is installed and in PATH\n"
                        error_msg += "- Install LaTeX (MiKTeX recommended)\n"
                        error_msg += "- Check if antivirus is blocking subprocess calls\n"
                        error_msg += "- Try running as administrator if permission issues\n"
                    
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
        """Extract the scene class name from Manim code and make it unique"""
        import re
        import time
        
        match = re.search(r'class\s+(\w+)\s*\([^)]*Scene[^)]*\)', code)
        if match:
            base_name = match.group(1)
            # Add timestamp to make it unique
            unique_name = f"{base_name}_{int(time.time() * 1000)}"
            return unique_name
        return f"Explanation_{int(time.time() * 1000)}"  # Default fallback with timestamp
    
    def _update_scene_name_in_code(self, code: str, new_scene_name: str) -> str:
        """Update the scene class name in the code"""
        import re
        # Replace the class name with the unique one
        pattern = r'class\s+(\w+)\s*\([^)]*Scene[^)]*\)'
        replacement = f'class {new_scene_name}(Scene)'
        return re.sub(pattern, replacement, code)
    
    def validate_manim_code(self, code: str) -> Tuple[bool, str]:
        """Validate Manim code syntax before rendering"""
        try:
            compile(code, '<string>', 'exec')
            return True, "Code is valid"
        except SyntaxError as e:
            return False, f"Syntax error: {str(e)}"
        except Exception as e:
            return False, f"Validation error: {str(e)}"

    def combine_video_audio(self, video_path: str, audio_path: str) -> str:
        """
        Combine video and audio files into a single video with audio using ffmpeg
        If audio is longer than video, pause on the last frame until audio ends
        
        Args:
            video_path: Path to the video file
            audio_path: Path to the audio file
            
        Returns:
            Path to the combined video file
        """
        try:
            # Get durations
            video_duration = self._get_video_duration(Path(video_path))
            audio_duration = self._get_audio_duration(Path(audio_path))
            
            print(f"Video duration: {video_duration}s, Audio duration: {audio_duration}s")
            
            # Create output path
            video_path_obj = Path(video_path)
            output_path = video_path_obj.parent / f"{video_path_obj.stem}_with_audio{video_path_obj.suffix}"
            
            if audio_duration > video_duration:
                # Audio is longer - extend video by pausing on last frame
                cmd = [
                    'ffmpeg',
                    '-i', video_path,
                    '-i', audio_path,
                    '-c:v', 'libx264',
                    '-c:a', 'aac',
                    '-filter_complex', f'[0:v]tpad=stop_mode=clone:stop_duration={audio_duration - video_duration}[v]',
                    '-map', '[v]',
                    '-map', '1:a',
                    '-y',
                    str(output_path)
                ]
            else:
                # Video is longer or equal - use shortest
                cmd = [
                    'ffmpeg',
                    '-i', video_path,
                    '-i', audio_path,
                    '-c:v', 'copy',
                    '-c:a', 'aac',
                    '-shortest',
                    '-y',
                    str(output_path)
                ]
            
            print(f"Combining video and audio: {video_path} + {audio_path}")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0 and output_path.exists():
                print(f"Successfully combined video and audio")
                # Replace original video with the one that has audio
                shutil.move(str(output_path), video_path)
                return video_path
            else:
                print(f"FFmpeg failed: {result.stderr}")
                return video_path  # Return original video if combination fails
                
        except Exception as e:
            print(f"Error combining video and audio: {e}")
            return video_path  # Return original video if combination fails
    
    def _get_audio_duration(self, audio_path: Path) -> float:
        """Get audio duration using ffprobe"""
        try:
            cmd = [
                "ffprobe",
                "-v", "quiet",
                "-show_entries", "format=duration",
                "-of", "csv=p=0",
                str(audio_path)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                return float(result.stdout.strip())
            else:
                return 5.0  # Default fallback
                
        except Exception:
            return 5.0  # Default fallback
