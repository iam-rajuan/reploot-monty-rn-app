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
            <Text style={styles.ringValue}>1,800</Text>
            <Text style={styles.ringUnit}>KCAL</Text>
          </View>
          <Text style={styles.ringTarget}>TARGET 2,400 KCAL</Text>
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
    backgroundColor: "rgba(18, 27, 44, 0.8)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(152, 173, 255, 0.12)",
    paddingVertical: 18,
    paddingHorizontal: 16,
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
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ringAsset: {
    position: "absolute",
    width: 150,
    height: 150,
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
    fontSize: 9.5,
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
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
  },
  ringUnit: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    color: "#2EE5C5",
    fontFamily: "JetBrainsMono_700Bold",
    marginLeft: 4,
  },
  ringTarget: {
    color: "#AAB5CB",
    fontSize: 9.5,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  dailyGoalPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(36, 87, 137, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(91, 146, 239, 0.32)",
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 7,
    marginTop: 12,
  },
  dailyGoalHalo: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#2EE5C5",
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
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.5,
    fontFamily: "JetBrainsMono_700Bold",
  },
});
