# AI Avatar Chatbot

A modular web application featuring a RAG-powered chatbot with OpenAI/Gemini integration and a real-time talking avatar with lip sync capabilities using React.js and sprite-based animation.

## Features

- **RAG Chatbot Module**: Document-based Q&A using OpenAI SDK and Gemini API
- **Talking Avatar Module**: Real-time sprite-based avatar with lip sync animation
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
- Resemble.ai (TTS)

### Frontend
- React 18
- Canvas-based sprite animation
- Material-UI
- Native WebSocket API

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Run setup script
./setup.sh

# Add your API keys to backend/.env
nano backend/.env
# Add: GEMINI_API_KEY=your_key_here
# Add: RESEMBLE_API_KEY=your_key_here

# Start both services
./start-dev.sh
```

### Option 2: Docker Compose

```bash
# Create .env in project root with your API keys
echo "GEMINI_API_KEY=your_gemini_key_here" > .env
echo "RESEMBLE_API_KEY=your_resemble_key_here" >> .env

# Start services
docker-compose up
```

Access at:
- Frontend: http://localhost:5173 (dev) or http://localhost:80 (Docker)
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
# Edit .env and add your API keys:
# GEMINI_API_KEY=your_key_here
# RESEMBLE_API_KEY=your_key_here

# Run server
python run.py
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
# Frontend will be available at http://localhost:5173
# Note: Avatar sprite frames are already included in public/models/
```

## Configuration

### Required
- **GEMINI_API_KEY**: Google Gemini API key (primary LLM)
- **RESEMBLE_API_KEY**: Resemble.ai API key (for TTS)

### Optional
- **OPENAI_API_KEY**: OpenAI API key (alternative LLM)

### System Requirements
- Python 3.11+
- Node.js 18+
- No GPU required (cloud-based TTS)

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

### Avatar Implementation

The avatar uses sprite-based animation with PNG frames. Two avatar options are included:
- **Lateman**: Sprite frames in `frontend/public/models/Lateman/`
- **Old Man**: Sprite frames in `frontend/public/models/oldman/`

### Lip Sync Implementation

The avatar uses viseme-based lip sync. The backend generates 8 basic mouth shapes that map to sprite frames:
- 0: Silence
- 1: Open (A, E sounds)
- 2: Smile (I sounds)
- 3: Round (O sounds)
- 4: Pursed (U sounds)
- 5: Closed (M, B, P)
- 6: Teeth on lip (F, V)
- 7: Teeth visible (Th, S, Z)

The sprite frames are automatically selected based on the viseme index during speech.

## Troubleshooting

### TTS Not Working
- Verify RESEMBLE_API_KEY is set correctly in backend/.env
- Ensure you have created a voice in your Resemble.ai account
- Check backend logs for Resemble.ai API errors
- Verify voice UUID and project UUID are configured correctly

### RAG Not Finding Documents
- Verify GEMINI_API_KEY or OPENAI_API_KEY is set correctly
- Check that documents are in supported formats (PDF, TXT, DOCX)
- Ensure ChromaDB directory has write permissions

### WebSocket Connection Issues
- Check CORS settings in backend configuration
- Verify WebSocket URL in frontend configuration
- Check firewall settings
- Ensure backend is running on port 8000

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

