import {
  GenericWorkoutDetailScreen,
  WorkoutLibraryDetailScreen,
} from "@/features/workouts";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function WorkoutDetailsRoute() {
  const params = useLocalSearchParams<{ pathId?: string }>();
  if (params.pathId) {
    return <GenericWorkoutDetailScreen pathId={params.pathId} />;
  }
  return <WorkoutLibraryDetailScreen />;
}
