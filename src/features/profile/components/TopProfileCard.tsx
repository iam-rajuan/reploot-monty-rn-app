import { useAchievements, useLeaderboard, useXPProgress } from "@/hooks/queries/useProgress";
import { ProgressBar } from "@/shared/components/ui/ProgressBar";
import { useAppSelector } from "@/store/hooks";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Award,
  ChevronRight,
  Crown,
  Flame,
  Medal,
  Trophy,
  Zap,
} from "lucide-react-native";
import React, { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

const BADGE_EMOJI: Record<string, string> = {
  medal: "🏅",
  lightning: "⚡",
  drop: "💧",
  flame: "🔥",
  arm: "💪",
  salad: "🥗",
  ribbon: "🎖️",
  trophy: "🏆",
};

const defaultAvatar = require("../../../../assets/avatar/sample-athlete-profile.png");

const format = (value: number) => new Intl.NumberFormat().format(value);

export const TopProfileCard = () => {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { data: xp } = useXPProgress();
  const { data: leaderboard } = useLeaderboard();
  const { data: achievements } = useAchievements();
  const userRank = leaderboard?.find((entry) => entry.isCurrentUser);
  const earnedBadges = useMemo(
    () =>
      (achievements ?? [])
        .filter((achievement) => achievement.isUnlocked)
        .sort(
          (left, right) =>
            new Date(right.unlockedAt ?? 0).getTime() -
            new Date(left.unlockedAt ?? 0).getTime(),
        ),
    [achievements],
  );
  const previewBadges = earnedBadges.slice(0, 5);
  const additionalBadges = Math.max(0, earnedBadges.length - previewBadges.length);
  const xpRatio = xp?.nextLevelXP ? xp.currentXP / xp.nextLevelXP : 0;

  const navigate = (path: "/profile/edit-profile" | "/achievements") => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push(path);
  };

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["rgba(56,189,248,0.12)", "rgba(139,92,246,0.07)", "rgba(255,255,255,0.02)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.identityRow}>
        <View style={styles.avatarFrame}>
          <Image
            source={user?.avatarUrl ? { uri: user.avatarUrl } : defaultAvatar}
            style={styles.avatar}
            contentFit="cover"
          />
        </View>
        <View style={styles.identity}>
          <Text style={styles.name} numberOfLines={1}>
            {user?.fullName || "Athlete"}
          </Text>
          <Text style={styles.status} numberOfLines={1}>ATHLETE PROFILE</Text>
          <View style={styles.identityMeta}>
            <View style={styles.tierChip}>
              <Medal size={13} color="#C5C0FF" />
              <Text style={styles.tierText}>{xp?.tier ?? "—"}</Text>
            </View>
            <View style={styles.streakChip}>
              <Flame size={13} color="#FFB68C" fill="#FFB68C" />
              <Text style={styles.streakText}>{xp?.dayStreak ?? "—"} DAY STREAK</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{xp?.currentLevel ?? "—"}</Text>
          <Text style={styles.statLabel}>LEVEL</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{userRank ? "#" + userRank.rank : "—"}</Text>
          <Text style={styles.statLabel}>GLOBAL RANK</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{earnedBadges.length}</Text>
          <Text style={styles.statLabel}>BADGES</Text>
        </View>
      </View>

      <View style={styles.xpSection}>
        <View style={styles.xpHeading}>
          <View style={styles.xpLabelRow}><Zap size={14} color="#38BDF8" /><Text style={styles.xpLabel}>WORKOUT XP</Text></View>
          <Text style={styles.xpValue}>{xp ? format(xp.currentXP) + " / " + format(xp.nextLevelXP) + " XP" : "Loading…"}</Text>
        </View>
        <ProgressBar progress={xpRatio} height={8} />
      </View>

      <View style={styles.achievementsSection}>
        <View style={styles.achievementsHeader}>
          <View style={styles.achievementsTitleRow}><Award size={15} color="#C5C0FF" /><Text style={styles.achievementsTitle}>ACHIEVEMENT COLLECTION</Text></View>
          <Text style={styles.badgeCount}>{earnedBadges.length} UNLOCKED</Text>
        </View>
        {previewBadges.length ? (
          <View style={styles.badgesRow}>
            {previewBadges.map((badge) => (
              <Pressable
                key={badge.id}
                accessibilityRole="button"
                accessibilityLabel={"View " + badge.title + " achievement"}
                style={styles.badge}
                onPress={() => navigate("/achievements")}
              >
                <Text style={styles.badgeEmoji}>{BADGE_EMOJI[badge.iconType ?? badge.iconName] ?? "🏅"}</Text>
              </Pressable>
            ))}
            {additionalBadges > 0 ? <View style={styles.moreBadge}><Text style={styles.moreBadgeText}>+{additionalBadges}</Text></View> : null}
          </View>
        ) : (
          <Text style={styles.emptyBadges}>Complete your first workout to earn a badge.</Text>
        )}
        <Pressable style={styles.viewAchievements} onPress={() => navigate("/achievements")}>
          <Text style={styles.viewAchievementsText}>VIEW ALL ACHIEVEMENTS</Text>
          <ChevronRight size={15} color="#C5C0FF" />
        </Pressable>
      </View>

      <Pressable style={styles.editButton} onPress={() => navigate("/profile/edit-profile")}>
        <LinearGradient colors={["#0284C7", "#0EA5E9", "#38BDF8"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.editGradient}>
          <Text style={styles.editText}>EDIT PROFILE</Text>
          <ChevronRight size={18} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { overflow: "hidden", borderRadius: 24, borderWidth: 1, borderColor: "rgba(56,189,248,0.18)", backgroundColor: "#111A25", padding: 20, marginBottom: 20 },
  identityRow: { flexDirection: "row", alignItems: "center" },
  avatarFrame: { width: 78, height: 78, marginRight: 16, borderRadius: 24, alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "#0D141E", borderWidth: 1, borderColor: "rgba(34,211,238,0.55)", shadowColor: "#22D3EE", shadowOpacity: 0.16, shadowRadius: 10, elevation: 3 },
  avatar: { width: "100%", height: "100%" },
  identity: { flex: 1, minWidth: 0 },
  name: { color: "#FFFFFF", fontSize: 20, lineHeight: 24, fontWeight: "900", fontFamily: "monospace", letterSpacing: 0.3 },
  status: { color: "#94A3B8", fontSize: 10, lineHeight: 14, fontWeight: "700", fontFamily: "monospace", letterSpacing: 0.8, marginTop: 2 },
  identityMeta: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  tierChip: { minHeight: 25, flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 99, paddingHorizontal: 8, backgroundColor: "rgba(197,192,255,0.14)", borderWidth: 1, borderColor: "rgba(197,192,255,0.26)" },
  tierText: { color: "#C5C0FF", fontSize: 9, fontFamily: "monospace", fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase" },
  streakChip: { minHeight: 25, flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 99, paddingHorizontal: 8, backgroundColor: "rgba(255,182,140,0.12)", borderWidth: 1, borderColor: "rgba(255,182,140,0.24)" },
  streakText: { color: "#FFB68C", fontSize: 9, fontFamily: "monospace", fontWeight: "800", letterSpacing: 0.4 },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 24, paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  stat: { flex: 1, alignItems: "center", minWidth: 0 },
  statDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.10)" },
  statValue: { color: "#FFFFFF", fontSize: 22, lineHeight: 25, fontWeight: "900" },
  statLabel: { color: "#94A3B8", fontFamily: "monospace", fontSize: 8, lineHeight: 12, fontWeight: "700", letterSpacing: 0.6, marginTop: 3, textAlign: "center" },
  xpSection: { marginTop: 20 },
  xpHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 9 },
  xpLabelRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  xpLabel: { color: "#38BDF8", fontSize: 10, fontFamily: "monospace", fontWeight: "800", letterSpacing: 0.9 },
  xpValue: { flexShrink: 1, color: "#C5C0FF", fontFamily: "monospace", fontSize: 11, fontWeight: "700", textAlign: "right" },
  achievementsSection: { marginTop: 22 },
  achievementsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  achievementsTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  achievementsTitle: { color: "#FFFFFF", fontSize: 11, fontFamily: "monospace", fontWeight: "800", letterSpacing: 0.6, flexShrink: 1 },
  badgeCount: { color: "#C5C0FF", fontFamily: "monospace", fontSize: 9, fontWeight: "700", letterSpacing: 0.5 },
  badgesRow: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 13 },
  badge: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(197,192,255,0.12)", borderWidth: 1, borderColor: "rgba(197,192,255,0.24)" },
  badgeEmoji: { fontSize: 18 },
  moreBadge: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(56,189,248,0.12)", borderWidth: 1, borderColor: "rgba(56,189,248,0.24)" },
  moreBadgeText: { color: "#38BDF8", fontFamily: "monospace", fontSize: 11, fontWeight: "800" },
  emptyBadges: { color: "#94A3B8", fontSize: 12, lineHeight: 17, marginTop: 10 },
  viewAchievements: { minHeight: 40, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 3, marginTop: 9 },
  viewAchievementsText: { color: "#C5C0FF", fontSize: 10, fontFamily: "monospace", fontWeight: "800", letterSpacing: 0.8 },
  editButton: { height: 52, overflow: "hidden", borderRadius: 16, marginTop: 8 },
  editGradient: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  editText: { color: "#FFFFFF", fontSize: 12, fontFamily: "monospace", fontWeight: "800", letterSpacing: 1.1 },
});
