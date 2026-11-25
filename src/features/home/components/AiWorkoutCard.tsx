import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { HORIZONTAL_PADDING } from "@/shared/utils/responsive";
import { typography } from "@/theme/typography";

const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;

const bgAsset = require("../../../../assets/figma/ai-workout/hero-workout-background.jpeg");

export const AiWorkoutCard = () => {
  const router = useRouter();
  const [modality, setModality] = useState<"GYM" | "HOME">("GYM");
  const [startPressed, setStartPressed] = useState(false);

  const handleToggle = (nextModality: "GYM" | "HOME") => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setModality(nextModality);
  };

  const handleStartWorkout = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    router.push({
      pathname: "/workouts",
      params: { modality: modality.toLowerCase() },
    });
  };

  return (
    <View style={styles.cardContainer}>
      <Image
        source={bgAsset}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <LinearGradient
        colors={[
          "rgba(6, 10, 20, 0.1)",
          "rgba(6, 10, 20, 0.6)",
          "#070B15",
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {/* Top Badges */}
        <View style={styles.badgesRow}>
          <View style={styles.badgeGroup}>
            <View style={styles.badgeSolid}>
              <Text style={styles.badgeSolidText}>INTERMEDIATE</Text>
            </View>
            <View style={styles.badgeOutline}>
              <Text style={styles.badgeOutlineText}>420 KCAL</Text>
            </View>
          </View>
          <View style={styles.badgeGreenOutline}>
            <Image
              source={require("../../../../assets/figma/ai-workout/xp.svg")}
              style={styles.xpIcon}
              contentFit="contain"
            />
            <Text style={styles.badgeGreenOutlineText}>+100 XP</Text>
          </View>
        </View>

        {/* Workout Info */}
        <View style={styles.workoutInfoBlock}>
          <Text style={styles.workoutSubtext}>TODAY'S CHALLENGE</Text>

          <Text style={styles.workoutTitle} numberOfLines={1}>
            UPPER BODY STRENGTH
          </Text>

          <View style={styles.durationRow}>
            <Image
              source={require("../../../../assets/figma/ai-workout/duration.svg")}
              style={styles.durationIcon}
              contentFit="contain"
            />
            <Text style={styles.durationText}>45 MIN SESSION</Text>
          </View>
        </View>

        {/* Gym / Home Segmented Toggle */}
        <View style={styles.toggleCapsule}>
          <Pressable
            style={[
              styles.toggleTab,
              modality === "GYM" && styles.toggleTabActive,
            ]}
            onPress={() => handleToggle("GYM")}
            accessibilityRole="button"
            accessibilityState={{ selected: modality === "GYM" }}
          >
            <Text
              style={[
                styles.toggleTabText,
                modality === "GYM" && styles.toggleTabTextActive,
              ]}
            >
              GYM
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.toggleTab,
              modality === "HOME" && styles.toggleTabActive,
            ]}
            onPress={() => handleToggle("HOME")}
            accessibilityRole="button"
            accessibilityState={{ selected: modality === "HOME" }}
          >
            <Text
              style={[
                styles.toggleTabText,
                modality === "HOME" && styles.toggleTabTextActive,
              ]}
            >
              HOME
            </Text>
          </Pressable>
        </View>

        {/* Start Button */}
        <Pressable
          onPress={handleStartWorkout}
          onPressIn={() => setStartPressed(true)}
          onPressOut={() => setStartPressed(false)}
          accessibilityRole="button"
          accessibilityLabel={`Start ${modality.toLowerCase()} workout`}
        >
          <View style={[styles.actionButtonPressable, startPressed && styles.buttonPressed]}>
            <LinearGradient
              colors={BUTTON_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <LinearGradient
                pointerEvents="none"
                colors={SHEEN}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.buttonSheen}
              />
              <Text style={styles.buttonText}>START WORKOUT</Text>
              <View style={styles.buttonTrail}>
                <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.6} />
              </View>
            </LinearGradient>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#0B1120",
    borderRadius: 24,
    overflow: "hidden",
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(104, 123, 255, 0.32)",
    position: "relative",
    minHeight: 310,
    shadowColor: "#162A5C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.55,
  },
  content: {
    flex: 1,
    padding: 18,
    justifyContent: "space-between",
    gap: 14,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgeGroup: {
    flexDirection: "row",
    gap: 6,
  },
  badgeSolid: {
    backgroundColor: "rgba(88, 101, 242, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(128, 143, 255, 0.34)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeSolidText: {
    ...typography.badge,
    color: "#CAD2FF",
  },
  badgeOutline: {
    backgroundColor: "rgba(7, 11, 21, 0.45)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeOutlineText: {
    ...typography.badge,
    color: "#EAF0FF",
  },
  badgeGreenOutline: {
    backgroundColor: "rgba(46, 229, 197, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(68, 234, 195, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  xpIcon: {
    width: 9,
    height: 12,
  },
  badgeGreenOutlineText: {
    ...typography.badge,
    color: "#3FDEC9",
  },
  workoutInfoBlock: {
    width: "100%",
  },
  workoutSubtext: {
    ...typography.metric,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    color: "#F4F7FF",
    marginBottom: 6,
  },
  workoutTitle: {
    ...typography.cardTitle,
    fontSize: 18,
    lineHeight: 24,
    color: "#7DD3FC",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  durationRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(7, 11, 21, 0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  durationIcon: {
    width: 11,
    height: 11,
  },
  durationText: {
    ...typography.badge,
    color: "#CBD5E1",
  },
  toggleCapsule: {
    width: 148,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(7, 11, 21, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
  },
  toggleTab: {
    flex: 1,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleTabActive: {
    backgroundColor: "#5865F2",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  toggleTabText: {
    ...typography.buttonSmall,
    color: "#A8B5C7",
    letterSpacing: 0.8,
  },
  toggleTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  actionButtonPressable: {
    width: "100%",
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#0EA5E9",
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {},
      default: { boxShadow: "0px 8px 20px rgba(14,165,233,0.30)" },
    }),
  },
  buttonGradient: {
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  buttonSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  buttonText: {
    ...typography.button,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  buttonTrail: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.97 }],
  },
});
