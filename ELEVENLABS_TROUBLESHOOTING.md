# ElevenLabs API Troubleshooting Guide

## 🚨 Current Issue Detected

Your ElevenLabs API key is returning a **401 Unauthorized** error with message:
```
detected_unusual_activity - Free Tier usage disabled
```

## 🔍 Common Causes

### 1. **VPN/Proxy Detection**
ElevenLabs Free Tier blocks VPN/proxy usage to prevent abuse.

**Solution:**
- Disable VPN/proxy when using ElevenLabs
- OR upgrade to a paid plan (VPN allowed on paid plans)

### 2. **Multiple Free Accounts**
Creating multiple free accounts from the same location triggers abuse detection.

**Solution:**
- Use only one free account per person
- Contact support@elevenlabs.io if legitimate

### 3. **API Key Issues**
- Expired or regenerated API key
- Copy-paste errors with whitespace

**Solution:**
```bash
# Check your API key at:
https://elevenlabs.io/app/settings/api-keys

# Update .env file:
cd /home/ali/Documents/DrTalha/backend
nano .env

# Format (no quotes, no spaces):
ELEVENLABS_API_KEY=sk_your_actual_key_here
```

### 4. **Free Tier Limits Exceeded**
Free tier: 10,000 characters/month

**Solution:**
- Check usage at https://elevenlabs.io/app/usage
- Wait for monthly reset
- OR upgrade to paid plan

---

## ✅ Step-by-Step Fix

### Step 1: Verify API Key

1. Go to https://elevenlabs.io/app/settings/api-keys
2. Copy your API key (starts with `sk_`)
3. Update your `.env` file:

```bash
cd /home/ali/Documents/DrTalha/backend
nano .env
```

Make sure it looks like this (NO quotes, NO spaces):
```env
GEMINI_API_KEY=AIzaSyC4S8MnFC14GmuNbRLy1nD7qZvUxTuEWVI
ELEVENLABS_API_KEY=sk_d3232c331bdb9ff9f372c8b7572680342fd6a75aa5a975db
```

### Step 2: Disable VPN/Proxy

If you're using a VPN or proxy:
1. Temporarily disable it
2. Test the API again
3. If it works, either:
   - Use without VPN
   - Upgrade to paid plan (allows VPN)

### Step 3: Check Account Status

Visit: https://elevenlabs.io/app/usage

Check:
- ✅ Account is active
- ✅ Character limit not exceeded
- ✅ No unusual activity warnings

### Step 4: Restart Backend

```bash
# Stop backend
pkill -f "python run.py"

# Restart
cd /home/ali/Documents/DrTalha/backend
source venv/bin/activate
python run.py
```

### Step 5: Test API

```bash
# Check health
curl http://localhost:8000/api/avatar/health | python3 -m json.tool

# Test speech generation
curl -X POST http://localhost:8000/api/avatar/speak \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "return_audio": true}'
```

---

## 🔄 Alternative: Use Different TTS Provider

If ElevenLabs free tier isn't working, you have options:

### Option 1: Google Text-to-Speech (gTTS)
**Pros:** Free, unlimited, no API key needed
**Cons:** Basic voice quality

```bash
# Update requirements.txt
cd backend
nano requirements.txt

# Replace:
elevenlabs==1.2.2
# With:
gTTS==2.5.0

# Reinstall
pip install gTTS==2.5.0
```

### Option 2: Upgrade to ElevenLabs Paid Plan
**Starter Plan:** $5/month - 30,000 characters
**Creator Plan:** $22/month - 100,000 characters

Benefits:
- ✅ VPN/Proxy allowed
- ✅ Higher quality voices
- ✅ More voice options
- ✅ Priority support

Upgrade at: https://elevenlabs.io/pricing

### Option 3: OpenAI TTS
Requires OpenAI API key but very affordable ($0.015 per 1,000 characters)

---

## 🧪 Testing Your Fix

### Test 1: Health Check
```bash
curl http://localhost:8000/api/avatar/health
```

Expected response:
```json
{
  "status": "healthy",
  "tts_initialized": true,
  "error": null
}
```

### Test 2: Generate Speech
```bash
curl -X POST http://localhost:8000/api/avatar/speak \
  -H "Content-Type: application/json" \
  -d '{"text": "Testing voice", "return_audio": true}' \
  -o test_audio.mp3
```

If successful, `test_audio.mp3` will be created.

### Test 3: Frontend Test
1. Open browser: http://localhost:5173
2. Type a message
3. Click "Speak"
4. Should hear audio without errors

---

## 📞 Still Having Issues?

### ElevenLabs Support
- Email: support@elevenlabs.io
- Discord: https://discord.gg/elevenlabs
- Docs: https://docs.elevenlabs.io/

### Check Backend Logs
```bash
# View real-time logs
cd /home/ali/Documents/DrTalha/backend
tail -f *.log  # if logging to file

# Or check console output where backend is running
```

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| 401 Unauthorized | API key invalid or activity detected | Check key, disable VPN |
| 429 Rate Limited | Exceeded character limit | Wait or upgrade |
| 403 Forbidden | Account suspended | Contact support |
| 500 Server Error | ElevenLabs API down | Check status.elevenlabs.io |

---

## 💡 Pro Tips

1. **Cache is Your Friend**
   - Repeated phrases are cached automatically
   - Saves API calls and characters
   - Check cache size in health endpoint

2. **Monitor Usage**
   - Check dashboard regularly
   - Set up usage alerts
   - Plan upgrades before hitting limits

3. **Voice Selection**
   - Different voices have different performance
   - Test multiple voices to find best quality
   - Some voices work better for specific content

4. **Test Mode**
   - Use short texts while testing
   - Avoid wasting characters on debugging
   - Use cached responses when possible

---

## ✅ Success Checklist

- [ ] API key copied correctly (no spaces/quotes)
- [ ] VPN/Proxy disabled
- [ ] Account active and not suspended
- [ ] Character limit not exceeded
- [ ] .env file updated and saved
- [ ] Backend restarted
- [ ] Health check returns "healthy"
- [ ] Test audio generation works
- [ ] Frontend can generate speech

---

**Last Updated:** 2025-11-11
**Your API Key:** `sk_d3232c331bdb9ff9f372c8b7572680342fd6a75aa5a975db`
**Account Check:** https://elevenlabs.io/app/usage
