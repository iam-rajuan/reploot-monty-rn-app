import { WorkoutHeader } from "@/features/workouts";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  BarChart2,
  Clock,
  Dumbbell,
  Flame,
  Share2,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react-native";
import React, { useState } from "react";
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
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";
import { typography } from "@/theme/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";
import { MilestoneShareCard } from "@/features/workouts/components/MilestoneShareCard";
import {
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
} from "@/features/workouts/components/WorkoutShareCard";
import { ShareImageSheet } from "@/features/workouts/components/ShareImageSheet";

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
const circleSizeStyle = 72;
// Template preview fills the milestone card (page padding 20 + card padding 16).
const PREVIEW_WIDTH = Math.min(SHARE_CARD_WIDTH, Dimensions.get("window").width - 72);
const PREVIEW_SCALE = PREVIEW_WIDTH / SHARE_CARD_WIDTH;

type TabType = "TODAY" | "WEEK" | "MONTH";

interface StatItemData {
  id: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
}

export default function YourWorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("TODAY");

  const triggerHaptic = (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
  ) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(style).catch(() => {});
    }
  };

  const handleTabChange = (tab: TabType) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  // Share Achievement opens a designed milestone image (same sheet as the workout summary).
  const [shareOpen, setShareOpen] = useState(false);
  const totalWorkouts = 127;
  const shareText = `🔥 ${totalWorkouts} workouts done on REPLOOT — and counting! #REPLOOT`;
  const shareDate = new Date()
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();

  const handleShare = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setShareOpen(true);
  };

  // Stat data customized per tab
  const statsData: Record<TabType, StatItemData[]> = {
    TODAY: [
      {
        id: "time",
        label: "TIME",
        value: "4h 20m",
        icon: <Clock color="#38BDF8" size={18} />,
        iconBg: "rgba(56, 189, 248, 0.12)",
      },
      {
        id: "workouts",
        label: "WORKOUTS",
        value: "5",
        icon: <Dumbbell color="#818CF8" size={18} />,
        iconBg: "rgba(129, 140, 248, 0.12)",
      },
      {
        id: "calories",
        label: "CALORIES",
        value: "2,450",
        icon: <Flame color="#FB923C" size={18} />,
        iconBg: "rgba(251, 146, 60, 0.12)",
      },
      {
        id: "earned",
        label: "EARNED",
        value: "+120 XP",
        icon: <Sparkles color="#34D399" size={18} />,
        iconBg: "rgba(52, 211, 153, 0.12)",
      },
      {
        id: "score",
        label: "SCORE",
        value: "94%",
        icon: <BarChart2 color="#F472B6" size={18} />,
        iconBg: "rgba(244, 114, 182, 0.12)",
      },
      {
        id: "accuracy",
        label: "ACCURACY",
        value: "94%",
        icon: <Zap color="#38BDF8" size={18} />,
        iconBg: "rgba(56, 189, 248, 0.12)",
      },
    ],
    WEEK: [
      {
        id: "time",
        label: "TIME",
        value: "18h 45m",
        icon: <Clock color="#38BDF8" size={18} />,
        iconBg: "rgba(56, 189, 248, 0.12)",
      },
      {
        id: "workouts",
        label: "WORKOUTS",
        value: "22",
        icon: <Dumbbell color="#818CF8" size={18} />,
        iconBg: "rgba(129, 140, 248, 0.12)",
      },
      {
        id: "calories",
        label: "CALORIES",
        value: "11,820",
        icon: <Flame color="#FB923C" size={18} />,
        iconBg: "rgba(251, 146, 60, 0.12)",
      },
      {
        id: "earned",
        label: "EARNED",
        value: "+680 XP",
        icon: <Sparkles color="#34D399" size={18} />,
        iconBg: "rgba(52, 211, 153, 0.12)",
      },
      {
        id: "score",
        label: "SCORE",
        value: "96%",
        icon: <BarChart2 color="#F472B6" size={18} />,
        iconBg: "rgba(244, 114, 182, 0.12)",
      },
      {
        id: "accuracy",
        label: "ACCURACY",
        value: "92%",
        icon: <Zap color="#38BDF8" size={18} />,
        iconBg: "rgba(56, 189, 248, 0.12)",
      },
    ],
    MONTH: [
      {
        id: "time",
        label: "TIME",
        value: "74h 10m",
        icon: <Clock color="#38BDF8" size={18} />,
        iconBg: "rgba(56, 189, 248, 0.12)",
      },
      {
        id: "workouts",
        label: "WORKOUTS",
        value: "84",
        icon: <Dumbbell color="#818CF8" size={18} />,
        iconBg: "rgba(129, 140, 248, 0.12)",
      },
      {
        id: "calories",
        label: "CALORIES",
        value: "48,500",
        icon: <Flame color="#FB923C" size={18} />,
        iconBg: "rgba(251, 146, 60, 0.12)",
      },
      {
        id: "earned",
        label: "EARNED",
        value: "+2,400 XP",
        icon: <Sparkles color="#34D399" size={18} />,
        iconBg: "rgba(52, 211, 153, 0.12)",
      },
      {
        id: "score",
        label: "SCORE",
        value: "95%",
        icon: <BarChart2 color="#F472B6" size={18} />,
        iconBg: "rgba(244, 114, 182, 0.12)",
      },
      {
        id: "accuracy",
        label: "ACCURACY",
        value: "93%",
        icon: <Zap color="#38BDF8" size={18} />,
        iconBg: "rgba(56, 189, 248, 0.12)",
      },
    ],
  };

  const currentStats = statsData[activeTab];
  const statById = (id: string) => currentStats.find((s) => s.id === id)?.value ?? "—";
  const gridStats = [
    { id: "workouts", label: "WORKOUTS", Icon: Dumbbell },
    { id: "calories", label: "CALORIES", Icon: Flame },
    { id: "earned", label: "XP EARNED", Icon: Sparkles },
    { id: "accuracy", label: "ACCURACY", Icon: Target },
  ];

  // Goal ring
  const circleSize = 72;
  const strokeWidth = 7;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressPercent =
    activeTab === "TODAY" ? 0.75 : activeTab === "WEEK" ? 0.88 : 0.94;
  const strokeDashoffset = circumference * (1 - progressPercent);
  const periodLabel =
    activeTab === "TODAY" ? "TODAY" : activeTab === "WEEK" ? "THIS WEEK" : "THIS MONTH";

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <StatusBar style="light" />

      <WorkoutHeader
        transparent={true}
        showBackButton={true}
        onPressBack={() => {
          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
          router.canGoBack() ? router.back() : router.replace("/(tabs)/progress");
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
          <Text style={styles.categoryBadge}>PROGRESS</Text>
          <Text style={styles.mainTitle} numberOfLines={1} adjustsFontSizeToFit>
            YOUR WORKOUTS
          </Text>
        </View>

        <View style={styles.segment}>
          {(["TODAY", "WEEK", "MONTH"] as TabType[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                style={[styles.segmentItem, isActive && styles.segmentItemActive]}
                onPress={() => handleTabChange(tab)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Summary */}
        <View style={styles.card}>
          <LinearGradient
            colors={SURFACE_WASH}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.summaryRow}>
            <View style={styles.summaryCopy}>
              <Text style={styles.kicker}>{periodLabel}</Text>
              <View style={styles.timeRow}>
                <Clock size={16} color={ACCENT} strokeWidth={2.4} />
                <Text style={styles.timeValue}>{statById("time")}</Text>
              </View>
              <Text style={styles.timeCaption}>Active training time</Text>
            </View>

            <View style={styles.goalRing}>
              <Svg width={circleSize} height={circleSize}>
                <Defs>
                  <SvgGradient id="goalRing" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#7DD3FC" />
                    <Stop offset="1" stopColor="#6366F1" />
                  </SvgGradient>
                </Defs>
                <Circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke="rgba(148,163,184,0.14)"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                <Circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke="url(#goalRing)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
                />
              </Svg>
              <View style={styles.goalTextContainer}>
                <Text style={styles.goalPercent}>{Math.round(progressPercent * 100)}%</Text>
                <Text style={styles.goalSub}>GOAL</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            {gridStats.map(({ id, label, Icon }) => (
              <View key={id} style={styles.statTile}>
                <View style={styles.iconChip}>
                  <Icon size={14} color={ACCENT} strokeWidth={2.4} />
                </View>
                <View style={styles.statCopy}>
                  <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                    {statById(id)}
                  </Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              </View>
            ))}
          </View>
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
          <View style={styles.milestoneLabelRow}>
            <View style={styles.cardIconChip}>
              <Trophy size={14} color={ACCENT} strokeWidth={2.4} />
            </View>
            <Text style={styles.milestoneLabel}>ALL-TIME RECORD</Text>
          </View>

          {/* Live preview of the exact image that gets shared */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel={`Milestone card: ${totalWorkouts} workouts. Tap to share.`}
            style={{
              width: PREVIEW_WIDTH,
              height: SHARE_CARD_HEIGHT * PREVIEW_SCALE,
              alignSelf: "center",
            }}
          >
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: (PREVIEW_WIDTH - SHARE_CARD_WIDTH) / 2,
                top: (SHARE_CARD_HEIGHT * PREVIEW_SCALE - SHARE_CARD_HEIGHT) / 2,
                transform: [{ scale: PREVIEW_SCALE }],
              }}
            >
              <MilestoneShareCard
                dateLabel={shareDate}
                total={totalWorkouts}
                periodLabel={periodLabel}
                stats={{
                  time: statById("time"),
                  calories: statById("calories"),
                  xp: statById("earned").replace(/\s*XP$/i, ""),
                  accuracy: statById("accuracy"),
                }}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryBtn}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share achievement"
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
            <View>
              <Share2 color="#FFFFFF" size={15} strokeWidth={2.4} />
            </View>
            <Text style={styles.primaryBtnText}>SHARE ACHIEVEMENT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ShareImageSheet
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Your milestone card"
        shareText={shareText}
        filename="reploot-milestone"
        renderCard={(ref, theme) => (
          <MilestoneShareCard
            ref={ref}
            theme={theme}
            dateLabel={shareDate}
            total={totalWorkouts}
            periodLabel={periodLabel}
            stats={{
              time: statById("time"),
              calories: statById("calories"),
              xp: statById("earned").replace(/\s*XP$/i, ""),
              accuracy: statById("accuracy"),
            }}
          />
        )}
      />
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
    marginBottom: 16,
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

  segment: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 16,
    marginBottom: 14,
    backgroundColor: "rgba(17,26,37,0.8)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.14)",
  },
  segmentItem: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentItemActive: {
    backgroundColor: "rgba(56,189,248,0.16)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.4)",
  },
  segmentText: {
    ...typography.badge,
    color: "#7C8BA1",
  },
  segmentTextActive: {
    color: ACCENT_SOFT,
  },

  card: {
    backgroundColor: "#111A25",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    padding: 16,
    gap: 14,
    marginBottom: 14,
    overflow: "hidden",
  },
  kicker: {
    ...typography.overline,
    color: ACCENT_SOFT,
  },

  // Summary
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryCopy: {
    flex: 1,
    gap: 2,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeValue: {
    ...typography.metricLarge,
    color: "#F8FAFC",
  },
  timeCaption: {
    ...typography.caption,
    color: "#8B9AB0",
  },
  goalRing: {
    width: circleSizeStyle,
    height: circleSizeStyle,
    alignItems: "center",
    justifyContent: "center",
  },
  goalTextContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  goalPercent: {
    ...typography.cardTitle,
    fontSize: 16,
    lineHeight: 20,
    color: "#F8FAFC",
  },
  goalSub: {
    ...typography.microTag,
    color: "#7C8BA1",
    letterSpacing: 0.6,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  statTile: {
    width: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(6,8,16,0.45)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
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
  statCopy: {
    flex: 1,
    minWidth: 0,
  },
  statValue: {
    ...typography.cardTitle,
    fontSize: 18,
    lineHeight: 22,
    color: "#F8FAFC",
  },
  statLabel: {
    ...typography.microTag,
    color: "#7C8BA1",
    letterSpacing: 0.6,
  },

  // Milestone
  milestoneLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardIconChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  milestoneLabel: {
    ...typography.sectionTitle,
    color: "#E5EEF8",
  },

  primaryBtn: {
    height: 50,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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
});
