import {
  Challenge,
  HomeChallengeItem,
  WeeklyChallengeProgress,
} from "@/shared/types/challenge";

export const mockWeeklyChallenge: WeeklyChallengeProgress = {
  id: "w_ch_1",
  title: "WEEKLY CHALLENGE",
  description: "Log 5 full workout routines across the 7-day training cycle.",
  xpReward: 500,
  totalSegments: 5,
  completedSegments: 3,
  percentCompleted: 60,
  weekRange: "OCT 12 — OCT 18, 2026",
};

export const mockUpcomingChallenges: Challenge[] = [
  {
    id: "hyper-hiit",
    title: "HYPER HIIT BLITZ",
    description: "High intensity interval training designed for metabolic conditioning.",
    category: "hiit",
    difficulty: "advanced",
    dayBadge: "IN 3 DAYS",
    durationDays: 3,
    xpReward: 350,
    targetCount: 3,
    completedCount: 0,
    status: "upcoming",
    image: require("../../assets/library/l5.png"),
    participantsCount: 1420,
  },
  {
    id: "titan-mobility",
    title: "TITAN MOBILITY FLOW",
    description: "Deep kinetic joint lubrication, thoracic spine mobility & recovery.",
    category: "mobility",
    difficulty: "intermediate",
    dayBadge: "WEEKEND SPECIAL",
    durationDays: 2,
    xpReward: 400,
    targetCount: 2,
    completedCount: 0,
    status: "upcoming",
    image: require("../../assets/library/l4.png"),
    participantsCount: 980,
  },
  {
    id: "valkyrie-strength",
    title: "VALKYRIE CORE MATRIX",
    description: "Targeted abdominal, oblique, and posterior chain stabilization routines.",
    category: "strength",
    difficulty: "elite",
    dayBadge: "UPCOMING",
    durationDays: 7,
    xpReward: 500,
    targetCount: 5,
    completedCount: 0,
    status: "upcoming",
    image: require("../../assets/library/l8.png"),
    participantsCount: 2310,
  },
];

export const mockHomeChallengesList: HomeChallengeItem[] = [
  {
    id: "hyper-hiit",
    dayBadge: "IN 3 DAYS",
    title: "HYPER HIIT BLITZ",
    xp: "+350 XP",
    image: require("../../assets/library/l5.png"),
  },
  {
    id: "titan-mobility",
    dayBadge: "WEEKEND SPECIAL",
    title: "TITAN MOBILITY FLOW",
    xp: "+400 XP",
    image: require("../../assets/library/l4.png"),
  },
  {
    id: "valkyrie-strength",
    dayBadge: "UPCOMING",
    title: "VALKYRIE CORE MATRIX",
    xp: "+500 XP",
    image: require("../../assets/library/l8.png"),
  },
];
