import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

// Crisp hollow neon cyan lightning bolt matching Figma outline design exactly
const StreakLightningIcon = () => (
  <Svg width={20} height={26} viewBox="0 0 24 30" fill="none">
    <Path
      d="M13.5 2H16.5L15 12.5H23L8.5 28H6.5L8 18H1.5L13.5 2Z"
      stroke="#2EE5C5"
      strokeWidth={2.4}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </Svg>
);

export const WeeklyProgressCard = () => {
  const WEEK_DAYS = [
    { label: "M", height: 32, type: "blue" },
    { label: "T", height: 48, type: "blue" },
    { label: "W", height: 68, type: "purple" },
    { label: "T", height: 80, type: "active" },
    { label: "F", height: 24, type: "blue" },
    { label: "S", height: 44, type: "blue" },
    { label: "S", height: 16, type: "blue" },
  ];

  return (
    <View style={styles.cardContainer}>
      {/* Header Row: LVL 42 Box + ELITE TIER + 12 DAY STREAK */}
      <View style={styles.headerRow}>
        {/* LVL 42 Gradient Badge: Left-aligned bold text matching Figma */}
        <LinearGradient
          colors={["#5851FD", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.levelBox}
        >
          <Text style={styles.levelLabel}>LVL</Text>
          <Text style={styles.levelNumber}>42</Text>
        </LinearGradient>

        <View style={styles.headerRight}>
          {/* ELITE TIER */}
          <View style={styles.tierCol}>
            <Text style={styles.tierText}>ELITE</Text>
            <Text style={styles.tierText}>TIER</Text>
          </View>

          {/* 12 DAY STREAK */}
          <View style={styles.streakCol}>
            <View style={styles.streakTopRow}>
              <StreakLightningIcon />
              <Text style={styles.streakNumber}>12</Text>
            </View>
            <Text style={styles.streakLabel}>DAY STREAK</Text>
          </View>
        </View>
      </View>

      {/* XP Progress Section */}
      <View style={styles.xpRow}>
        <Text style={styles.xpText}>2,450 XP</Text>
        <Text style={styles.xpText}>3,000 XP</Text>
      </View>
      <View style={styles.progressBarTrack}>
        <LinearGradient
          colors={["#5851FD", "#4D8DFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBarFill, { width: "72%" }]}
        />
      </View>

      {/* Weekly Bar Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {WEEK_DAYS.map((dayItem, index) => {
            const isActive = dayItem.type === "active";
            const isPurple = dayItem.type === "purple";

            return (
              <View key={index} style={styles.barWrap}>
                <View
                  style={[
                    styles.bar,
                    { height: dayItem.height },
                    isActive
                      ? styles.barActive
                      : isPurple
                        ? styles.barPurple
                        : styles.barBlue,
                  ]}
                />
                <Text
                  style={[
                    styles.dayLabel,
                    isActive && styles.dayLabelActive,
                  ]}
                >
                  {dayItem.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Bottom Link */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.linkRow}
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
          router.push("/weekly-progress" as any);
        }}
      >
        <Text style={styles.viewProgressLink}>View Weekly Progress</Text>
        <ArrowRight size={13} color="#2EE5C5" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#111422",
    borderRadius: 24,
    padding: 22,
    paddingBottom: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  levelBox: {
    width: 126,
    height: 98,
    borderRadius: 22,
    paddingLeft: 18,
    paddingTop: 14,
    paddingBottom: 12,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  levelLabel: {
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: 0.8,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
  },
  levelNumber: {
    color: "#FFFFFF",
    fontSize: 44,
    lineHeight: 46,
    fontWeight: "900",
    letterSpacing: -1,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  tierCol: {
    justifyContent: "center",
    gap: 4,
  },
  tierText: {
    color: "#C8C4D8",
    fontSize: 12,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    letterSpacing: 2,
  },
  streakCol: {
    alignItems: "flex-start",
  },
  streakTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  streakNumber: {
    color: "#2EE5C5",
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 42,
    letterSpacing: -0.5,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
  },
  streakLabel: {
    color: "#C8C4D8",
    fontSize: 11,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 2,
  },
  xpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  xpText: {
    color: "#CBD5E1",
    fontSize: 11.5,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 28,
  },
  progressBarFill: {
    height: 12,
    borderRadius: 6,
  },
  chartContainer: {
    height: 96,
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 6,
  },
  barWrap: {
    width: 33,
    alignItems: "center",
    gap: 8,
  },
  bar: {
    width: 33,
    borderRadius: 8,
  },
  barBlue: {
    backgroundColor: "#659AF8",
  },
  barPurple: {
    backgroundColor: "#5B597F",
  },
  barActive: {
    backgroundColor: "#2EE5C5",
    shadowColor: "#2EE5C5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  dayLabel: {
    width: 33,
    textAlign: "center",
    color: "#7E83A0",
    fontSize: 10,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
  },
  dayLabelActive: {
    color: "#2EE5C5",
    fontWeight: "900",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  viewProgressLink: {
    color: "#2EE5C5",
    fontSize: 12,
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
