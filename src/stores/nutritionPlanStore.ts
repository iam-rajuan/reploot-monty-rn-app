import { create } from "zustand";

interface NutritionPlanState {
  hasGeneratedPlan: boolean;
  activateGeneratedPlan: () => void;
  resetGeneratedPlan: () => void;
}

export const useNutritionPlanStore = create<NutritionPlanState>((set) => ({
  hasGeneratedPlan: false,
  activateGeneratedPlan: () => set({ hasGeneratedPlan: true }),
  resetGeneratedPlan: () => set({ hasGeneratedPlan: false }),
}));
