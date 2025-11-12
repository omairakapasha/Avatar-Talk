#!/bin/bash

echo "🚀 Setting up AI Avatar Chatbot Project"
echo "========================================"

# Backend setup
echo ""
echo "📦 Setting up Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env and add your API keys!"
fi

# Create necessary directories
mkdir -p data chroma_db

cd ..

# Frontend setup
echo ""
echo "📦 Setting up Frontend..."
cd frontend

# Install dependencies
echo "Installing Node dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
fi

# Create models directory
mkdir -p public/models

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your API keys to backend/.env:"
echo "   - GEMINI_API_KEY (required)"
echo "   - OPENAI_API_KEY (optional)"
echo ""
echo "2. Place your GLB avatar model in:"
echo "   frontend/public/models/avatar.glb"
echo ""
echo "3. Start the backend:"
echo "   cd backend && source venv/bin/activate && python run.py"
echo ""
echo "4. Start the frontend (in new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "5. Or use Docker Compose:"
echo "   docker-compose up"
echo ""


