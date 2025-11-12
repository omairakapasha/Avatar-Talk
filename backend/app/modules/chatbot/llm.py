from typing import Optional, AsyncGenerator
import google.generativeai as genai
from ..shared.config import settings


class LLMManager:
    """Manages Gemini LLM using Google Generative AI SDK directly"""
    
    def __init__(self):
        self.gemini_model = None
        self._initialize_llms()
    
    def _initialize_llms(self):
        """Initialize Gemini LLM"""
        if settings.gemini_api_key:
            # Configure direct Gemini API
            genai.configure(api_key=settings.gemini_api_key)
            
            # Try common model names in order of preference
            # Based on available models from API
            model_names_to_try = [
                "gemini-2.5-flash",      # Fast and efficient
                "gemini-2.5-pro",       # More capable
                "gemini-2.0-flash",     # Alternative fast model
                "models/gemini-2.5-flash",  # With models/ prefix
                "models/gemini-2.5-pro",
            ]
            
            for model_name in model_names_to_try:
                try:
                    # Just create the model - don't test generation during init
                    test_model = genai.GenerativeModel(model_name)
                    self.gemini_model = model_name
                    print(f"✅ Gemini LLM initialized successfully with {model_name}")
                    return
                except Exception as e:
                    error_msg = str(e)
                    if "404" not in error_msg and "not found" not in error_msg.lower():
                        # If it's not a 404, this might be the right model but with a different error
                        # Try using it anyway
                        self.gemini_model = model_name
                        print(f"✅ Gemini LLM initialized with {model_name} (warning: {error_msg[:80]})")
                        return
                    print(f"⚠️  Failed to initialize with {model_name}: {error_msg[:100]}")
                    continue
            
            # If all failed, set to None and log error
            print(f"❌ Could not initialize any Gemini model. Please check your API key and available models.")
            self.gemini_model = None
    
    def get_model(self, provider: str = "gemini"):
        """Get Gemini model instance"""
        if self.gemini_model:
            return genai.GenerativeModel(self.gemini_model)
        else:
            raise ValueError("Gemini API key not configured or model not available")
    
    async def generate_response(
        self, 
        query: str, 
        context: str = "", 
        provider: str = "gemini"
    ) -> str:
        """Generate a response using the specified LLM"""
        model = self.get_model(provider)
        
        prompt = "You are a helpful AI assistant. Use the provided context to answer questions accurately."
        if context:
            prompt += f"\n\nContext:\n{context}"
        prompt += f"\n\nUser: {query}\nAssistant:"
        
        try:
            response = model.generate_content(prompt)
            if hasattr(response, 'text'):
                return response.text
            else:
                # Handle different response formats
                return str(response)
        except Exception as e:
            error_msg = str(e)
            if "404" in error_msg or "not found" in error_msg.lower():
                raise ValueError(f"Gemini model '{self.gemini_model}' is not available. Please check your API key and model access. Error: {error_msg}")
            raise Exception(f"Gemini API error: {error_msg}")
    
    async def stream_response(
        self, 
        query: str, 
        context: str = "", 
        provider: str = "gemini"
    ) -> AsyncGenerator[str, None]:
        """Stream response chunks from the LLM"""
        model = self.get_model(provider)
        
        prompt = "You are a helpful AI assistant. Use the provided context to answer questions accurately."
        if context:
            prompt += f"\n\nContext:\n{context}"
        prompt += f"\n\nUser: {query}\nAssistant:"
        
        try:
            response = model.generate_content(prompt, stream=True)
            for chunk in response:
                if hasattr(chunk, 'text') and chunk.text:
                    yield chunk.text
                elif hasattr(chunk, 'parts'):
                    for part in chunk.parts:
                        if hasattr(part, 'text') and part.text:
                            yield part.text
        except Exception as e:
            error_msg = str(e)
            if "404" in error_msg or "not found" in error_msg.lower():
                raise ValueError(f"Gemini model '{self.gemini_model}' is not available. Please check your API key and model access. Error: {error_msg}")
            raise Exception(f"Gemini API streaming error: {error_msg}")


# Global LLM manager instance
llm_manager = LLMManager()


