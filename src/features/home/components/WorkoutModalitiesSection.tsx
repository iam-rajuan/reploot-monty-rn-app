import { useRouter } from "expo-router";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { TodaysMissionsCard } from "./TodaysMissionsCard";
import { WorkoutModalityCard } from "./WorkoutModalityCard";

const gymWorkoutAsset = require("../../../../assets/figma/modalities/gym-workout-card.jpeg");
const homeWorkoutAsset = require("../../../../assets/figma/modalities/home-workout-card.jpeg");

export interface WorkoutModalitiesSectionProps {
  onSelectModality?: (modality: "gym" | "home") => void;
  style?: StyleProp<ViewStyle>;
}

export const WorkoutModalitiesSection: React.FC<
  WorkoutModalitiesSectionProps
> = ({ onSelectModality, style }) => {
  const router = useRouter();

  const handleSelectGym = () => {
    if (onSelectModality) {
      onSelectModality("gym");
    } else {
      router.push({
        pathname: "/workouts",
        params: { modality: "gym" },
      });
    }
  };

  const handleSelectHome = () => {
    if (onSelectModality) {
      onSelectModality("home");
    } else {
      router.push("/workouts/home" as any);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.cardsColumn}>
        <TodaysMissionsCard />
        <WorkoutModalityCard
          title="GYM WORKOUT"
          subtitle="Full equipment access"
          image={gymWorkoutAsset}
          tag="FULL GYM"
          onPress={handleSelectGym}
          testID="gym-workout-card"
        />

        <WorkoutModalityCard
          title="HOME WORKOUT"
          subtitle="Bodyweight & dumbbells"
          image={homeWorkoutAsset}
          tag="NO GYM NEEDED"
          onPress={handleSelectHome}
          testID="home-workout-card"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  cardsColumn: {
    width: "100%",
    gap: 16,
  },
});
