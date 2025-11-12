#!/bin/bash

echo "🔍 Verifying AI Avatar Chatbot Project Setup"
echo "============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check function
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 (missing)"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        return 0
    else
        echo -e "${RED}✗${NC} $1/ (missing)"
        return 1
    fi
}

errors=0

# Backend verification
echo "Backend Files:"
check_file "backend/requirements.txt" || ((errors++))
check_file "backend/run.py" || ((errors++))
check_file "backend/app/main.py" || ((errors++))
check_file "backend/app/modules/chatbot/router.py" || ((errors++))
check_file "backend/app/modules/chatbot/rag.py" || ((errors++))
check_file "backend/app/modules/chatbot/llm.py" || ((errors++))
check_file "backend/app/modules/avatar/router.py" || ((errors++))
check_file "backend/app/modules/avatar/tts.py" || ((errors++))
check_file "backend/app/modules/avatar/lipsync.py" || ((errors++))
check_file "backend/app/modules/shared/config.py" || ((errors++))
check_dir "backend/venv" || echo -e "${YELLOW}⚠${NC} backend/venv/ (run setup.sh)"

echo ""
echo "Frontend Files:"
check_file "frontend/package.json" || ((errors++))
check_file "frontend/vite.config.js" || ((errors++))
check_file "frontend/src/App.jsx" || ((errors++))
check_file "frontend/src/main.jsx" || ((errors++))
check_file "frontend/src/modules/chatbot/ChatModule.jsx" || ((errors++))
check_file "frontend/src/modules/avatar/AvatarModule.jsx" || ((errors++))
check_file "frontend/src/modules/avatar/AvatarScene.jsx" || ((errors++))
check_file "frontend/src/modules/shared/AppContext.jsx" || ((errors++))
check_file "frontend/src/services/api.js" || ((errors++))
check_dir "frontend/node_modules" || echo -e "${YELLOW}⚠${NC} frontend/node_modules/ (run npm install)"

echo ""
echo "Configuration:"
check_file "docker-compose.yml" || ((errors++))
check_file "setup.sh" || ((errors++))
check_file "start-dev.sh" || ((errors++))
check_file ".gitignore" || ((errors++))

echo ""
echo "Documentation:"
check_file "README.md" || ((errors++))
check_file "ARCHITECTURE.md" || ((errors++))
check_file "PROJECT_SUMMARY.md" || ((errors++))
check_file "CONTRIBUTING.md" || ((errors++))
check_file "LICENSE" || ((errors++))
check_file "backend/README.md" || ((errors++))
check_file "frontend/README.md" || ((errors++))

echo ""
echo "Sample Data:"
check_file "backend/data/sample_document.txt" || ((errors++))
check_file "frontend/public/models/README.md" || ((errors++))

echo ""
echo "Environment Configuration:"
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} backend/.env exists"
    if grep -q "GEMINI_API_KEY=your" backend/.env; then
        echo -e "${YELLOW}⚠${NC} Remember to add your GEMINI_API_KEY to backend/.env"
    else
        echo -e "${GREEN}✓${NC} GEMINI_API_KEY appears to be configured"
    fi
else
    echo -e "${YELLOW}⚠${NC} backend/.env not found (run setup.sh or cp backend/.env.example backend/.env)"
fi

echo ""
echo "Optional:"
if [ -f "frontend/public/models/avatar.glb" ]; then
    echo -e "${GREEN}✓${NC} GLB model found"
else
    echo -e "${YELLOW}ℹ${NC} No GLB model (fallback avatar will be used)"
fi

echo ""
echo "============================================="
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✅ Project structure is complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure backend/.env with your API keys"
    echo "2. (Optional) Add GLB model to frontend/public/models/"
    echo "3. Run: ./start-dev.sh"
else
    echo -e "${RED}❌ Found $errors missing files${NC}"
    echo ""
    echo "Run: ./setup.sh to fix missing components"
fi
echo ""


