# Avatar Models Directory

Place your 3D avatar model files here.

## Required File

Place your GLB model as:
```
avatar.glb
```

The application will automatically load this model.

## Model Requirements

### Format
- **GLB format** (GLTF binary)
- Other formats (FBX, OBJ) need conversion to GLB

### Recommended Structure
- Humanoid model with a head
- Optional: Jaw bone for better lip sync
- File size: < 50MB for better loading

### Bone Names (for lip sync detection)
If your model has bones, name the jaw bone with one of:
- "jaw"
- "Jaw"
- "JAW"
- "mouth"
- "Mouth"

The system will automatically detect and animate it.

## Fallback Behavior

If no model is provided or fails to load:
- A simple geometric avatar will be displayed
- Lip sync will still work using shape scaling
- You can still test all functionality

## Finding Free Models

Good sources for free humanoid models:
1. **Mixamo** (https://www.mixamo.com/) - Free rigged characters
2. **Sketchfab** (https://sketchfab.com/) - Many free models (check license)
3. **TurboSquid Free** - Some free models available
4. **Ready Player Me** - Generate custom avatars

## Converting to GLB

If you have a model in another format:

### Using Blender (Free)
1. Import your model (File → Import)
2. Export as GLTF 2.0 (File → Export → glTF 2.0)
3. Choose "GLB" format
4. Enable "Apply Modifiers"
5. Export

### Online Tools
- https://products.aspose.app/3d/conversion - Online converter
- https://anyconv.com/fbx-to-glb-converter/ - FBX to GLB

## Optimizing Your Model

For better performance:
- Reduce polygon count (< 100k triangles)
- Optimize textures (< 2048x2048)
- Remove unnecessary bones
- Merge materials when possible

## Testing Your Model

After placing your model:
1. Refresh the frontend
2. Check browser console for loading messages
3. Use mouse to rotate and zoom
4. Test lip sync by sending a chat message

## Troubleshooting

### Model doesn't load
- Check file name is exactly `avatar.glb`
- Check file size (< 100MB)
- Check browser console for errors
- Try with a simpler model first

### Lip sync doesn't work well
- Check if model has a jaw bone
- Fallback system will use simple animation
- Consider creating morph targets in Blender

### Model looks wrong
- Check orientation (should face forward)
- Check scale (should be normalized)
- Try re-exporting with different settings


