import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";

export const NutritionRingCard = () => {
  const radius = 56;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // ~351.86
  const progressLength = circumference * 0.75; // 75% goal = ~263.9

  return (
    <View style={styles.ringCard}>
      <View style={styles.ringContainer}>
        <Svg width={180} height={180} viewBox="0 0 150 150">
          <Defs>
            <SvgGradient id="ringGrad" x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0%" stopColor="#4F46E5" />
              <Stop offset="45%" stopColor="#38BDF8" />
              <Stop offset="100%" stopColor="#2EE5C5" />
            </SvgGradient>
          </Defs>

          {/* Complete Circular Background Track (crisply visible in #242C44) */}
          <Circle
            cx={75}
            cy={75}
            r={radius}
            stroke="#242C44"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Active 75% Progress Arc with Rounded Caps */}
          <Circle
            cx={75}
            cy={75}
            r={radius}
            stroke="url(#ringGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${progressLength} ${circumference}`}
            strokeLinecap="round"
            fill="none"
            transform="rotate(135 75 75)"
          />
        </Svg>

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
    backgroundColor: "#131624",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  ringContainer: {
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 1.5,
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
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
  },
  ringUnit: {
    fontSize: 22,
    lineHeight: 38,
    fontWeight: "900",
    color: "#2EE5C5",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    marginLeft: 6,
  },
  ringTarget: {
    color: "#8E94B8",
    fontSize: 10.5,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
    marginTop: 2,
    letterSpacing: 1,
  },
  dailyGoalPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(24, 44, 78, 0.65)",
    borderWidth: 1.2,
    borderColor: "rgba(56, 189, 248, 0.4)",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 8,
    marginTop: 14,
  },
  dailyGoalHalo: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: "rgba(56, 189, 248, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  dailyGoalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  dailyGoalText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    fontFamily: "JetBrainsMono_700Bold",
  },
});
