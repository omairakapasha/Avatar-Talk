from typing import List, Optional
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    DirectoryLoader
)
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from ..shared.config import settings


class RAGSystem:
    """Retrieval-Augmented Generation system using ChromaDB"""
    
    def __init__(self):
        # RAG disabled - requires OpenAI embeddings which are not available
        self.embeddings = None
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        
        self.vectorstore = None
        self._initialize_vectorstore()
    
    def _initialize_vectorstore(self):
        """Initialize or load existing ChromaDB vectorstore"""
        if not self.embeddings:
            print("Warning: OpenAI API key not configured. RAG system disabled.")
            return
        
        persist_dir = settings.chroma_persist_dir
        
        # Create directory if it doesn't exist
        os.makedirs(persist_dir, exist_ok=True)
        
        # Initialize Chroma with persistence
        self.vectorstore = Chroma(
            persist_directory=persist_dir,
            embedding_function=self.embeddings,
            collection_name="documents"
        )
    
    async def add_documents(self, file_paths: List[str]) -> int:
        """Add documents to the vector store"""
        if not self.vectorstore:
            raise ValueError("Vectorstore not initialized. Check OpenAI API key.")
        
        all_documents = []
        
        for file_path in file_paths:
            # Load document based on file type
            if file_path.endswith('.pdf'):
                loader = PyPDFLoader(file_path)
            elif file_path.endswith('.txt'):
                loader = TextLoader(file_path)
            else:
                print(f"Skipping unsupported file type: {file_path}")
                continue
            
            documents = loader.load()
            all_documents.extend(documents)
        
        # Split documents into chunks
        chunks = self.text_splitter.split_documents(all_documents)
        
        # Add to vectorstore
        self.vectorstore.add_documents(chunks)
        
        return len(chunks)
    
    async def load_directory(self, directory_path: str) -> int:
        """Load all supported documents from a directory"""
        if not self.vectorstore:
            raise ValueError("Vectorstore not initialized. Check OpenAI API key.")
        
        # Load PDF files
        pdf_loader = DirectoryLoader(
            directory_path,
            glob="**/*.pdf",
            loader_cls=PyPDFLoader
        )
        
        # Load text files
        txt_loader = DirectoryLoader(
            directory_path,
            glob="**/*.txt",
            loader_cls=TextLoader
        )
        
        all_documents = []
        
        try:
            all_documents.extend(pdf_loader.load())
        except Exception as e:
            print(f"Error loading PDFs: {e}")
        
        try:
            all_documents.extend(txt_loader.load())
        except Exception as e:
            print(f"Error loading text files: {e}")
        
        if not all_documents:
            return 0
        
        # Split and add to vectorstore
        chunks = self.text_splitter.split_documents(all_documents)
        self.vectorstore.add_documents(chunks)
        
        return len(chunks)
    
    async def retrieve_context(self, query: str, k: int = 4) -> str:
        """Retrieve relevant context for a query"""
        if not self.vectorstore:
            return ""
        
        # Perform similarity search
        docs = self.vectorstore.similarity_search(query, k=k)
        
        # Combine document contents
        context = "\n\n".join([doc.page_content for doc in docs])
        
        return context
    
    async def search_documents(self, query: str, k: int = 4) -> List[dict]:
        """Search for relevant documents and return metadata"""
        if not self.vectorstore:
            return []
        
        docs = self.vectorstore.similarity_search(query, k=k)
        
        results = []
        for doc in docs:
            results.append({
                "content": doc.page_content,
                "metadata": doc.metadata
            })
        
        return results
    
    def clear_database(self):
        """Clear all documents from the vector store"""
        if self.vectorstore:
            self.vectorstore.delete_collection()
            self._initialize_vectorstore()


# Global RAG system instance
rag_system = RAGSystem()


