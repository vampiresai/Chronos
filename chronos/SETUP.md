# Setup Guide

## Quick Start

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Setup Backend Server (Required for Gemini AI)

```bash
cd server
npm install
```

Create `server/.env`:
```env
GEMINI_API_KEY="YOUR-API-KEY"
ALLOWED_ORIGIN=http://localhost:3000
PORT=3001
```

Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend Environment

Update `.env.local` (create if it doesn't exist):
```env
# Backend API URL
VITE_API_URL=http://localhost:3001

# Optional: Firebase config (has defaults)
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# ... etc
```

### 4. Deploy Firebase Security Rules

**Realtime Database:**
1. Go to Firebase Console → Realtime Database → Rules
2. Copy contents from `firebase-database.rules.json`
3. Paste and click "Publish"

**Storage:**
1. Go to Firebase Console → Storage → Rules
2. Copy contents from `firebase-storage.rules`
3. Paste and click "Publish"

### 5. Start Frontend

```bash
npm run dev
```

## Running Both Servers

You need both servers running:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## Security Notes

- ✅ Gemini API key is now protected (server-side only)
- ✅ Firebase config uses environment variables
- ✅ Security rules protect your data
- ⚠️ Make sure to deploy Firebase rules before production use

