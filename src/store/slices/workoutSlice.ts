import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  DynamicWorkoutPathDetail,
  REPLACEMENT_EXERCISES_POOL,
  WORKOUT_PATH_DETAILS_MAP,
  WORKOUT_VARIATIONS_MAP,
  WorkoutExerciseItem,
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

export interface TrainingSettings {
  frequency: number; // 3, 4, 5, 6
  location: string; // "gym" | "home"
  experience: string; // "beginner" | "intermed" | "advanced"
  goal: string; // "muscle" | "fat" | "strength" | "endurance"
  stylesSelected: string[]; // ["push", "pull", "chest", "upper", "lower", "fullbody"]
  lastSyncedAt?: string;
}

export interface WorkoutState {
  completedExerciseIds: string[];
  activeWorkoutPathId: string | null;
  currentExerciseIndex: number;
  selectedWorkoutCategory: string; // e.g. "push" | "pull" | "chest" | "lower" | "upper" | "fullbody"
  workoutsByPath: Record<string, DynamicWorkoutPathDetail>;
  regenerationCounterByPath: Record<string, number>;
  calendarSchedules: Record<string, ScheduledWorkoutEntry>;
  activeScheduleDateKey: string;
  trainingSettings: TrainingSettings;
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
        isAiRecommended: i < 8,
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
  trainingSettings: {
    frequency: 4,
    location: "gym",
    experience: "intermed",
    goal: "muscle",
    stylesSelected: ["push", "pull", "chest", "upper", "lower"],
    lastSyncedAt: undefined,
  },
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

    // Keep the routine order selected by the member. `orderedExerciseIds` may
    // contain only the visible AI picks, so retain any exercises not included
    // in the payload at the end of the routine.
    reorderWorkoutExercises: (
      state,
      action: PayloadAction<{ pathId: string; orderedExerciseIds: string[] }>
    ) => {
      const { pathId, orderedExerciseIds } = action.payload;
      const key = pathId.toLowerCase();
      if (!state.workoutsByPath[key]) {
        const fallback = WORKOUT_PATH_DETAILS_MAP[key] || WORKOUT_PATH_DETAILS_MAP.push;
        state.workoutsByPath[key] = {
          ...fallback,
          exercises: [...fallback.exercises],
        };
      }
      const currentWorkout = state.workoutsByPath[key];
      if (!currentWorkout) return;

      const exercisesById = new Map(
        currentWorkout.exercises.map((exercise) => [exercise.id, exercise])
      );
      const ordered = orderedExerciseIds
        .map((id) => exercisesById.get(id))
        .filter((exercise): exercise is WorkoutExerciseItem => Boolean(exercise));
      const requestedIds = new Set(orderedExerciseIds);
      const remaining = currentWorkout.exercises.filter(
        (exercise) => !requestedIds.has(exercise.id)
      );

      currentWorkout.exercises = [...ordered, ...remaining].map(
        (exercise, index) => ({
          ...exercise,
          index: String(index + 1).padStart(2, "0"),
          isAiRecommended: index < 8,
        })
      );
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
        isAiRecommended: idx < 8,
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
          isAiRecommended: exerciseIndex < 8,
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
              isAiRecommended: exerciseIndex < 8,
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
      let currentWorkout = state.workoutsByPath[key];

      // A route can be opened before its Redux entry has been restored or
      // initialized. Recreate that entry from the canonical workout data so
      // tapping Regenerate always changes the routine that is on screen.
      if (!currentWorkout && WORKOUT_PATH_DETAILS_MAP[key]) {
        const sourceWorkout = WORKOUT_PATH_DETAILS_MAP[key];
        currentWorkout = {
          ...sourceWorkout,
          exercises: sourceWorkout.exercises.map((ex, index) => ({
            ...ex,
            index: String(index + 1).padStart(2, '0'),
          })),
        };
        state.workoutsByPath[key] = currentWorkout;
      }

      if (!currentWorkout) return;

      const currentCounter = state.regenerationCounterByPath[key] || 0;
      const nextCounter = currentCounter + 1;
      state.regenerationCounterByPath[key] = nextCounter;

      const variations = WORKOUT_VARIATIONS_MAP[key] || [];
      if (variations.length > 0) {
        const variationIndex = nextCounter % variations.length;
        const selectedVariation = variations[variationIndex];
        const regularExercises = (WORKOUT_PATH_DETAILS_MAP[key]?.exercises || [])
          .filter((exercise) => !exercise.isAiRecommended)
          .map((exercise) => ({ ...exercise, isAiRecommended: false }));

        // Regeneration changes the eight AI picks, while the full regular
        // exercise library remains available below them.
        currentWorkout.exercises = [
          ...selectedVariation.slice(0, 8).map((exercise) => ({
            ...exercise,
            isAiRecommended: true,
          })),
          ...regularExercises,
        ].map((exercise, idx) => ({
          ...exercise,
          index: String(idx + 1).padStart(2, '0'),
          isAiRecommended: idx < 8,
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
            isAiRecommended: i < 8,
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

    // 8. UPDATE TRAINING SETTINGS
    updateTrainingSettings: (
      state,
      action: PayloadAction<Partial<TrainingSettings>>
    ) => {
      state.trainingSettings = {
        ...state.trainingSettings,
        ...action.payload,
      };
    },

    // 9. AUTO-GENERATE & SYNC AI WORKOUT SCHEDULE TO CALENDAR
    autoGenerateCalendarPlan: (
      state,
      action: PayloadAction<{
        frequency: number;
        location?: string;
        experience?: string;
        goal?: string;
        stylesSelected?: string[];
        year?: number;
        month?: number;
      }>
    ) => {
      const {
        frequency,
        location = state.trainingSettings.location,
        experience = state.trainingSettings.experience,
        goal = state.trainingSettings.goal,
        stylesSelected = state.trainingSettings.stylesSelected,
      } = action.payload;

      state.trainingSettings = {
        frequency,
        location,
        experience,
        goal,
        stylesSelected,
        lastSyncedAt: new Date().toISOString(),
      };

      const now = new Date();
      const year = action.payload.year ?? now.getFullYear();
      const month = action.payload.month ?? now.getMonth();
      const currentDay = now.getDate();
      const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;

      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Normalize candidate splits
      const candidateSplits = (stylesSelected && stylesSelected.length > 0
        ? stylesSelected
        : ["push", "pull", "chest", "upper", "lower"]
      ).map((s) => (s === "full" ? "fullbody" : s.toLowerCase()));

      // Frequency patterns (days of week to train: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
      let activeDaysOfWeek: number[] = [1, 2, 4, 5]; // 4 days: Mon, Tue, Thu, Fri
      if (frequency === 3) {
        activeDaysOfWeek = [1, 3, 5]; // Mon, Wed, Fri
      } else if (frequency === 4) {
        activeDaysOfWeek = [1, 2, 4, 5]; // Mon, Tue, Thu, Fri
      } else if (frequency === 5) {
        activeDaysOfWeek = [1, 2, 3, 5, 6]; // Mon, Tue, Wed, Fri, Sat
      } else if (frequency === 6) {
        activeDaysOfWeek = [1, 2, 3, 4, 5, 6]; // Mon through Sat
      }

      // Generate schedules for the target month and the subsequent month
      let splitCounter = 0;

      const monthsToGenerate = [
        { y: year, m: month, isCurrent: isCurrentMonth },
        { y: month === 11 ? year + 1 : year, m: (month + 1) % 12, isCurrent: false },
      ];

      for (const target of monthsToGenerate) {
        const targetDaysInMonth = new Date(target.y, target.m + 1, 0).getDate();

        for (let day = 1; day <= targetDaysInMonth; day++) {
          const dateObj = new Date(target.y, target.m, day);
          const dayOfWeek = dateObj.getDay();
          const dateKey = `${target.y}-${target.m}-${day}`;

          if (activeDaysOfWeek.includes(dayOfWeek)) {
            const splitId = candidateSplits[splitCounter % candidateSplits.length];
            splitCounter++;

            const meta = SPLIT_MISSION_METADATA[splitId] || SPLIT_MISSION_METADATA.pull;

            let entryType: 'completed' | 'scheduled' | 'today' = 'scheduled';
            if (target.isCurrent) {
              if (day < currentDay) {
                entryType = 'completed';
              } else if (day === currentDay) {
                entryType = 'today';
              } else {
                entryType = 'scheduled';
              }
            } else {
              entryType = 'scheduled';
            }

            state.calendarSchedules[dateKey] = {
              dateKey,
              splitId,
              splitName: meta.name,
              missionTitle: meta.missionTitle,
              missionSubtitle: meta.missionSubtitle,
              type: entryType,
              color: meta.color,
              bgColor: meta.bgColor,
              borderColor: meta.borderColor,
              route: meta.route,
            };
          } else {
            // Rest day - clear any previous scheduled workout on this date
            delete state.calendarSchedules[dateKey];
          }
        }
      }

      // Set active schedule key to today or current
      const todayKey = `${year}-${month}-${currentDay}`;
      state.activeScheduleDateKey = todayKey;
      if (state.calendarSchedules[todayKey]) {
        state.selectedWorkoutCategory = state.calendarSchedules[todayKey].splitId;
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
  reorderWorkoutExercises,
  removeExerciseFromWorkout,
  replaceExerciseInWorkout,
  regenerateWorkout,
  resetWorkoutToDefault,
  assignWorkoutSchedule,
  removeWorkoutSchedule,
  setActiveScheduleDate,
  updateTrainingSettings,
  autoGenerateCalendarPlan,
} = workoutSlice.actions;

export default workoutSlice.reducer;
