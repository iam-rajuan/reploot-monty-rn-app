import { WorkoutHeader } from "@/features/workouts";
import { useProgressionSnapshot } from "@/features/progression";
import { useWeeklyChallenge } from "@/hooks/queries/useChallenges";
import {
  useLeaderboard,
  usePersonalRecords,
  useXPProgress,
} from "@/hooks/queries/useProgress";
import { ProgressBar } from "@/shared/components/ui/ProgressBar";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Award,
  BarChart3,
  ChevronRight,
  Crown,
  Flame,
  History,
  Medal,
  Trophy,
  Zap,
} from "lucide-react-native";
import React from "react";
import {
  type DimensionValue,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MOTIVATION = [
  "Consistency turns effort into strength.",
  "One session closer to your strongest self.",
  "Train with intent. Recover with purpose.",
  "Small wins build lasting momentum.",
  "Progress is earned one rep at a time.",
  "Discipline is the bridge to your next level.",
];
const format = (value: number) => new Intl.NumberFormat().format(value);
function todayMotivation() {
  const now = new Date();
  const key = [now.getFullYear(), now.getMonth() + 1, now.getDate()].join("-");
  const seed = [...key].reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  return MOTIVATION[seed % MOTIVATION.length];
}

export default function ProgressTabRoute() {
  const insets = useSafeAreaInsets();
  const { data: xp } = useXPProgress();
  const progression = useProgressionSnapshot();
  const { data: leaderboard } = useLeaderboard();
  const { data: records } = usePersonalRecords();
  const { data: challenge } = useWeeklyChallenge();
  const motivation = todayMotivation();
  const userRank = leaderboard?.find((entry) => entry.isCurrentUser);
  const record = records?.[0];
  const xpRatio = xp?.nextLevelXP ? xp.currentXP / xp.nextLevelXP : 0;
  const go = (path: string) => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push(path as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <WorkoutHeader transparent style={styles.header} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 128, 152) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>LEVEL UP</Text>
        <View style={styles.workoutCard}>
          <LinearGradient
            colors={["rgba(99,102,241,0.30)", "rgba(34,211,238,0.10)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.workoutTop}>
            <View style={styles.levelRow}>
              <View style={styles.levelIcon}>
                <Zap size={18} color="#C5C0FF" />
              </View>
              <View>
                <Text style={styles.label}>CURRENT LEVEL</Text>
                <Text style={styles.level}>
                  {xp ? "Level " + xp.currentLevel : "Level —"}
                </Text>
                <Text style={[styles.tier, { color: progression.tier.color }]}>
                  {progression.tier.displayName.toUpperCase()} TIER
                </Text>
              </View>
            </View>
            <View style={styles.streak}>
              <Flame size={18} color="#FFB68C" fill="#FFB68C" />
              <Text style={styles.streakValue}>{xp?.dayStreak ?? "—"}</Text>
              <Text style={styles.streakText}>DAY{"\n"}STREAK</Text>
            </View>
          </View>
          <View style={styles.xpSection}>
            <View style={styles.xpHeading}>
              <Text style={styles.label}>WORKOUT XP</Text>
              <Text style={styles.xpValue}>
                {xp
                  ? format(xp.currentXP) +
                    " / " +
                    format(xp.nextLevelXP) +
                    " XP"
                  : "Loading…"}
              </Text>
            </View>
            <ProgressBar progress={xpRatio} height={10} />
            <Text style={styles.xpRemaining}>
              {xp
                ? format(Math.max(0, xp.nextLevelXP - xp.currentXP)) +
                  " XP TO NEXT LEVEL"
                : " "}
            </Text>
          </View>
        </View>
        <View style={styles.motivation}>
          <Text style={styles.quote}>“</Text>
          <Text style={styles.motivationText}>{motivation}</Text>
        </View>
        <View style={styles.competitionCard}>
          <LinearGradient
            colors={["rgba(255,182,140,0.12)", "rgba(255,255,255,0.02)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.rankRow}>
            <View>
              <Text style={styles.label}>GLOBAL RANKING</Text>
              <Text style={styles.rank}>
                {userRank ? "#" + userRank.rank : "—"}
              </Text>
            </View>
            <Pressable
              style={styles.rankButton}
              onPress={() => go("/profile/global-rankings")}
            >
              <Crown size={16} color="#FFB68C" />
              <Text style={styles.rankButtonText}>VIEW RANKING</Text>
              <ChevronRight size={15} color="#FFB68C" />
            </Pressable>
          </View>
          <View style={styles.divider} />
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <View style={styles.statLabel}>
                <Trophy size={15} color="#C5C0FF" />
                <Text style={styles.personalLabel}>PERSONAL RECORD</Text>
              </View>
              <Text style={styles.statTitle} numberOfLines={1}>
                {record?.exerciseName ?? "No records yet"}
              </Text>
              {record ? (
                <Text style={styles.statSub}>
                  {record.value} {record.unit} · {record.metric}
                </Text>
              ) : null}
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <View style={styles.statLabel}>
                <Award size={15} color="#FFB68C" />
                <Text style={styles.challengeLabel}>CHALLENGE XP</Text>
              </View>
              <Text style={styles.challengeXP}>
                {userRank ? format(userRank.weeklyXP) + " XP" : "—"}
              </Text>
              <Text style={styles.statSub}>COMPETITIVE TOTAL</Text>
            </View>
          </View>
          <Pressable
            style={styles.challenge}
            onPress={() => go("/workouts/challenges")}
          >
            <View style={styles.challengeTop}>
              <View>
                <Text style={styles.label}>WEEKLY CHALLENGE</Text>
                <Text style={styles.challengeTitle} numberOfLines={1}>
                  {challenge?.title ?? "Loading challenge…"}
                </Text>
              </View>
              <View style={styles.reward}>
                <Text style={styles.rewardText}>
                  +{challenge?.xpReward ?? 0} XP
                </Text>
              </View>
            </View>
            <View style={styles.challengeTrack}>
              <View
                style={[
                  styles.challengeFill,
                  {
                    width: (String(challenge?.percentCompleted ?? 0) +
                      "%") as DimensionValue,
                  },
                ]}
              />
            </View>
            <View style={styles.challengeFooter}>
              <Text style={styles.challengeProgress}>
                {challenge
                  ? String(challenge.completedSegments) +
                    " / " +
                    String(challenge.totalSegments) +
                    " COMPLETE"
                  : " "}
              </Text>
              <ChevronRight size={16} color="#FFB68C" />
            </View>
          </Pressable>
          <Pressable
            style={styles.achievements}
            onPress={() => go("/achievements")}
          >
            <Medal size={16} color="#C5C0FF" />
            <Text style={styles.achievementsText}>VIEW ACHIEVEMENTS</Text>
            <ChevronRight size={15} color="#C5C0FF" />
          </Pressable>
        </View>
        <View style={styles.tracking}>
          <Text style={styles.trackingTitle}>TRACKING</Text>
          <Pressable
            style={styles.navRow}
            onPress={() => go("/weight-progress")}
          >
            <View style={styles.navIcon}>
              <BarChart3 size={18} color="#38BDF8" />
            </View>
            <Text style={styles.navText}>BODY METRICS</Text>
            <ChevronRight size={18} color="#94A3B8" />
          </Pressable>
          <Pressable style={styles.navRow} onPress={() => go("/your-workouts")}>
            <View style={[styles.navIcon, styles.logIcon]}>
              <History size={18} color="#44EAC3" />
            </View>
            <Text style={styles.navText}>WORKOUT LOGS</Text>
            <ChevronRight size={18} color="#94A3B8" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#121318" },
  header: { backgroundColor: "#121318" },
  content: { paddingHorizontal: 24, paddingTop: 16, gap: 24 },
  title: {
    color: "#F6F8FF",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.8,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    textShadowColor: "rgba(120, 145, 255, 0.22)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  workoutCard: {
    overflow: "hidden",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(197,192,255,0.30)",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 24,
  },
  workoutTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  levelIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(197,192,255,0.20)",
    borderWidth: 1,
    borderColor: "rgba(197,192,255,0.24)",
  },
  label: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  level: {
    color: "#FFF",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginTop: 2,
  },
  tier: {
    fontFamily: "monospace",
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 3,
  },
  streak: { flexDirection: "row", alignItems: "center", gap: 5 },
  streakValue: {
    color: "#FFB68C",
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "900",
  },
  streakText: {
    color: "#C8C4D8",
    fontFamily: "monospace",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  xpSection: { marginTop: 26 },
  xpHeading: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 9,
  },
  xpValue: {
    color: "#C5C0FF",
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
  },
  xpRemaining: {
    color: "#C5C0FF",
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 10,
  },
  motivation: {
    minHeight: 62,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  quote: {
    color: "#44EAC3",
    fontSize: 30,
    height: 24,
    lineHeight: 30,
    fontWeight: "800",
  },
  motivationText: {
    color: "#E3E1E9",
    textAlign: "center",
    fontSize: 18,
    lineHeight: 25,
    fontStyle: "italic",
    fontWeight: "600",
  },
  competitionCard: {
    overflow: "hidden",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,182,140,0.30)",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 24,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  rank: {
    color: "#FFF",
    fontSize: 42,
    lineHeight: 44,
    fontWeight: "900",
    letterSpacing: -1.5,
    marginTop: 2,
  },
  rankButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
  },
  rankButtonText: {
    color: "#FFB68C",
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    marginVertical: 20,
  },
  statsRow: { flexDirection: "row", alignItems: "stretch" },
  stat: { flex: 1, minWidth: 0 },
  statDivider: {
    width: 1,
    marginHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  statLabel: { flexDirection: "row", alignItems: "center", gap: 6 },
  personalLabel: {
    color: "#C5C0FF",
    fontFamily: "monospace",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.7,
    flexShrink: 1,
  },
  challengeLabel: {
    color: "#FFB68C",
    fontFamily: "monospace",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  statTitle: {
    color: "#FFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    marginTop: 8,
  },
  statSub: {
    color: "#C8C4D8",
    fontFamily: "monospace",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },
  challengeXP: {
    color: "#FFB68C",
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "900",
    marginTop: 8,
  },
  challenge: {
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
  },
  challengeTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  challengeTitle: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  reward: {
    borderRadius: 99,
    backgroundColor: "rgba(255,182,140,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,182,140,0.30)",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  rewardText: {
    color: "#FFB68C",
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
  },
  challengeTrack: {
    height: 8,
    borderRadius: 99,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    marginTop: 14,
  },
  challengeFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "#FFB68C",
  },
  challengeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 9,
  },
  challengeProgress: {
    color: "#FFB68C",
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  achievements: {
    minHeight: 44,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 18,
  },
  achievementsText: {
    color: "#C5C0FF",
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  tracking: { gap: 10 },
  trackingTitle: {
    color: "#94A3B8",
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  navRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 16,
    gap: 12,
  },
  navIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.12)",
  },
  logIcon: { backgroundColor: "rgba(68,234,195,0.12)" },
  navText: {
    flex: 1,
    color: "#E3E1E9",
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
});
