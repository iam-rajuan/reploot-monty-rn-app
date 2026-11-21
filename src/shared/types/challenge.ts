/**
 * REPLOOT Challenge Domain Models
 * Unified architecture for Gym, Home, and Community Challenges.
 */

export type ChallengeCategory =
  | "hiit"
  | "strength"
  | "mobility"
  | "endurance"
  | "streak"
  | "community";

export type ChallengeDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "elite";

export type ChallengeStatus =
  | "upcoming"
  | "active"
  | "completed"
  | "expired";

export interface Challenge {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  dayBadge: string; // e.g. "IN 3 DAYS", "WEEKEND SPECIAL", "ACTIVE"
  durationDays: number;
  xpReward: number;
  targetCount: number; // e.g. 5 workouts
  completedCount: number; // e.g. 3 completed
  status: ChallengeStatus;
  imageUrl?: string;
  image?: any;
  startDate?: string;
  endDate?: string;
  participantsCount?: number;
}

export interface WeeklyChallengeProgress {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  totalSegments: number; // e.g. 5
  completedSegments: number; // e.g. 3
  percentCompleted: number; // e.g. 60
  weekRange: string;
}

export interface HomeChallengeItem {
  id: string;
  dayBadge: string;
  title: string;
  xp: string;
  image: any;
}
