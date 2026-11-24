import { ExerciseDetailScreen } from "@/features/workouts";
import { getExerciseDetailById } from "@/features/workouts/data/exerciseDetailsData";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

export default function ExerciseDetailsRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    pathId?: string;
  }>();

  const exerciseId = (params.id as string) || "bench-press";
  const exerciseTitle = params.title as string | undefined;

  const exerciseData = getExerciseDetailById(exerciseId, exerciseTitle);

  return (
    <ExerciseDetailScreen
      exerciseData={exerciseData}
      onBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/workouts");
        }
      }}
      onViewFullWorkout={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/workouts");
        }
      }}
      onStartExercise={() => {
        router.push({
          pathname: "/workouts/ai-session" as any,
          params: {
            pathId: (params.pathId as string) || "push",
            exerciseId,
          },
        });
      }}
    />
  );
}
