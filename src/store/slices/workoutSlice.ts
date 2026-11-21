import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  DynamicWorkoutPathDetail,
  REPLACEMENT_EXERCISES_POOL,
  WORKOUT_PATH_DETAILS_MAP,
  WORKOUT_VARIATIONS_MAP,
} from '@/features/workouts/data/workoutPathDetailData';

export interface WorkoutState {
  completedExerciseIds: string[];
  activeWorkoutPathId: string | null;
  currentExerciseIndex: number;
  selectedWorkoutCategory: string; // e.g. "push" | "pull" | "chest" | "lower" | "upper" | "fullbody"
  workoutsByPath: Record<string, DynamicWorkoutPathDetail>;
  regenerationCounterByPath: Record<string, number>;
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
  selectedWorkoutCategory: 'push',
  workoutsByPath: cloneInitialWorkouts(),
  regenerationCounterByPath: {
    push: 0,
    pull: 0,
    chest: 0,
    upper: 0,
    lower: 0,
    fullbody: 0,
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
} = workoutSlice.actions;

export default workoutSlice.reducer;
