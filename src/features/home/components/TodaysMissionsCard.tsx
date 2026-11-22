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
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

const missionBackground = require("../../../../assets/figma/missions/todays-missions-background.jpeg");
const calendarIcon = require("../../../../assets/figma/missions/mission-calendar.svg");
const settingsIcon = require("../../../../assets/figma/missions/mission-settings.svg");

export const TodaysMissionsCard = () => {
  const dispatch = useAppDispatch();
  const todayKey = getTodayDateKey();
  const calendarSchedules = useAppSelector(
    (state) => state.workout.calendarSchedules || {}
  );
  const activeScheduleDateKey = useAppSelector(
    (state) => state.workout.activeScheduleDateKey || todayKey
  );
  const selectedWorkoutCategory = useAppSelector(
    (state) => state.workout.selectedWorkoutCategory || "pull"
  );
  const scheduledToday = calendarSchedules[activeScheduleDateKey];
  const splitId = scheduledToday?.splitId || selectedWorkoutCategory || "pull";
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
    <Pressable
      onPress={handleWorkoutPress}
      style={({ pressed }) => [styles.pressTarget, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Today's Mission: ${missionTitle}, ${missionSubtitle}`}
    >
      <View style={styles.card}>
        <View style={styles.glassBase} pointerEvents="none" />
        <Image
          source={missionBackground}
          style={styles.backgroundImage}
          contentFit="fill"
          pointerEvents="none"
        />
        <LinearGradient
          colors={[
            "rgba(13, 14, 19, 0.48)",
            "rgba(13, 14, 19, 0.36)",
            "rgba(13, 14, 19, 0.54)",
          ]}
          locations={[0.1875, 0.5, 1]}
          style={styles.gradient}
          pointerEvents="none"
        />
        <Text style={styles.heading}>TODAY'S MISSIONS</Text>
        <View style={styles.missionCopy} pointerEvents="none">
          <Text style={styles.missionTitle} numberOfLines={1}>
            {missionTitle}
          </Text>
          <Text style={styles.missionSubtitle} numberOfLines={1}>
            {missionSubtitle}
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Workout Calendar"
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              handleCalendarPress();
            }}
            style={styles.actionButton}
          >
            <Image
              source={calendarIcon}
              style={styles.calendarIcon}
              contentFit="contain"
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              handleSettingsPress();
            }}
            style={styles.actionButton}
          >
            <Image
              source={settingsIcon}
              style={styles.settingsIcon}
              contentFit="contain"
            />
          </Pressable>
        </View>
        <View style={styles.insetHighlight} pointerEvents="none" />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressTarget: {
    height: 240,
    minHeight: 240,
    maxHeight: 240,
    flexShrink: 0,
  },
  pressed: { opacity: 0.96 },
  card: {
    height: 240,
    width: "100%",
    overflow: "hidden",
    position: "relative",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(108, 92, 255, 0.55)",
    backgroundColor: "#0D0E13",
    shadowColor: "#6C5CFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  glassBase: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  backgroundImage: {
    position: "absolute",
    top: 1.6,
    left: "-15.6%",
    width: "131.43%",
    aspectRatio: 512 / 286,
    opacity: 0.35,
  },
  gradient: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  heading: {
    position: "absolute",
    top: 40,
    left: 24,
    color: "#E3E1E9",
    fontSize: 30,
    lineHeight: 32,
    fontWeight: "900",
    fontStyle: "italic",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    letterSpacing: -0.6,
  },
  missionCopy: {
    position: "absolute",
    top: 101,
    left: 30,
    width: 237,
  },
  missionTitle: {
    color: "#E3E1E9",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "700",
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
    letterSpacing: -0.35,
    marginBottom: 4,
  },
  missionSubtitle: {
    color: "#C8C4D8",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Platform.select({ android: "sans-serif", ios: "System" }),
    fontWeight: "400",
  },
  actions: {
    position: "absolute",
    top: 187,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  actionButton: {
    width: 39,
    height: 39,
    borderRadius: 20,
    borderWidth: 1.219,
    borderColor: "#3385C0",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarIcon: {
    width: 13.5,
    height: 15,
  },
  settingsIcon: {
    width: 18,
    height: 18,
  },
  insetHighlight: {
    position: "absolute",
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 31,
  },
});
