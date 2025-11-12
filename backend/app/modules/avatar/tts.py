import base64
import hashlib
import os
import tempfile
import time
from typing import Dict, Optional, Tuple

import requests
from resemble import Resemble

from ..shared.config import settings

# Try to import mutagen for MP3 duration, fallback to estimation
try:
    from mutagen.mp3 import MP3
    HAS_MUTAGEN = True
except ImportError:
    HAS_MUTAGEN = False


class TTSManager:
    """Text-to-Speech manager using Resemble.ai SDK (non-streaming)."""

    def __init__(self) -> None:
        self.api_key: Optional[str] = None
        self.device: str = "cpu"
        self._cache: Dict[str, bytes] = {}
        self._cache_dir = tempfile.mkdtemp(prefix="tts_cache_")

        # Resemble.ai configuration
        self.project_uuid: str = "9d6b821e"  # Default project
        self.voice_uuid: str = "68b8d08b"  # User-provided voice

        self.api_error: Optional[str] = None
        self._initialize_tts()

    def _initialize_tts(self) -> None:
        try:
            api_key = settings.resemble_api_key
            if not api_key:
                raise ValueError("Resemble.ai API key not configured in settings.")

            self.api_key = api_key.strip()
            Resemble.api_key(self.api_key)

            print("✅ TTS initialized with Resemble.ai SDK")
            print(f"🎤 Voice UUID: {self.voice_uuid}")
            print(f"📦 Project UUID: {self.project_uuid}")
        except Exception as exc:
            self.api_error = str(exc)
            print(f"❌ Error initializing Resemble.ai TTS: {exc}")

    def _cache_key(self, text: str) -> str:
        return hashlib.md5(f"{self.voice_uuid}:{text}".encode("utf-8")).hexdigest()

    def _get_cached_audio(self, text: str) -> Optional[bytes]:
        key = self._cache_key(text)
        if key in self._cache:
            return self._cache[key]

        cache_path = os.path.join(self._cache_dir, f"{key}.mp3")
        if os.path.exists(cache_path):
            with open(cache_path, "rb") as fh:
                audio_data = fh.read()
            self._cache[key] = audio_data
            return audio_data
        return None

    def _store_cache(self, text: str, audio: bytes) -> None:
        key = self._cache_key(text)
        if len(self._cache) < 50:
            self._cache[key] = audio

        cache_path = os.path.join(self._cache_dir, f"{key}.mp3")
        try:
            with open(cache_path, "wb") as fh:
                fh.write(audio)
        except Exception as exc:
            print(f"⚠️  Failed to persist cache: {exc}")

    def _get_audio_duration(self, audio_bytes: bytes) -> float:
        """Get audio duration from MP3 bytes"""
        if not HAS_MUTAGEN:
            # Fallback: estimate based on file size (rough: ~16kbps average)
            # This is very rough, but better than nothing
            estimated_duration = len(audio_bytes) / 2000.0  # ~2KB per second
            return max(estimated_duration, 0.5)
        
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name
            
            try:
                audio_file = MP3(tmp_path)
                duration = audio_file.info.length
                return float(duration)
            finally:
                try:
                    os.unlink(tmp_path)
                except:
                    pass
        except Exception as e:
            print(f"⚠️  Could not get audio duration: {e}")
            # Fallback estimation
            estimated_duration = len(audio_bytes) / 2000.0
            return max(estimated_duration, 0.5)

    def text_to_speech(self, text: str, output_path: Optional[str] = None) -> bytes:
        if not self.api_key:
            raise ValueError(f"Resemble.ai TTS Error: {self.api_error or 'TTS not initialized'}")

        if not self.voice_uuid:
            raise ValueError("Resemble.ai TTS Error: Voice UUID not configured.")

        normalized_text = text.strip()
        if len(normalized_text) > 1000:
            normalized_text = normalized_text[:1000] + "..."

        cached = self._get_cached_audio(normalized_text)
        if cached:
            if output_path:
                with open(output_path, "wb") as fh:
                    fh.write(cached)
            return cached

        try:
            print("🎙️  Generating speech with Resemble.ai (non-streaming)...")
            print(f"📝 Text: {normalized_text[:60]}{'...' if len(normalized_text) > 60 else ''}")

            response = Resemble.v2.clips.create_sync(
                self.project_uuid,
                self.voice_uuid,
                normalized_text,
            )

            audio_url: Optional[str] = None
            if isinstance(response, dict):
                audio_url = response.get("item", {}).get("audio_src")
            elif hasattr(response, "item"):
                audio_url = getattr(response.item, "audio_src", None)

            if not audio_url:
                raise RuntimeError(f"No audio URL returned from Resemble.ai: {response}")

            audio_response = requests.get(audio_url, timeout=30)
            audio_response.raise_for_status()

            audio_data = audio_response.content
            if len(audio_data) < 100:
                raise RuntimeError("Received audio payload is too small.")

            self._store_cache(normalized_text, audio_data)

            if output_path:
                with open(output_path, "wb") as fh:
                    fh.write(audio_data)

            print(f"✅ Generated {len(audio_data)} bytes of audio using Resemble.ai")
            return audio_data

        except Exception as exc:
            message = str(exc)
            print(f"❌ Error generating speech: {message}")

            lowered = message.lower()
            if "401" in lowered or "unauthorized" in lowered:
                raise ValueError("Resemble.ai API Error: Invalid API key") from exc
            if "404" in lowered or "not found" in lowered:
                raise ValueError("Resemble.ai API Error: Project or voice not found") from exc
            if "429" in lowered:
                raise ValueError("Resemble.ai API Error: Rate limit exceeded") from exc
            if "syn_server_url" in lowered:
                raise ValueError("Resemble.ai Streaming API requires special access.") from exc

            raise RuntimeError(f"Resemble.ai TTS Error: {message}") from exc

    def text_to_speech_with_duration(self, text: str) -> Tuple[bytes, float]:
        """Generate speech and return audio bytes with actual duration"""
        audio_bytes = self.text_to_speech(text)
        duration = self._get_audio_duration(audio_bytes)
        return audio_bytes, duration

    def text_to_speech_base64(self, text: str) -> str:
        audio = self.text_to_speech(text)
        return base64.b64encode(audio).decode("utf-8")

    def text_to_speech_with_audio_only(self, text: str) -> bytes:
        return self.text_to_speech(text)

    async def stream_speech(self, text: str):
        yield self.text_to_speech(text)

    def get_status(self) -> Dict[str, object]:
        return {
            "initialized": self.api_key is not None,
            "voice_uuid": self.voice_uuid,
            "project_uuid": self.project_uuid,
            "error": self.api_error,
            "cache_size": len(self._cache),
            "provider": "Resemble.ai",
        }

    def clear_cache(self) -> None:
        self._cache.clear()
        if os.path.exists(self._cache_dir):
            for filename in os.listdir(self._cache_dir):
                try:
                    os.unlink(os.path.join(self._cache_dir, filename))
                except OSError:
                    pass
        print("🧹 TTS cache cleared.")

    def __del__(self) -> None:
        try:
            if os.path.exists(self._cache_dir):
                import shutil

                shutil.rmtree(self._cache_dir, ignore_errors=True)
        except Exception:
            pass


tts_manager = TTSManager()

