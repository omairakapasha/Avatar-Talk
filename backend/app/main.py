from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from .modules.shared.config import settings
from .modules.chatbot import router as chatbot_router
from .modules.avatar import router as avatar_router

# Create FastAPI app
app = FastAPI(
    title="AI Avatar Chatbot API",
    description="Modular API for RAG chatbot with talking avatar",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chatbot_router)
app.include_router(avatar_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Avatar Chatbot API",
        "version": "1.0.0",
        "endpoints": {
            "chatbot": "/api/chatbot",
            "avatar": "/api/avatar",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health():
    """Overall health check"""
    return {
        "status": "healthy",
        "modules": {
            "chatbot": "active",
            "avatar": "active"
        }
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "detail": str(exc)
        }
    )


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload
    )


