/**
 * REPLOOT Nutrition & Macro Domain Models
 * Derived from Precision Nutrition and AI Food Scanner Figma designs.
 */

export interface MacroNutrients {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface MacroTarget {
  targetCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
}

export interface NutritionSummary {
  consumed: MacroNutrients;
  target: MacroTarget;
  percentOfDailyGoal: number;
  date: string;
}

export interface DailyEnergyBudget {
  targetCalories: number;
  consumedCalories: number;
  remainingCalories: number;
  percentConsumed: number;
  protein: {
    consumed: number;
    target: number;
  };
  carbs: {
    consumed: number;
    target: number;
  };
  fat: {
    consumed: number;
    target: number;
  };
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealItem {
  id: string;
  name: string;
  servingSize: string;
  quantity: number;
  macros: MacroNutrients;
}

export interface Meal {
  id: string;
  name: string;
  mealType: MealType;
  items: MealItem[];
  totalMacros: MacroNutrients;
  loggedAt: string;
  imageUrl?: string;
  isAiScanned?: boolean;
}

export interface LoggedMeal {
  id: number;
  type: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
  typeColor: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  liked?: boolean;
}

export interface HydrationLog {
  currentLiters: number;
  targetLiters: number;
  percentOfGoal: number;
  recentAdditionsMl: number[];
  date: string;
}

export interface HydrationTelemetry {
  currentLiters: number;
  targetLiters: number;
  percentOfGoal: number;
  isHydrated: boolean;
  recentAdditionsMl: number[];
}

export interface MealPlanMeal {
  id: string | number;
  title: string;
  mealType: MealType;
  suggestedCalories: number;
  description: string;
  ingredients: string[];
  prepTime?: string;
  liked?: boolean;
}

export interface MealPlan {
  id: string;
  date: string;
  meals: MealPlanMeal[];
  targetCalories: number;
  aiRecommendationNotes?: string;
}
