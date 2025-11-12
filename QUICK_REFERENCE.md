# Quick Reference Guide

## 🚀 Getting Started (3 Steps)

```bash
# 1. Setup
./setup.sh

# 2. Configure (add your Gemini API key)
nano backend/.env

# 3. Start
./start-dev.sh
```

## 📡 API Endpoints

### Chatbot
```
POST   /api/chatbot/query              # Query with RAG
WS     /api/chatbot/stream             # Stream responses
POST   /api/chatbot/documents/upload   # Upload docs
DELETE /api/chatbot/documents/clear    # Clear docs
GET    /api/chatbot/health             # Health check
```

### Avatar
```
POST   /api/avatar/speak               # Generate speech + visemes
POST   /api/avatar/speak-audio         # Audio only
WS     /api/avatar/stream              # Stream avatar data
POST   /api/avatar/visemes             # Visemes only
GET    /api/avatar/health              # Health check
```

## 🔧 Common Commands

### Backend
```bash
cd backend
source venv/bin/activate              # Activate venv
python run.py                         # Start server
pip install -r requirements.txt       # Install deps
deactivate                            # Exit venv
```

### Frontend
```bash
cd frontend
npm install                           # Install deps
npm run dev                           # Start dev server
npm run build                         # Build for production
npm run preview                       # Preview production build
```

### Docker
```bash
docker-compose up                     # Start all services
docker-compose up -d                  # Start in background
docker-compose down                   # Stop all services
docker-compose logs -f                # View logs
```

## 📁 Key Files

### Configuration
- `backend/.env` - Backend environment variables
- `frontend/.env` - Frontend environment variables
- `docker-compose.yml` - Docker configuration

### Backend Modules
- `backend/app/modules/chatbot/router.py` - Chat API
- `backend/app/modules/chatbot/rag.py` - RAG system
- `backend/app/modules/chatbot/llm.py` - LLM manager
- `backend/app/modules/avatar/router.py` - Avatar API
- `backend/app/modules/avatar/tts.py` - Text-to-speech
- `backend/app/modules/avatar/lipsync.py` - Lip sync
- `backend/app/modules/shared/config.py` - Settings

### Frontend Modules
- `frontend/src/modules/chatbot/ChatModule.jsx` - Chat UI
- `frontend/src/modules/avatar/AvatarModule.jsx` - Avatar container
- `frontend/src/modules/avatar/AvatarScene.jsx` - 3D scene
- `frontend/src/modules/shared/AppContext.jsx` - State management
- `frontend/src/services/api.js` - API client

## 🎯 Module Communication

### Frontend Pattern
```javascript
// Chat Module writes to context
const { addMessage, speak } = useAppContext();
addMessage({ role: 'assistant', content: response });
speak(text, audioData, visemeData);

// Avatar Module reads from context
const { currentSpeech, isSpeaking } = useAppContext();
useEffect(() => {
  if (currentSpeech) {
    // Play audio and animate
  }
}, [currentSpeech]);
```

### Backend Pattern
```python
# Modules are independent
# Only share config
from app.modules.shared.config import settings

# Each module has its own router
router = APIRouter(prefix="/api/module", tags=["module"])

# Register in main.py
app.include_router(module_router)
```

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check if running
curl http://localhost:8000/health

# View API docs
open http://localhost:8000/docs

# Check logs
python run.py  # (see console output)
```

### Frontend Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Check if running
curl http://localhost:3000
```

### Database Issues
```bash
# Clear ChromaDB
rm -rf backend/chroma_db
# Upload documents again
```

## 📊 Environment Variables

### Required
```bash
GEMINI_API_KEY=your_gemini_api_key    # Google Gemini
```

### Optional
```bash
OPENAI_API_KEY=your_openai_api_key    # OpenAI GPT-4
TTS_MODEL=tts_models/en/ljspeech/glow-tts  # TTS model
```

## 🎨 Adding a New Module

### Backend
```bash
# 1. Create structure
mkdir -p backend/app/modules/mymodule
touch backend/app/modules/mymodule/{__init__.py,router.py,logic.py}

# 2. Implement router
# See backend/app/modules/chatbot/router.py as example

# 3. Register in main.py
# from .modules.mymodule import router as mymodule_router
# app.include_router(mymodule_router)
```

### Frontend
```bash
# 1. Create structure
mkdir -p frontend/src/modules/mymodule
touch frontend/src/modules/mymodule/MyModule.jsx

# 2. Implement component
# Import useAppContext for state

# 3. Add to App.jsx
# import MyModule from './modules/mymodule/MyModule'
# <MyModule />
```

## 📝 Testing APIs

### cURL Examples
```bash
# Query chatbot
curl -X POST http://localhost:8000/api/chatbot/query \
  -H "Content-Type: application/json" \
  -d '{"query":"What is this project?","provider":"gemini","use_rag":true}'

# Generate speech
curl -X POST http://localhost:8000/api/chatbot/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world"}'

# Upload document
curl -X POST http://localhost:8000/api/chatbot/documents/upload \
  -F "files=@document.pdf"
```

## 🔗 URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- OpenAPI JSON: http://localhost:8000/openapi.json

## 📚 Documentation

- `README.md` - Getting started
- `ARCHITECTURE.md` - System design
- `PROJECT_SUMMARY.md` - Complete overview
- `CONTRIBUTING.md` - How to contribute
- `backend/README.md` - Backend details
- `frontend/README.md` - Frontend details

## 💡 Tips

- Use Gemini (free tier available)
- Fallback avatar works without GLB
- TTS takes 5-10s on CPU (normal)
- Upload docs before using RAG
- Check browser console for errors
- Use API docs for testing

## 🎓 Learning Resources

- FastAPI: https://fastapi.tiangolo.com/
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber
- LangChain: https://python.langchain.com/
- Material-UI: https://mui.com/
- Coqui TTS: https://github.com/coqui-ai/TTS


