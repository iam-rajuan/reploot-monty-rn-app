import {
  Achievement,
  LeaderboardEntry,
  PersonalRecord,
  ProgressReport,
  RankingContext,
  RankingContextId,
  XPProgress,
} from "@/shared/types/progress";

export const mockXPProgress: XPProgress = {
  currentLevel: 42,
  currentXP: 2450,
  nextLevelXP: 3000,
  tier: "Elite",
  dayStreak: 12,
  totalWorkoutsCompleted: 68,
  seasonXP: 14250,
  globalRank: 42,
  xpToNextTier: 550,
  tierProgressPercent: 81.6,
};

export const mockPersonalRecords: PersonalRecord[] = [
  {
    id: "pr_1",
    exerciseName: "Barbell Bench Press",
    category: "Chest",
    metric: "1 Rep Max",
    value: "105",
    unit: "KG",
    date: "2026-10-14",
    peakStatus: "PEAK",
  },
  {
    id: "pr_2",
    exerciseName: "Barbell Back Squat",
    category: "Legs",
    metric: "1 Rep Max",
    value: "140",
    unit: "KG",
    date: "2026-10-10",
    peakStatus: "PEAK",
  },
  {
    id: "pr_3",
    exerciseName: "Conventional Deadlift",
    category: "Back",
    metric: "1 Rep Max",
    value: "165",
    unit: "KG",
    date: "2026-09-28",
    peakStatus: "OPTIMAL",
  },
];

export const mockAchievements: Achievement[] = [
  {
    id: "1",
    title: "Today Workout",
    description: "Completed the full Reploot workout routine for today.",
    category: "workout",
    isUnlocked: true,
    unlockedAt: "2026-10-18T09:30:00Z",
    iconName: "medal",
    iconType: "medal",
    glowColor: "rgba(250, 204, 21, 0.25)",
    xpReward: 100,
    progressPercent: 100,
  },
  {
    id: "2",
    title: "Healthy Day",
    description: "Met daily nutrition, hydration and calorie expenditure goals.",
    category: "nutrition",
    isUnlocked: true,
    unlockedAt: "2026-10-18T20:00:00Z",
    iconName: "lightning",
    iconType: "lightning",
    glowColor: "rgba(234, 179, 8, 0.25)",
    xpReward: 150,
    progressPercent: 100,
  },
  {
    id: "3",
    title: "Hydration Hero",
    description: "Consumed 3.0L target water telemetry for 5 consecutive days.",
    category: "nutrition",
    isUnlocked: true,
    unlockedAt: "2026-10-17T18:00:00Z",
    iconName: "drop",
    iconType: "drop",
    glowColor: "rgba(56, 189, 248, 0.35)",
    xpReward: 120,
    progressPercent: 100,
  },
  {
    id: "4",
    title: "3 Day Streak",
    description: "Maintained active physical training consistency for 3 days.",
    category: "streak",
    isUnlocked: true,
    unlockedAt: "2026-10-09T11:00:00Z",
    iconName: "flame",
    iconType: "flame",
    glowColor: "rgba(249, 115, 22, 0.35)",
    xpReward: 150,
    progressPercent: 100,
  },
  {
    id: "5",
    title: "2/12 Workouts",
    description: "Completed 2 out of 12 planned split cycle training blocks.",
    category: "workout",
    isUnlocked: true,
    unlockedAt: "2026-10-12T14:30:00Z",
    iconName: "arm",
    iconType: "arm",
    glowColor: "rgba(251, 146, 60, 0.25)",
    xpReward: 200,
    progressPercent: 100,
  },
  {
    id: "6",
    title: "Healthy Week",
    description: "Achieved 100% adherence to AI-tailored weekly macronutrient plan.",
    category: "nutrition",
    isUnlocked: true,
    unlockedAt: "2026-10-15T21:00:00Z",
    iconName: "salad",
    iconType: "salad",
    glowColor: "rgba(34, 197, 94, 0.25)",
    xpReward: 250,
    progressPercent: 100,
  },
  {
    id: "7",
    title: "2/16 Workouts",
    description: "Achieved advanced strength milestones across multi-week training cycle.",
    category: "workout",
    isUnlocked: true,
    unlockedAt: "2026-10-16T16:00:00Z",
    iconName: "ribbon",
    iconType: "ribbon",
    glowColor: "rgba(234, 179, 8, 0.25)",
    xpReward: 300,
    progressPercent: 100,
  },
  {
    id: "8",
    title: "2/25 Workouts",
    description: "Quarter-century workout club milestone unlocked.",
    category: "level",
    isUnlocked: true,
    unlockedAt: "2026-10-17T12:00:00Z",
    iconName: "trophy",
    iconType: "trophy",
    glowColor: "rgba(245, 158, 11, 0.35)",
    xpReward: 500,
    progressPercent: 100,
  },
  {
    id: "9",
    title: "Master Form",
    description: "Achieve 98%+ AI pose tracking accuracy across 10 compound sets.",
    category: "accuracy",
    isUnlocked: false,
    iconName: "zap",
    iconType: "lightning",
    glowColor: "rgba(168, 85, 247, 0.25)",
    xpReward: 400,
    progressPercent: 65,
    currentProgress: 6,
    targetProgress: 10,
  },
];

type UnrankedLeaderboardEntry = Omit<LeaderboardEntry, "rank" | "weeklyXP">;

// Competition ranking: equal scores share a rank and the next rank skips ahead (1, 2, 2, 4).
export const assignCompetitionRanks = (
  entries: UnrankedLeaderboardEntry[],
): LeaderboardEntry[] =>
  [...entries]
    .sort((a, b) => b.score - a.score || a.userId.localeCompare(b.userId))
    .map((entry, index, sorted) => ({
      ...entry,
      weeklyXP: entry.score,
      rank:
        index > 0 && entry.score === sorted[index - 1].score
          ? sorted.slice(0, index).filter((item) => item.score > entry.score).length + 1
          : index + 1,
    }));

export const mockLeaderboardEntries: LeaderboardEntry[] = assignCompetitionRanks([
  {
    userId: "usr_101",
    fullName: "Marcus Thuram",
    avatarUrl: "https://i.pravatar.cc/100?img=33",
    score: 54200,
    isCurrentUser: false,
  },
  {
    userId: "usr_102",
    fullName: "Sarah_Strong",
    avatarUrl: "https://i.pravatar.cc/100?img=12",
    score: 48150,
    isCurrentUser: false,
  },
  {
    userId: "usr_103",
    fullName: "J-Train",
    avatarUrl: "https://i.pravatar.cc/100?img=60",
    score: 48150,
    isCurrentUser: false,
  },
  {
    userId: "usr_104",
    fullName: "Elena Rostova",
    avatarUrl: "https://i.pravatar.cc/100?img=47",
    score: 38400,
    isCurrentUser: false,
  },
  {
    userId: "usr_105",
    fullName: "David Kim",
    avatarUrl: "https://i.pravatar.cc/100?img=53",
    score: 35100,
    isCurrentUser: false,
  },
  {
    userId: "1",
    fullName: "Alex",
    avatarUrl: "https://i.pravatar.cc/100?img=68",
    score: 28750,
    isCurrentUser: true,
  },
]);

export const mockHomeLeaderboardEntries: LeaderboardEntry[] = assignCompetitionRanks([
  {
    userId: "home_201",
    fullName: "Maya Moves",
    avatarUrl: "https://i.pravatar.cc/100?img=49",
    score: 46800,
    isCurrentUser: false,
  },
  {
    userId: "home_202",
    fullName: "CoreByNadia",
    avatarUrl: "https://i.pravatar.cc/100?img=45",
    score: 42100,
    isCurrentUser: false,
  },
  {
    userId: "home_203",
    fullName: "NoGymNeeded",
    avatarUrl: "https://i.pravatar.cc/100?img=15",
    score: 42100,
    isCurrentUser: false,
  },
  {
    userId: "home_204",
    fullName: "LivingRoomLift",
    avatarUrl: "https://i.pravatar.cc/100?img=32",
    score: 36650,
    isCurrentUser: false,
  },
  {
    userId: "1",
    fullName: "Alex",
    avatarUrl: "https://i.pravatar.cc/100?img=68",
    score: 31900,
    isCurrentUser: true,
  },
  {
    userId: "home_206",
    fullName: "BodyweightBen",
    avatarUrl: "https://i.pravatar.cc/100?img=11",
    score: 29400,
    isCurrentUser: false,
  },
]);

// Backend integration point: each challenge type owns its scoring metadata and data set.
export const mockRankingContexts: Record<RankingContextId, RankingContext> = {
  gym: {
    id: "gym",
    title: "Gym challenge ranking",
    scoreLabel: "Challenge score",
    scoreUnit: "XP",
    scoringStatus: "configured",
    developmentData: true,
    entries: mockLeaderboardEntries,
  },
  home: {
    id: "home",
    title: "Home challenge ranking",
    scoreLabel: "Challenge score",
    scoreUnit: "XP",
    scoringStatus: "configured",
    developmentData: true,
    entries: mockHomeLeaderboardEntries,
  },
};

export const mockProgressReport: ProgressReport = {
  period: "weekly",
  totalWorkouts: 5,
  totalDurationMinutes: 215,
  totalCaloriesBurned: 1980,
  averageAccuracyPercent: 93,
  aiInsights: [
    "Your squat depth consistency improved by 14% this week.",
    "Optimal recovery detected: Friday rest day preserved high power output.",
  ],
  daysActivity: [
    { dayLabel: "M", activeMinutes: 45, completionPercent: 100 },
    { dayLabel: "T", activeMinutes: 50, completionPercent: 100 },
    { dayLabel: "W", activeMinutes: 60, completionPercent: 100 },
    { dayLabel: "T", activeMinutes: 40, completionPercent: 85 },
    { dayLabel: "F", activeMinutes: 0, completionPercent: 0 },
    { dayLabel: "S", activeMinutes: 45, completionPercent: 90 },
    { dayLabel: "S", activeMinutes: 0, completionPercent: 0 },
  ],
};
