import {
  mockAchievements,
  mockLeaderboardEntries,
  mockPersonalRecords,
  mockProgressReport,
  mockXPProgress,
} from "@/mocks/progress.mock";
import {
  Achievement,
  LeaderboardEntry,
  PersonalRecord,
  ProgressReport,
  XPProgress,
} from "@/shared/types/progress";

const simulateDelay = <T>(data: T, delayMs = 80): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delayMs));

export const progressService = {
  getXPProgress: async (): Promise<XPProgress> => {
    return simulateDelay(mockXPProgress);
  },

  getAchievements: async (): Promise<Achievement[]> => {
    return simulateDelay(mockAchievements);
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    return simulateDelay(mockLeaderboardEntries);
  },

  getPersonalRecords: async (): Promise<PersonalRecord[]> => {
    return simulateDelay(mockPersonalRecords);
  },

  getWeeklyReport: async (): Promise<ProgressReport> => {
    return simulateDelay(mockProgressReport);
  },
};
