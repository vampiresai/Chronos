
export enum CapsuleStatus {
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  OPENED = 'OPENED', // Viewed by user
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
}

export interface Attachment {
  id: string;
  type: MediaType;
  url: string; // Base64 or URL
  name: string;
}

export interface Capsule {
  id: string;
  userId: string; // Owner of the capsule
  title: string;
  message: string;
  createdAt: number; // Timestamp
  unlockAt: number; // Timestamp
  status: CapsuleStatus;
  attachments: Attachment[];
  themeColor: string; // Hex or tailwind class
  isShared?: boolean;
}

export type CreateCapsuleData = Omit<Capsule, 'id' | 'status' | 'createdAt'>;

export interface GeminiLetterResponse {
  subject: string;
  content: string;
}
