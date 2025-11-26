
// FIX: Import React to provide the 'React' namespace for React.ReactNode.
import React from 'react';

export interface Mentor {
  name: string;
  title: string;
  skills: string[];
  avatarUrl: string;
  rating: number;
  description: string;
  sessionPrice: number;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface GroundedResponse {
  text: string;
  sources: GroundingSource[];
}

export interface Workshop {
  title: string;
  speaker: string;
  date: string;
  topic: string;
  isPremium?: boolean;
}

export interface Course {
  title: string;
  platform: string;
  description:string;
}

export interface RecommendedCourse {
  title: string;
  platform: string;
  description: string;
  reason: string;
}

export interface ProFeature {
  title: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface Notification {
  id: number;
  type: 'workshop' | 'message' | 'challenge' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface NavLinkItem {
  text: string;
  href: string;
  icon: React.ReactNode;
  isFeature?: boolean;
  view?: 'home' | 'tasks' | 'certificates' | 'interview';
}

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji
}

export interface UserAchievement {
  badgeId: string;
  dateEarned: string;
}

export interface Certificate {
  id: string;
  recipientName: string;
  courseName: string;
  date: string;
  signatureImage: string; // Base64 string of the signature
}

export interface InterviewFeedback {
  rating: number; // 1-10
  feedback: string;
  toneAnalysis: string;
  suggestedImprovement: string;
}
