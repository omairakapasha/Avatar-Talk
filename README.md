# AI Avatar Chatbot

A modular web application featuring a RAG-powered chatbot with OpenAI/Gemini integration and a real-time talking avatar with lip sync capabilities using React.js and a Blender GLB model.

## Features

- **RAG Chatbot Module**: Document-based Q&A using OpenAI SDK and Gemini API
- **Talking Avatar Module**: Real-time 3D avatar with lip sync using React Three Fiber
- **Modular Architecture**: Easy to extend and maintain
- **WebSocket Support**: Real-time streaming for chat and audio
- **Open Source**: Built entirely with open-source technologies

## Project Structure

```
ai-avatar-chatbot/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app entry
│   │   ├── modules/
│   │   │   ├── chatbot/    # RAG chatbot module
│   │   │   ├── avatar/     # Avatar API module
│   │   │   └── shared/     # Shared utilities
│   ├── data/               # RAG documents
│   ├── requirements.txt
│   └── .env.example
├── frontend/               # React frontend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── chatbot/
│   │   │   └── avatar/
│   └── package.json
└── README.md
```

## Tech Stack

### Backend
- FastAPI (REST + WebSocket)
- LangChain (RAG orchestration)
- ChromaDB (vector storage)
- OpenAI SDK
- Google Generative AI (Gemini)
- Coqui TTS (open-source TTS)

### Frontend
- React 18
- React Three Fiber (3D rendering)
- Three.js
- Material-UI
- Socket.io-client (WebSocket)

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Run setup script
./setup.sh

# Add your Gemini API key to backend/.env
nano backend/.env

# Place your GLB model (optional)
cp your-model.glb frontend/public/models/avatar.glb

# Start both services
./start-dev.sh
```

### Option 2: Docker Compose

```bash
# Create .env in project root with your API keys
echo "GEMINI_API_KEY=AIzaSyBd6KPjAzO_P5msJEWJ6LIZvrc0170f3Qc" > .env

# Start services
docker-compose up
```

Access at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 3: Manual Setup

#### Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Run server
python run.py
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Place your GLB model
# Copy to: public/models/avatar.glb

# Run dev server
npm run dev
```

## Configuration

### Required
- **GEMINI_API_KEY**: Google Gemini API key (primary LLM)

### Optional
- **OPENAI_API_KEY**: OpenAI API key (alternative LLM)

### System Requirements
- Python 3.11+
- Node.js 18+
- 4GB+ RAM (for TTS models)
- No GPU required (CPU-optimized)

## Usage

### Uploading Documents for RAG

Use the API endpoint to upload documents:

```bash
curl -X POST "http://localhost:8000/api/chatbot/documents/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "files=@document.pdf"
```

Or place documents in the `backend/data/` directory and load them:

```bash
curl -X POST "http://localhost:8000/api/chatbot/documents/load-directory"
```

### Querying the Chatbot

```bash
curl -X POST "http://localhost:8000/api/chatbot/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "Your question here", "provider": "openai", "use_rag": true}'
```

### Generating Avatar Speech

```bash
curl -X POST "http://localhost:8000/api/avatar/speak" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, how can I help you?"}'
```

## API Endpoints

### Chatbot Module
- `POST /api/chatbot/query` - Query the chatbot
- `WS /api/chatbot/stream` - Stream chat responses
- `POST /api/chatbot/documents/upload` - Upload documents
- `POST /api/chatbot/documents/load-directory` - Load documents from directory
- `DELETE /api/chatbot/documents/clear` - Clear all documents
- `GET /api/chatbot/health` - Health check

### Avatar Module
- `POST /api/avatar/speak` - Generate speech and lip sync data
- `POST /api/avatar/speak-audio` - Generate audio only
- `WS /api/avatar/stream` - Stream avatar data
- `POST /api/avatar/visemes` - Generate viseme sequence
- `GET /api/avatar/health` - Health check

## Development

### Adding New Modules

1. Create a new directory in `backend/app/modules/`
2. Implement your module with `router.py`, business logic files, and `__init__.py`
3. Import and include the router in `backend/app/main.py`

### Lip Sync Implementation

The avatar uses viseme-based lip sync. The backend generates 8 basic mouth shapes:
- 0: Silence
- 1: Open (A, E sounds)
- 2: Smile (I sounds)
- 3: Round (O sounds)
- 4: Pursed (U sounds)
- 5: Closed (M, B, P)
- 6: Teeth on lip (F, V)
- 7: Teeth visible (Th, S, Z)

For production use, integrate proper phoneme extraction tools like Rhubarb Lip Sync.

## Troubleshooting

### TTS Not Working
- Ensure you have sufficient disk space for model downloads
- Check if CUDA is available for GPU acceleration
- Try using the fallback TTS model

### RAG Not Finding Documents
- Verify OPENAI_API_KEY is set correctly
- Check that documents are in supported formats (PDF, TXT)
- Ensure ChromaDB directory has write permissions

### WebSocket Connection Issues
- Check CORS settings in backend
- Verify WebSocket URL in frontend configuration
- Check firewall settings

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

