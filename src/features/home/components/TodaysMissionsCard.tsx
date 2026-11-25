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
import { ArrowRight, CalendarDays } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";

const missionBackground = require("../../../../assets/figma/missions/todays-missions-background.jpeg");
const calendarIcon = require("../../../../assets/figma/missions/mission-calendar.svg");
const settingsIcon = require("../../../../assets/figma/missions/mission-settings.svg");

const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;

const haptic = () => {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
};

/**
 * Small round glass button. Visuals sit on an inner View because Pressable
 * style functions are dropped on native in this app (NativeWind interop).
 */
const RoundAction = ({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) => {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View style={[styles.roundAction, pressed && styles.roundActionPressed]}>{children}</View>
    </Pressable>
  );
};

export const TodaysMissionsCard = () => {
  const dispatch = useAppDispatch();
  const [cardPressed, setCardPressed] = useState(false);
  const [startPressed, setStartPressed] = useState(false);
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
    haptic();
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
    haptic();
    router.push("/workout-calendar");
  };

  const handleSettingsPress = () => {
    haptic();
    router.push("/settings");
  };

  return (
    <Pressable
      onPress={handleWorkoutPress}
      onPressIn={() => setCardPressed(true)}
      onPressOut={() => setCardPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={`Today's Mission: ${missionTitle}, ${missionSubtitle}`}
    >
      <View style={[styles.card, cardPressed && styles.cardPressed]}>
        <Image
          source={missionBackground}
          style={styles.backgroundImage}
          contentFit="cover"
          pointerEvents="none"
        />
        <LinearGradient
          colors={[
            "rgba(6, 10, 20, 0.62)",
            "rgba(8, 14, 27, 0.5)",
            "rgba(6, 10, 20, 0.9)",
          ]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.contentWrap}>
          {/* Heading */}
          <Text style={styles.heading} numberOfLines={1}>
            TODAY'S MISSIONS
          </Text>

          {/* Mission */}
          <View style={styles.missionCopy}>
            <Text style={styles.missionTitle} numberOfLines={1}>
              {missionTitle}
            </Text>
            <Text style={styles.missionSubtitle} numberOfLines={1}>
              {missionSubtitle}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isRestDay ? "Plan a workout" : "Start mission"}
              onPress={(event) => {
                event.stopPropagation();
                handleWorkoutPress();
              }}
              onPressIn={() => setStartPressed(true)}
              onPressOut={() => setStartPressed(false)}
              style={styles.startPressable}
            >
              <View style={[styles.startShadow, startPressed && styles.startPressed]}>
                <LinearGradient
                  colors={BUTTON_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.startButton}
                >
                  <LinearGradient
                    pointerEvents="none"
                    colors={SHEEN}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.startSheen}
                  />
                  {isRestDay && <CalendarDays size={15} color="#FFFFFF" strokeWidth={2.4} />}
                  <Text style={styles.startText} numberOfLines={1}>
                    {isRestDay ? "PLAN WORKOUT" : "START MISSION"}
                  </Text>
                  {!isRestDay && <ArrowRight size={15} color="#FFFFFF" strokeWidth={2.6} />}
                </LinearGradient>
              </View>
            </Pressable>

            <RoundAction label="Workout Calendar" onPress={handleCalendarPress}>
              <Image source={calendarIcon} style={styles.calendarIcon} contentFit="contain" />
            </RoundAction>
            <RoundAction label="Settings" onPress={handleSettingsPress}>
              <Image source={settingsIcon} style={styles.settingsIcon} contentFit="contain" />
            </RoundAction>
          </View>
        </View>

        <View style={styles.insetHighlight} pointerEvents="none" />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 210,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(104, 123, 255, 0.32)",
    backgroundColor: "#0A101D",
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
    opacity: 0.4,
  },
  contentWrap: {
    padding: 20,
    minHeight: 210,
    justifyContent: "space-between",
    gap: 14,
  },
  heading: {
    ...typography.metric,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    color: "#F4F7FF",
  },
  missionCopy: {
    gap: 4,
  },
  missionTitle: {
    ...typography.cardTitle,
    fontSize: 20,
    lineHeight: 26,
    color: "#F4F7FF",
  },
  missionSubtitle: {
    ...typography.bodySmall,
    color: "#B0BAD0",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  startPressable: {
    flex: 1,
  },
  startShadow: {
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#0EA5E9",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {},
      default: { boxShadow: "0px 6px 16px rgba(14,165,233,0.28)" },
    }),
  },
  startPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.97 }],
  },
  startButton: {
    height: 44,
    borderRadius: 14,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  startSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  startText: {
    ...typography.buttonSmall,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  roundAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(6, 35, 49, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(63, 222, 201, 0.45)",
  },
  roundActionPressed: {
    backgroundColor: "rgba(63, 222, 201, 0.18)",
    transform: [{ scale: 0.95 }],
  },
  calendarIcon: {
    width: 15,
    height: 16,
  },
  settingsIcon: {
    width: 18,
    height: 18,
  },
  insetHighlight: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: "rgba(188, 199, 255, 0.09)",
    borderRadius: 23,
  },
});
