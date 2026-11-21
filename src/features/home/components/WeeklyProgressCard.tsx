import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowRight, Star, Zap } from "lucide-react-native";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const WeeklyProgressCard = () => {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday ...

  const WEEK_DAYS = [
    { label: "M", height: 32, dayNum: 1 },
    { label: "T", height: 48, dayNum: 2 },
    { label: "W", height: 68, dayNum: 3 },
    { label: "T", height: 80, dayNum: 4 },
    { label: "F", height: 24, dayNum: 5 },
    { label: "S", height: 44, dayNum: 6 },
    { label: "S", height: 16, dayNum: 0 },
  ];
  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        {/* LVL 42 Box */}
        <View style={{ alignItems: "center" }}>
          <View style={styles.streakTopRow}>
            <Star size={28} color="#38EDD8" strokeWidth={2.5} />
            <Text style={[styles.streakNumber, { color: "#38EDD8" }]}>42</Text>
          </View>
          <View style={styles.streakBottomRow}>
            <Text style={styles.streakLabel}>ELITE</Text>
            <Text style={styles.streakLabel}>TIER</Text>
          </View>
        </View>

        {/* 12 DAY STREAK */}
        <View style={styles.streakContainer}>
          <View style={styles.streakTopRow}>
            <Zap size={28} color="#38EDD8" strokeWidth={2.5} />
            <Text style={styles.streakNumber}>12</Text>
          </View>
          <View style={styles.streakBottomRow}>
            <Text style={styles.streakLabel}>DAY</Text>
            <Text style={styles.streakLabel}>STREAK</Text>
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
          colors={["#707BFF", "#5260FF"]}
          style={[styles.progressBarFill, { width: "80%" }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>

      {/* Weekly Bar Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {WEEK_DAYS.map((dayItem, index) => {
            const isToday = currentDayOfWeek === dayItem.dayNum;
            return (
              <View key={index} style={styles.barWrap}>
                {isToday ? (
                  <View style={styles.barActiveGlow}>
                    <LinearGradient
                      colors={["#38EDD8", "#38EDD8"]}
                      style={[
                        styles.bar,
                        styles.barActive,
                        { height: dayItem.height },
                      ]}
                    />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.bar,
                      dayItem.height > 50 ? styles.barPurpleGray : styles.barBlue,
                      { height: dayItem.height },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.dayLabel,
                    isToday && styles.dayLabelActive,
                  ]}
                >
                  {dayItem.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

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
        <ArrowRight size={14} color="#38EDD8" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#11141C",
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  levelBox: {
    width: 100,
    height: 100,
    borderRadius: 20,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  levelTextSmall: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 32,
    letterSpacing: 1,
    marginBottom: 1,
  },
  levelTextBig: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "900",
    lineHeight: 48,
    letterSpacing: -1,
  },
  tierStreakCol: {
    marginLeft: 16,
    justifyContent: "center",
    gap: 4,
  },
  eliteTierText: {
    color: "#C2C6DC",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    fontFamily: "monospace",
  },
  streakContainer: {
    marginLeft: "auto",
    alignItems: "center",
  },
  streakTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  streakNumber: {
    color: "#38EDD8",
    fontSize: 40,
    fontWeight: "900",
    lineHeight: 40,
    letterSpacing: -1,
  },
  streakBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  streakLabel: {
    color: "#C2C6DC",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    fontFamily: "monospace",
  },
  xpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  xpText: {
    color: "#E2E8F0",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    fontFamily: "monospace",
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: "#2B2D42", // Dark track
    borderRadius: 5,
    marginBottom: 40,
  },
  progressBarFill: {
    height: 10,
    borderRadius: 5,
  },
  chartContainer: {
    height: 100,
    justifyContent: "flex-end",
    marginBottom: 24,
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 8,
  },
  barWrap: {
    alignItems: "center",
    gap: 12,
  },
  bar: {
    width: 24,
    borderRadius: 6,
  },
  barBlue: {
    backgroundColor: "#6FA5F6", // Light blue
  },
  barPurpleGray: {
    backgroundColor: "#6E7196", // Purplish gray
  },
  barActiveGlow: {
    borderRadius: 6,
  },
  barActive: {
    // Gradient used inside view
  },
  dayLabel: {
    color: "#C2C6DC",
    fontSize: 10,
    fontWeight: "800",
    fontFamily: "monospace",
  },
  dayLabelActive: {
    color: "#38EDD8",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  viewProgressLink: {
    color: "#38EDD8",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
    fontFamily: "monospace",
  },
});
