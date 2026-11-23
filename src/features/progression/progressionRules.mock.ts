import { ProgressionRules, ProgressionState } from "./types";

// Development-only values. Product/backend can replace this object without changing UI components.
export const MOCK_PROGRESSION_RULES: ProgressionRules = {
  version: "mock-v1",
  isMockConfiguration: true,
  tiers: [
    { id: "bronze", displayName: "Bronze", color: "#D99768", levelThresholds: [600, 800, 1000] },
    { id: "silver", displayName: "Silver", color: "#CBD5E1", levelThresholds: [900, 1100, 1400] },
    { id: "gold", displayName: "Gold", color: "#FFD166", levelThresholds: [1200, 1500, 1900] },
  ],
};

export const MOCK_INITIAL_PROGRESSION: ProgressionState = {
  lifetimeXp: 18450,
  currentTierId: "silver",
  currentLevel: 3,
  levelXp: 850,
  overflowXpAtCap: 0,
};
