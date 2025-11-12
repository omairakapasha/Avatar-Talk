# Frontend - AI Avatar Chatbot UI

React frontend with modular architecture for chat interface and 3D avatar display.

## Modules

### 1. Chat Module (`src/modules/chatbot/`)
- **Purpose**: Chat interface for user interaction
- **Features**:
  - Message display with role-based styling
  - LLM provider selection (Gemini/OpenAI)
  - RAG toggle
  - Document upload
  - Auto-speak toggle
- **Dependencies**: Material-UI, axios
- **Communication**: Uses AppContext to share messages and trigger speech

### 2. Avatar Module (`src/modules/avatar/`)
- **Purpose**: 3D avatar display with lip sync
- **Features**:
  - GLB model loading
  - Fallback simple 3D avatar
  - Jaw bone animation for lip sync
  - 8 viseme-based mouth shapes
  - Audio playback synchronization
- **Dependencies**: React Three Fiber, Three.js, @react-three/drei
- **Communication**: Listens to AppContext for speech events

### 3. Shared Module (`src/modules/shared/`)
- **Purpose**: Shared context and utilities
- **Features**:
  - AppContext for inter-module communication
  - Message management
  - Speech state management
  - Settings management

## Architecture

Modules are **completely independent** and communicate only through the shared AppContext:

```
ChatModule --> AppContext <-- AvatarModule
```

- Chat sends messages and responses to context
- Avatar listens for speech events from context
- No direct coupling between modules

## Setup

1. Install dependencies:
```bash
npm install
```

2. Place your GLB model:
```bash
# Copy your avatar model to:
frontend/public/models/avatar.glb
```

3. Configure environment:
```bash
cp .env.example .env
```

4. Run development server:
```bash
npm run dev
```

## Adding New Modules

1. Create directory: `src/modules/your_module/`
2. Create main component: `YourModule.jsx`
3. Import `useAppContext` for communication
4. Add to `App.jsx`:
```jsx
import YourModule from './modules/your_module/YourModule';

// In render:
<YourModule />
```

## Lip Sync Implementation

The avatar uses viseme-based lip sync without morph targets:

### Method 1: Jaw Bone Animation (Preferred)
- Automatically detects jaw bone in GLB model
- Rotates jaw based on viseme index
- Smooth interpolation

### Method 2: Fallback 3D Avatar
- Simple geometric shapes
- Scales mouth based on viseme
- Always works as fallback

### Viseme Mapping
```
0: Silence
1: Open (A, E sounds)
2: Smile (I sounds)
3: Round (O sounds)
4: Pursed (U sounds)
5: Closed (M, B, P)
6: Teeth on lip (F, V)
7: Teeth visible (Th, S, Z)
```

## Module Communication Flow

1. User types message in ChatModule
2. ChatModule queries backend API
3. ChatModule adds response to AppContext
4. If auto-speak enabled, ChatModule triggers `speak()` in context
5. AvatarModule receives speech event from context
6. AvatarModule plays audio and animates avatar
7. AvatarModule updates speaking state in context

This ensures modules remain independent and testable.


