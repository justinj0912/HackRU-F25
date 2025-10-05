import os
import tempfile
import hashlib
import json
from pathlib import Path
from elevenlabs import generate, save, set_api_key
from config import ELEVENLABS_API_KEY
from difflib import SequenceMatcher

class ElevenLabsClient:
    def __init__(self):
        """Initialize ElevenLabs client"""
        set_api_key(ELEVENLABS_API_KEY)
        self.output_dir = Path("output/audio")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.cache = {}  # Simple in-memory cache
        self.similarity_cache = {}  # Cache for similar texts
        self.cache_file = self.output_dir / "cache.json"
        self.load_cache()
    
    def load_cache(self):
        """Load cache from disk"""
        try:
            if self.cache_file.exists():
                with open(self.cache_file, 'r') as f:
                    data = json.load(f)
                    self.cache = data.get('cache', {})
                    self.similarity_cache = data.get('similarity_cache', {})
        except Exception:
            self.cache = {}
            self.similarity_cache = {}
    
    def save_cache(self):
        """Save cache to disk"""
        try:
            data = {
                'cache': self.cache,
                'similarity_cache': self.similarity_cache
            }
            with open(self.cache_file, 'w') as f:
                json.dump(data, f)
        except Exception:
            pass
    
    def find_similar_text(self, text: str, threshold: float = 0.8) -> str:
        """Find similar text in cache to reuse audio"""
        for cached_text, audio_path in self.similarity_cache.items():
            similarity = SequenceMatcher(None, text.lower(), cached_text.lower()).ratio()
            if similarity >= threshold and Path(audio_path).exists():
                return audio_path
        return None
    
    def generate_speech(self, text: str, voice_id: str = "21m00Tcm4TlvDq8ikWAM") -> str:
        """
        Generate speech from text using ElevenLabs with caching
        
        Args:
            text: Text to convert to speech
            voice_id: ElevenLabs voice ID (default: Rachel voice)
            
        Returns:
            Path to the generated audio file
        """
        try:
            # Create filename based on text hash
            text_hash = hashlib.md5(text.encode()).hexdigest()[:8]
            filename = f"speech_{text_hash}.mp3"
            output_path = self.output_dir / filename
            
            # Check if file already exists
            if output_path.exists():
                return str(output_path)
            
            # Generate audio using ElevenLabs
            audio = generate(
                text=text,
                voice=voice_id,
                model="eleven_turbo_v2"  # Faster, cheaper model
            )
            
            # Save to output directory
            save(audio, str(output_path))
            
            return str(output_path)
                
        except Exception as e:
            raise Exception(f"Failed to generate speech: {e}")
    
    def generate_speech_to_file(self, text: str, filename: str, voice_id: str = "21m00Tcm4TlvDq8ikWAM") -> str:
        try:
            # Check for similar text first
            similar_path = self.find_similar_text(text)
            if similar_path:
                # Copy similar audio to new filename
                output_path = self.output_dir / filename
                import shutil
                shutil.copy2(similar_path, output_path)
                return str(output_path)
            
            # Generate audio (use faster model)
            audio = generate(
                text=text,
                voice=voice_id,
                model="eleven_turbo_v2"  # Faster, cheaper model
            )
            
            # Save to output directory
            output_path = self.output_dir / filename
            save(audio, str(output_path))
            return str(output_path)
            
        except Exception as e:
            raise Exception(f"Failed to generate speech: {e}")
    
    def get_available_voices(self):
        """
        Get list of available voices
        """
        try:
            from elevenlabs import voices
            return voices()
        except Exception as e:
            raise Exception(f"Failed to get voices: {e}")
    
    def should_generate_audio(self, text: str) -> bool:
        """
        Determine if audio should be generated based on text length and content
        """
        # Skip audio for very short texts
        if len(text.strip()) < 3:
            return False
        
        # Skip audio for common short phrases
        short_phrases = [
            "ok", "yes", "no", "hi", "hello", "thanks", "thank you",
            "sure", "okay", "alright", "got it", "understood"
        ]
        
        if text.lower().strip() in short_phrases:
            return False
        
        return True

# Global instance
elevenlabs_client = ElevenLabsClient()
