import { queryKeys } from "@/services/api/queryKeys";
import { challengeService } from "@/services/mock/challengeService";
import { useQuery } from "@tanstack/react-query";

export function useUpcomingChallenges() {
  return useQuery({
    queryKey: queryKeys.challenges.list("upcoming"),
    queryFn: () => challengeService.getUpcomingChallenges(),
  });
}

export function useWeeklyChallenge() {
  return useQuery({
    queryKey: queryKeys.challenges.weekly(),
    queryFn: () => challengeService.getWeeklyChallenge(),
  });
}

export function useHomeChallenges() {
  return useQuery({
    queryKey: queryKeys.challenges.list("home"),
    queryFn: () => challengeService.getHomeChallenges(),
  });
}
