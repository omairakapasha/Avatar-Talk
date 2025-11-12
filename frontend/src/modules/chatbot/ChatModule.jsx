import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Paper,
  List,
  ListItem,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppContext } from '../shared/AppContext';
import { chatbotAPI, avatarAPI } from '../../services/api';

const ChatModule = () => {
  const {
    messages,
    addMessage,
    clearMessages,
    speak,
    settings,
    updateSettings,
  } = useAppContext();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    setIsLoading(true);

    try {
      // Query chatbot
      const response = await chatbotAPI.query(
        userMessage,
        settings.provider,
        settings.useRag
      );

      // Add bot response
      addMessage({
        role: 'assistant',
        content: response.response,
        contextUsed: response.context_used,
      });

      // If auto-speak is enabled, trigger avatar (async to not block chat)
      if (settings.autoSpeak) {
        // Don't await - let speech generation happen in background
        avatarAPI.speak(response.response)
          .then(speechData => {
            speak(response.response, speechData.audio_base64, speechData.visemes);
          })
          .catch(error => {
            console.error('Speech generation failed:', error);
            // Chat still works even if speech fails
          });
      }
    } catch (error) {
      console.error('Error querying chatbot:', error);
      let errorMessage = 'Failed to get response. Check console for details.';
      
      if (error.response) {
        // Server responded with error
        const errorDetail = error.response.data?.detail || error.response.data?.message || 'Unknown server error';
        errorMessage = `Server error: ${errorDetail}`;
        console.error('Server error details:', error.response.data);
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'No response from server. Is the backend running?';
        console.error('No response received:', error.request);
      } else {
        // Error setting up request
        errorMessage = `Request error: ${error.message}`;
        console.error('Request setup error:', error.message);
      }
      
      addMessage({
        role: 'error',
        content: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadStatus('Uploading...');

    try {
      const result = await chatbotAPI.uploadDocuments(files);
      setUploadStatus(`Uploaded ${files.length} file(s). Added ${result.chunks_added} chunks.`);
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadStatus('Upload failed');
      setTimeout(() => setUploadStatus(''), 3000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearDocuments = async () => {
    try {
      await chatbotAPI.clearDocuments();
      setUploadStatus('Documents cleared');
      setTimeout(() => setUploadStatus(''), 2000);
    } catch (error) {
      console.error('Error clearing documents:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        p: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          AI Chat
        </Typography>

        {/* Settings */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Using: Gemini API
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.useRag}
                onChange={(e) => updateSettings({ useRag: e.target.checked })}
                disabled={true}
              />
            }
            label="Use RAG (requires OpenAI)"
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.autoSpeak}
                onChange={(e) => updateSettings({ autoSpeak: e.target.checked })}
              />
            }
            label="Auto-speak"
          />
        </Box>

        {/* Document Upload */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Docs
          </Button>
          <IconButton size="small" onClick={handleClearDocuments} title="Clear documents">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        {uploadStatus && (
          <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
            {uploadStatus}
          </Typography>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          mb: 2,
        }}
      >
        <List>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                flexDirection: 'column',
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: '85%',
                  backgroundColor:
                    message.role === 'user'
                      ? 'primary.dark'
                      : message.role === 'error'
                      ? 'error.dark'
                      : 'background.paper',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
                {message.contextUsed && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    📚 Used RAG context
                  </Typography>
                )}
              </Paper>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Input */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          size="small"
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>

      {messages.length > 0 && (
        <Button
          size="small"
          onClick={clearMessages}
          sx={{ mt: 1 }}
        >
          Clear Chat
        </Button>
      )}
    </Box>
  );
};

export default ChatModule;


