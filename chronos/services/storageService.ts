
import { 
  ref, 
  push, 
  set, 
  onValue, 
  off,
  update,
  remove
} from "firebase/database";
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { db, storage } from "./firebase";
import { Capsule, CapsuleStatus, Attachment } from "../types";

export const StorageService = {
  
  /**
   * Subscribe to the user's capsules in real-time
   */
  subscribeToCapsules(userId: string, onUpdate: (capsules: Capsule[]) => void) {
    if (!userId) return () => {};

    const capsulesRef = ref(db, `users/${userId}/capsules`);

    const unsubscribe = onValue(capsulesRef, (snapshot) => {
      const capsules: Capsule[] = [];
      const data = snapshot.val();
      
      if (data) {
        Object.keys(data).forEach((id) => {
          const capsuleData = data[id];
          // Ensure attachments array exists
          if (!capsuleData.attachments) {
            capsuleData.attachments = [];
          }
          capsules.push({ 
            id, 
            ...capsuleData 
          } as Capsule);
        });
      }
      
      onUpdate(capsules);
    }, (error) => {
      console.error("Error reading capsules:", error);
      onUpdate([]);
    });

    return () => off(capsulesRef);
  },

  /**
   * Upload multiple media files and return attachment objects with URLs
   */
  async uploadMediaFiles(files: File[], userId: string, capsuleId?: string): Promise<Attachment[]> {
    const uploadPromises = files.map(async (file) => {
      const url = await this.uploadMediaFile(file, file.name, userId, capsuleId);
      const type = file.type.startsWith('image') ? 'IMAGE' : 
                   file.type.startsWith('video') ? 'VIDEO' : 
                   file.type.startsWith('audio') ? 'AUDIO' : 'FILE';
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        type: type as any,
        url,
        name: file.name
      } as Attachment;
    });

    return Promise.all(uploadPromises);
  },

  /**
   * Convert base64 data URL to File object
   */
  dataURLtoFile(dataurl: string, filename: string): File {
    try {
      const arr = dataurl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      console.error("Error converting data URL to file:", error);
      throw new Error("Failed to convert data URL to file");
    }
  },

  /**
   * Save a new capsule to Realtime Database
   * Uploads media files to Firebase Storage if they are base64 (non-blocking)
   */
  async saveCapsule(capsule: Omit<Capsule, 'id'>): Promise<void> {
    try {
      // Create a new capsule reference
      const capsulesRef = ref(db, `users/${capsule.userId}/capsules`);
      const newCapsuleRef = push(capsulesRef);
      const capsuleId = newCapsuleRef.key;

      if (!capsuleId) {
        throw new Error("Failed to create capsule ID");
      }

      const attachments = capsule.attachments || [];
      
      // First, save the capsule immediately with base64 attachments
      // This ensures the capsule is saved even if media upload fails
      const capsuleData = {
        ...capsule,
        attachments: attachments // Save with original attachments first
      };

      await set(newCapsuleRef, capsuleData);

      // Then, try to upload base64 attachments to Firebase Storage in the background
      // If upload succeeds, update the capsule with the new URLs
      if (attachments.length > 0) {
        this.uploadAttachmentsInBackground(capsule.userId, capsuleId, attachments, newCapsuleRef)
          .catch(error => {
            console.warn("Background media upload failed, keeping base64:", error);
            // Don't throw - capsule is already saved
          });
      }
    } catch (error) {
      console.error("Error saving capsule:", error);
      throw error;
    }
  },

  /**
   * Upload attachments in the background and update the capsule
   */
  async uploadAttachmentsInBackground(
    userId: string, 
    capsuleId: string, 
    attachments: Attachment[], 
    capsuleRef: any
  ): Promise<void> {
    const uploadedAttachments: Attachment[] = [];
    
    for (const attachment of attachments) {
      if (attachment.url.startsWith('data:')) {
        // It's a base64 data URL, convert and upload
        try {
          // Add timeout to prevent hanging
          const uploadPromise = this.uploadMediaFile(attachment.url, attachment.name, userId, capsuleId);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Upload timeout')), 30000) // 30 second timeout
          );
          
          const uploaded = await Promise.race([uploadPromise, timeoutPromise]) as string;
          uploadedAttachments.push({
            ...attachment,
            url: uploaded
          });
        } catch (uploadError) {
          console.warn("Error uploading attachment, keeping base64:", uploadError);
          // Keep the base64 if upload fails
          uploadedAttachments.push(attachment);
        }
      } else {
        // Already a URL, keep it
        uploadedAttachments.push(attachment);
      }
    }

    // Update the capsule with uploaded URLs if any were uploaded
    if (uploadedAttachments.some((att, idx) => att.url !== attachments[idx]?.url)) {
      await update(capsuleRef, {
        attachments: uploadedAttachments
      });
    }
  },

  /**
   * Upload a media file to Firebase Storage and return the download URL
   * Overloaded to accept either File or base64 string
   */
  async uploadMediaFile(
    fileOrDataUrl: File | string, 
    fileNameOrName: string, 
    userId: string, 
    capsuleId?: string
  ): Promise<string> {
    try {
      let file: File;
      let fileName: string;

      if (typeof fileOrDataUrl === 'string') {
        // It's a base64 data URL
        file = this.dataURLtoFile(fileOrDataUrl, fileNameOrName);
        fileName = fileNameOrName;
      } else {
        // It's already a File
        file = fileOrDataUrl;
        fileName = fileNameOrName;
      }

      // Create a unique file path
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${fileName}`;
      const filePath = capsuleId 
        ? `users/${userId}/capsules/${capsuleId}/${uniqueFileName}`
        : `users/${userId}/temp/${uniqueFileName}`;
      
      const fileRef = storageRef(storage, filePath);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading media file:", error);
      throw error;
    }
  },

  /**
   * Update the status (e.g., LOCK -> UNLOCKED)
   */
  async updateCapsuleStatus(id: string, userId: string, status: CapsuleStatus): Promise<void> {
    try {
      const capsuleRef = ref(db, `users/${userId}/capsules/${id}`);
      await update(capsuleRef, { status });
    } catch (error) {
      console.error("Error updating capsule:", error);
      throw error;
    }
  },

  /**
   * Delete a capsule and its associated media files
   */
  async deleteCapsule(id: string, userId: string, attachments?: Attachment[]): Promise<void> {
    try {
      // Delete media files from Storage
      if (attachments) {
        for (const attachment of attachments) {
          if (attachment.url.startsWith('https://') || attachment.url.startsWith('gs://')) {
            try {
              // Extract the file path from the URL or construct it
              const urlParts = attachment.url.split('/');
              const fileName = urlParts[urlParts.length - 1].split('?')[0];
              const filePath = `users/${userId}/capsules/${id}/${fileName}`;
              const fileRef = storageRef(storage, filePath);
              await deleteObject(fileRef);
            } catch (storageError) {
              console.warn("Error deleting media file:", storageError);
              // Continue even if file deletion fails
            }
          }
        }
      }

      // Delete the capsule from Realtime Database
      const capsuleRef = ref(db, `users/${userId}/capsules/${id}`);
      await remove(capsuleRef);
    } catch (error) {
      console.error("Error deleting capsule:", error);
      throw error;
    }
  }
};
