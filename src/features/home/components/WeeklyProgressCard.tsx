import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowRight, Shield } from "lucide-react-native";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/shared/components/typography";
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
  const [isDailyXpVisible, setIsDailyXpVisible] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const xpRevealTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const WEEK_DAYS = [
    { label: "M", height: 28, xp: "+180", type: "blue" },
    { label: "T", height: 44, xp: "+320", type: "blue" },
    { label: "W", height: 60, xp: "+410", type: "purple" },
    { label: "T", height: 72, xp: "+620", type: "active" },
    { label: "F", height: 22, xp: "+0", type: "blue" },
    { label: "S", height: 40, xp: "+540", type: "blue" },
    { label: "S", height: 16, xp: "+380", type: "blue" },
  ];

  React.useEffect(
    () => () => {
      if (xpRevealTimerRef.current) {
        clearTimeout(xpRevealTimerRef.current);
      }
    },
    []
  );

  const revealDayXp = (index: number) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
    if (xpRevealTimerRef.current) {
      clearTimeout(xpRevealTimerRef.current);
    }
    setSelectedDayIndex(index);
    xpRevealTimerRef.current = setTimeout(() => {
      setSelectedDayIndex(null);
      xpRevealTimerRef.current = null;
    }, 3000);
  };

  return (
    <View style={styles.cardContainer}>
      {/* Profile-card surface wash (docs/profile-card-design-language.md §4.1) */}
      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(56,189,248,0.12)",
          "rgba(139,92,246,0.07)",
          "rgba(255,255,255,0.02)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Header Row: Level, current progression tier, and day streak */}
      <View style={styles.headerRow}>
        <View style={styles.levelCluster}>
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

          <View style={styles.tierIdentity}>
            <View style={[styles.tierEmblem, { backgroundColor: `${progression.tier.color}18`, borderColor: `${progression.tier.color}4D` }]}>
              <Shield size={15} color={progression.tier.color} strokeWidth={2.3} />
            </View>
            <View style={styles.tierCol}>
              <Text style={[styles.tierText, { color: progression.tier.color }]}>{progression.tier.displayName.toUpperCase()}</Text>
              <Text style={styles.tierText}>TIER</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
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
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
          setIsDailyXpVisible((visible) => !visible);
        }}
        accessibilityRole="button"
        accessibilityLabel="Show XP gained by day"
        accessibilityState={{ expanded: isDailyXpVisible }}
        style={styles.xpTapTarget}
      >
        <View style={styles.progressBarTrack}>
          <LinearGradient
            colors={["#6366F1", "#4F9DFB", "#38D6E8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: "72%" }]}
          />
        </View>
      </TouchableOpacity>
      {/* Weekly Bar Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {WEEK_DAYS.map((dayItem, index) => {
            const isActive = dayItem.type === "active";
            const isPurple = dayItem.type === "purple";

            const shouldShowXp = isDailyXpVisible || selectedDayIndex === index;

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.78}
                style={styles.barWrap}
                onPress={() => revealDayXp(index)}
                accessibilityRole="button"
                accessibilityLabel={`Show ${dayItem.label} XP: ${dayItem.xp}`}
              >
                <Text
                  style={[
                    styles.dailyBarXp,
                    isActive && styles.dailyBarXpActive,
                    !shouldShowXp && styles.dailyBarXpHidden,
                  ]}
                  numberOfLines={1}
                >
                  {dayItem.xp}
                </Text>
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
              </TouchableOpacity>
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
    // Profile-card surface (docs/profile-card-design-language.md §4.1)
    backgroundColor: "#111A25",
    borderRadius: 24,
    padding: 18,
    marginHorizontal: HORIZONTAL_PADDING,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
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
    lineHeight: 15,
    fontWeight: "700",
    letterSpacing: 1.2,
    textAlign: "center",
  },
  levelNumber: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "center",
  },
  levelCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  tierIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  tierEmblem: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  tierCol: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  tierText: {
    color: "#AAB5CB",
    fontSize: 11,
    lineHeight: 15,
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
    fontWeight: "800",
    lineHeight: 31,
    letterSpacing: 0,
  },
  streakLabel: {
    color: "#AAB5CB",
    fontSize: 10,
    lineHeight: 14,
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
    fontWeight: "700",
    letterSpacing: 0,
  },
  progressBarTrack: {
    height: 11,
    backgroundColor: "rgba(148, 163, 184, 0.14)",
    borderRadius: 999,
    overflow: "hidden",
  },
  xpTapTarget: {
    borderRadius: 999,
    paddingVertical: 4,
    marginHorizontal: -4,
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  progressBarFill: {
    height: 11,
    borderRadius: 999,
  },
  chartContainer: {
    // The label row is always reserved, so revealing XP never shifts the chart.
    height: 112,
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
    maxWidth: 46,
    alignItems: "center",
    gap: 6,
  },
  dailyBarXp: {
    minHeight: 14,
    color: "#8FA0BD",
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "700",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  dailyBarXpActive: {
    color: "#54E6CF",
  },
  dailyBarXpHidden: {
    opacity: 0,
  },
  bar: {
    width: "98%",
    maxWidth: 42,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
    fontWeight: "700",
  },
  dayLabelActive: {
    color: "#3FDEC9",
    fontWeight: "800",
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
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
