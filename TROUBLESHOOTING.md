# Troubleshooting Guide

## Avatar Not Showing Expressions

### Issue
The avatar face/mouth doesn't change when speaking.

### Solutions Implemented

#### 1. Audio Format Fixed
- **Problem**: Code expected WAV but gTTS generates MP3
- **Fix**: Changed audio MIME type to `audio/mp3`

#### 2. Multi-layer Animation Strategy
The avatar now uses multiple fallback methods:

**Method A: Jaw Bone Animation** (if available)
- Detects bones with names: `jaw`, `mouth`, `chin`, `head`
- Rotates jaw bone based on viseme index
- Best quality lip sync

**Method B: Whole Model Rotation** (if no jaw bone)
- Rotates entire head/model
- Less precise but always works
- Activated when no jaw bone detected

**Method C: Fallback 3D Avatar** (if model fails)
- Simple geometric shapes
- Scales mouth based on viseme
- Always works as last resort

#### 3. Enhanced Debugging
- Console logs show bone detection
- Visual indicator shows current viseme index
- Shows speaking state in real-time

### How to Verify It's Working

1. **Open Browser Console** (F12)
2. **Send a chat message**
3. **Look for these logs**:
   ```
   Model loaded successfully
   Scanning model for bones...
   Found bone: [bone names]
   ✓ Using bone for lip sync: [bone name]
   Playing audio with viseme data: X visemes
   Viseme 1 at 0.15s
   Viseme 2 at 0.30s
   ...
   ```

4. **Check the visual indicator** (top-left):
   - Should show changing viseme numbers (0-7)
   - Should show "Speaking: Yes" when active

### Your Model Specifics

**File**: `old_man_bust.glb` (126MB)

#### Check if model has bones:
1. Open browser console
2. Send a message  
3. Look for: `Found bone: [name]`
4. If you see bones listed, animation uses Method A
5. If "No bones found", animation uses Method B (whole model)

### Viseme Reference

When speaking, you should see these values:
```
0: Silence (mouth closed)
1: Open (A, E sounds) - widest
2: Smile (I sounds)
3: Round (O sounds)
4: Pursed (U sounds)
5: Closed (M, B, P)
6: Teeth on lip (F, V)
7: Teeth visible (Th, S, Z)
```

### Common Issues

#### Avatar loads but doesn't animate
- **Check**: Is "Auto-speak" toggle enabled?
- **Check**: Does console show viseme changes?
- **Fix**: Look for JavaScript errors in console

#### Viseme numbers change but no visible movement
- **Likely cause**: Model has no jaw bone
- **What's happening**: Whole model rotation is subtle
- **Solution**: Increase rotation values or add visual overlay

#### Audio plays but no viseme data
- **Check**: Backend TTS is working
- **Check**: Console shows "Playing audio with viseme data: X visemes"
- **Fix**: Backend might not be generating visemes

### Advanced Solutions

#### If your model has no animatable bones:

**Option 1: Add 2D Mouth Overlay**
```jsx
// Add animated sprite/image over model mouth
<sprite position={mouthPosition}>
  <spriteMaterial map={mouthTexture} />
</sprite>
```

**Option 2: Shader-based Deformation**
```jsx
// Use vertex shader to deform mesh
const mouthShader = {
  vertexShader: `...`,
  fragmentShader: `...`
}
```

**Option 3: Replace with Fallback Avatar**
In `AvatarScene.jsx` line 154:
```jsx
const [useModel, setUseModel] = useState(false);
```
This will use the simple geometric avatar that always works.

### Testing Each Component

#### Test TTS Generation:
```bash
curl -X POST http://localhost:8000/api/avatar/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world"}' | python3 -m json.tool
```

Should return:
```json
{
  "audio_base64": "...",
  "visemes": [...],
  "duration": 1.6
}
```

#### Test Viseme Changes:
Open browser console and watch for:
```
Viseme 0 at 0.00s
Viseme 1 at 0.15s
Viseme 5 at 0.30s
...
```

If you see these logs, visemes ARE changing - the model just might not be responding visually.

### Debugging Checklist

- [ ] Backend running (http://localhost:8000/health returns healthy)
- [ ] Frontend running (http://localhost:3000 loads)
- [ ] Console shows "Model loaded successfully"
- [ ] Console shows bone detection messages
- [ ] Console shows "Playing audio with viseme data: X visemes"
- [ ] Console shows "Viseme X at Y.YYs" messages
- [ ] Top-left indicator shows changing viseme numbers
- [ ] Audio plays when message sent
- [ ] "Speaking: Yes" appears in indicator

If ALL checks pass but still no visible animation:
→ Your model likely has no moveable jaw bone
→ Use fallback avatar or add 2D mouth overlay

### Quick Fixes

**Make animations more visible:**

Edit `/home/ali/Documents/DrTalha/frontend/src/modules/avatar/AvatarScene.jsx`:

Line 77-85, increase rotation values:
```jsx
const rotations = {
  0: 0,       // silence
  1: 0.6,     // open (was 0.3, doubled for visibility)
  2: 0.2,     // smile (was 0.1, doubled)
  3: 0.4,     // round (was 0.2, doubled)
  4: 0.3,     // pursed (was 0.15, doubled)
  5: 0,       // closed
  6: 0.1,     // teeth on lip (was 0.05, doubled)
  7: 0.3,     // teeth visible (was 0.15, doubled)
};
```

This makes jaw movements more obvious.

### Still Not Working?

Switch to agent mode and tell me:
> "Make lip sync more visible"

I'll implement:
1. Larger jaw rotations
2. Additional head movements
3. Visual mouth overlay
4. Better debugging

