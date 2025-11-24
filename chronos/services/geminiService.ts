import { GeminiLetterResponse } from "../types";

// API endpoint for backend proxy (keeps API key secure on server)
// @ts-ignore - Vite injects import.meta.env
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001';

export const GeminiService = {
  /**
   * Generates a poetic or structured letter to the future self based on raw thoughts.
   * Uses secure backend API proxy to protect API key.
   */
  async generateFutureLetter(userThoughts: string, durationDescription: string): Promise<GeminiLetterResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/generate-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userThoughts,
          durationDescription: durationDescription || 'the future'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // If server provides fallback, use it
        if (errorData.fallback) {
          return errorData.fallback;
        }
        throw new Error(errorData.error || 'Failed to generate letter');
      }

      const result = await response.json();
      return result as GeminiLetterResponse;
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      // Fallback if API is unavailable
      return {
        subject: "A Letter from the Past",
        content: userThoughts || "Remember this moment."
      };
    }
  },

  /**
   * Suggests a creative title for a capsule based on its content.
   * Uses secure backend API proxy to protect API key.
   */
  async suggestTitle(content: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/suggest-title`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return errorData.fallback || "My Time Capsule";
      }

      const result = await response.json();
      return result.title || "My Time Capsule";
    } catch (error) {
      console.error("Title suggestion error:", error);
      return "My Time Capsule";
    }
  }
};
