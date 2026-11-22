import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowRight, Clock } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

const bgAsset = require("../../../../assets/upperBody/upperBodyStrength.png");

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
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <LinearGradient
        colors={[
          "rgba(7, 10, 17, 0.45)",
          "rgba(7, 10, 17, 0.8)",
          "rgba(7, 10, 17, 0.96)",
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {/* Top Badges */}
        <View style={styles.badgesRow}>
          <View style={styles.badgeSolid}>
            <Text style={styles.badgeSolidText}>INTERMEDIATE</Text>
          </View>
          <View style={styles.badgeOutline}>
            <Text style={styles.badgeOutlineText}>420 KCAL</Text>
          </View>
          <View style={styles.badgeGreenOutline}>
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
            <Clock size={13} color="#2EE5C5" strokeWidth={2.5} />
            <Text style={styles.durationText}>45 MIN SESSION</Text>
          </View>
        </View>

        {/* Gym / Home Segmented Toggle matching Figma */}
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
          style={({ pressed }) => [pressed && styles.buttonPressed]}
        >
          <View style={styles.actionButton}>
            <LinearGradient
              colors={["#1E7CC4", "#2997E8"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>START WORKOUT</Text>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.8} />
            </LinearGradient>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#11141C",
    borderRadius: 24,
    overflow: "hidden",
    marginHorizontal: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    position: "relative",
  },
  content: {
    padding: 22,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  badgeSolid: {
    backgroundColor: "rgba(108, 92, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(108, 92, 255, 0.45)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeSolidText: {
    color: "#C5C0FF",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 1,
  },
  badgeOutline: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeOutlineText: {
    color: "#CBD5E1",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 1,
  },
  badgeGreenOutline: {
    backgroundColor: "rgba(46, 229, 197, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(46, 229, 197, 0.45)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeGreenOutlineText: {
    color: "#2EE5C5",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 1,
  },
  workoutInfoBlock: {
    marginBottom: 16,
  },
  workoutSubtext: {
    color: "#8E94B8",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 1.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  workoutTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "900",
    fontStyle: "italic",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  durationText: {
    color: "#8E94B8",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 1,
  },
  toggleCapsule: {
    width: 120,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
    marginBottom: 20,
  },
  toggleTab: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleTabActive: {
    backgroundColor: "#5851FD",
  },
  toggleTabText: {
    color: "#8E94B8",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 1,
  },
  toggleTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  actionButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
  },
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    letterSpacing: 1.5,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});
