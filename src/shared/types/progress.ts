/**
 * REPLOOT Progress, Gamification & Analytics Domain Models
 */

export type TierLevel = "Bronze" | "Silver" | "Gold" | "Elite" | "Master";

export interface TierConfig {
  name: TierLevel;
  minXP: number;
  badgeColor: string;
  glowColor: string;
}

export interface XPProgress {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  tier: TierLevel;
  dayStreak: number;
  totalWorkoutsCompleted: number;
  seasonXP: number;
  globalRank: number;
  xpToNextTier: number;
  tierProgressPercent: number;
}

export interface WeightEntry {
  id: string;
  weightKg: number;
  date: string;
  notes?: string;
}

export type BadgeIconType =
  | "medal"
  | "lightning"
  | "drop"
  | "flame"
  | "arm"
  | "salad"
  | "ribbon"
  | "trophy";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: "streak" | "workout" | "accuracy" | "nutrition" | "level" | "special";
  isUnlocked: boolean;
  unlockedAt?: string;
  iconName: string;
  iconType?: BadgeIconType;
  glowColor?: string;
  xpReward: number;
  progressPercent: number;
  currentProgress?: number;
  targetProgress?: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  tier: string;
  statusLabel?: string;
  weeklyXP: number;
  seasonXP?: number;
  isCurrentUser: boolean;
}

export interface PersonalRecord {
  id: string;
  exerciseName: string;
  category: string;
  metric: string;
  value: string;
  unit?: string;
  date: string;
  peakStatus?: "PEAK" | "OPTIMAL" | "RECORD";
}

export interface ProgressReport {
  period: "daily" | "weekly" | "monthly";
  totalWorkouts: number;
  totalDurationMinutes: number;
  totalCaloriesBurned: number;
  averageAccuracyPercent: number;
  aiInsights: string[];
  daysActivity: {
    dayLabel: "M" | "T" | "W" | "T" | "F" | "S" | "S";
    activeMinutes: number;
    completionPercent: number;
  }[];
}
