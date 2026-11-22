import { Image } from "expo-image";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export const NutritionRingCard = () => {
  return (
    <View style={styles.ringCard}>
      <View style={styles.ringContainer}>
        <Image
          source={require("../../../../assets/figma/nutrition/nutrition-ring-track.svg")}
          style={styles.ringAsset}
          contentFit="contain"
        />
        <Image
          source={require("../../../../assets/figma/nutrition/nutrition-ring-progress.svg")}
          style={styles.ringAsset}
          contentFit="contain"
        />

        {/* Center Text Information */}
        <View style={styles.ringCenterText}>
          <Text style={styles.ringSubtext}>CONSUMED</Text>
          <View style={styles.ringValueRow}>
            <Text style={styles.ringValue}>1.8</Text>
            <Text style={styles.ringUnit}>kcal</Text>
          </View>
          <Text style={styles.ringTarget}>TARGET 2.4k</Text>
        </View>
      </View>

      {/* 75% OF DAILY GOAL Pill with Glowing Dot */}
      <View style={styles.dailyGoalPill}>
        <View style={styles.dailyGoalHalo}>
          <View style={styles.dailyGoalDot} />
        </View>
        <Text style={styles.dailyGoalText}>75% OF DAILY GOAL</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ringCard: {
    backgroundColor: "rgba(24, 37, 50, 0.4)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 21,
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  ringContainer: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ringAsset: {
    position: "absolute",
    width: 160,
    height: 160,
  },
  ringCenterText: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  ringSubtext: {
    color: "#2EE5C5",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: "JetBrainsMono_700Bold",
    marginBottom: 2,
  },
  ringValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  ringValue: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
  },
  ringUnit: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: "900",
    color: "#2EE5C5",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    marginLeft: 4,
  },
  ringTarget: {
    color: "#C8C4D8",
    fontSize: 9,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
    marginTop: 1,
    letterSpacing: 0.45,
  },
  dailyGoalPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#20487C",
    borderWidth: 1,
    borderColor: "rgba(14, 19, 129, 0.4)",
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 999,
    gap: 8,
    marginTop: 14,
  },
  dailyGoalHalo: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    shadowColor: "#44EAC3",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  dailyGoalDot: {
    display: "none",
  },
  dailyGoalText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    fontFamily: "JetBrainsMono_700Bold",
  },
});
