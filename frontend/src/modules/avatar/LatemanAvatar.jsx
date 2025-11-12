import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';

// Speech: "well I met Doris at the bus stop on a rainy day no umbrella both of us drenched offered her a coat"
// Map viseme indices (from backend) to video frame ranges that best represent those mouth shapes
const VISEME_FRAME_MAP_ADJUSTED = {
  0: [1, 2, 38],                 // silence/neutral (rest frames)
  1: [3, 4, 8, 9, 15, 16, 19, 20, 26, 33], // open (A, E sounds) - "well", "met", "at", "rainy", "day"
  2: [10, 17, 27],               // smile (I sounds) - "I", "rainy"
  3: [11, 12, 21, 22, 30, 37],   // round (O sounds) - "Doris", "on", "no", "coat"
  4: [7, 13, 14, 23, 24, 28],    // pursed (U sounds) - "bus", "umbrella", "us"
  5: [5, 6, 18, 25, 29, 35],     // closed (M, B, P) - "met", "bus", "stop", "umbrella", "both"
  6: [36],                       // teeth_lip (F, V) - "offered"
  7: [31, 32, 34],               // teeth (Th, S, Z) - "the", "us", "drenched"
};

const TOTAL_FRAMES = 38;

// Memoize canvas operations to prevent unnecessary recalculations
const applyChromaKey = (ctx, width, height) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Detect green screen (bright green) - optimized condition
    if (g > 200 && r < 100 && b < 100) {
      data[i + 3] = 0; // Make transparent
    }
  }

  ctx.putImageData(imageData, 0, 0);
};

const LatemanAvatar = ({ audioTime = 0, audioDuration = 0, visemeIndex = 0, isSpeaking = false }) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [loadedImages, setLoadedImages] = useState({});
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  const lastVisemeRef = useRef(0);
  const visemeStartTimeRef = useRef(0);
  const imageLoadPromisesRef = useRef({});
  const frameAnimationRef = useRef(null);
  const lastFrameRef = useRef(1);
  const audioTimeRef = useRef(0);
  const visemeIndexRef = useRef(0);
  const isSpeakingRef = useRef(false);

  // Optimized image preloading with caching
  useEffect(() => {
    const loadFrames = async () => {
      const images = {};
      
      // Create loading promises for all frames
      const loadPromises = Array.from({length: TOTAL_FRAMES}, (_, i) => {
        const frameNum = i + 1;
        
        // Check if we already have a loading promise for this frame
        if (!imageLoadPromisesRef.current[frameNum]) {
          imageLoadPromisesRef.current[frameNum] = new Promise((resolve) => {
            const img = new Image();
            
            img.onload = () => {
              images[frameNum] = img;
              resolve();
            };
            img.onerror = () => {
              console.warn(`Failed to load Lateman frame-${frameNum}.png`);
              resolve();
            };
            img.src = `/models/Lateman/frame-${frameNum}.png`;
          });
        }
        
        return imageLoadPromisesRef.current[frameNum];
      });

      await Promise.all(loadPromises);
      setLoadedImages(images);
      setLoading(false);
      console.log(`✅ Lateman: Loaded ${Object.keys(images).length} frames`);
    };

    loadFrames();
    
    // Cleanup function
    return () => {
      imageLoadPromisesRef.current = {};
    };
  }, []);

  // Track previous viseme for logging
  const prevVisemeRef = useRef(visemeIndex);
  
  // Update refs with latest values
  useEffect(() => {
    const prevViseme = prevVisemeRef.current;
    audioTimeRef.current = audioTime;
    visemeIndexRef.current = visemeIndex;
    isSpeakingRef.current = isSpeaking;
    
    // Debug: Log when viseme changes
    if (visemeIndex !== prevViseme) {
      console.log(`📢 LatemanAvatar: visemeIndex changed ${prevViseme} -> ${visemeIndex}, isSpeaking: ${isSpeaking}, audioTime: ${audioTime.toFixed(3)}s`);
      prevVisemeRef.current = visemeIndex;
    }
  }, [audioTime, visemeIndex, isSpeaking]);

  // Continuous frame animation loop for smooth lip sync
  useEffect(() => {
    if (loading) {
      // Cancel any running animation
      if (frameAnimationRef.current) {
        cancelAnimationFrame(frameAnimationRef.current);
        frameAnimationRef.current = null;
      }
      return;
    }
    
    if (!isSpeaking) {
      setCurrentFrame(1);
      lastFrameRef.current = 1;
      lastVisemeRef.current = 0;
      visemeStartTimeRef.current = 0;
      // Cancel animation when not speaking
      if (frameAnimationRef.current) {
        cancelAnimationFrame(frameAnimationRef.current);
        frameAnimationRef.current = null;
      }
      return;
    }

    // Start/restart continuous animation loop
    const frameAnimationLoop = () => {
      // Use refs to get latest values (not closure values)
      const currentAudioTime = audioTimeRef.current;
      const currentVisemeIndex = visemeIndexRef.current;
      const currentlySpeaking = isSpeakingRef.current;

      if (!currentlySpeaking || loading) {
        if (frameAnimationRef.current) {
          cancelAnimationFrame(frameAnimationRef.current);
          frameAnimationRef.current = null;
        }
        return;
      }

      // Detect viseme change and reset timer - MUST check this first
      if (currentVisemeIndex !== lastVisemeRef.current) {
        console.log(`🔄 Viseme changed: ${lastVisemeRef.current} -> ${currentVisemeIndex} at ${currentAudioTime.toFixed(2)}s`);
        lastVisemeRef.current = currentVisemeIndex;
        visemeStartTimeRef.current = currentAudioTime;
        // Force frame update when viseme changes
        lastFrameRef.current = -1; // Force update
      }

      // Get frames for current viseme
      const frames = VISEME_FRAME_MAP_ADJUSTED[currentVisemeIndex] || VISEME_FRAME_MAP_ADJUSTED[0];
      
      if (!frames || frames.length === 0) {
        console.warn(`⚠️ No frames for viseme ${currentVisemeIndex}`);
        frameAnimationRef.current = requestAnimationFrame(frameAnimationLoop);
        return;
      }

      // Calculate time since viseme started
      const visemeTime = Math.max(0, currentAudioTime - visemeStartTimeRef.current);
      
      // Cycle through frames: 2 seconds per frame (0.5 frames per second)
      const frameChangeRate = 1 / 2; // frames per second (0.5)
      const frameSetIndex = Math.floor(visemeTime * frameChangeRate) % frames.length;
      const newFrame = frames[frameSetIndex];
      
      // Always update frame to ensure animation
      if (newFrame && newFrame !== lastFrameRef.current) {
        lastFrameRef.current = newFrame;
        setCurrentFrame(newFrame);
        console.log(`🎬 Frame ${newFrame} (viseme ${currentVisemeIndex}, index ${frameSetIndex}/${frames.length}, time ${visemeTime.toFixed(3)}s)`);
      } else if (!newFrame) {
        console.warn(`⚠️ Invalid frame index ${frameSetIndex} for viseme ${currentVisemeIndex}`);
      }

      // Continue animation loop - ALWAYS continue if speaking
      if (currentlySpeaking && !loading) {
        frameAnimationRef.current = requestAnimationFrame(frameAnimationLoop);
      } else {
        frameAnimationRef.current = null;
      }
    };

    // Cancel existing animation before starting new one
    if (frameAnimationRef.current) {
      cancelAnimationFrame(frameAnimationRef.current);
    }
    
    // Reset viseme tracking when starting
    lastVisemeRef.current = visemeIndex;
    visemeStartTimeRef.current = audioTime;
    
    // Start the animation loop
    frameAnimationRef.current = requestAnimationFrame(frameAnimationLoop);
    
    return () => {
      if (frameAnimationRef.current) {
        cancelAnimationFrame(frameAnimationRef.current);
        frameAnimationRef.current = null;
      }
    };
  }, [visemeIndex, audioTime, isSpeaking, loading]);

  // Optimized canvas rendering with requestAnimationFrame
  useEffect(() => {
    if (!canvasRef.current || !loadedImages[currentFrame]) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { 
      alpha: true, 
      willReadFrequently: true
    });
    const img = loadedImages[currentFrame];

    if (!img || !img.complete) return;

    // Use requestAnimationFrame for smooth rendering
    const renderFrame = () => {
      const dpr = window.devicePixelRatio || 1;
      
      // Crop 0% from left, 3% from right (restore 5% width on right), 15% top, 20% bottom
      const cropLeftPercent = 0.00;
      const cropRightPercent = 0.03;
      const cropTopPercent = 0.15;
      const cropBottomPercent = 0.20;
      
      const sourceX = img.width * cropLeftPercent;
      const sourceY = img.height * cropTopPercent;
      const sourceWidth = img.width * (1 - cropLeftPercent - cropRightPercent);  // 97% of width
      const sourceHeight = img.height * (1 - cropTopPercent - cropBottomPercent); // 65% of height
      
      // Scale to fit within max dimensions while maintaining aspect ratio
      const maxWidth = 800;
      const maxHeight = 600;
      
      const scaleX = maxWidth / sourceWidth;
      const scaleY = maxHeight / sourceHeight;
      const scale = Math.min(scaleX, scaleY, 1); // Don't upscale
      
      const displayWidth = sourceWidth * scale;
      const displayHeight = sourceHeight * scale;
      
      // Only update canvas size if it changed
      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';
      }

      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // Draw cropped and scaled image
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,  // source (cropped)
        0, 0, displayWidth, displayHeight              // destination (scaled)
      );

      // Apply chroma key to remove green background
      try {
        applyChromaKey(ctx, displayWidth, displayHeight);
      } catch (error) {
        console.warn('Chroma key failed:', error);
      }
    };

    requestAnimationFrame(renderFrame);
  }, [currentFrame, loadedImages]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#C9CAC7',
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
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          filter: 'none',
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
          Loading Lateman avatar...
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
          <div>Lateman Avatar (Lip Sync)</div>
          <div>Viseme: {visemeIndex}</div>
          <div>Frame: {currentFrame}/{TOTAL_FRAMES}</div>
          <div>Audio: {(audioTime * 1000).toFixed(0)}ms / {(audioDuration * 1000).toFixed(0)}ms</div>
          <div>Speaking: {isSpeaking ? 'YES' : 'NO'}</div>
          <div>Mode: viseme-synced frames</div>
          <div style={{marginTop: '4px', fontSize: '0.75rem', opacity: 0.7}}>
            Cropped: 0% L, 3% R, 15% top, 20% bottom
          </div>
        </Box>
      )}
    </Box>
  );
};

export default LatemanAvatar;