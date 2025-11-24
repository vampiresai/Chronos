## Table of Contents

- [About](#-about)
- [Features](#-features)
- [How It Works](#-how-it-works)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Building for Production](#-building-for-production)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)

---

## About

Chronos is a modern, secure time capsule application that allows users to create digital memories sealed in time. Write messages, attach photos and videos, and set them to unlock at a future date. When the time comes, experience the joy of rediscovering your past thoughts and memories.

### Key Concepts

- **Time Capsules**: Digital containers that hold your messages and media
- **Sealed Memories**: Content locked until a specified future date
- **Timeline View**: Visual representation of all your capsules organized by year
- **Gallery**: Collection of unlocked media from your capsules

---

## Features

### Authentication & Security
- **Secure User Authentication**: Firebase Authentication with email/password
- **User Profiles**: Personalized accounts with display names
- **Data Privacy**: Each user can only access their own capsules
- **Protected API Keys**: Backend proxy protects sensitive API keys

### Time Capsule Creation
- **Rich Text Messages**: Write detailed messages to your future self
- **Media Attachments**: Upload images, videos, and audio files (up to 10MB each)
- **AI-Powered Letter Generation**: Use Gemini AI to transform rough thoughts into beautiful letters
- **Custom Unlock Dates**: Set any future date for your capsule to unlock
- **Quick Notes**: Fast capture widget for spontaneous thoughts

### User Interface
- **Three Main Views**:
  - **Dashboard**: Overview with stats, next unlock countdown, and recent capsules
  - **Timeline**: Chronological view of all capsules organized by year
  - **Gallery**: Visual gallery of unlocked media artifacts
- **Modern Glassmorphism Design**: Beautiful glass-effect UI with smooth animations
- **Responsive Design**: Works on desktop and mobile devices
- **Loading Screen**: Animated loading screen on app startup

### Time Management
- **Countdown Timers**: Real-time countdown to next capsule unlock
- **Progress Tracking**: Visual progress bars showing time until unlock
- **Status Indicators**: Clear visual indicators for locked/unlocked capsules
- **Automatic Unlocking**: Capsules automatically become available when the date arrives

### Interactive Experience
- **Sound Effects**: Audio feedback for user interactions
- **Smooth Animations**: Polished transitions and hover effects
- **Visual Feedback**: Loading states, success messages, and error handling

### Security Features
- **Firebase Security Rules**: Strict access control for database and storage
- **Rate Limiting**: Prevents API abuse (10 requests/minute)
- **CORS Protection**: Secure cross-origin requests
- **Environment Variables**: Sensitive data stored securely

---

## How It Works

### Architecture

1. **Frontend (React + TypeScript)**
   - User interface built with React 19
   - Real-time data synchronization with Firebase
   - Optimized performance with memoization and lazy loading

2. **Backend API Server (Node.js + Express)**
   - Secure proxy for Gemini AI API calls
   - Rate limiting and CORS protection
   - Keeps API keys server-side only

3. **Firebase Services**
   - **Authentication**: User login/signup
   - **Realtime Database**: Stores time capsules and user data
   - **Storage**: Hosts media files (images, videos, audio)

### Data Flow

```
User Action → Frontend → Firebase Auth
                    ↓
              Firebase Realtime DB (Capsules)
                    ↓
              Firebase Storage (Media Files)
                    ↓
              Backend API (AI Features)
```

### Time Capsule Lifecycle

1. **Creation**: User creates a capsule with message, media, and unlock date
2. **Sealing**: Capsule is saved to Firebase with `LOCKED` status
3. **Storage**: Media files uploaded to Firebase Storage
4. **Waiting**: Capsule remains locked until unlock date
5. **Unlocking**: When date arrives, capsule status changes to `UNLOCKED`
6. **Opening**: User can view the capsule content and media

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Firebase Account** - [Sign up](https://firebase.google.com/)
- **Google Cloud Account** (for Gemini API) - [Get API Key](https://makersuite.google.com/app/apikey)

---

## Installation

### 1. Clone or Download the Repository

```bash
# If using git
git clone <repository-url>
cd chronos

# Or download and extract the ZIP file
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

---

## Configuration

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing: `chronos-725d2`
3. Enable **Authentication** → Email/Password
4. Create **Realtime Database** (choose your region)
5. Enable **Storage** (start in test mode)

### 2. Environment Variables

#### Frontend Configuration (`.env.local`)

Create `.env.local` in the root directory:

```env
# Backend API URL (required for AI features)
VITE_API_URL=http://localhost:3001

# VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_DATABASE_URL=YOUR_FIREBASE_DATABASE_URL
VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID

```

#### Backend Configuration (`server/.env`)

Create `server/.env`:

```env
# Gemini API Key (required for AI features)
GEMINI_API_KEY=your_gemini_api_key_here

# Allowed CORS origin (your frontend URL)
ALLOWED_ORIGIN=http://localhost:3000

# Server port
PORT=3001
```

### 3. Deploy Firebase Security Rules

**Option A: Using Firebase Console (Easiest)**

1. **Realtime Database Rules**:
   - Go to Firebase Console → Realtime Database → Rules
   - Copy contents from `firebase-database.rules.json`
   - Paste and click "Publish"

2. **Storage Rules**:
   - Go to Firebase Console → Storage → Rules
   - Copy contents from `firebase-storage.rules`
   - Paste and click "Publish"

**Option B: Using Firebase CLI**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (if not already done)
firebase init

# Deploy rules
firebase deploy --only database,storage
```

See [DEPLOY_FIREBASE_RULES.md](./DEPLOY_FIREBASE_RULES.md) for detailed instructions.

---

## Running the Application

### Development Mode

You need to run both the frontend and backend servers:

#### Terminal 1: Backend Server

```bash
cd server
npm run dev
```

The backend will start on `http://localhost:3001`

#### Terminal 2: Frontend Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000` (or the port shown in terminal)

### Quick Start (Both Servers)

If you have `concurrently` installed:

```bash
npm run dev:all
```

### Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/health

---

## Building for Production

### Build Frontend

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deploy

#### Frontend Deployment Options:

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   - Connect your repository
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Firebase Hosting**
   ```bash
   firebase init hosting
   firebase deploy --only hosting
   ```

#### Backend Deployment Options:

1. **Vercel Serverless Functions**
   - Move `server/index.js` to `api/` directory
   - Configure as serverless function

2. **Railway/Render**
   - Connect your repository
   - Set environment variables
   - Deploy

3. **Traditional Server**
   - Use PM2 or systemd
   - Set up reverse proxy (nginx)
   - Configure SSL

---

## Project Structure

```
chronos/
├── components/           # React components
│   ├── Auth.tsx         # Authentication component
│   └── UIComponents.tsx # Reusable UI components
├── services/            # Business logic services
│   ├── firebase.ts      # Firebase configuration
│   ├── geminiService.ts # AI service (uses backend proxy)
│   ├── storageService.ts # Capsule storage operations
│   ├── userService.ts   # User data management
│   └── soundService.ts  # Audio feedback
├── server/              # Backend API server
│   ├── index.js         # Express server
│   ├── package.json     # Backend dependencies
│   └── .env             # Backend environment variables
├── App.tsx              # Main application component
├── types.ts             # TypeScript type definitions
├── index.html           # HTML template
├── index.tsx            # React entry point
├── vite.config.ts       # Vite configuration
├── firebase-database.rules.json  # Database security rules
├── firebase-storage.rules        # Storage security rules
├── .env.local           # Frontend environment variables
├── SECURITY.md          # Security documentation
├── SETUP.md             # Detailed setup guide
└── README.md            # This file
```

---

## Tech Stack

### Frontend
- **React 19.2.0** - UI framework
- **TypeScript 5.8.2** - Type safety
- **Vite 6.2.0** - Build tool and dev server
- **Tailwind CSS** - Styling (via CDN)
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **@google/genai** - Gemini AI SDK
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Services
- **Firebase Authentication** - User authentication
- **Firebase Realtime Database** - Data storage
- **Firebase Storage** - Media file storage
- **Google Gemini AI** - AI-powered letter generation

---

##  Security

This application implements multiple security layers:

###  Implemented Security Features

1. **API Key Protection**
   - Gemini API key stored server-side only
   - Never exposed to client browser
   - Backend proxy handles all AI requests

2. **Firebase Security Rules**
   - Users can only access their own data
   - File size and type validation
   - Strict access controls

3. **Rate Limiting**
   - 10 requests per minute per IP
   - Prevents API abuse

4. **CORS Protection**
   - Only allows requests from configured origins

5. **Environment Variables**
   - Sensitive data in `.env.local` (gitignored)
   - No secrets in codebase

See [SECURITY.md](./SECURITY.md) for detailed security documentation.

---



<div align="center">

**Made with for preserving memories across time**

</div>
