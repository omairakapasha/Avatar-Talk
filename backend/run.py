#!/usr/bin/env python3
"""
Script to run the FastAPI backend server
"""
import uvicorn
from app.modules.shared.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload
    )


