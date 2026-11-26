import { WorkoutHeader } from "@/features/workouts";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, Award, Check } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/shared/components/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { typography } from "@/theme/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

// One accent for the whole page.
const ACCENT = "#38BDF8";
const ACCENT_SOFT = "#7DD3FC";
const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;
const SURFACE_WASH = [
  "rgba(56,189,248,0.12)",
  "rgba(139,92,246,0.06)",
  "rgba(255,255,255,0.02)",
] as const;

// 3D badge art: Microsoft Fluent Emoji (MIT) — see assets/badges/LICENSE-fluent-emoji.txt
const BADGE_ICONS: Record<BadgeItem["type"], number> = {
  medal: require("../assets/badges/medal.png"),
  lightning: require("../assets/badges/lightning.png"),
  drop: require("../assets/badges/drop.png"),
  flame: require("../assets/badges/flame.png"),
  arm: require("../assets/badges/arm.png"),
  salad: require("../assets/badges/salad.png"),
  ribbon: require("../assets/badges/ribbon.png"),
  trophy: require("../assets/badges/trophy.png"),
};

// 3 equal columns inside the 20px page padding.
const BADGE_GAP = 10;
const BADGE_WIDTH = Math.floor((Dimensions.get("window").width - 40 - BADGE_GAP * 2) / 3);

const MILESTONE = { label: "25 Workouts", done: 25, total: 25, xp: 500 };

interface BadgeItem {
  id: string;
  name: string;
  type:
    | "medal"
    | "lightning"
    | "drop"
    | "flame"
    | "arm"
    | "salad"
    | "ribbon"
    | "trophy";
  glowColor: string;
}

const UNLOCKED_BADGES: BadgeItem[] = [
  {
    id: "1",
    name: "Today Workout",
    type: "medal",
    glowColor: "rgba(250, 204, 21, 0.25)",
  },
  {
    id: "2",
    name: "Healthy Day",
    type: "lightning",
    glowColor: "rgba(234, 179, 8, 0.25)",
  },
  {
    id: "3",
    name: "Hydration Hero",
    type: "drop",
    glowColor: "rgba(56, 189, 248, 0.35)",
  },
  {
    id: "4",
    name: "3 Day Streak",
    type: "flame",
    glowColor: "rgba(249, 115, 22, 0.35)",
  },
  {
    id: "5",
    name: "2/12 Workouts",
    type: "arm",
    glowColor: "rgba(251, 146, 60, 0.25)",
  },
  {
    id: "6",
    name: "Healthy Week",
    type: "salad",
    glowColor: "rgba(34, 197, 94, 0.25)",
  },
  {
    id: "7",
    name: "2/16 Workouts",
    type: "ribbon",
    glowColor: "rgba(234, 179, 8, 0.25)",
  },
  {
    id: "8",
    name: "2/25 Workouts",
    type: "trophy",
    glowColor: "rgba(245, 158, 11, 0.35)",
  },
];

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();

  const triggerHaptic = (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
  ) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(style).catch(() => {});
    }
  };

  const handleStartWorkout = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/workouts");
  };

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <StatusBar style="light" />

      {/* Unified WorkoutHeader with back button enabled */}
      <WorkoutHeader
        transparent={true}
        showBackButton={true}
        onPressBack={() => {
          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
          router.canGoBack()
            ? router.back()
            : router.replace("/(tabs)/progress");
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: Math.max(insets.bottom + 28, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.categoryBadge}>ACHIEVEMENTS</Text>
          <Text style={styles.mainTitle} numberOfLines={1} adjustsFontSizeToFit>
            UNLOCK NEXT LEVEL
          </Text>
        </View>

        {/* Milestone */}
        <View style={styles.card}>
          <LinearGradient
            colors={SURFACE_WASH}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.milestoneRow}>
            <View style={styles.milestoneMedal}>
              <Image
                source={BADGE_ICONS.trophy}
                style={styles.milestoneIcon}
                contentFit="contain"
              />
            </View>
            <View style={styles.milestoneCopy}>
              <Text style={styles.kicker}>MONTHLY MILESTONE</Text>
              <Text style={styles.milestoneTitle}>{MILESTONE.label}</Text>
              <View style={styles.milestoneMeta}>
                <View style={styles.donePill}>
                  <Check size={10} color="#FFFFFF" strokeWidth={3.4} />
                  <Text style={styles.donePillText}>COMPLETE</Text>
                </View>
                <Text style={styles.xpText}>+{MILESTONE.xp} XP</Text>
              </View>
            </View>
          </View>

          <View style={styles.progressBlock}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>SESSIONS</Text>
              <Text style={styles.progressValue}>
                {MILESTONE.done}
                <Text style={styles.progressTotal}> / {MILESTONE.total}</Text>
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <LinearGradient
                colors={["#6366F1", "#4F9DFB", "#38BDF8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, (MILESTONE.done / MILESTONE.total) * 100)}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionLeft}>
            <View style={styles.iconChip}>
              <Award size={14} color={ACCENT} strokeWidth={2.4} />
            </View>
            <Text style={styles.sectionTitle}>UNLOCKED BADGES</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{UNLOCKED_BADGES.length}</Text>
          </View>
        </View>

        <View style={styles.badgesGrid}>
          {UNLOCKED_BADGES.map((badge) => (
            <View key={badge.id} style={styles.badgeCard}>
              <View style={styles.badgeRing}>
                <View style={styles.badgeInner}>
                  <Image
                    source={BADGE_ICONS[badge.type]}
                    style={styles.badgeIcon}
                    contentFit="contain"
                    accessibilityIgnoresInvertColors
                  />
                </View>
                <View style={styles.badgeCheck}>
                  <Check size={9} color="#FFFFFF" strokeWidth={3.6} />
                </View>
              </View>
              <Text style={styles.badgeName} numberOfLines={2}>
                {badge.name}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.primaryBtn}
          onPress={handleStartWorkout}
          accessibilityRole="button"
          accessibilityLabel="Start today's workout"
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
          <Text style={styles.primaryBtnText}>START TODAY'S WORKOUT</Text>
          <View style={styles.primaryTrail}>
            <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.6} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#060810",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  titleSection: {
    marginTop: 4,
    marginBottom: 18,
    gap: 4,
  },
  categoryBadge: {
    ...typography.overline,
    fontSize: 11,
    lineHeight: 16,
    color: ACCENT_SOFT,
  },
  mainTitle: {
    ...typography.pageTitle,
    color: "#F6F8FF",
  },

  // Milestone card
  card: {
    backgroundColor: "#111A25",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    padding: 16,
    gap: 16,
    marginBottom: 24,
    overflow: "hidden",
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  milestoneMedal: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.12)",
    borderWidth: 2,
    borderColor: "rgba(56,189,248,0.45)",
  },
  milestoneIcon: {
    width: 40,
    height: 40,
  },
  milestoneCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  kicker: {
    ...typography.overline,
    color: ACCENT_SOFT,
  },
  milestoneTitle: {
    ...typography.metric,
    color: "#F8FAFC",
  },
  milestoneMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  donePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#0EA5E9",
  },
  donePillText: {
    ...typography.badge,
    color: "#FFFFFF",
  },
  xpText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },
  progressBlock: {
    gap: 8,
  },
  progressLabels: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  progressLabel: {
    ...typography.overline,
    color: "#7C8BA1",
  },
  progressValue: {
    ...typography.cardTitle,
    fontSize: 14,
    lineHeight: 18,
    color: "#F8FAFC",
    fontVariant: ["tabular-nums"],
  },
  progressTotal: {
    ...typography.caption,
    color: "#7C8BA1",
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(148,163,184,0.12)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.10)",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 999,
  },

  // Section
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 14,
  },
  sectionLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: "#E5EEF8",
  },
  pill: {
    minWidth: 28,
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
  },
  pillText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },

  // Badges
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: BADGE_GAP,
    marginBottom: 24,
  },
  badgeCard: {
    width: BADGE_WIDTH,
    alignItems: "center",
    gap: 8,
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 6,
    borderRadius: 20,
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.16)",
  },
  badgeRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(56,189,248,0.45)",
    backgroundColor: "rgba(56,189,248,0.06)",
  },
  badgeInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.14)",
  },
  badgeIcon: {
    width: 36,
    height: 36,
  },
  badgeCheck: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0EA5E9",
    borderWidth: 2,
    borderColor: "#111A25",
  },
  badgeName: {
    ...typography.caption,
    fontWeight: "600",
    color: "#E2E8F0",
    textAlign: "center",
    minHeight: 32,
  },

  // Button
  primaryBtn: {
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
      },
      web: { boxShadow: "0 8px 22px rgba(56,189,248,0.28)" } as any,
      default: {},
    }),
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
