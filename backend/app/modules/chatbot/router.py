from fastapi import APIRouter, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
from pathlib import Path

from .rag import rag_system
from .llm import llm_manager

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])


class QueryRequest(BaseModel):
    query: str
    provider: str = "gemini"  # Changed default to Gemini
    use_rag: bool = False  # Disabled by default (requires OpenAI for embeddings)


class QueryResponse(BaseModel):
    response: str
    context_used: bool


class DocumentUploadResponse(BaseModel):
    message: str
    chunks_added: int


@router.post("/query", response_model=QueryResponse)
async def query_chatbot(request: QueryRequest):
    """Query the chatbot with optional RAG"""
    try:
        context = ""
        context_used = False
        
        if request.use_rag:
            # Retrieve relevant context from RAG system
            context = await rag_system.retrieve_context(request.query)
            context_used = bool(context)
        
        # Generate response using LLM
        response = await llm_manager.generate_response(
            query=request.query,
            context=context,
            provider=request.provider
        )
        
        return QueryResponse(
            response=response,
            context_used=context_used
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.websocket("/stream")
async def websocket_stream(websocket: WebSocket):
    """WebSocket endpoint for streaming chat responses"""
    await websocket.accept()
    
    try:
        while True:
            # Receive query from client
            data = await websocket.receive_json()
            query = data.get("query", "")
            provider = data.get("provider", "openai")
            use_rag = data.get("use_rag", True)
            
            if not query:
                await websocket.send_json({"error": "No query provided"})
                continue
            
            # Get context if RAG is enabled
            context = ""
            if use_rag:
                context = await rag_system.retrieve_context(query)
            
            # Stream response
            async for chunk in llm_manager.stream_response(query, context, provider):
                await websocket.send_json({
                    "type": "chunk",
                    "content": chunk
                })
            
            # Send end signal
            await websocket.send_json({"type": "end"})
    
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        await websocket.send_json({"error": str(e)})


@router.post("/documents/upload", response_model=DocumentUploadResponse)
async def upload_documents(files: List[UploadFile] = File(...)):
    """Upload documents for RAG processing"""
    try:
        data_dir = Path("data")
        data_dir.mkdir(exist_ok=True)
        
        file_paths = []
        
        # Save uploaded files
        for file in files:
            file_path = data_dir / file.filename
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            file_paths.append(str(file_path))
        
        # Add documents to RAG system
        chunks_added = await rag_system.add_documents(file_paths)
        
        return DocumentUploadResponse(
            message=f"Successfully uploaded {len(files)} file(s)",
            chunks_added=chunks_added
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/documents/load-directory")
async def load_directory(directory: str = "data"):
    """Load all documents from a directory"""
    try:
        if not os.path.exists(directory):
            raise HTTPException(status_code=404, detail="Directory not found")
        
        chunks_added = await rag_system.load_directory(directory)
        
        return {
            "message": f"Loaded documents from {directory}",
            "chunks_added": chunks_added
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/documents/clear")
async def clear_documents():
    """Clear all documents from the vector store"""
    try:
        rag_system.clear_database()
        return {"message": "All documents cleared"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "gemini_configured": bool(llm_manager.gemini_model),
        "rag_disabled": "RAG requires OpenAI embeddings (not available)"
    }


