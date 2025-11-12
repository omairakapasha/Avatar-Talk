# Backend - AI Avatar Chatbot API

FastAPI backend with modular architecture for RAG chatbot and avatar TTS/lip-sync.

## Modules

### 1. Chatbot Module (`app/modules/chatbot/`)
- **Purpose**: RAG-powered Q&A system with multiple LLM support
- **Features**:
  - Document upload and processing (PDF, TXT)
  - Vector store with ChromaDB
  - OpenAI GPT-4 and Google Gemini support
  - WebSocket streaming responses
- **Dependencies**: LangChain, ChromaDB, OpenAI SDK, Google Generative AI

### 2. Avatar Module (`app/modules/avatar/`)
- **Purpose**: Text-to-speech and lip sync generation
- **Features**:
  - CPU-optimized TTS with Coqui TTS
  - Viseme generation for 8 basic mouth shapes
  - Audio streaming
  - Base64 audio encoding
- **Dependencies**: Coqui TTS, pydub, scipy

### 3. Shared Module (`app/modules/shared/`)
- **Purpose**: Common configuration and utilities
- **Features**:
  - Centralized settings management
  - Environment variable loading

## Setup

1. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env and add your API keys
```

4. Run server:
```bash
python run.py
```

## API Endpoints

### Chatbot
- `POST /api/chatbot/query` - Query with RAG
- `WS /api/chatbot/stream` - Streaming responses
- `POST /api/chatbot/documents/upload` - Upload documents
- `GET /api/chatbot/health` - Health check

### Avatar
- `POST /api/avatar/speak` - Generate speech + visemes
- `WS /api/avatar/stream` - Stream avatar data
- `GET /api/avatar/health` - Health check

## Adding New Modules

1. Create directory: `app/modules/your_module/`
2. Create `router.py` with FastAPI router
3. Create `__init__.py` exporting router
4. Add to `app/main.py`:
```python
from .modules.your_module import router as your_router
app.include_router(your_router)
```

## CPU Optimization

Since no GPU is available, the TTS module uses CPU-friendly models:
- `glow-tts` (recommended for CPU)
- `tacotron2-DDC` (fallback)

To change TTS model, update `.env`:
```
TTS_MODEL=tts_models/en/ljspeech/glow-tts
```


