import { WorkoutStyle } from "@/shared/types/user";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useProfileSetupStore } from "../store/profileSetupStore";
import { OnboardingButton } from "@/features/onboarding/components/OnboardingButton";

import { DayPillItem } from "./DayPillItem";
import { GymDumbbellIcon } from "./GymDumbbellIcon";
import { HomeRoofIcon } from "./HomeRoofIcon";
import { LocationCard } from "./LocationCard";

const DAY_ROWS: number[][] = [
  [2, 3, 4],
  [5, 6, 7],
];

export function Step4YourStyle() {
  const { width } = useWindowDimensions();
  const pillWidth = Math.floor((width - 40 - 24) / 3);

  const selectedStyle = useProfileSetupStore(
    (s) => s.data.workoutStyle || "gym",
  );
  const selectedDays = useProfileSetupStore(
    (s) => s.data.workoutDaysPerWeek || 3,
  );
  const updateData = useProfileSetupStore((s) => s.updateData);
  const nextStep = useProfileSetupStore((s) => s.nextStep);

  const handleSelectStyle = React.useCallback(
    (workoutStyle: WorkoutStyle) => {
      requestAnimationFrame(() => {
        try {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {
          // ignore
        }
      });
      updateData({ workoutStyle });
    },
    [updateData],
  );

  const handleSelectDays = React.useCallback(
    (workoutDaysPerWeek: number) => {
      requestAnimationFrame(() => {
        try {
          void Haptics.selectionAsync();
        } catch {
          // ignore
        }
      });
      updateData({ workoutDaysPerWeek });
    },
    [updateData],
  );

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>YOUR STYLE</Text>
      </View>

      {/* 2 Location Cards: GYM vs HOME */}
      <View style={styles.locationGroup}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ selected: selectedStyle === "gym" }}
          activeOpacity={0.8}
          onPress={() => handleSelectStyle("gym")}
        >
          <LocationCard
            isSelected={selectedStyle === "gym"}
            icon={<GymDumbbellIcon color="#FB923C" />}
            title="GYM"
            subtitle="Full equipment access"
          />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ selected: selectedStyle === "home" }}
          activeOpacity={0.8}
          onPress={() => handleSelectStyle("home")}
        >
          <LocationCard
            isSelected={selectedStyle === "home"}
            icon={<HomeRoofIcon color="#C4B5FD" />}
            title="HOME"
            subtitle="Bodyweight & basics"
          />
        </TouchableOpacity>
      </View>

      {/* Workout Days / week Section */}
      <View style={styles.frequencySection}>
        <Text style={styles.frequencyTitle}>Workout Days / week</Text>

        <View style={styles.daysGrid}>
          {DAY_ROWS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.pillsRow}>
              {row.map((days) => (
                <DayPillItem
                  key={days}
                  days={days}
                  isSelected={selectedDays === days}
                  pillWidth={pillWidth}
                  onSelect={handleSelectDays}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Continue CTA */}
      <View style={styles.ctaContainer}>
        <OnboardingButton text="CONTINUE" compact onPress={nextStep} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "stretch",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
    alignItems: "center",
  },
  hero: {
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 14,
  },
  title: {
    color: "#22D3EE",
    fontSize: 24,
    lineHeight: 30,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "left",
    textTransform: "uppercase",
  },
  locationGroup: {
    width: "100%",
    gap: 16,
    marginBottom: 36,
  },
  frequencySection: {
    width: "100%",
    marginBottom: 20,
  },
  frequencyTitle: {
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 16,
  },
  daysGrid: {
    width: "100%",
    gap: 12,
  },
  pillsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayPillActive: {
    width: "100%",
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3882F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  dayPillInactive: {
    width: "100%",
    height: 44,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "#11141C",
    alignItems: "center",
    justifyContent: "center",
  },
  dayTextActive: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
    fontFamily: "monospace",
  },
  dayTextInactive: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
    fontFamily: "monospace",
  },
  ctaContainer: {
    width: "100%",
    marginTop: 10,
    marginBottom: 16,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
});
