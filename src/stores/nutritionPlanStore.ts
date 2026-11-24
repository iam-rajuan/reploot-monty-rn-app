import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { createJSONStorage, persist } from "zustand/middleware";

export interface UnifiedMeal {
  id: number;
  time: string;
  type: string;
  typeColor: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  completed: boolean;
  loggedAt?: string;
}

export const INITIAL_MEALS: UnifiedMeal[] = [
  {
    id: 1,
    time: "08:30 AM",
    type: "BREAKFAST",
    typeColor: "#38BDF8",
    name: "Avocado & Poached Egg Toast",
    calories: 420,
    protein: 22,
    carbs: 34,
    fat: 16,
    prepTime: "10m",
    completed: false,
  },
  {
    id: 2,
    time: "01:00 PM",
    type: "LUNCH",
    typeColor: "#38BDF8",
    name: "Grilled Chicken Quinoa Bowl",
    calories: 680,
    protein: 48,
    carbs: 62,
    fat: 14,
    prepTime: "20m",
    completed: false,
  },
  {
    id: 3,
    time: "04:30 PM",
    type: "SNACK",
    typeColor: "#38BDF8",
    name: "Almond & Whey Cacao Crunch",
    calories: 310,
    protein: 18,
    carbs: 24,
    fat: 12,
    prepTime: "5m",
    completed: false,
  },
  {
    id: 4,
    time: "07:45 PM",
    type: "DINNER",
    typeColor: "#38BDF8",
    name: "Atlantic Salmon & Grilled Greens",
    calories: 540,
    protein: 42,
    carbs: 16,
    fat: 22,
    prepTime: "25m",
    completed: false,
  },
];

export interface ScannedMealInput {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  type?: string;
  prepTime?: string;
}

interface NutritionPlanState {
  hasHydrated: boolean;
  hasGeneratedPlan: boolean;
  lastApprovedAdjustment: string | null;
  meals: UnifiedMeal[];
  lastSavedMealId: number | null;

  activateGeneratedPlan: () => void;
  setHasHydrated: (value: boolean) => void;
  approvePlanAdjustment: (summary: string) => void;

  toggleMealLog: (id: number) => void;
  regenerateMeal: (id: number) => void;
  deleteMeal: (id: number) => void;
  reorderMeals: (orderedMealIds: number[]) => void;
  randomizeCalories: () => void;
  resetMeals: () => void;

  logScannedMeal: (mealData: ScannedMealInput) => number;
}

export const useNutritionPlanStore = create<NutritionPlanState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      hasGeneratedPlan: false,
      lastApprovedAdjustment: null,
      meals: INITIAL_MEALS,
      lastSavedMealId: null,

      activateGeneratedPlan: () => set({ hasGeneratedPlan: true }),
      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),
      approvePlanAdjustment: (summary: string) =>
        set({ lastApprovedAdjustment: summary }),

      toggleMealLog: (id: number) =>
        set((state) => ({
          meals: state.meals.map((m) =>
            m.id === id
              ? {
                  ...m,
                  completed: !m.completed,
                  loggedAt: !m.completed ? new Date().toISOString() : undefined,
                }
              : m,
          ),
        })),

      regenerateMeal: (id: number) =>
        set((state) => ({
          meals: state.meals.map((meal) =>
            meal.id === id
              ? {
                  ...meal,
                  completed: false,
                  calories: Math.max(
                    100,
                    meal.calories + Math.floor(Math.random() * 81) - 40,
                  ),
                }
              : meal,
          ),
        })),

      deleteMeal: (id: number) =>
        set((state) => ({
          meals: state.meals.filter((m) => m.id !== id),
        })),

      reorderMeals: (orderedMealIds: number[]) =>
        set((state) => {
          const mealsById = new Map(state.meals.map((meal) => [meal.id, meal]));
          const orderedMeals = orderedMealIds
            .map((id) => mealsById.get(id))
            .filter((meal): meal is UnifiedMeal => Boolean(meal));
          const requestedIds = new Set(orderedMealIds);

          return {
            meals: [
              ...orderedMeals,
              ...state.meals.filter((meal) => !requestedIds.has(meal.id)),
            ],
          };
        }),

      randomizeCalories: () =>
        set((state) => ({
          meals: state.meals.map((m) => ({
            ...m,
            calories: m.calories + Math.floor(Math.random() * 20) - 10,
          })),
        })),

      resetMeals: () => set({ meals: INITIAL_MEALS, lastSavedMealId: null }),

      logScannedMeal: (mealData: ScannedMealInput) => {
        // Generate unique ID for this scanned meal
        const targetId = Date.now();
        const newScannedMeal: UnifiedMeal = {
          id: targetId,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "SCANNED",
          typeColor: "#38BDF8",
          name: mealData.name,
          calories: mealData.calories,
          protein: mealData.protein,
          carbs: mealData.carbs,
          fat: mealData.fat,
          prepTime: "AI SCAN",
          completed: true,
          loggedAt: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        // Append to bottom queue without replacing any scheduled meal
        set((state) => ({
          meals: [...state.meals, newScannedMeal],
          lastSavedMealId: targetId,
        }));

        return targetId;
      },
    }),
    {
      name: "reloot-nutrition-plan",
      version: 1,
      storage: createJSONStorage(() => ({
        getItem: (name) => SecureStore.getItemAsync(name),
        setItem: (name, value) => SecureStore.setItemAsync(name, value),
        removeItem: (name) => SecureStore.deleteItemAsync(name),
      })),
      partialize: (state) => ({
        hasGeneratedPlan: state.hasGeneratedPlan,
        lastApprovedAdjustment: state.lastApprovedAdjustment,
        meals: state.meals,
        lastSavedMealId: state.lastSavedMealId,
      }),
      migrate: (persistedState: any, version) => {
        if (version < 1 && Array.isArray(persistedState?.meals)) {
          return {
            ...persistedState,
            meals: persistedState.meals.map((meal: UnifiedMeal) => ({
              ...meal,
              completed: Boolean(meal.loggedAt && meal.completed),
            })),
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
