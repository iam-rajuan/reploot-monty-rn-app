import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Activity,
  ArrowRight,
  Trophy,
  type LucideIcon,
  Clock,
  Compass,
  Dumbbell,
  Flame,
  RotateCcw,
  Sparkles,
  User,
  Zap,
} from "lucide-react-native";
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
import {
  HOME_WORKOUT_LIBRARY_DATA,
  HomeChallengeItem,
  HomeWorkoutLibraryData,
  HomeWorkoutSessionItem,
} from "../data/homeWorkoutLibraryData";
import { typography } from "@/theme/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

const { width } = Dimensions.get("window");

// One accent for the whole page.
const ACCENT = "#38BDF8";
const ACCENT_SOFT = "#7DD3FC";
const SURFACE_WASH = [
  "rgba(56,189,248,0.12)",
  "rgba(139,92,246,0.06)",
  "rgba(255,255,255,0.02)",
] as const;
const SESSION_ICONS: Record<string, LucideIcon> = {
  "upper-body": Dumbbell,
  "lower-body": Activity,
  "full-body": User,
  mobility: Compass,
  hiit: Flame,
  strength: Zap,
};

export interface HomeWorkoutLibraryScreenProps {
  data?: HomeWorkoutLibraryData;
  onBack?: () => void;
  onStartQuest?: () => void;
  onSelectChallenge?: (challenge: HomeChallengeItem) => void;
  onSelectSession?: (session: HomeWorkoutSessionItem) => void;
}

export const HomeWorkoutLibraryScreen: React.FC<
  HomeWorkoutLibraryScreenProps
> = ({
  data = HOME_WORKOUT_LIBRARY_DATA,
  onBack,
  onStartQuest,
  onSelectChallenge,
  onSelectSession,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/home");
    }
  };

  const handleStartQuest = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    if (onStartQuest) {
      onStartQuest();
    } else {
      router.push({
        pathname: "/workouts/ai-session" as any,
        params: { pathId: data.todayMainQuest.id },
      });
    }
  };

  const handleChallengePress = (challenge: HomeChallengeItem) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (onSelectChallenge) {
      onSelectChallenge(challenge);
    } else {
      router.push({
        pathname: "/workouts/ai-session" as any,
        params: { pathId: challenge.id },
      });
    }
  };

  const handleSessionPress = (session: HomeWorkoutSessionItem) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (onSelectSession) {
      onSelectSession(session);
    } else if (session.targetRoute) {
      const isGymPath = session.targetRoute === "/workouts";
      router.push({
        pathname: session.targetRoute as any,
        params: {
          source: "home",
          ...(isGymPath ? { pathId: session.workoutPathId || session.id } : {}),
        },
      });
    } else {
      // Default fallback for session cards to Upper Body screen
      router.push({
        pathname: "/workouts/upper" as any,
        params: { source: "home" },
      });
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <StatusBar style="light" />

      {/* Top Header matching exact screenshot with back button, search, notifications, avatar */}
      <CustomHeader
        transparent={true}
        showBackButton={true}
        onPressBack={handleBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 30, 60) },
        ]}
      >
        <View style={styles.titleSection}>
          <Text style={styles.categoryBadge}>HOME WORKOUT</Text>
          <Text style={styles.mainTitle} numberOfLines={1} adjustsFontSizeToFit>
            CHOOSE YOUR PATH
          </Text>
          <Text style={styles.subtitle}>No gym needed. Pick a session and start.</Text>
        </View>

        {/* XP progress */}
        <View style={styles.xpCard}>
          <LinearGradient
            colors={SURFACE_WASH}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.xpHeader}>
            <View style={styles.xpHeaderLeft}>
              <View style={styles.iconChip}>
                <Zap size={14} color={ACCENT} strokeWidth={2.4} />
              </View>
              <Text style={styles.sectionLabel}>CURRENT XP</Text>
            </View>
          </View>

          <View style={styles.xpValueRow}>
            <Text style={styles.xpMainValue}>{data.currentXp}</Text>
            <Text style={styles.xpTotalValue}> / {data.targetXp}</Text>
            <Text style={styles.rankUpText} numberOfLines={1}>
              {data.rankUpText}
            </Text>
          </View>

          <View style={styles.progressBarTrack}>
            <LinearGradient
              colors={["#6366F1", "#4F9DFB", "#38BDF8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${data.progressPercent}%` }]}
            />
          </View>
        </View>

        {/* Upcoming challenges */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionLeft}>
            <View style={styles.iconChip}>
              <Trophy size={14} color={ACCENT} strokeWidth={2.4} />
            </View>
            <Text style={styles.sectionLabel}>UPCOMING CHALLENGES</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.viewAll}
            onPress={() => router.push("/workouts/challenges" as any)}
            accessibilityRole="button"
            accessibilityLabel="View all challenges"
          >
            <Text style={styles.viewAllText}>ALL</Text>
            <ArrowRight size={12} color={ACCENT_SOFT} strokeWidth={2.6} />
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {data.upcomingChallenges.map((challenge) => (
            <TouchableOpacity
              key={challenge.id}
              activeOpacity={0.85}
              onPress={() => handleChallengePress(challenge)}
              style={styles.challengeCard}
              accessibilityRole="button"
              accessibilityLabel={`${challenge.title}, ${challenge.dayBadge}`}
            >
              <View style={styles.challengeImageWrap}>
                <Image source={challenge.image} style={styles.challengeImage} contentFit="cover" />
                <LinearGradient
                  colors={["rgba(6,8,16,0)", "rgba(17,26,37,0.95)"]}
                  start={{ x: 0.5, y: 0.4 }}
                  end={{ x: 0.5, y: 1 }}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>{challenge.dayBadge}</Text>
                </View>
              </View>
              <View style={styles.challengeContent}>
                <Text style={styles.challengeTitle} numberOfLines={2}>
                  {challenge.title}
                </Text>
                <View style={styles.xpChip}>
                  <Zap size={10} color={ACCENT_SOFT} fill={ACCENT_SOFT} />
                  <Text style={styles.xpChipText}>{challenge.xp}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sessions */}
        <View style={[styles.sectionRow, styles.sessionsHeader]}>
          <View style={styles.sectionLeft}>
            <View style={styles.iconChip}>
              <Dumbbell size={14} color={ACCENT} strokeWidth={2.4} />
            </View>
            <Text style={styles.sectionLabel}>SESSIONS</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {data.sessions.map((session) => {
            const Icon = SESSION_ICONS[session.id] || Dumbbell;
            return (
              <TouchableOpacity
                key={session.id}
                activeOpacity={0.85}
                onPress={() => handleSessionPress(session)}
                style={styles.sessionCard}
                accessibilityRole="button"
                accessibilityLabel={session.title}
              >
                <LinearGradient
                  colors={SURFACE_WASH}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
                <View style={styles.sessionTopRow}>
                  <View style={styles.sessionIcon}>
                    <Icon size={20} color={ACCENT} strokeWidth={2} />
                  </View>
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>{session.tag || "+60 XP"}</Text>
                  </View>
                </View>
                <View style={styles.sessionTitleRow}>
                  <Text
                    style={styles.sessionTitle}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                  >
                    {session.title}
                  </Text>
                  <View style={styles.arrowCircle}>
                    <ArrowRight size={13} color={ACCENT_SOFT} strokeWidth={2.5} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#060810",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  titleSection: {
    marginTop: 4,
    marginBottom: 20,
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
  subtitle: {
    ...typography.body,
    color: "#94A3B8",
  },

  // Shared bits
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
  sectionLabel: {
    ...typography.sectionTitle,
    color: "#E5EEF8",
    flexShrink: 1,
  },
  pill: {
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },

  // XP card
  xpCard: {
    backgroundColor: "#111A25",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    padding: 18,
    gap: 12,
    marginBottom: 24,
    overflow: "hidden",
  },
  xpHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  xpHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  xpValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  xpMainValue: {
    ...typography.metricLarge,
    color: "#F8FAFC",
    fontVariant: ["tabular-nums"],
  },
  xpTotalValue: {
    ...typography.subtitle,
    color: "#64748B",
    fontVariant: ["tabular-nums"],
  },
  rankUpText: {
    ...typography.badge,
    color: ACCENT_SOFT,
    marginLeft: "auto",
    paddingLeft: 8,
    flexShrink: 1,
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

  // Section headers
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
  sessionsHeader: {
    marginTop: 26,
  },
  viewAll: {
    height: 30,
    paddingHorizontal: 11,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  viewAllText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },

  // Challenge cards
  challengeCard: {
    width: (width - 54) / 2,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
  },
  challengeImageWrap: {
    height: 104,
  },
  challengeImage: {
    ...StyleSheet.absoluteFill,
  },
  dayBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(7,11,21,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  dayBadgeText: {
    ...typography.badge,
    color: "#E2E8F0",
  },
  challengeContent: {
    padding: 12,
    paddingTop: 8,
    gap: 8,
  },
  challengeTitle: {
    ...typography.cardTitle,
    fontSize: 14,
    lineHeight: 18,
    color: "#F8FAFC",
  },
  xpChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
  },
  xpChipText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },

  // Session cards
  sessionCard: {
    width: (width - 54) / 2,
    height: 124,
    padding: 14,
    borderRadius: 22,
    justifyContent: "space-between",
    overflow: "hidden",
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
  },
  sessionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
  },
  sessionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  sessionTitle: {
    ...typography.cardTitle,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
    color: "#F8FAFC",
    textTransform: "uppercase",
    flexShrink: 1,
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
  },
});
