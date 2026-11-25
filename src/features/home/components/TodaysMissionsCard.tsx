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
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";

const missionBackground = require("../../../../assets/figma/missions/todays-missions-background.jpeg");
const calendarIcon = require("../../../../assets/figma/missions/mission-calendar.svg");
const settingsIcon = require("../../../../assets/figma/missions/mission-settings.svg");

export const TodaysMissionsCard = () => {
  const dispatch = useAppDispatch();
  const todayKey = getTodayDateKey();
  const calendarSchedules = useAppSelector(
    (state) => state.workout.calendarSchedules || {},
  );
  const activeScheduleDateKey = useAppSelector(
    (state) => state.workout.activeScheduleDateKey || todayKey,
  );
  const selectedWorkoutCategory = useAppSelector(
    (state) => state.workout.selectedWorkoutCategory || "pull",
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
    const isGymRootRoute =
      splitId === "lower" || splitId === "fullbody" || splitId === "full";
    router.push({
      pathname: (isGymRootRoute
        ? "/workouts"
        : activeMetadata.route || `/workouts/${splitId}`) as any,
      params: {
        source: "mission",
        ...(isGymRootRoute
          ? { pathId: splitId === "full" ? "fullbody" : splitId }
          : {}),
      },
    });
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
        <View style={[styles.glassBase, styles.cardLayer]} pointerEvents="none" />
        <Image
          source={missionBackground}
          style={[styles.backgroundImage, styles.cardLayer]}
          contentFit="cover"
          pointerEvents="none"
        />
        <LinearGradient
          colors={[
            "rgba(6, 10, 20, 0.65)",
            "rgba(8, 14, 27, 0.52)",
            "rgba(6, 10, 20, 0.85)",
          ]}
          locations={[0, 0.5, 1]}
          style={[styles.gradient, styles.cardLayer]}
          pointerEvents="none"
        />

        {/* Content Container using robust responsive Flexbox */}
        <View style={styles.contentWrap}>
          {/* Top Heading */}
          <Text style={styles.heading} numberOfLines={1}>
            TODAY'S MISSIONS
          </Text>

          {/* Middle Copy */}
          <View style={styles.missionCopy}>
            <Text style={styles.missionTitle} numberOfLines={1}>
              {missionTitle}
            </Text>
            <Text style={styles.missionSubtitle} numberOfLines={1}>
              {missionSubtitle}
            </Text>
          </View>

          {/* Bottom Actions */}
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
        </View>

        <View style={styles.insetHighlight} pointerEvents="none" />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressTarget: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
  },
  pressed: { opacity: 0.96 },
  card: {
    width: "100%",
    minHeight: 210,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(104, 123, 255, 0.32)",
    backgroundColor: "#0A101D",
    shadowColor: "#162A5C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  glassBase: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(129, 151, 255, 0.05)",
  },
  cardLayer: {
    borderRadius: 24,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.38,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentWrap: {
    padding: 20,
    minHeight: 210,
    justifyContent: "space-between",
    zIndex: 2,
  },
  heading: {
    color: "#F4F7FF",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  missionCopy: {
    marginVertical: 10,
  },
  missionTitle: {
    color: "#F4F7FF",
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  missionSubtitle: {
    color: "#B0BAD0",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.2,
    borderColor: "rgba(63, 222, 201, 0.5)",
    backgroundColor: "rgba(6, 35, 49, 0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarIcon: {
    width: 14,
    height: 15,
  },
  settingsIcon: {
    width: 17,
    height: 17,
  },
  insetHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: "rgba(188, 199, 255, 0.09)",
    borderRadius: 23,
  },
});
