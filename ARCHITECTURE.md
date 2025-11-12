# Architecture Documentation

## Design Philosophy

This project follows a **truly modular architecture** where each module is:
- **Self-contained**: Has its own dependencies, logic, and state
- **Loosely coupled**: Communicates through well-defined interfaces
- **Independently testable**: Can be tested in isolation
- **Easy to extend**: New modules can be added without modifying existing ones

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐        ┌──────────────┐                   │
│  │ Chat Module  │◄──────►│  AppContext  │◄────────┐         │
│  └──────────────┘        └──────────────┘         │         │
│         │                        ▲                 │         │
│         │                        │                 │         │
│         │                        │          ┌──────┴──────┐  │
│         │                        └──────────┤Avatar Module│  │
│         │                                   └─────────────┘  │
│         │                                          │         │
│         └──────────────────┬───────────────────────┘         │
│                            │ API Calls                        │
└────────────────────────────┼──────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  FastAPI Server  │
                    └────────┬─────────┘
                             │
        ┏━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━┓
        ┃         Backend (FastAPI)                 ┃
        ┃                                            ┃
        ┃  ┌─────────────────┐  ┌─────────────────┐ ┃
        ┃  │ Chatbot Module  │  │  Avatar Module  │ ┃
        ┃  ├─────────────────┤  ├─────────────────┤ ┃
        ┃  │ - RAG System    │  │ - TTS Engine    │ ┃
        ┃  │ - LLM Manager   │  │ - Lip Sync      │ ┃
        ┃  │ - Vector Store  │  │ - Viseme Gen    │ ┃
        ┃  └─────────────────┘  └─────────────────┘ ┃
        ┃           │                    │            ┃
        ┃           └──────────┬─────────┘            ┃
        ┃                      │                      ┃
        ┃              ┌───────▼──────┐               ┃
        ┃              │Shared Module │               ┃
        ┃              │  - Config    │               ┃
        ┃              └──────────────┘               ┃
        ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

## Backend Module Structure

### 1. Chatbot Module (`backend/app/modules/chatbot/`)

**Purpose**: Handles all chatbot-related functionality including RAG and LLM interactions.

**Components**:
- `router.py`: FastAPI routes and endpoints
- `rag.py`: RAG system with ChromaDB
- `llm.py`: LLM provider management (OpenAI, Gemini)

**Responsibilities**:
- Document processing and vector storage
- Context retrieval from documents
- Query processing with multiple LLM providers
- Streaming responses via WebSocket

**API Surface**:
```python
POST /api/chatbot/query
WS   /api/chatbot/stream
POST /api/chatbot/documents/upload
POST /api/chatbot/documents/load-directory
DELETE /api/chatbot/documents/clear
GET  /api/chatbot/health
```

**Dependencies**:
- LangChain (orchestration)
- ChromaDB (vector store)
- OpenAI SDK
- Google Generative AI

### 2. Avatar Module (`backend/app/modules/avatar/`)

**Purpose**: Handles text-to-speech and lip sync generation.

**Components**:
- `router.py`: FastAPI routes for TTS and lip sync
- `tts.py`: Text-to-speech engine (Coqui TTS)
- `lipsync.py`: Viseme generation for lip sync

**Responsibilities**:
- Converting text to speech audio
- Generating lip sync data (visemes)
- Audio streaming
- Phoneme-to-viseme mapping

**API Surface**:
```python
POST /api/avatar/speak
POST /api/avatar/speak-audio
WS   /api/avatar/stream
POST /api/avatar/visemes
GET  /api/avatar/health
```

**Dependencies**:
- Coqui TTS (speech synthesis)
- pydub (audio processing)
- scipy (audio encoding)

### 3. Shared Module (`backend/app/modules/shared/`)

**Purpose**: Common configuration and utilities.

**Components**:
- `config.py`: Centralized settings using Pydantic

**Responsibilities**:
- Environment variable management
- Application-wide configuration
- Settings validation

## Frontend Module Structure

### 1. Chat Module (`frontend/src/modules/chatbot/`)

**Purpose**: User interface for chat interaction.

**Components**:
- `ChatModule.jsx`: Main chat component
- Message display and input
- Settings controls

**State Management**:
```javascript
// Local state
- input: string
- isLoading: boolean
- uploadStatus: string

// Shared context (read/write)
- messages: Message[]
- settings: Settings
```

**Responsibilities**:
- Render chat interface
- Handle user input
- Query backend API
- Manage document uploads
- Trigger speech synthesis
- Update shared context

**Communication**:
- Writes messages to AppContext
- Triggers `speak()` in AppContext
- Reads/writes settings from AppContext

### 2. Avatar Module (`frontend/src/modules/avatar/`)

**Purpose**: 3D avatar display with lip sync.

**Components**:
- `AvatarModule.jsx`: Container with audio playback
- `AvatarScene.jsx`: 3D scene with Three.js
- Lip sync animation logic

**State Management**:
```javascript
// Local state
- visemeIndex: number
- progress: number
- audioRef: HTMLAudioElement

// Shared context (read)
- currentSpeech: SpeechData
- isSpeaking: boolean
```

**Responsibilities**:
- Render 3D avatar
- Play audio
- Animate lip sync
- Update speaking state
- Handle avatar controls

**Communication**:
- Listens to `currentSpeech` from AppContext
- Updates `isSpeaking` state in AppContext
- No direct dependency on Chat Module

### 3. Shared Module (`frontend/src/modules/shared/`)

**Purpose**: Inter-module communication and shared state.

**Components**:
- `AppContext.jsx`: React Context for state sharing

**State**:
```javascript
{
  messages: Message[],           // Chat history
  currentSpeech: SpeechData,     // Active speech
  isSpeaking: boolean,           // Speaking state
  settings: Settings             // App settings
}
```

**API**:
```javascript
addMessage(message)
clearMessages()
speak(text, audioData, visemeData)
updateSpeakingState(speaking)
updateSettings(settings)
```

## Communication Patterns

### Frontend Module Communication

Modules communicate **exclusively** through AppContext:

```javascript
// Chat Module → Avatar Module
// Chat doesn't call Avatar directly
chatModule.onResponse = (response) => {
  // Add to shared context
  addMessage(response);
  
  // Trigger speech (if enabled)
  if (settings.autoSpeak) {
    const speechData = await avatarAPI.speak(response);
    speak(response, speechData.audio_base64, speechData.visemes);
  }
}

// Avatar Module listens to context
useEffect(() => {
  if (currentSpeech) {
    // Play audio and animate
    playAudio(currentSpeech.audioData);
    animateVisemes(currentSpeech.visemeData);
  }
}, [currentSpeech]);
```

### Backend Module Communication

Modules are independent and don't call each other:

```python
# Modules only share configuration
from app.modules.shared.config import settings

# No cross-module imports
# Each module exposes its router
# Main app includes all routers
```

## Adding a New Module

### Backend

1. Create module directory:
```bash
mkdir -p backend/app/modules/my_module
```

2. Create files:
```python
# __init__.py
from .router import router
__all__ = ["router"]

# router.py
from fastapi import APIRouter
router = APIRouter(prefix="/api/my_module", tags=["my_module"])

@router.get("/")
async def root():
    return {"module": "my_module"}

# logic.py
class MyModuleLogic:
    def __init__(self):
        pass
```

3. Register in main app:
```python
# app/main.py
from .modules.my_module import router as my_module_router
app.include_router(my_module_router)
```

### Frontend

1. Create module directory:
```bash
mkdir -p frontend/src/modules/my_module
```

2. Create component:
```jsx
// MyModule.jsx
import { useAppContext } from '../shared/AppContext';

export default function MyModule() {
  const { /* context values */ } = useAppContext();
  
  return (
    <div>My Module</div>
  );
}
```

3. Add to App:
```jsx
// App.jsx
import MyModule from './modules/my_module/MyModule';

// In render
<MyModule />
```

## Design Decisions

### Why Modular?

1. **Scalability**: Easy to add new features (e.g., video generation, emotion detection)
2. **Maintainability**: Changes in one module don't affect others
3. **Testability**: Each module can be tested independently
4. **Team collaboration**: Multiple developers can work on different modules
5. **Reusability**: Modules can be used in other projects

### Why AppContext for Frontend?

- **Loose coupling**: Modules don't know about each other
- **Single source of truth**: All shared state in one place
- **Easy to debug**: State changes are centralized
- **Flexible**: Easy to add new shared state
- **React-native**: Built-in React feature

### Why FastAPI Routers for Backend?

- **Modular routing**: Each module defines its own routes
- **Auto documentation**: OpenAPI/Swagger docs automatically generated
- **Type safety**: Pydantic models ensure type correctness
- **Performance**: Async support out of the box
- **Standards**: RESTful API conventions

## Lip Sync Without Morph Targets

Since the GLB model doesn't have morph targets, we use:

### Approach 1: Jaw Bone Rotation (Preferred)
- Detects jaw bone in model hierarchy
- Rotates jaw based on viseme
- Smooth interpolation with lerp
- Works with most humanoid models

### Approach 2: Fallback 3D Avatar
- Simple geometric shapes
- Scales/transforms shapes based on viseme
- Always works as fallback

### Viseme System
- 8 basic mouth shapes
- Covers all English phonemes
- Simple phoneme-to-viseme mapping
- Can be extended with proper phoneme extraction

## Performance Optimizations

### Backend (CPU-only)
- Lightweight TTS models (glow-tts, tacotron2-DDC)
- Forced CPU usage
- Efficient vector search with ChromaDB
- Streaming responses to reduce latency

### Frontend
- React Three Fiber for efficient 3D rendering
- Lerp for smooth animations
- Lazy loading of modules
- Optimized audio playback

## Security Considerations

- Environment variables for API keys
- CORS configuration
- Input validation with Pydantic
- File upload restrictions
- No sensitive data in frontend

## Future Extensibility

Easy to add:
- Video generation module
- Emotion detection module
- Voice cloning module
- Multi-language support
- Analytics module
- Admin dashboard module

Each would be a self-contained module following the same pattern.


