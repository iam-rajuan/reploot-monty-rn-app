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
import { HORIZONTAL_PADDING } from "@/shared/utils/responsive";
import { useProgressionSnapshot } from "@/features/progression";

// Crisp hollow neon cyan lightning bolt matching Figma outline design
const StreakLightningIcon = () => (
  <Svg width={16} height={20} viewBox="0 0 24 30" fill="none">
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
  const progression = useProgressionSnapshot();
  const WEEK_DAYS = [
    { label: "M", height: 28, type: "blue" },
    { label: "T", height: 44, type: "blue" },
    { label: "W", height: 60, type: "purple" },
    { label: "T", height: 72, type: "active" },
    { label: "F", height: 22, type: "blue" },
    { label: "S", height: 40, type: "blue" },
    { label: "S", height: 16, type: "blue" },
  ];

  return (
    <View style={styles.cardContainer}>
      {/* Header Row: Level, current progression tier, and day streak */}
      <View style={styles.headerRow}>
        {/* LVL 42 Gradient Badge: Proportional, responsive cyber badge */}
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
          {/* Current progression tier */}
          <View style={styles.tierCol}>
            <Text style={[styles.tierText, { color: progression.tier.color }]}>{progression.tier.displayName.toUpperCase()}</Text>
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
    borderRadius: 24,
    padding: 18,
    marginHorizontal: HORIZONTAL_PADDING,
    borderWidth: 1,
    borderColor: "rgba(159, 174, 255, 0.13)",
    marginBottom: 20,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  levelBox: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    shadowColor: "#397DF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  levelLabel: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 1.2,
    fontFamily: "JetBrainsMono_700Bold",
    textAlign: "center",
  },
  levelNumber: {
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: 0,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flexShrink: 1,
  },
  tierCol: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  tierText: {
    color: "#AAB5CB",
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    letterSpacing: 1,
  },
  streakCol: {
    alignItems: "flex-end",
  },
  streakTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakNumber: {
    color: "#3FDEC9",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 30,
    letterSpacing: 0,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
  },
  streakLabel: {
    color: "#AAB5CB",
    fontSize: 10,
    lineHeight: 14,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 1,
  },
  xpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 8,
  },
  xpText: {
    color: "#C8C4D8",
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    letterSpacing: 0,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 18,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 999,
  },
  chartContainer: {
    height: 96,
    justifyContent: "flex-end",
    marginBottom: 14,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  barWrap: {
    flex: 1,
    maxWidth: 36,
    alignItems: "center",
    gap: 6,
  },
  bar: {
    width: "100%",
    maxWidth: 28,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
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
    width: "100%",
    textAlign: "center",
    color: "#AAB5CB",
    fontSize: 9,
    lineHeight: 13,
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
    gap: 6,
    alignSelf: "center",
    paddingVertical: 4,
  },
  viewProgressLink: {
    color: "#3FDEC9",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
