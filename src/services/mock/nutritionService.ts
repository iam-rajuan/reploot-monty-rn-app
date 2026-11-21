import {
  mockDailyEnergyBudget,
  mockHydrationLog,
  mockHydrationTelemetry,
  mockNutritionSummary,
  mockRecentMeals,
} from "@/mocks/nutrition.mock";
import {
  DailyEnergyBudget,
  HydrationLog,
  HydrationTelemetry,
  LoggedMeal,
  NutritionSummary,
} from "@/shared/types/nutrition";

const simulateDelay = <T>(data: T, delayMs = 80): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delayMs));

export const nutritionService = {
  getDailyBudget: async (): Promise<DailyEnergyBudget> => {
    return simulateDelay(mockDailyEnergyBudget);
  },

  getNutritionSummary: async (_date?: string): Promise<NutritionSummary> => {
    return simulateDelay(mockNutritionSummary);
  },

  getHydrationLog: async (_date?: string): Promise<HydrationLog> => {
    return simulateDelay(mockHydrationLog);
  },

  getHydrationTelemetry: async (): Promise<HydrationTelemetry> => {
    return simulateDelay(mockHydrationTelemetry);
  },

  getRecentMeals: async (): Promise<LoggedMeal[]> => {
    return simulateDelay(mockRecentMeals);
  },
};
