import React, { lazy, Suspense } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { AppProvider } from './modules/shared/AppContext';

// Lazy load modules for better performance
const ChatModule = lazy(() => import('./modules/chatbot/ChatModule'));
const AvatarModule = lazy(() => import('./modules/avatar/AvatarModule'));

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2d2d2d',
    },
  },
});

// Loading component
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppProvider>
        <Box
          sx={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
          }}
        >
          {/* Avatar Module - Independent */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            <Suspense fallback={<LoadingFallback />}>
              <AvatarModule />
            </Suspense>
          </Box>

          {/* Chat Module - Independent */}
          <Box
            sx={{
              width: 400,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: 'background.paper',
            }}
          >
            <Suspense fallback={<LoadingFallback />}>
              <ChatModule />
            </Suspense>
          </Box>
        </Box>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;