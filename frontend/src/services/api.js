import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      // Server responded with error status
      console.error('Error Response:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request);
    } else {
      // Error setting up request
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Chatbot API
export const chatbotAPI = {
  query: async (query, provider = 'gemini', useRag = true) => {
    const response = await api.post('/api/chatbot/query', {
      query,
      provider,
      use_rag: useRag,
    });
    return response.data;
  },

  uploadDocuments: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await api.post('/api/chatbot/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  loadDirectory: async (directory = 'data') => {
    const response = await api.post('/api/chatbot/documents/load-directory', null, {
      params: { directory },
    });
    return response.data;
  },

  clearDocuments: async () => {
    const response = await api.delete('/api/chatbot/documents/clear');
    return response.data;
  },

  health: async () => {
    const response = await api.get('/api/chatbot/health');
    return response.data;
  },
};

// Avatar API
export const avatarAPI = {
  speak: async (text) => {
    const response = await api.post('/api/avatar/speak', {
      text,
      return_audio: true,
      return_visemes: true,
    });
    return response.data;
  },

  speakAudioOnly: async (text) => {
    const response = await api.post('/api/avatar/speak-audio', {
      text,
    }, {
      responseType: 'blob',
    });
    return response.data;
  },

  generateVisemes: async (text, duration = null) => {
    const response = await api.post('/api/avatar/visemes', null, {
      params: { text, duration },
    });
    return response.data;
  },

  health: async () => {
    const response = await api.get('/api/avatar/health');
    return response.data;
  },
};

// WebSocket connections
export const createChatWebSocket = () => {
  return new WebSocket(`${WS_URL}/api/chatbot/stream`);
};

export const createAvatarWebSocket = () => {
  return new WebSocket(`${WS_URL}/api/avatar/stream`);
};

export default api;


