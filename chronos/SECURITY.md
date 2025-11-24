# Security Guide

This document outlines the security measures implemented in the Chronos Time Capsule application.

## 🔐 API Security

### Gemini API Key Protection

**Status: ✅ SECURED**

The Gemini API key is now protected using a backend proxy server:

- **Before**: API key was exposed in the client-side JavaScript bundle
- **After**: API key is stored server-side only and never exposed to the browser

**Implementation:**
- Backend API server (`server/index.js`) handles all Gemini API calls
- Frontend makes requests to `/api/gemini/*` endpoints
- Rate limiting: 10 requests per minute per IP address
- CORS protection: Only allows requests from configured origins

**To use:**
1. Start the backend server: `cd server && npm install && npm run dev`
2. Set `VITE_API_URL` in `.env.local` (defaults to `http://localhost:3001`)

### Firebase Configuration

**Status: ✅ SECURED**

Firebase configuration is now loaded from environment variables:

- All Firebase config values use `VITE_*` environment variables
- Falls back to hardcoded values for development (should be replaced in production)
- `.env.local` is in `.gitignore` to prevent committing secrets

## 🛡️ Firebase Security Rules

### Realtime Database Rules

**Location:** `firebase-database.rules.json`

**Protections:**
- ✅ Users can only read/write their own data
- ✅ Capsule data validation (required fields, valid status values)
- ✅ User ID must match authenticated user
- ✅ Prevents unauthorized access to other users' data

**To deploy:**
```bash
firebase deploy --only database
```

### Storage Rules

**Location:** `firebase-storage.rules`

**Protections:**
- ✅ Users can only access files in their own `users/{userId}/` path
- ✅ File size limit: 10MB per file
- ✅ Content type validation (images, videos, audio only)
- ✅ Prevents unauthorized file access

**To deploy:**
```bash
firebase deploy --only storage
```

## 📋 Environment Variables

### Required for Backend Server

Create `server/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
ALLOWED_ORIGIN=http://localhost:3000
PORT=3001
```

### Required for Frontend

Update `.env.local`:
```env
# Firebase Configuration (optional - has defaults)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Backend API URL
VITE_API_URL=http://localhost:3001
```

## 🔒 Security Best Practices

### ✅ Implemented

1. **API Key Protection**: Gemini API key never exposed to client
2. **Rate Limiting**: Prevents API abuse (10 req/min per IP)
3. **CORS Protection**: Only allows requests from configured origins
4. **Firebase Rules**: Strict access control for database and storage
5. **Environment Variables**: Sensitive data in `.env.local` (gitignored)
6. **Input Validation**: Server validates all API requests
7. **Error Handling**: Graceful fallbacks prevent information leakage

### ⚠️ Recommended for Production

1. **HTTPS Only**: Use SSL/TLS certificates in production
2. **API Authentication**: Add JWT tokens or API keys for backend endpoints
3. **Redis Rate Limiting**: Replace in-memory rate limiting with Redis
4. **Monitoring**: Set up error tracking (Sentry, etc.)
5. **Firebase App Check**: Enable Firebase App Check to prevent abuse
6. **API Quotas**: Set up quotas in Google Cloud Console for Gemini API
7. **Backup Rules**: Regularly backup and test Firebase security rules

## 🚨 Security Checklist

Before deploying to production:

- [ ] Remove hardcoded Firebase config fallbacks
- [ ] Set up production environment variables
- [ ] Deploy Firebase security rules
- [ ] Enable Firebase App Check
- [ ] Set up HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Set up API rate limiting (Redis)
- [ ] Enable monitoring and alerts
- [ ] Review and test all security rules
- [ ] Set up API quotas in Google Cloud Console

## 📞 Security Issues

If you discover a security vulnerability, please:
1. Do NOT create a public GitHub issue
2. Contact the maintainers directly
3. Provide details of the vulnerability

## 📚 Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Google Cloud API Security](https://cloud.google.com/apis/design/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

