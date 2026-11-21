import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  DynamicWorkoutPathDetail,
  REPLACEMENT_EXERCISES_POOL,
  WORKOUT_PATH_DETAILS_MAP,
  WORKOUT_VARIATIONS_MAP,
} from '@/features/workouts/data/workoutPathDetailData';

export interface ScheduledWorkoutEntry {
  dateKey: string; // e.g. "2024-9-18"
  splitId: string; // "push" | "pull" | "chest" | "upper" | "lower" | "fullbody"
  splitName: string;
  missionTitle: string;
  missionSubtitle: string;
  type?: 'completed' | 'scheduled' | 'today';
  color: string;
  bgColor: string;
  borderColor: string;
  route: string;
}

export const SPLIT_MISSION_METADATA: Record<
  string,
  {
    name: string;
    missionTitle: string;
    missionSubtitle: string;
    color: string;
    bgColor: string;
    borderColor: string;
    route: string;
  }
> = {
  pull: {
    name: "Pull Day",
    missionTitle: "Pull Day Hyper-Row",
    missionSubtitle: "Lat Pulldown & Cable Rows",
    color: "#2DD4BF",
    bgColor: "rgba(45, 212, 191, 0.22)",
    borderColor: "#2DD4BF",
    route: "/workouts/pull",
  },
  push: {
    name: "Push Day",
    missionTitle: "Push Day Iron-Forge",
    missionSubtitle: "Overhead Press & Dips",
    color: "#38BDF8",
    bgColor: "rgba(56, 189, 248, 0.22)",
    borderColor: "#38BDF8",
    route: "/workouts/push",
  },
  chest: {
    name: "Chest Day",
    missionTitle: "Chest Day Hypertrophy",
    missionSubtitle: "Flat Bench & Incline DB Press",
    color: "#38EDD8",
    bgColor: "rgba(56, 237, 216, 0.22)",
    borderColor: "#38EDD8",
    route: "/workouts/chest",
  },
  upper: {
    name: "Upper Body",
    missionTitle: "Upper Body Power-Circuit",
    missionSubtitle: "Chest, Back, Arms & Delts",
    color: "#C084FC",
    bgColor: "rgba(192, 132, 252, 0.22)",
    borderColor: "#C084FC",
    route: "/workouts/upper",
  },
  lower: {
    name: "Lower Body",
    missionTitle: "Lower Body Quad Matrix",
    missionSubtitle: "Squats, Leg Press & Calves",
    color: "#FFB68C",
    bgColor: "rgba(255, 182, 140, 0.22)",
    borderColor: "#FFB68C",
    route: "/workouts?pathId=lower",
  },
  fullbody: {
    name: "Full Body",
    missionTitle: "Full Body Metabolic Surge",
    missionSubtitle: "Compound Lifts & Conditioning",
    color: "#F43F5E",
    bgColor: "rgba(244, 63, 94, 0.22)",
    borderColor: "#F43F5E",
    route: "/workouts?pathId=fullbody",
  },
};

// Helper to resolve today's date key according to user's device/region
export const getTodayDateKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
};

// Initial calendar schedules dynamically anchored around the current real date
const createInitialCalendarSchedules = (): Record<string, ScheduledWorkoutEntry> => {
  const result: Record<string, ScheduledWorkoutEntry> = {};
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // 1. TODAY'S WORKOUT: Pull Day
  const todayKey = `${currentYear}-${currentMonth}-${currentDay}`;
  const todayMeta = SPLIT_MISSION_METADATA.pull;
  result[todayKey] = {
    dateKey: todayKey,
    splitId: "pull",
    splitName: todayMeta.name,
    missionTitle: todayMeta.missionTitle,
    missionSubtitle: todayMeta.missionSubtitle,
    type: "today",
    color: todayMeta.color,
    bgColor: todayMeta.bgColor,
    borderColor: todayMeta.borderColor,
    route: todayMeta.route,
  };

  // 2. PAST WORKOUTS IN CURRENT MONTH: Realistic completed workout telemetry
  const pastSplits = ["push", "chest", "pull", "upper", "push", "chest", "pull"];
  let splitIdx = 0;
  for (let day = currentDay - 2; day >= 1; day -= 2) {
    const splitId = pastSplits[splitIdx % pastSplits.length];
    splitIdx++;
    const meta = SPLIT_MISSION_METADATA[splitId] || SPLIT_MISSION_METADATA.push;
    const dateKey = `${currentYear}-${currentMonth}-${day}`;
    result[dateKey] = {
      dateKey,
      splitId,
      splitName: meta.name,
      missionTitle: meta.missionTitle,
      missionSubtitle: meta.missionSubtitle,
      type: "completed",
      color: meta.color,
      bgColor: meta.bgColor,
      borderColor: meta.borderColor,
      route: meta.route,
    };
  }

  // 3. UPCOMING SCHEDULED WORKOUTS IN CURRENT MONTH
  const upcomingSplits = ["push", "chest", "upper", "lower", "pull", "chest"];
  let upcomingIdx = 0;
  for (let day = currentDay + 2; day <= daysInMonth; day += 2) {
    const splitId = upcomingSplits[upcomingIdx % upcomingSplits.length];
    upcomingIdx++;
    const meta = SPLIT_MISSION_METADATA[splitId] || SPLIT_MISSION_METADATA.push;
    const dateKey = `${currentYear}-${currentMonth}-${day}`;
    result[dateKey] = {
      dateKey,
      splitId,
      splitName: meta.name,
      missionTitle: meta.missionTitle,
      missionSubtitle: meta.missionSubtitle,
      type: "scheduled",
      color: meta.color,
      bgColor: meta.bgColor,
      borderColor: meta.borderColor,
      route: meta.route,
    };
  }

  // Also include October 2024 entries for backward compatibility
  const legacyScheduleDef: Array<{
    day: number;
    splitId: string;
    type: 'completed' | 'scheduled' | 'today';
  }> = [
    { day: 2, splitId: "push", type: "completed" },
    { day: 4, splitId: "pull", type: "completed" },
    { day: 6, splitId: "push", type: "completed" },
    { day: 9, splitId: "chest", type: "completed" },
    { day: 11, splitId: "pull", type: "completed" },
    { day: 13, splitId: "push", type: "completed" },
    { day: 16, splitId: "chest", type: "completed" },
    { day: 18, splitId: "pull", type: "today" },
    { day: 20, splitId: "push", type: "scheduled" },
    { day: 23, splitId: "pull", type: "scheduled" },
    { day: 25, splitId: "pull", type: "scheduled" },
    { day: 27, splitId: "pull", type: "scheduled" },
    { day: 30, splitId: "chest", type: "scheduled" },
  ];
  legacyScheduleDef.forEach(({ day, splitId, type }) => {
    const meta = SPLIT_MISSION_METADATA[splitId] || SPLIT_MISSION_METADATA.pull;
    const dateKey = `2024-9-${day}`;
    if (!result[dateKey]) {
      result[dateKey] = {
        dateKey,
        splitId,
        splitName: meta.name,
        missionTitle: meta.missionTitle,
        missionSubtitle: meta.missionSubtitle,
        type,
        color: meta.color,
        bgColor: meta.bgColor,
        borderColor: meta.borderColor,
        route: meta.route,
      };
    }
  });

  return result;
};

export interface WorkoutState {
  completedExerciseIds: string[];
  activeWorkoutPathId: string | null;
  currentExerciseIndex: number;
  selectedWorkoutCategory: string; // e.g. "push" | "pull" | "chest" | "lower" | "upper" | "fullbody"
  workoutsByPath: Record<string, DynamicWorkoutPathDetail>;
  regenerationCounterByPath: Record<string, number>;
  calendarSchedules: Record<string, ScheduledWorkoutEntry>;
  activeScheduleDateKey: string;
}

// Deep clone initial workouts so mutations don't alter raw module definitions
const cloneInitialWorkouts = (): Record<string, DynamicWorkoutPathDetail> => {
  const result: Record<string, DynamicWorkoutPathDetail> = {};
  Object.keys(WORKOUT_PATH_DETAILS_MAP).forEach((key) => {
    const item = WORKOUT_PATH_DETAILS_MAP[key];
    result[key] = {
      ...item,
      exercises: item.exercises.map((ex, i) => ({
        ...ex,
        index: String(i + 1).padStart(2, '0'),
      })),
    };
  });
  return result;
};

const initialState: WorkoutState = {
  completedExerciseIds: [],
  activeWorkoutPathId: null,
  currentExerciseIndex: 0,
  selectedWorkoutCategory: 'pull',
  workoutsByPath: cloneInitialWorkouts(),
  regenerationCounterByPath: {
    push: 0,
    pull: 0,
    chest: 0,
    upper: 0,
    lower: 0,
    fullbody: 0,
  },
  calendarSchedules: createInitialCalendarSchedules(),
  activeScheduleDateKey: getTodayDateKey(),
};

export const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    markExerciseComplete: (state, action: PayloadAction<string>) => {
      if (!state.completedExerciseIds.includes(action.payload)) {
        state.completedExerciseIds.push(action.payload);
      }
    },
    unmarkExerciseComplete: (state, action: PayloadAction<string>) => {
      state.completedExerciseIds = state.completedExerciseIds.filter(
        (id) => id !== action.payload
      );
    },
    resetCompletedExercises: (state) => {
      state.completedExerciseIds = [];
      state.currentExerciseIndex = 0;
    },
    setCurrentExerciseIndex: (state, action: PayloadAction<number>) => {
      state.currentExerciseIndex = action.payload;
    },
    setActiveWorkoutPathId: (state, action: PayloadAction<string | null>) => {
      state.activeWorkoutPathId = action.payload;
      if (action.payload) {
        state.selectedWorkoutCategory = action.payload;
      }
    },
    setSelectedWorkoutCategory: (state, action: PayloadAction<string>) => {
      state.selectedWorkoutCategory = action.payload.toLowerCase();
    },

    // 1. DELETE ONE EXERCISE: only that exercise is removed, re-indexing remaining
    removeExerciseFromWorkout: (
      state,
      action: PayloadAction<{ pathId: string; exerciseId: string }>
    ) => {
      const { pathId, exerciseId } = action.payload;
      const key = pathId.toLowerCase();
      const currentWorkout = state.workoutsByPath[key];
      if (!currentWorkout) return;

      const filtered = currentWorkout.exercises.filter(
        (ex) => ex.id !== exerciseId
      );
      // Re-index remaining exercises cleanly
      currentWorkout.exercises = filtered.map((ex, idx) => ({
        ...ex,
        index: String(idx + 1).padStart(2, '0'),
      }));
    },

    // 2. REPLACE ONE EXERCISE: only that exercise changes, picking next non-duplicate
    replaceExerciseInWorkout: (
      state,
      action: PayloadAction<{ pathId: string; exerciseId: string }>
    ) => {
      const { pathId, exerciseId } = action.payload;
      const key = pathId.toLowerCase();
      const currentWorkout = state.workoutsByPath[key];
      if (!currentWorkout) return;

      const exerciseIndex = currentWorkout.exercises.findIndex(
        (ex) => ex.id === exerciseId
      );
      if (exerciseIndex === -1) return;

      const pool = REPLACEMENT_EXERCISES_POOL[key] || [];
      const currentIds = new Set(currentWorkout.exercises.map((ex) => ex.id));

      // Find first candidate in replacement pool not already present in routine
      const candidate = pool.find((item) => !currentIds.has(item.id));
      if (candidate) {
        currentWorkout.exercises[exerciseIndex] = {
          ...candidate,
          index: String(exerciseIndex + 1).padStart(2, '0'),
        };
      } else {
        // Fallback: If pool exhausted, pick from alternate variations
        const allVariations = WORKOUT_VARIATIONS_MAP[key] || [];
        for (const varSet of allVariations) {
          const varCandidate = varSet.find((item) => !currentIds.has(item.id));
          if (varCandidate) {
            currentWorkout.exercises[exerciseIndex] = {
              ...varCandidate,
              index: String(exerciseIndex + 1).padStart(2, '0'),
            };
            break;
          }
        }
      }
    },

    // 3. REGENERATE WORKOUT: replaces the whole exercise list with another recommendation
    // while strictly preserving the selected workout category
    regenerateWorkout: (state, action: PayloadAction<{ pathId: string }>) => {
      const { pathId } = action.payload;
      const key = pathId.toLowerCase();
      const currentWorkout = state.workoutsByPath[key];
      if (!currentWorkout) return;

      const currentCounter = state.regenerationCounterByPath[key] || 0;
      const nextCounter = currentCounter + 1;
      state.regenerationCounterByPath[key] = nextCounter;

      const variations = WORKOUT_VARIATIONS_MAP[key] || [];
      if (variations.length > 0) {
        const variationIndex = nextCounter % variations.length;
        const selectedVariation = variations[variationIndex];
        currentWorkout.exercises = selectedVariation.map((ex, idx) => ({
          ...ex,
          index: String(idx + 1).padStart(2, '0'),
        }));
      }
    },

    // 4. RESET WORKOUT TO INITIAL DEFAULT
    resetWorkoutToDefault: (
      state,
      action: PayloadAction<{ pathId: string }>
    ) => {
      const { pathId } = action.payload;
      const key = pathId.toLowerCase();
      if (WORKOUT_PATH_DETAILS_MAP[key]) {
        state.workoutsByPath[key] = {
          ...WORKOUT_PATH_DETAILS_MAP[key],
          exercises: WORKOUT_PATH_DETAILS_MAP[key].exercises.map((ex, i) => ({
            ...ex,
            index: String(i + 1).padStart(2, '0'),
          })),
        };
        state.regenerationCounterByPath[key] = 0;
      }
    },

    // 5. ASSIGN WORKOUT SCHEDULE TO DATE
    assignWorkoutSchedule: (
      state,
      action: PayloadAction<{
        dateKey: string;
        splitId: string;
        type?: 'completed' | 'scheduled' | 'today';
      }>
    ) => {
      const { dateKey, splitId, type } = action.payload;
      const normalizedSplit = (splitId === 'full' ? 'fullbody' : splitId).toLowerCase();
      const meta = SPLIT_MISSION_METADATA[normalizedSplit] || SPLIT_MISSION_METADATA.pull;

      state.calendarSchedules[dateKey] = {
        dateKey,
        splitId: normalizedSplit,
        splitName: meta.name,
        missionTitle: meta.missionTitle,
        missionSubtitle: meta.missionSubtitle,
        type: type || (dateKey === state.activeScheduleDateKey ? 'today' : 'scheduled'),
        color: meta.color,
        bgColor: meta.bgColor,
        borderColor: meta.borderColor,
        route: meta.route,
      };

      state.activeScheduleDateKey = dateKey;
      state.selectedWorkoutCategory = normalizedSplit;
    },

    // 6. REMOVE WORKOUT SCHEDULE FROM DATE
    removeWorkoutSchedule: (
      state,
      action: PayloadAction<{ dateKey: string }>
    ) => {
      const { dateKey } = action.payload;
      delete state.calendarSchedules[dateKey];
    },

    // 7. SET ACTIVE FOCUSED SCHEDULE DATE
    setActiveScheduleDate: (
      state,
      action: PayloadAction<string>
    ) => {
      const dateKey = action.payload;
      state.activeScheduleDateKey = dateKey;
      if (state.calendarSchedules[dateKey]) {
        state.selectedWorkoutCategory = state.calendarSchedules[dateKey].splitId;
      }
    },
  },
});

export const {
  markExerciseComplete,
  unmarkExerciseComplete,
  resetCompletedExercises,
  setCurrentExerciseIndex,
  setActiveWorkoutPathId,
  setSelectedWorkoutCategory,
  removeExerciseFromWorkout,
  replaceExerciseInWorkout,
  regenerateWorkout,
  resetWorkoutToDefault,
  assignWorkoutSchedule,
  removeWorkoutSchedule,
  setActiveScheduleDate,
} = workoutSlice.actions;

export default workoutSlice.reducer;
