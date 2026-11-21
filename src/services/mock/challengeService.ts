import {
  mockHomeChallengesList,
  mockUpcomingChallenges,
  mockWeeklyChallenge,
} from "@/mocks/challenges.mock";
import {
  Challenge,
  HomeChallengeItem,
  WeeklyChallengeProgress,
} from "@/shared/types/challenge";

const simulateDelay = <T>(data: T, delayMs = 80): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delayMs));

export const challengeService = {
  getUpcomingChallenges: async (): Promise<Challenge[]> => {
    return simulateDelay(mockUpcomingChallenges);
  },

  getWeeklyChallenge: async (): Promise<WeeklyChallengeProgress> => {
    return simulateDelay(mockWeeklyChallenge);
  },

  getHomeChallenges: async (): Promise<HomeChallengeItem[]> => {
    return simulateDelay(mockHomeChallengesList);
  },

  getChallengeById: async (id: string): Promise<Challenge | undefined> => {
    const challenge = mockUpcomingChallenges.find((ch) => ch.id === id);
    return simulateDelay(challenge);
  },
};
