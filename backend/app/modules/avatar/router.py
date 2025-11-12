from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional, List, Dict
import asyncio
import base64

from .tts import tts_manager
from .lipsync import lipsync_manager

router = APIRouter(prefix="/api/avatar", tags=["avatar"])


class SpeakRequest(BaseModel):
    text: str
    return_audio: bool = True
    return_visemes: bool = True


class SpeakResponse(BaseModel):
    audio_base64: Optional[str] = None
    visemes: Optional[List[Dict]] = None
    duration: Optional[float] = None


@router.post("/speak", response_model=SpeakResponse)
async def speak(request: SpeakRequest):
    """
    Generate speech audio and lip sync data for text
    
    Returns audio as base64 and viseme sequence for animation
    """
    try:
        response_data = {}

        audio_base64: str = ""
        visemes_payload: List[Dict] = []

        if request.return_audio or request.return_visemes:
            # Generate audio bytes and get actual duration
            audio_bytes, actual_duration = tts_manager.text_to_speech_with_duration(request.text)
            audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

            if request.return_audio:
                response_data["audio_base64"] = audio_base64

            if request.return_visemes:
                # Use actual audio duration for accurate viseme timing
                visemes_payload = lipsync_manager.text_to_visemes(request.text, duration=actual_duration)
                response_data["visemes"] = visemes_payload
                response_data["duration"] = actual_duration

        return SpeakResponse(**response_data)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/speak-audio")
async def speak_audio(request: SpeakRequest):
    """
    Generate speech audio only and return as WAV file
    """
    try:
        audio_data = tts_manager.text_to_speech(request.text)
        
        return Response(
            content=audio_data,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=speech.mp3"
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.websocket("/stream")
async def websocket_avatar_stream(websocket: WebSocket):
    """
    WebSocket endpoint for streaming avatar speech and animation data
    """
    await websocket.accept()
    
    try:
        while True:
            # Receive text from client
            data = await websocket.receive_json()
            text = data.get("text", "")
            
            if not text:
                await websocket.send_json({"error": "No text provided"})
                continue
            
            # Generate viseme sequence
            word_count = len(text.split())
            estimated_duration = word_count * 0.4
            visemes = lipsync_manager.text_to_visemes(text, duration=estimated_duration)
            
            # Send viseme data
            await websocket.send_json({
                "type": "visemes",
                "data": visemes,
                "duration": estimated_duration
            })
            
            # Generate and send audio
            audio_base64 = tts_manager.text_to_speech_base64(text)
            await websocket.send_json({
                "type": "audio",
                "data": audio_base64
            })
            
            # Send completion signal
            await websocket.send_json({"type": "complete"})
    
    except WebSocketDisconnect:
        print("Avatar WebSocket disconnected")
    except Exception as e:
        await websocket.send_json({"error": str(e)})


@router.post("/visemes")
async def generate_visemes(text: str, duration: Optional[float] = None):
    """
    Generate viseme sequence for text
    """
    try:
        visemes = lipsync_manager.text_to_visemes(text, duration)
        
        return {
            "visemes": visemes,
            "viseme_count": len(visemes)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    status_info = tts_manager.get_status()
    return {
        "status": "healthy" if not status_info["error"] else "degraded",
        "tts_initialized": status_info["initialized"],
        "tts_provider": status_info["provider"],
        "voice_uuid": status_info["voice_uuid"],
        "device": tts_manager.device,
        "error": status_info["error"],
        "cache_size": status_info["cache_size"]
    }


