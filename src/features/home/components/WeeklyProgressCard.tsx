import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowRight, Zap } from "lucide-react-native";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const WeeklyProgressCard = () => {
  const WEEK_DAYS = [
    { label: "M", height: 30, type: "blue" },
    { label: "T", height: 46, type: "blue" },
    { label: "W", height: 66, type: "purple" },
    { label: "T", height: 86, type: "active" },
    { label: "F", height: 22, type: "blue" },
    { label: "S", height: 52, type: "blue" },
    { label: "S", height: 18, type: "blue" },
  ];

  return (
    <View style={styles.cardContainer}>
      {/* Header Row: LVL 42 Box + ELITE TIER + 12 DAY STREAK */}
      <View style={styles.headerRow}>
        {/* LVL 42 Gradient Badge */}
        <LinearGradient
          colors={["#5A55FD", "#3B82F6"]}
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
              <Zap size={24} color="#2EE5C5" strokeWidth={3} />
              <Text style={styles.streakNumber}>12</Text>
            </View>
            <Text style={styles.streakLabel}>DAY  STREAK</Text>
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
          colors={["#5A55FD", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBarFill, { width: "75%" }]}
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
    borderRadius: 28,
    padding: 24,
    paddingBottom: 22,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 26,
  },
  levelBox: {
    width: 96,
    height: 96,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  levelLabel: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  levelNumber: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "900",
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
  },
  tierCol: {
    justifyContent: "center",
    gap: 3,
  },
  tierText: {
    color: "#8E94B8",
    fontSize: 11,
    fontFamily: "monospace",
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
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  streakLabel: {
    color: "#8E94B8",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  xpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  xpText: {
    color: "#CBD0E8",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 1,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "#1F2338",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 32,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  chartContainer: {
    height: 100,
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 4,
  },
  barWrap: {
    alignItems: "center",
    gap: 12,
  },
  bar: {
    width: 24,
    borderRadius: 7,
  },
  barBlue: {
    backgroundColor: "#5D95EA",
  },
  barPurple: {
    backgroundColor: "#5A597E",
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
    color: "#7E83A0",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  dayLabelActive: {
    color: "#2EE5C5",
    fontWeight: "800",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  viewProgressLink: {
    color: "#2EE5C5",
    fontSize: 12.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
