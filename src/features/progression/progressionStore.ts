import { create } from "zustand";
import { applyEarnedXp, getProgressionSnapshot } from "./progressionEngine";
import { MOCK_INITIAL_PROGRESSION, MOCK_PROGRESSION_RULES } from "./progressionRules.mock";
import { ProgressionResult, ProgressionSnapshot, ProgressionState } from "./types";

interface ProgressionStore extends ProgressionState {
  lastTransition: Pick<ProgressionResult, "levelsGained" | "tiersGained"> | null;
  earnXp: (xp: number) => ProgressionResult;
  resetMockProgression: () => void;
}

export const useProgressionStore = create<ProgressionStore>((set, get) => ({
  ...MOCK_INITIAL_PROGRESSION,
  lastTransition: null,
  earnXp: (xp) => {
    const current = get();
    const result = applyEarnedXp(current, xp, MOCK_PROGRESSION_RULES);
    set({ ...result.state, lastTransition: { levelsGained: result.levelsGained, tiersGained: result.tiersGained } });
    return result;
  },
  resetMockProgression: () => set({ ...MOCK_INITIAL_PROGRESSION, lastTransition: null }),
}));

export function useProgressionSnapshot(): ProgressionSnapshot {
  const state = useProgressionStore();
  return getProgressionSnapshot(state, MOCK_PROGRESSION_RULES);
}
