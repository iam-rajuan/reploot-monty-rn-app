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
import { ArrowRight, Calendar, Settings } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const TodaysMissionsCard = () => {
  const dispatch = useAppDispatch();
  const todayKey = getTodayDateKey();

  // Read schedules and active schedule date key from Redux store
  const calendarSchedules = useAppSelector(
    (state) => state.workout.calendarSchedules || {}
  );
  const activeScheduleDateKey = useAppSelector(
    (state) => state.workout.activeScheduleDateKey || todayKey
  );
  const selectedWorkoutCategory = useAppSelector(
    (state) => state.workout.selectedWorkoutCategory || "pull"
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
    <Pressable
      onPress={handleWorkoutPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Today's Mission: ${missionTitle}, ${missionSubtitle}`}
    >
      <Image
        source={require("../../../../assets/todaysMission/todaysMissionsBg.png")}
        style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
        contentFit="cover"
        pointerEvents="none"
      />
      <LinearGradient
        colors={[
          "rgba(10, 13, 20, 0.35)",
          "rgba(10, 13, 20, 0.72)",
          "rgba(10, 13, 20, 0.95)",
        ]}
        locations={[0, 0.5, 1]}
        style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
        pointerEvents="none"
      />

      <View style={styles.content}>
        <Text style={styles.headerTitle}>TODAY'S MISSIONS</Text>

        {/* Mission Info: Title & Subtitle */}
        <View style={styles.missionInfo}>
          <Text style={styles.missionTitle} numberOfLines={1}>
            {missionTitle}
          </Text>
          <Text style={styles.missionSubtitle} numberOfLines={1}>
            {missionSubtitle}
          </Text>
        </View>

        {/* Action Buttons: Calendar, Settings, and Arrow grouped in bottom middle */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Workout Calendar"
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={(e) => {
              e?.stopPropagation?.();
              handleCalendarPress();
            }}
            style={styles.circleButton}
          >
            <Calendar size={18} color="#2EE5C5" strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Settings"
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={(e) => {
              e?.stopPropagation?.();
              handleSettingsPress();
            }}
            style={styles.circleButton}
          >
            <Settings size={18} color="#2EE5C5" strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go to Workout"
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={(e) => {
              e?.stopPropagation?.();
              handleWorkoutPress();
            }}
            style={styles.circleButton}
          >
            <ArrowRight size={18} color="#2EE5C5" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 28,
    height: 240,
    minHeight: 240,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1.2,
    borderColor: "rgba(46, 229, 197, 0.35)",
    backgroundColor: "#11141C",
    position: "relative",
    shadowColor: "#2EE5C5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  containerPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.992 }],
  },
  content: {
    flex: 1,
    padding: 22,
    justifyContent: "space-between",
    position: "relative",
    zIndex: 2,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "900",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    letterSpacing: 0.5,
    textAlign: "left",
    textTransform: "uppercase",
  },
  missionInfo: {
    marginVertical: "auto",
  },
  missionTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "800",
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  missionSubtitle: {
    color: "#8E94B8",
    fontSize: 12.5,
    lineHeight: 17,
    fontFamily: Platform.select({ android: "sans-serif-medium", ios: "System" }),
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(46, 229, 197, 0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(46, 229, 197, 0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
});
