import { ProgressionResult, ProgressionRules, ProgressionSnapshot, ProgressionState } from "./types";

export function getProgressionSnapshot(state: ProgressionState, rules: ProgressionRules): ProgressionSnapshot {
  const tierIndex = Math.max(0, rules.tiers.findIndex((tier) => tier.id === state.currentTierId));
  const tier = rules.tiers[tierIndex];
  const safeLevel = Math.min(Math.max(state.currentLevel, 1), tier.levelThresholds.length);
  const levelThreshold = tier.levelThresholds[safeLevel - 1];
  const isMaxProgression = tierIndex === rules.tiers.length - 1 && safeLevel === tier.levelThresholds.length;
  const displayedXp = Math.min(state.levelXp, levelThreshold);

  return {
    ...state,
    currentTierId: tier.id,
    currentLevel: safeLevel,
    tier,
    levelThreshold,
    levelProgressPercent: levelThreshold > 0 ? (displayedXp / levelThreshold) * 100 : 0,
    xpRemainingInLevel: Math.max(levelThreshold - displayedXp, 0),
    isMaxProgression,
  };
}

export function applyEarnedXp(state: ProgressionState, earnedXp: number, rules: ProgressionRules): ProgressionResult {
  const safeEarnedXp = Math.max(0, Math.floor(earnedXp));
  let tierIndex = Math.max(0, rules.tiers.findIndex((tier) => tier.id === state.currentTierId));
  let currentLevel = state.currentLevel;
  let levelXp = state.levelXp + safeEarnedXp;
  let overflowXpAtCap = state.overflowXpAtCap;
  let levelsGained = 0;
  let tiersGained = 0;

  while (true) {
    const tier = rules.tiers[tierIndex];
    const levelIndex = Math.min(Math.max(currentLevel - 1, 0), tier.levelThresholds.length - 1);
    const threshold = tier.levelThresholds[levelIndex];
    if (levelXp < threshold) break;

    const isLastLevelInTier = currentLevel >= tier.levelThresholds.length;
    const isLastTier = tierIndex >= rules.tiers.length - 1;
    if (isLastLevelInTier && isLastTier) {
      overflowXpAtCap += levelXp - threshold;
      levelXp = threshold;
      break;
    }

    levelXp -= threshold;
    levelsGained += 1;
    if (isLastLevelInTier) {
      tierIndex += 1;
      currentLevel = 1;
      tiersGained += 1;
    } else {
      currentLevel += 1;
    }
  }

  return {
    state: {
      lifetimeXp: state.lifetimeXp + safeEarnedXp,
      currentTierId: rules.tiers[tierIndex].id,
      currentLevel,
      levelXp,
      overflowXpAtCap,
    },
    levelsGained,
    tiersGained,
  };
}
