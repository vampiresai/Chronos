
import { ref, set, get, update } from "firebase/database";
import { db } from "./firebase";
import { User } from "firebase/auth";

export interface UserData {
  uid: string;
  email: string;
  displayName: string | null;
  createdAt: number;
  lastLoginAt: number;
}

export const UserService = {
  /**
   * Create or update user data in Realtime Database
   */
  async saveUser(user: User, displayName?: string): Promise<void> {
    try {
      const userRef = ref(db, `users/${user.uid}`);
      
      // Try to get existing user data
      let existingData: UserData | null = null;
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          existingData = snapshot.val() as UserData;
        }
      } catch (getError: any) {
        console.warn("Could not read user data, creating new:", getError);
      }
      
      const userData: UserData = {
        uid: user.uid,
        email: user.email || '',
        displayName: displayName || user.displayName || null,
        createdAt: existingData?.createdAt || Date.now(),
        lastLoginAt: Date.now()
      };

      if (existingData) {
        // Update existing user
        await update(userRef, {
          displayName: userData.displayName,
          lastLoginAt: userData.lastLoginAt,
          email: userData.email
        });
      } else {
        // Create new user
        await set(userRef, userData);
      }
    } catch (error: any) {
      // Don't throw error - just log it so auth still works
      console.warn("Error saving user to Realtime Database:", error.message);
      // Silently fail - authentication still works without database
    }
  },

  /**
   * Get user data from Realtime Database
   */
  async getUserData(uid: string): Promise<UserData | null> {
    try {
      const userRef = ref(db, `users/${uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return snapshot.val() as UserData;
      }
      return null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }
};
