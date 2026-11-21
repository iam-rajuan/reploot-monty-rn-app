import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getTodayDateKey,
  setSelectedWorkoutCategory,
  SPLIT_MISSION_METADATA,
} from "@/store/slices/workoutSlice";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const TodaysMissionsCard = () => {
  const dispatch = useAppDispatch();
  const todayKey = getTodayDateKey();

  // Read schedules and active schedule date key from Redux store
  const calendarSchedules = useAppSelector(
    (state) => state.workout.calendarSchedules || {},
  );
  const activeScheduleDateKey = useAppSelector(
    (state) => state.workout.activeScheduleDateKey || todayKey,
  );
  const selectedWorkoutCategory = useAppSelector(
    (state) => state.workout.selectedWorkoutCategory || "pull",
  );

  // Check if a workout is scheduled for the active date
  const scheduledToday = calendarSchedules[activeScheduleDateKey];
  const splitId = scheduledToday
    ? scheduledToday.splitId
    : selectedWorkoutCategory || "pull";

  const activeMetadata =
    SPLIT_MISSION_METADATA[splitId] || SPLIT_MISSION_METADATA.pull;

  const isRestDay = !scheduledToday && activeScheduleDateKey !== todayKey;

  const missionTitle = isRestDay
    ? "Active Recovery / Rest Day"
    : scheduledToday?.missionTitle || activeMetadata.missionTitle;

  const missionSubtitle = isRestDay
    ? "Tap to assign a workout in calendar"
    : scheduledToday?.missionSubtitle || activeMetadata.missionSubtitle;

  const handleWorkoutPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (isRestDay) {
      router.push("/workout-calendar");
      return;
    }
    // Update active category in shared Redux store and route straight to selected workout
    dispatch(setSelectedWorkoutCategory(splitId));
    const targetRoute =
      activeMetadata.route ||
      (splitId === "fullbody" || splitId === "full"
        ? "/workouts?pathId=fullbody"
        : `/workouts/${splitId}`);
    router.push(targetRoute as any);
  };

  const handleCalendarPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push("/workout-calendar");
  };

  const handleSettingsPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push("/settings");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../../assets/todaysMission/todaysMissionsBg.png")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        pointerEvents="none"
      />
      <LinearGradient
        colors={["rgba(10, 13, 20, 0.45)", "rgba(10, 13, 20, 0.92)"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.content}>
        <Text style={styles.headerTitle}>TODAY'S MISSIONS</Text>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.75}
          onPress={handleWorkoutPress}
        >
          <View style={styles.missionRow}>
            <View style={styles.missionInfo}>
              <Text style={styles.missionTitle}>{missionTitle}</Text>
              <Text style={styles.missionSubtitle}>{missionSubtitle}</Text>
            </View>
            <View style={styles.arrowButton}>
              <Image
                source={require("../../../../assets/todaysMission/RightArrow.png")}
                style={styles.arrowIcon}
                contentFit="contain"
              />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={handleCalendarPress}
            style={styles.iconButton}
          >
            <Image
              source={require("../../../../assets/todaysMission/calendar.svg")}
              style={styles.icon}
              contentFit="contain"
            />
            <Text style={styles.iconLabel}>CALENDAR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={handleSettingsPress}
            style={styles.iconButton}
          >
            <Image
              source={require("../../../../assets/todaysMission/settings.svg")}
              style={styles.icon}
              contentFit="contain"
            />
            <Text style={styles.iconLabel}>SETTINGS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "#11141C",
    position: "relative",
  },
  content: {
    padding: 22,
    position: "relative",
    zIndex: 2,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    fontFamily: "monospace",
    letterSpacing: 1.5,
    textAlign: "left",
    textTransform: "uppercase",
    marginBottom: 16,
  },
  missionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  missionInfo: {
    flex: 1,
    marginRight: 12,
  },
  missionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    fontFamily: "monospace",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  missionSubtitle: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "monospace",
    fontWeight: "500",
  },
  arrowButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowIcon: {
    width: 44,
    height: 44,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
  iconButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.35)",
  },
  icon: {
    width: 28,
    height: 28,
  },
  iconLabel: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "800",
    fontFamily: "monospace",
    letterSpacing: 1.2,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
