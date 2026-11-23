import {
  mockAchievements,
  mockRankingContexts,
  mockPersonalRecords,
  mockProgressReport,
  mockXPProgress,
} from "@/mocks/progress.mock";
import {
  Achievement,
  PersonalRecord,
  ProgressReport,
  RankingContext,
  RankingContextId,
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

  getLeaderboard: async (context: RankingContextId = "gym"): Promise<RankingContext> => {
    return simulateDelay(mockRankingContexts[context]);
  },

  getPersonalRecords: async (): Promise<PersonalRecord[]> => {
    return simulateDelay(mockPersonalRecords);
  },

  getWeeklyReport: async (): Promise<ProgressReport> => {
    return simulateDelay(mockProgressReport);
  },
};
