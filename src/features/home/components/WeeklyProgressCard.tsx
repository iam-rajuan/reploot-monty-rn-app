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
  <Svg width={18} height={24} viewBox="0 0 24 30" fill="none">
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
          colors={["#5865F2", "#397DF6"]}
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
          colors={["#5D68F6", "#48B8F3"]}
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
    backgroundColor: "rgba(18, 25, 43, 0.88)",
    borderRadius: 32,
    padding: 33,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: "rgba(159, 174, 255, 0.13)",
    marginBottom: 30,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  levelBox: {
    width: 133,
    minHeight: 96,
    borderRadius: 16,
    alignItems: "flex-start",
    justifyContent: "center",
    padding: 12,
  },
  levelLabel: {
    color: "#FFFFFF",
    fontSize: 48,
    lineHeight: 40,
    fontWeight: "900",
    letterSpacing: 0,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    textAlign: "left",
  },
  levelNumber: {
    color: "#FFFFFF",
    fontSize: 48,
    lineHeight: 44,
    fontWeight: "900",
    letterSpacing: 0,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    textAlign: "left",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  tierCol: {
    justifyContent: "center",
    paddingRight: 12,
  },
  tierText: {
    color: "#AAB5CB",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  streakCol: {
    alignItems: "flex-start",
  },
  streakTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakNumber: {
    color: "#3FDEC9",
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 40,
    letterSpacing: 0,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
  },
  streakLabel: {
    color: "#AAB5CB",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    letterSpacing: 0,
    marginTop: 0,
  },
  xpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 12,
  },
  xpText: {
    color: "#C8C4D8",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    letterSpacing: 0,
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 24,
  },
  progressBarFill: {
    height: 12,
    borderRadius: 999,
  },
  chartContainer: {
    height: 116,
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  barWrap: {
    width: 32.7,
    alignItems: "center",
    gap: 8,
  },
  bar: {
    width: 32.7,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  barBlue: {
    backgroundColor: "#74A9E8",
  },
  barPurple: {
    backgroundColor: "#76739F",
  },
  barActive: {
    backgroundColor: "#3FDEC9",
    shadowColor: "#3FDEC9",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  dayLabel: {
    width: 32.7,
    textAlign: "center",
    color: "#AAB5CB",
    fontSize: 8,
    lineHeight: 12,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
  },
  dayLabelActive: {
    color: "#3FDEC9",
    fontWeight: "900",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    alignSelf: "center",
  },
  viewProgressLink: {
    color: "#3FDEC9",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    letterSpacing: 0,
  },
});
