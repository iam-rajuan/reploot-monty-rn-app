import {
  DailyEnergyBudget,
  HydrationLog,
  HydrationTelemetry,
  LoggedMeal,
  NutritionSummary,
} from "@/shared/types/nutrition";

export const mockDailyEnergyBudget: DailyEnergyBudget = {
  targetCalories: 2300,
  consumedCalories: 1850,
  remainingCalories: 450,
  percentConsumed: 80,
  protein: {
    consumed: 120,
    target: 180,
  },
  carbs: {
    consumed: 180,
    target: 250,
  },
  fat: {
    consumed: 55,
    target: 70,
  },
};

export const mockNutritionSummary: NutritionSummary = {
  consumed: {
    calories: 1850,
    proteinGrams: 120,
    carbsGrams: 180,
    fatGrams: 55,
  },
  target: {
    targetCalories: 2300,
    targetProteinGrams: 180,
    targetCarbsGrams: 250,
    targetFatGrams: 70,
  },
  percentOfDailyGoal: 80,
  date: "2026-10-18",
};

export const mockHydrationLog: HydrationLog = {
  currentLiters: 1.8,
  targetLiters: 3.0,
  percentOfGoal: 60,
  recentAdditionsMl: [250, 500, 750],
  date: "2026-10-18",
};

export const mockHydrationTelemetry: HydrationTelemetry = {
  currentLiters: 1.8,
  targetLiters: 3.0,
  percentOfGoal: 60,
  isHydrated: true,
  recentAdditionsMl: [250, 500, 750],
};

export const mockRecentMeals: LoggedMeal[] = [
  {
    id: 1,
    type: "BREAKFAST",
    typeColor: "#38BDF8",
    name: "Avocado & Poached Egg Toast",
    calories: 420,
    protein: 18,
    carbs: 34,
    fat: 16,
    time: "08:30 AM",
    liked: true,
  },
  {
    id: 2,
    type: "LUNCH",
    typeColor: "#2DD4BF",
    name: "Grilled Chicken & Quinoa Bowl",
    calories: 650,
    protein: 45,
    carbs: 58,
    fat: 14,
    time: "01:15 PM",
    liked: true,
  },
  {
    id: 3,
    type: "SNACK",
    typeColor: "#FFB68C",
    name: "Almond & Cacao Protein Crunch",
    calories: 280,
    protein: 12,
    carbs: 22,
    fat: 11,
    time: "04:45 PM",
    liked: false,
  },
];
