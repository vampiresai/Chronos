// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// Loaded from environment variables for security
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // @ts-ignore - Vite injects import.meta.env
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyAIe3S8wG4-QQlHU8lNuPG8EiUIjJLunt0",
  // @ts-ignore
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "chronos-725d2.firebaseapp.com",
  // @ts-ignore
  databaseURL: import.meta.env?.VITE_FIREBASE_DATABASE_URL || "https://chronos-725d2-default-rtdb.firebaseio.com",
  // @ts-ignore
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "chronos-725d2",
  // @ts-ignore
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "chronos-725d2.firebasestorage.app",
  // @ts-ignore
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "198698324830",
  // @ts-ignore
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:198698324830:web:e86fbede8b6ebc5790f5cf",
  // @ts-ignore
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-SV7YE8YZSL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn("Analytics initialization failed:", error);
  }
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getDatabase(app); // Realtime Database
export const storage = getStorage(app);