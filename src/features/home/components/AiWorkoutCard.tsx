import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { HORIZONTAL_PADDING } from "@/shared/utils/responsive";

const bgAsset = require("../../../../assets/figma/ai-workout/hero-workout-background.jpeg");

export const AiWorkoutCard = () => {
  const router = useRouter();
  const [modality, setModality] = useState<"GYM" | "HOME">("GYM");

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
          <Text style={styles.workoutSubtext}>TODAY'S AI WORKOUT</Text>

          <Text style={styles.workoutTitle}>
            UPPER BODY{"\n"}STRENGTH
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
          accessibilityRole="button"
          style={({ pressed }) => [styles.actionButtonPressable, pressed && styles.buttonPressed]}
        >
          <LinearGradient
            colors={["#176F9F", "#338FE0"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>START WORKOUT</Text>
            <Image
              source={require("../../../../assets/figma/ai-workout/start-arrow.svg")}
              style={styles.startArrow}
              contentFit="contain"
            />
          </LinearGradient>
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
    color: "#CAD2FF",
    fontSize: 9.5,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 0,
  },
  badgeOutline: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeOutlineText: {
    color: "#EAF0FF",
    fontSize: 9.5,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 0,
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
    color: "#3FDEC9",
    fontSize: 9.5,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 0,
  },
  workoutInfoBlock: {
    width: "100%",
  },
  workoutSubtext: {
    color: "#B6C0D6",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  workoutTitle: {
    color: "#F4F7FF",
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "900",
    fontStyle: "italic",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    letterSpacing: -0.6,
    textTransform: "uppercase",
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  durationIcon: {
    width: 11,
    height: 11,
  },
  durationText: {
    color: "#B6C0D6",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 0,
  },
  toggleCapsule: {
    width: 120,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
  },
  toggleTab: {
    flex: 1,
    height: 30,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleTabActive: {
    backgroundColor: "#5865F2",
  },
  toggleTabText: {
    color: "#C8C4D8",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 0,
  },
  toggleTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  actionButtonPressable: {
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: "#338FE0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonGradient: {
    height: 52,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
    letterSpacing: 1.5,
  },
  startArrow: {
    width: 14,
    height: 14,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});
