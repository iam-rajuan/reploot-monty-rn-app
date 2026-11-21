import { queryKeys } from "@/services/api/queryKeys";
import { workoutService } from "@/services/mock/workoutService";
import { useQuery } from "@tanstack/react-query";

export function useTodayWorkout() {
  return useQuery({
    queryKey: queryKeys.workouts.today(),
    queryFn: () => workoutService.getTodayWorkout(),
  });
}

export function useExercises(category?: string) {
  return useQuery({
    queryKey: queryKeys.workouts.exercises(category),
    queryFn: () => workoutService.getExercises(category),
  });
}

export function useWorkoutSplits() {
  return useQuery({
    queryKey: queryKeys.workouts.library({ type: "splits" }),
    queryFn: () => workoutService.getWorkoutSplits(),
  });
}
