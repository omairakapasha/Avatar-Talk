import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';

// Backend generates 8 viseme types (0-7) based on phoneme analysis
// But we have 49 frames! So we map multiple frames to each viseme for variety
// Each viseme randomly picks from its frame pool for natural variation
const VISEME_TO_FRAMES = {
  // Neutral/Silence - calm, resting expressions
  0: [1, 2, 3, 4, 5, 6],
  
  // Open mouth (A, E sounds) - wide open
  1: [14, 15, 16, 17, 18, 19, 21, 22, 37, 38, 44],
  
  // Smile/I sounds - slight smile, narrow opening
  2: [20, 23, 24, 25, 35, 36, 39],
  
  // Round O sounds - rounded lips
  3: [26, 27, 28, 29, 30, 31, 32, 33],
  
  // Pursed U sounds - lips forward
  4: [7, 8, 9, 34, 40, 41, 42],
  
  // Closed M/B/P sounds - lips together
  5: [10, 11, 12, 13, 43, 45, 46],
  
  // Teeth on lip F/V sounds
  6: [47, 48, 49],
  
  // Teeth showing Th/S/Z sounds
  7: [15, 16, 17, 18, 19]
};

const OldManAvatar = ({ visemeIndex = 0, isSpeaking = false }) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [loadedImages, setLoadedImages] = useState({});
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  // Preload all frames
  useEffect(() => {
    const loadFrames = async () => {
      const images = {};
      const frameNumbers = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49
      ];

      const loadPromises = frameNumbers.map((num) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            images[num] = img;
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load frame-${num}.png`);
            resolve();
          };
          img.src = `/models/oldman/frame-${num}.png`;
        });
      });

      await Promise.all(loadPromises);
      setLoadedImages(images);
      setLoading(false);
    };

    loadFrames();
  }, []);

  // Update frame based on viseme
  useEffect(() => {
    if (!isSpeaking) {
      // When not speaking, use first neutral frame
      setCurrentFrame(1);
      return;
    }

    // Get frame list for current viseme
    const frames = VISEME_TO_FRAMES[visemeIndex] || VISEME_TO_FRAMES[0];
    
    // Pick a random frame from the list for variation
    const randomFrame = frames[Math.floor(Math.random() * frames.length)];
    setCurrentFrame(randomFrame);
    
  }, [visemeIndex, isSpeaking]);

  // Render current frame to canvas with chroma key (remove green background)
  // Crop 25% from left side
  useEffect(() => {
    if (!canvasRef.current || !loadedImages[currentFrame]) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
    const img = loadedImages[currentFrame];

    if (!img || !img.complete) return;

    const dpr = window.devicePixelRatio || 1;
    
    // Calculate crop: skip 25% from left, use remaining 75%
    const cropLeft = img.width * 0.25;  // Skip left 25%
    const croppedWidth = img.width * 0.75;  // Use right 75%
    const croppedHeight = img.height;
    
    // Set canvas size to cropped dimensions
    canvas.width = croppedWidth * dpr;
    canvas.height = croppedHeight * dpr;
    canvas.style.width = croppedWidth + 'px';
    canvas.style.height = croppedHeight + 'px';

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, croppedWidth, croppedHeight);

    // Draw image cropped: skip left 25%
    ctx.drawImage(
      img,
      cropLeft,        // source x (start at 25% from left)
      0,               // source y
      croppedWidth,    // source width (75% of original)
      croppedHeight,   // source height (100% of original)
      0,               // dest x
      0,               // dest y
      croppedWidth,    // dest width
      croppedHeight    // dest height
    );

    // Apply chroma key to remove green background
    try {
      const imageData = ctx.getImageData(0, 0, croppedWidth, croppedHeight);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Detect green screen (bright green)
        if (g > 200 && r < 100 && b < 100) {
          // Make pixel transparent
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    } catch (error) {
      console.warn('Chroma key failed:', error);
    }
  }, [currentFrame, loadedImages]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle glow when speaking */}
      {isSpeaking && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(100, 200, 255, 0.05) 0%, transparent 60%)',
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.2 },
              '50%': { opacity: 0.5 },
            },
          }}
        />
      )}

      {/* Canvas for frame rendering */}
      <canvas
        ref={canvasRef}
        style={{
          minWidth: '773px',
          minHeight: '527px',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: isSpeaking ? 'drop-shadow(0 4px 12px rgba(100, 200, 255, 0.3))' : 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))',
          transition: 'filter 0.3s ease',
        }}
      />

      {/* Loading state */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            color: '#333',
            fontSize: '1.2rem',
          }}
        >
          Loading oldman avatar...
        </Box>
      )}

      {/* Debug overlay */}
      {!loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
          }}
        >
          <div>Old Man Avatar</div>
          <div>Frame: {currentFrame}</div>
          <div>Viseme: {visemeIndex}</div>
          <div>Speaking: {isSpeaking ? 'YES' : 'NO'}</div>
        </Box>
      )}
    </Box>
  );
};

export default OldManAvatar;

