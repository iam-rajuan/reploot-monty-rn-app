import React, { useCallback } from "react";
import { FitnessGoal } from "@/shared/types/user";
import * as Haptics from "expo-haptics";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { useProfileSetupStore } from "../store/profileSetupStore";
import { OnboardingButton } from "@/features/onboarding/components/OnboardingButton";

import { BicepArmIcon } from "./BicepArmIcon";
import { HeartShapeIcon } from "./HeartShapeIcon";
import { LightningIcon } from "./LightningIcon";
import { MeditationIcon } from "./MeditationIcon";
import { ScaleBoxIcon } from "./ScaleBoxIcon";
import { StopwatchIcon } from "./StopwatchIcon";
import { GoalCardItem, GoalOption } from "./GoalCardItem";
import { typography } from "@/theme/typography";

const GOAL_PAIRS: [GoalOption, GoalOption][] = [
  [
    {
      id: "lose_weight",
      label: "LOSE WEIGHT",
      icon: () => <ScaleBoxIcon />,
    },
    {
      id: "build_muscle",
      label: "BUILD MUSCLE",
      icon: () => <BicepArmIcon />,
    },
  ],
  [
    {
      id: "stay_fit",
      label: "STAY FIT",
      icon: () => <HeartShapeIcon />,
    },
    {
      id: "gain_strength",
      label: "GAIN STRENGTH",
      icon: () => <LightningIcon />,
    },
  ],
  [
    {
      id: "improve_endurance",
      label: "IMPROVE\nENDURANCE",
      icon: () => <StopwatchIcon />,
    },
    {
      id: "improve_flexibility",
      label: "IMPROVE\nFLEXIBILITY",
      icon: () => <MeditationIcon />,
    },
  ],
];

export function Step3YourGoal() {
  const { width: screenWidth } = useWindowDimensions();
  const primaryGoal = useProfileSetupStore((s) => s.data.primaryGoal);
  const selectedGoal = primaryGoal || "build_muscle";
  const updateData = useProfileSetupStore((s) => s.updateData);
  const nextStep = useProfileSetupStore((s) => s.nextStep);
  const horizontalPadding = 20;
  const cardGap = 14;
  const cardWidth = Math.floor(
    (screenWidth - horizontalPadding * 2 - cardGap) / 2,
  );
  const cardHeight = Math.round(cardWidth * 0.8);

  const handleSelectGoal = useCallback(
    (goal: FitnessGoal) => {
      updateData({ primaryGoal: goal });
      requestAnimationFrame(() => {
        try {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {
          // ignore
        }
      });
    },
    [updateData],
  );

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>YOUR GOAL</Text>
      </View>
      <View style={[styles.gridContainer, { width: cardWidth * 2 + cardGap }]}>
        {GOAL_PAIRS.map((pair, rowIndex) => (
          <View key={rowIndex} style={[styles.row, { gap: cardGap }]}>
            {pair.map((opt) => (
              <GoalCardItem
                key={opt.id}
                opt={opt}
                isSelected={selectedGoal === opt.id}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                onSelect={handleSelectGoal}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={{ width: "100%", paddingHorizontal: horizontalPadding }}>
        <OnboardingButton text="CONTINUE" compact onPress={nextStep} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "stretch",
    paddingTop: 4,
    paddingBottom: 4,
    alignItems: "center",
  },
  hero: {
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 14,
  },
  title: {
    ...typography.pageTitle,
    color: "#22D3EE",
  },
  gridContainer: {
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
    justifyContent: "center",
  },
});
