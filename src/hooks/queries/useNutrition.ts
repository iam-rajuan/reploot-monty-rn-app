import { queryKeys } from "@/services/api/queryKeys";
import { nutritionService } from "@/services/mock/nutritionService";
import { useQuery } from "@tanstack/react-query";

export function useDailyBudget() {
  return useQuery({
    queryKey: queryKeys.nutrition.today(),
    queryFn: () => nutritionService.getDailyBudget(),
  });
}

export function useHydrationTelemetry() {
  return useQuery({
    queryKey: queryKeys.nutrition.hydration("today"),
    queryFn: () => nutritionService.getHydrationTelemetry(),
  });
}

export function useRecentMeals() {
  return useQuery({
    queryKey: queryKeys.nutrition.macros("today"),
    queryFn: () => nutritionService.getRecentMeals(),
  });
}
