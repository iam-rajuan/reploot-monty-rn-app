import {
  mockExercises,
  mockTodayWorkout,
  mockWorkoutSplits,
} from "@/mocks/workouts.mock";
import {
  Exercise,
  Workout,
  WorkoutSplitTemplate,
} from "@/shared/types/workout";

const simulateDelay = <T>(data: T, delayMs = 80): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delayMs));

export const workoutService = {
  getTodayWorkout: async (): Promise<Workout> => {
    return simulateDelay(mockTodayWorkout);
  },

  getExercises: async (category?: string): Promise<Exercise[]> => {
    if (!category) return simulateDelay(mockExercises);
    const filtered = mockExercises.filter(
      (ex) => ex.category.toLowerCase() === category.toLowerCase(),
    );
    return simulateDelay(filtered);
  },

  getExerciseById: async (id: string): Promise<Exercise | undefined> => {
    const exercise = mockExercises.find((ex) => ex.id === id);
    return simulateDelay(exercise);
  },

  getWorkoutSplits: async (): Promise<WorkoutSplitTemplate[]> => {
    return simulateDelay(mockWorkoutSplits);
  },
};
