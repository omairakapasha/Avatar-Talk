import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [currentSpeech, setCurrentSpeech] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [settings, setSettings] = useState({
    provider: 'gemini',
    useRag: false,  // Disabled by default (requires OpenAI API key)
    autoSpeak: true,
  });

  // Add message to chat
  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, {
      ...message,
      id: Date.now() + Math.random(),
      timestamp: new Date(),
    }]);
  }, []);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Trigger avatar to speak
  const speak = useCallback((text, audioData, visemeData) => {
    setCurrentSpeech({
      text,
      audioData,
      visemeData,
      timestamp: Date.now(),
    });
  }, []);

  // Update speaking state
  const updateSpeakingState = useCallback((speaking) => {
    setIsSpeaking(speaking);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const value = {
    messages,
    addMessage,
    clearMessages,
    currentSpeech,
    speak,
    isSpeaking,
    updateSpeakingState,
    settings,
    updateSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};


