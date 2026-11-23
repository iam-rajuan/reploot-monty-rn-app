export interface ProgressionTierRule {
  id: string;
  displayName: string;
  color: string;
  levelThresholds: number[];
}

export interface ProgressionRules {
  version: string;
  isMockConfiguration: boolean;
  tiers: ProgressionTierRule[];
}

export interface ProgressionState {
  lifetimeXp: number;
  currentTierId: string;
  currentLevel: number;
  levelXp: number;
  overflowXpAtCap: number;
}

export interface ProgressionSnapshot extends ProgressionState {
  tier: ProgressionTierRule;
  levelThreshold: number;
  levelProgressPercent: number;
  xpRemainingInLevel: number;
  isMaxProgression: boolean;
}

export interface ProgressionResult {
  state: ProgressionState;
  levelsGained: number;
  tiersGained: number;
}
