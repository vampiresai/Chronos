import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Rate limiting (simple in-memory store - use Redis in production)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const limit = rateLimitMap.get(ip);
  
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ 
      error: 'Too many requests. Please try again later.' 
    });
  }
  
  limit.count++;
  next();
}

// Initialize Gemini AI (server-side only)
let ai = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('✅ Gemini AI initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error.message);
  }
} else {
  console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    geminiAvailable: !!ai,
    timestamp: new Date().toISOString()
  });
});

// Generate future letter endpoint
app.post('/api/gemini/generate-letter', rateLimit, async (req, res) => {
  if (!ai) {
    return res.status(503).json({ 
      error: 'Gemini AI service is not available',
      fallback: {
        subject: 'A Letter from the Past',
        content: req.body.userThoughts || 'Remember this moment.'
      }
    });
  }

  try {
    const { userThoughts, durationDescription } = req.body;

    if (!userThoughts) {
      return res.status(400).json({ error: 'userThoughts is required' });
    }

    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a time travel assistant. The user is creating a time capsule to be opened in ${durationDescription || 'the future'}.
      The user has provided some raw thoughts/notes: "${userThoughts}".
      
      Please rewrite these thoughts into a beautiful, meaningful letter to their future self.
      The tone should be nostalgic yet hopeful.
      Return the result in JSON format with 'subject' and 'content' fields.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ['subject', 'content'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(text);
    res.json(result);
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate letter',
      message: error.message,
      fallback: {
        subject: 'A Letter from the Past',
        content: req.body.userThoughts || 'Remember this moment.'
      }
    });
  }
});

// Suggest title endpoint
app.post('/api/gemini/suggest-title', rateLimit, async (req, res) => {
  if (!ai) {
    return res.status(503).json({ 
      error: 'Gemini AI service is not available',
      fallback: 'My Time Capsule'
    });
  }

  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Suggest a short, creative, 3-5 word title for a time capsule containing this message: "${content}". return only the title text.`,
    });

    const title = response.text?.trim() || 'My Time Capsule';
    res.json({ title });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: 'Failed to suggest title',
      fallback: 'My Time Capsule'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for: ${process.env.ALLOWED_ORIGIN || 'http://localhost:3000'}`);
});

