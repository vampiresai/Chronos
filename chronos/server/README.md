# Chronos API Server

Secure backend proxy for Gemini API calls. This server protects your API keys by handling all Gemini requests server-side.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
ALLOWED_ORIGIN=http://localhost:3000
PORT=3001
```

3. Start the server:
```bash
npm run dev
```

## API Endpoints

### Health Check
```
GET /health
```

### Generate Letter
```
POST /api/gemini/generate-letter
Body: {
  "userThoughts": "string",
  "durationDescription": "string"
}
```

### Suggest Title
```
POST /api/gemini/suggest-title
Body: {
  "content": "string"
}
```

## Security Features

- ✅ API key never exposed to client
- ✅ Rate limiting (10 requests/minute per IP)
- ✅ CORS protection
- ✅ Input validation
- ✅ Error handling with fallbacks

## Production Deployment

For production, consider:
- Using a process manager (PM2, systemd)
- Setting up HTTPS/SSL
- Using Redis for distributed rate limiting
- Adding authentication (JWT tokens)
- Setting up monitoring and logging

