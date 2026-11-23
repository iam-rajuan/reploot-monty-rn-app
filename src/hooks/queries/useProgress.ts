import { queryKeys } from "@/services/api/queryKeys";
import { progressService } from "@/services/mock/progressService";
import { useQuery } from "@tanstack/react-query";

export function useXPProgress() {
  return useQuery({
    queryKey: queryKeys.progress.overview(),
    queryFn: () => progressService.getXPProgress(),
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: queryKeys.progress.achievements(),
    queryFn: () => progressService.getAchievements(),
  });
}

export function useLeaderboard(context: "gym" | "home" = "gym") {
  return useQuery({
    queryKey: queryKeys.leaderboard.global(context),
    queryFn: () => progressService.getLeaderboard(context),
  });
}

export function usePersonalRecords() {
  return useQuery({
    queryKey: queryKeys.progress.workoutHistory(),
    queryFn: () => progressService.getPersonalRecords(),
  });
}

export function useWeeklyReport() {
  return useQuery({
    queryKey: queryKeys.progress.weeklyReport(),
    queryFn: () => progressService.getWeeklyReport(),
  });
}
