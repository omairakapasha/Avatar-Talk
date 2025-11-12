# Getting Started with AI Avatar Chatbot

## ✅ What's Been Built

A **fully modular** AI Avatar Chatbot with:
- ✅ RAG-powered chatbot (Gemini + OpenAI support)
- ✅ Real-time 3D talking avatar with lip sync
- ✅ CPU-optimized (no GPU needed)
- ✅ Your GLB model already installed!

## 🚀 Start in 3 Steps

### Step 1: Run Setup
```bash
./setup.sh
```

This will:
- Set up Python virtual environment
- Install all backend dependencies
- Install all frontend dependencies
- Create necessary directories
- Create .env files

### Step 2: Add Your API Key
```bash
nano backend/.env
```

Add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 3: Start the Application
```bash
./start-dev.sh
```

This will start both backend and frontend servers.

## 🌐 Access the Application

Once started, open your browser to:
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

## 🎯 First Usage

1. **Upload a Document** (optional)
   - Click "Upload Docs" button in the chat interface
   - Select PDF or TXT files
   - Wait for "Uploaded successfully" message

2. **Start Chatting**
   - Type a message in the input box
   - Press Enter or click Send
   - Watch the avatar speak your response!

3. **Try Different Settings**
   - Toggle "Use RAG" to use uploaded documents
   - Toggle "Auto-speak" to control avatar speech
   - Change LLM provider (Gemini/OpenAI)

## 📊 System Info

### Your Model
✅ GLB model installed: `old_man_bust.glb`
- Location: `frontend/public/models/avatar.glb`
- Size: 126MB
- The avatar will use this model automatically

### Modules Implemented

**Backend (FastAPI):**
1. **Chatbot Module** - RAG + LLM queries
2. **Avatar Module** - TTS + Lip sync
3. **Shared Module** - Configuration

**Frontend (React):**
1. **Chat Module** - Interactive chat UI
2. **Avatar Module** - 3D avatar display
3. **Shared Module** - State management

## 🎨 Features to Try

### RAG (Retrieval-Augmented Generation)
1. Upload documents via the UI
2. Enable "Use RAG" toggle
3. Ask questions about your documents
4. Avatar will speak answers based on your docs!

### Avatar Interaction
- The avatar animates based on speech
- 8 different mouth shapes (visemes)
- Jaw bone animation (if model supports)
- Smooth lip synchronization

### Settings
- **Provider**: Switch between Gemini and OpenAI
- **Use RAG**: Enable document-based answers
- **Auto-speak**: Automatic avatar speech

## 🐛 Troubleshooting

### Backend won't start?
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

### Frontend won't start?
```bash
cd frontend
npm install
npm run dev
```

### Avatar not loading?
- Check browser console (F12)
- Your model is already in place
- Fallback avatar will appear if model fails

### TTS is slow?
- Normal on CPU (5-10 seconds)
- First run may be slower (model download)

## 📚 Documentation

- **README.md** - Main documentation
- **ARCHITECTURE.md** - System architecture details
- **PROJECT_SUMMARY.md** - Complete project overview
- **QUICK_REFERENCE.md** - Command reference
- **CONTRIBUTING.md** - How to contribute

## 🎓 Example Queries to Try

1. "What is this project about?" (tests sample document)
2. "Explain how the avatar works"
3. "What are the main features?"
4. Upload your own docs and ask about them!

## 🔧 Advanced Usage

### Docker Deployment
```bash
# Add API key to root .env
echo "GEMINI_API_KEY=your_key" > .env

# Start with Docker
docker-compose up
```

### Manual Testing
```bash
# Test backend API
curl http://localhost:8000/health

# View API documentation
open http://localhost:8000/docs
```

### Development
```bash
# Backend changes auto-reload (when using start-dev.sh)
# Frontend has hot module replacement

# Check logs in terminal
# Backend: See FastAPI logs
# Frontend: See Vite logs
```

## 💡 Tips

1. **First Chat is Slow**: TTS model loads on first use
2. **GLB Model Works**: Your avatar will automatically load
3. **Gemini is Free**: Great for testing
4. **Sample Document Included**: Test RAG immediately
5. **API Docs**: Explore at http://localhost:8000/docs

## 🎉 You're Ready!

Your modular AI Avatar Chatbot is complete and ready to use!

### Quick Start Reminder:
```bash
./setup.sh                  # Run once
nano backend/.env           # Add GEMINI_API_KEY
./start-dev.sh              # Start app
# Open http://localhost:3000
```

Enjoy your AI Avatar Chatbot! 🚀🤖


