import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { NestableScrollContainer } from "react-native-draggable-flatlist";
import { Platform, StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PULL_DAY_DATA, PullDayExercise } from "../data/pullDayData";
import { PullDayHeroCard } from "./PullDayHeroCard";
import { PushDayExerciseList } from "./PushDayExerciseCard";
import { StartAiWorkoutButton } from "./StartAiWorkoutButton";
import { typography } from "@/theme/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

export interface PullDayScreenProps {
  onBack?: () => void;
  onStartWorkout?: () => void;
  onSelectExercise?: (exerciseId: string) => void;
}

export const PullDayScreen: React.FC<PullDayScreenProps> = ({
  onBack,
  onStartWorkout,
  onSelectExercise,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [exercises, setExercises] = useState(PULL_DAY_DATA.exercises);
  const [isDraggingExercise, setIsDraggingExercise] = useState(false);

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/workouts");
    }
  };

  const handleStart = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    if (onStartWorkout) {
      onStartWorkout();
    }
  };

  const handleExercisePress = (exercise: PullDayExercise) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onSelectExercise?.(exercise.id);
  };

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <CustomHeader showBackButton onPressBack={handleBack} />
      <NestableScrollContainer
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 90 },
        ]}
      >
        <PushDayExerciseList
          exercises={exercises}
          onExercisePress={handleExercisePress}
          onDragStateChange={setIsDraggingExercise}
          onReorderExercises={(orderedIds) => {
            const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
            setExercises(orderedIds.flatMap((id) => {
              const exercise = byId.get(id);
              return exercise ? [exercise] : [];
            }));
          }}
          ListHeaderComponent={
            <>
              <View style={styles.titleSection}>
                <Text style={styles.mainTitle}>{PULL_DAY_DATA.title}</Text>
              </View>
              <PullDayHeroCard />
            </>
          }
        />
      </NestableScrollContainer>

      <StartAiWorkoutButton onPress={handleStart} dragActive={isDraggingExercise} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#070A11",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  titleSection: {
    marginBottom: 16,
  },
  mainTitle: {
    ...typography.pageTitle,
    color: "#FFFFFF",
    marginBottom: 6,
    ...(Platform.OS === "web"
      ? ({
          filter: "drop-shadow(0 0 16px rgba(68, 234, 195, 0.5))",
        } as any)
      : {}),
  },
  subtitle: {
    color: "#8E95A5",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
  },
});
