import { useAchievements, useLeaderboard, useXPProgress } from "@/hooks/queries/useProgress";
import { useProgressionSnapshot } from "@/features/progression";
import { useAppSelector } from "@/store/hooks";
import { badgeIconFor } from "@/shared/constants/badgeIcons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Award, ChevronRight, Flame, Medal, Zap } from "lucide-react-native";
import React, { useMemo } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";

const ACCENT = "#38BDF8";
const ACCENT_SOFT = "#7DD3FC";
const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;
const SURFACE_WASH = [
  "rgba(56,189,248,0.12)",
  "rgba(139,92,246,0.06)",
  "rgba(255,255,255,0.02)",
] as const;

const defaultAvatar = require("../../../../assets/avatar/sample-athlete-profile.png");

const format = (value: number) => new Intl.NumberFormat().format(value);

export const TopProfileCard = () => {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { data: xp } = useXPProgress();
  const progression = useProgressionSnapshot();
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
  const xpRatio = xp?.nextLevelXP ? Math.min(1, xp.currentXP / xp.nextLevelXP) : 0;

  const navigate = (path: "/profile/edit-profile" | "/achievements") => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push(path);
  };

  const stats = [
    { key: "level", value: xp?.currentLevel ?? "—", label: "LEVEL" },
    { key: "rank", value: userRank ? `#${userRank.rank}` : "—", label: "GLOBAL RANK" },
    { key: "badges", value: earnedBadges.length, label: "BADGES" },
  ];

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={SURFACE_WASH}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Identity */}
      <View style={styles.identityRow}>
        <View style={styles.avatarRing}>
          <LinearGradient
            colors={["#7DD3FC", "#38BDF8", "#6366F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.avatarInner}>
            <Image
              source={user?.avatarUrl ? { uri: user.avatarUrl } : defaultAvatar}
              style={styles.avatar}
              contentFit="cover"
            />
          </View>
        </View>

        <View style={styles.identity}>
          <Text style={styles.kicker}>ATHLETE PROFILE</Text>
          <Text style={styles.name} numberOfLines={1}>
            {user?.fullName || "Athlete"}
          </Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Medal size={11} color={ACCENT_SOFT} strokeWidth={2.4} />
              <Text style={styles.chipText} numberOfLines={1}>
                {progression.tier.displayName}
              </Text>
            </View>
            <View style={styles.chip}>
              <Flame size={11} color={ACCENT_SOFT} strokeWidth={2.4} />
              <Text style={styles.chipText} numberOfLines={1}>
                {xp?.dayStreak ?? "—"} DAY STREAK
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.key} style={styles.statTile}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel} numberOfLines={1}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* XP */}
      <View style={styles.xpSection}>
        <View style={styles.xpHeading}>
          <View style={styles.inlineLabel}>
            <Zap size={13} color={ACCENT} strokeWidth={2.6} />
            <Text style={styles.sectionLabel}>WORKOUT XP</Text>
          </View>
          <Text style={styles.xpValue}>
            {xp ? (
              <>
                {format(xp.currentXP)}
                <Text style={styles.xpTotal}> / {format(xp.nextLevelXP)}</Text>
              </>
            ) : (
              "…"
            )}
          </Text>
        </View>
        <View style={styles.track}>
          <LinearGradient
            colors={["#6366F1", "#4F9DFB", "#38BDF8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.trackFill, { width: `${Math.max(3, xpRatio * 100)}%` }]}
          />
        </View>
      </View>

      {/* Badges */}
      <View style={styles.badgesSection}>
        <View style={styles.xpHeading}>
          <View style={styles.inlineLabel}>
            <Award size={13} color={ACCENT} strokeWidth={2.6} />
            <Text style={styles.sectionLabel}>ACHIEVEMENTS</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigate("/achievements")}
            style={styles.linkChip}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="View all achievements"
          >
            <Text style={styles.linkChipText}>VIEW ALL</Text>
            <ChevronRight size={12} color={ACCENT_SOFT} strokeWidth={2.6} />
          </TouchableOpacity>
        </View>

        {previewBadges.length ? (
          <View style={styles.badgesRow}>
            {previewBadges.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`View ${badge.title} achievement`}
                style={styles.badge}
                onPress={() => navigate("/achievements")}
              >
                <Image
                  source={badgeIconFor(badge.iconType ?? badge.iconName)}
                  style={styles.badgeIcon}
                  contentFit="contain"
                />
              </TouchableOpacity>
            ))}
            {additionalBadges > 0 ? (
              <View style={[styles.badge, styles.moreBadge]}>
                <Text style={styles.moreBadgeText}>+{additionalBadges}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <Text style={styles.emptyBadges}>Complete your first workout to earn a badge.</Text>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.primaryBtn}
        onPress={() => navigate("/profile/edit-profile")}
        accessibilityRole="button"
        accessibilityLabel="Edit profile"
      >
        <LinearGradient
          colors={BUTTON_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={SHEEN}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.primarySheen}
          pointerEvents="none"
        />
        <Text style={styles.primaryBtnText}>EDIT PROFILE</Text>
        <View style={styles.primaryTrail}>
          <ChevronRight size={14} color="#FFFFFF" strokeWidth={2.6} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    backgroundColor: "#111A25",
    padding: 16,
    gap: 16,
    marginBottom: 14,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 2.5,
    overflow: "hidden",
  },
  avatarInner: {
    flex: 1,
    borderRadius: 34,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#111A25",
    backgroundColor: "#0D141E",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  identity: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  kicker: {
    ...typography.overline,
    color: ACCENT_SOFT,
  },
  name: {
    ...typography.metric,
    color: "#F8FAFC",
  },
  chipsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  chip: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
  },
  chipText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statTile: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(6,8,16,0.45)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  statValue: {
    ...typography.metric,
    color: "#F8FAFC",
  },
  statLabel: {
    ...typography.microTag,
    color: "#7C8BA1",
    letterSpacing: 0.6,
  },
  xpSection: {
    gap: 8,
  },
  xpHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  inlineLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionLabel: {
    ...typography.overline,
    color: "#CBD5E1",
  },
  xpValue: {
    ...typography.badge,
    color: "#F8FAFC",
    fontVariant: ["tabular-nums"],
  },
  xpTotal: {
    ...typography.badge,
    color: "#7C8BA1",
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(148,163,184,0.12)",
  },
  trackFill: {
    height: "100%",
    borderRadius: 999,
  },
  badgesSection: {
    gap: 10,
  },
  linkChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  linkChipText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1.5,
    borderColor: "rgba(56,189,248,0.35)",
  },
  badgeIcon: {
    width: 26,
    height: 26,
  },
  moreBadge: {
    backgroundColor: "rgba(6,8,16,0.45)",
    borderColor: "rgba(148,163,184,0.2)",
  },
  moreBadgeText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },
  emptyBadges: {
    ...typography.bodySmall,
    color: "#94A3B8",
  },
  primaryBtn: {
    height: 50,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primarySheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  primaryBtnText: {
    ...typography.button,
    letterSpacing: 1,
    color: "#FFFFFF",
  },
  primaryTrail: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
