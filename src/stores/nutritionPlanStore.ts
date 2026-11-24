import { create } from "zustand";

interface NutritionPlanState {
  hasGeneratedPlan: boolean;
  lastApprovedAdjustment: string | null;
  activateGeneratedPlan: () => void;
  resetGeneratedPlan: () => void;
  approvePlanAdjustment: (summary: string) => void;
}

export const useNutritionPlanStore = create<NutritionPlanState>((set) => ({
  hasGeneratedPlan: false,
  lastApprovedAdjustment: null,
  activateGeneratedPlan: () => set({ hasGeneratedPlan: true }),
  resetGeneratedPlan: () => set({ hasGeneratedPlan: false, lastApprovedAdjustment: null }),
  approvePlanAdjustment: (summary) => set({ lastApprovedAdjustment: summary }),
}));
