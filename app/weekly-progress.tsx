import { WorkoutHeader } from "@/features/workouts";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Share2,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/shared/components/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Line as SvgLine } from "react-native-svg";
import {
  HORIZONTAL_PADDING,
  clampFontSize,
  isSmallDevice,
} from "@/shared/utils/responsive";
import { typography } from "@/theme/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

const { width } = Dimensions.get("window");

type WeekTab = "THIS_WEEK" | "PREV_WEEK" | "BEST_WEEK";

interface DayData {
  day: string;
  fullDay: string;
  date: string;
  minutes: number;
  calories: number;
  accuracy: number;
  workoutName: string;
  isRest: boolean;
  barHeight: number;
}

// One accent for the whole page.
const ACCENT = "#38BDF8";
const ACCENT_SOFT = "#7DD3FC";
const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;

const ProfileCardBackground = () => (
  <LinearGradient
    colors={[
      "rgba(56,189,248,0.12)",
      "rgba(139,92,246,0.07)",
      "rgba(255,255,255,0.02)",
    ]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    pointerEvents="none"
    style={StyleSheet.absoluteFill}
  />
);

const WEEK_DATA: Record<
  WeekTab,
  { dateRange: string; days: DayData[]; totalXp: number }
> = {
  THIS_WEEK: {
    dateRange: "OCT 12 — OCT 18, 2026",
    totalXp: 2450,
    days: [
      {
        day: "M",
        fullDay: "Monday",
        date: "Oct 12",
        minutes: 45,
        calories: 410,
        accuracy: 92,
        workoutName: "Chest & Triceps Hyper-Forge",
        isRest: false,
        barHeight: 46,
      },
      {
        day: "T",
        fullDay: "Tuesday",
        date: "Oct 13",
        minutes: 50,
        calories: 460,
        accuracy: 94,
        workoutName: "Legs & Core Reploot Squats",
        isRest: false,
        barHeight: 56,
      },
      {
        day: "W",
        fullDay: "Wednesday",
        date: "Oct 14",
        minutes: 60,
        calories: 550,
        accuracy: 91,
        workoutName: "Shoulders & Traps Overload",
        isRest: false,
        barHeight: 70,
      },
      {
        day: "T",
        fullDay: "Thursday",
        date: "Oct 15",
        minutes: 40,
        calories: 420,
        accuracy: 95,
        workoutName: "Pull Day Hyper-Row Matrix",
        isRest: false,
        barHeight: 84, // active day
      },
      {
        day: "F",
        fullDay: "Friday",
        date: "Oct 16",
        minutes: 0,
        calories: 0,
        accuracy: 0,
        workoutName: "Active Recovery & Neuromuscular Reset",
        isRest: true,
        barHeight: 18,
      },
      {
        day: "S",
        fullDay: "Saturday",
        date: "Oct 17",
        minutes: 45,
        calories: 430,
        accuracy: 93,
        workoutName: "Full Body Functional Flow",
        isRest: false,
        barHeight: 48,
      },
      {
        day: "S",
        fullDay: "Sunday",
        date: "Oct 18",
        minutes: 0,
        calories: 0,
        accuracy: 0,
        workoutName: "Scheduled Recovery & Mobility Protocol",
        isRest: true,
        barHeight: 18,
      },
    ],
  },
  PREV_WEEK: {
    dateRange: "OCT 05 — OCT 11, 2026",
    totalXp: 2180,
    days: [
      {
        day: "M",
        fullDay: "Monday",
        date: "Oct 05",
        minutes: 40,
        calories: 380,
        accuracy: 90,
        workoutName: "Push Protocol A",
        isRest: false,
        barHeight: 42,
      },
      {
        day: "T",
        fullDay: "Tuesday",
        date: "Oct 06",
        minutes: 45,
        calories: 420,
        accuracy: 91,
        workoutName: "Pull Protocol B",
        isRest: false,
        barHeight: 48,
      },
      {
        day: "W",
        fullDay: "Wednesday",
        date: "Oct 07",
        minutes: 0,
        calories: 0,
        accuracy: 0,
        workoutName: "Midweek Rest",
        isRest: true,
        barHeight: 18,
      },
      {
        day: "T",
        fullDay: "Thursday",
        date: "Oct 08",
        minutes: 50,
        calories: 470,
        accuracy: 92,
        workoutName: "Legs Conditioning",
        isRest: false,
        barHeight: 54,
      },
      {
        day: "F",
        fullDay: "Friday",
        date: "Oct 09",
        minutes: 40,
        calories: 390,
        accuracy: 89,
        workoutName: "Arms & Core",
        isRest: false,
        barHeight: 42,
      },
      {
        day: "S",
        fullDay: "Saturday",
        date: "Oct 10",
        minutes: 35,
        calories: 330,
        accuracy: 91,
        workoutName: "HIIT Sprint Conditioning",
        isRest: false,
        barHeight: 38,
      },
      {
        day: "S",
        fullDay: "Sunday",
        date: "Oct 11",
        minutes: 0,
        calories: 0,
        accuracy: 0,
        workoutName: "Weekly Reset",
        isRest: true,
        barHeight: 18,
      },
    ],
  },
  BEST_WEEK: {
    dateRange: "SEP 21 — SEP 27, 2026",
    totalXp: 2900,
    days: [
      {
        day: "M",
        fullDay: "Monday",
        date: "Sep 21",
        minutes: 60,
        calories: 580,
        accuracy: 96,
        workoutName: "Heavy Push Max Overload",
        isRest: false,
        barHeight: 72,
      },
      {
        day: "T",
        fullDay: "Tuesday",
        date: "Sep 22",
        minutes: 55,
        calories: 520,
        accuracy: 95,
        workoutName: "Heavy Deadlift & Pull",
        isRest: false,
        barHeight: 65,
      },
      {
        day: "W",
        fullDay: "Wednesday",
        date: "Sep 23",
        minutes: 50,
        calories: 480,
        accuracy: 94,
        workoutName: "Legs Barbell Matrix",
        isRest: false,
        barHeight: 58,
      },
      {
        day: "T",
        fullDay: "Thursday",
        date: "Sep 24",
        minutes: 50,
        calories: 490,
        accuracy: 95,
        workoutName: "Shoulders Hypertrophy",
        isRest: false,
        barHeight: 58,
      },
      {
        day: "F",
        fullDay: "Friday",
        date: "Sep 25",
        minutes: 0,
        calories: 0,
        accuracy: 0,
        workoutName: "Hydro Recovery",
        isRest: true,
        barHeight: 18,
      },
      {
        day: "S",
        fullDay: "Saturday",
        date: "Sep 26",
        minutes: 65,
        calories: 610,
        accuracy: 97,
        workoutName: "Apex Competition Protocol",
        isRest: false,
        barHeight: 82,
      },
      {
        day: "S",
        fullDay: "Sunday",
        date: "Sep 27",
        minutes: 40,
        calories: 360,
        accuracy: 93,
        workoutName: "Recovery Flow & Mobility",
        isRest: false,
        barHeight: 45,
      },
    ],
  },
};

export default function WeeklyProgressScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<WeekTab>("THIS_WEEK");
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(3); // Thursday default

  const currentWeek = WEEK_DATA[activeTab];
  const selectedDay = currentWeek.days[selectedDayIndex] || currentWeek.days[3];

  const triggerHaptic = (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
  ) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(style).catch(() => {});
    }
  };

  const handleTabChange = (tab: WeekTab) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    setSelectedDayIndex(3);
  };

  const handleDaySelect = (index: number) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDayIndex(index);
  };

  const handleShare = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `⚡ REPLOOT Weekly Report: ${currentWeek.dateRange} — 5 Workouts Completed, 3h 35m Training Time, 1,980 kcal burned with 93% AI accuracy score! #Reploot #TrainSmarter`,
        title: "Reploot Weekly Report",
      });
    } catch {
      // dismissed
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <StatusBar style="light" />

      {/* Unified WorkoutHeader with back button */}
      <WorkoutHeader
        transparent={true}
        showBackButton={true}
        onPressBack={() => {
          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
          router.canGoBack() ? router.back() : router.replace("/(tabs)/home");
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: Math.max(insets.bottom + 60, 80) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.maskedTitleWrapper}>
            <View style={styles.maskedTitleView}>
              <View style={styles.maskWrapper}>
                <Text style={[styles.mainTitle, { color: "#F6F8FF" }]} numberOfLines={1}>
                  WEEKLY REPORT
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.titleDateRow}>
            <Calendar size={13} color={ACCENT} style={{ marginRight: 6 }} />
            <Text style={styles.subtitle}>{currentWeek.dateRange}</Text>
          </View>
        </View>

        {/* Week Switcher Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.tabButton,
              activeTab === "THIS_WEEK" && styles.tabButtonActive,
            ]}
            onPress={() => handleTabChange("THIS_WEEK")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "THIS_WEEK" && styles.tabTextActive,
              ]}
            >
              THIS WEEK
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.tabButton,
              activeTab === "PREV_WEEK" && styles.tabButtonActive,
            ]}
            onPress={() => handleTabChange("PREV_WEEK")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "PREV_WEEK" && styles.tabTextActive,
              ]}
            >
              PREV WEEK
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.tabButton,
              activeTab === "BEST_WEEK" && styles.tabButtonActive,
            ]}
            onPress={() => handleTabChange("BEST_WEEK")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "BEST_WEEK" && styles.tabTextActive,
              ]}
            >
              BEST WEEK
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Athlete Status & XP Card */}
        <View style={styles.card}>
          <ProfileCardBackground />
          <View style={styles.headerRow}>
            {/* Level 42 Box */}
            <View style={styles.heroStatCol}>
              <View style={styles.heroIcon}>
                <Star size={15} color={ACCENT} strokeWidth={2.4} />
              </View>
              <Text style={styles.streakNumber}>42</Text>
              <Text style={styles.streakLabel}>LEVEL</Text>
            </View>

            {/* Middle Divider */}
            <View style={styles.verticalDivider} />

            {/* Streak Box */}
            <View style={styles.heroStatCol}>
              <View style={styles.heroIcon}>
                <Zap size={15} color={ACCENT} strokeWidth={2.4} />
              </View>
              <Text style={styles.streakNumber}>12</Text>
              <Text style={styles.streakLabel}>DAY STREAK</Text>
            </View>

            {/* Middle Divider */}
            <View style={styles.verticalDivider} />

            {/* Weekly XP Badge */}
            <View style={styles.heroStatCol}>
              <View style={styles.heroIcon}>
                <TrendingUp size={15} color={ACCENT} strokeWidth={2.4} />
              </View>
              <Text style={styles.streakNumber}>+{currentWeek.totalXp}</Text>
              <Text style={styles.streakLabel}>XP GAINED</Text>
            </View>
          </View>

          {/* XP Progress Bar to next level */}
          <View style={styles.progressBarTrack}>
            <LinearGradient
              colors={["#6366F1", "#4F9DFB", "#38BDF8"]}
              style={[styles.progressBarFill, { width: "82%" }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <View style={styles.xpRow}>
            <Text style={styles.xpText}>2,450 / 3,000 XP</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Sparkles size={11} color={ACCENT} />
              <Text style={styles.xpTargetText}>550 XP to LVL 43</Text>
            </View>
          </View>
        </View>

        {/* 4 Core Weekly Metrics - Unified Instrument Card */}
        <View style={[styles.card, styles.metricsUnifiedCard]}>
          <ProfileCardBackground />
          <View style={styles.metricsRow}>
            {/* Workouts */}
            <View style={styles.metricCell}>
              <View style={styles.metricCellHeader}>
                <Dumbbell size={14} color={ACCENT} strokeWidth={2.3} />
                <Text style={styles.metricLabel}>WORKOUTS</Text>
              </View>
              <Text style={styles.metricValue}>5 / 5</Text>
              <Text style={styles.metricSub}>100% target</Text>
            </View>

            <View style={styles.metricVerticalDivider} />

            {/* Time Duration */}
            <View style={styles.metricCell}>
              <View style={styles.metricCellHeader}>
                <Clock size={14} color={ACCENT} strokeWidth={2.3} />
                <Text style={styles.metricLabel}>DURATION</Text>
              </View>
              <Text style={styles.metricValue}>3h 35m</Text>
              <Text style={styles.metricSub}>43m avg</Text>
            </View>
          </View>

          <View style={styles.metricHorizontalDivider} />

          <View style={styles.metricsRow}>
            {/* Calories */}
            <View style={styles.metricCell}>
              <View style={styles.metricCellHeader}>
                <Flame size={14} color={ACCENT} strokeWidth={2.3} />
                <Text style={styles.metricLabel}>ACTIVE BURN</Text>
              </View>
              <Text style={styles.metricValue}>1,980</Text>
              <Text style={styles.metricSub}>kcal</Text>
            </View>

            <View style={styles.metricVerticalDivider} />

            {/* Accuracy Score */}
            <View style={styles.metricCell}>
              <View style={styles.metricCellHeader}>
                <Activity size={14} color={ACCENT} strokeWidth={2.3} />
                <Text style={styles.metricLabel}>ACCURACY</Text>
              </View>
              <Text style={styles.metricValue}>93%</Text>
              <Text style={styles.metricSub}>Optimal form</Text>
            </View>
          </View>
        </View>

        {/* 7-Day Activity & Training Load Chart */}
        <View style={styles.card}>
          <ProfileCardBackground />
          <View style={styles.cardHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconContainer}>
                <Activity size={14} color={ACCENT} />
              </View>
              <Text style={styles.cardTitle}>DAILY TRAINING LOAD</Text>
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>MINUTES</Text>
            </View>
          </View>

          {/* Interactive Bar Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartBars}>
              {currentWeek.days.map((item, idx) => {
                const isSelected = selectedDayIndex === idx;
                const isCurrentActive = idx === 3; // Thursday

                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.75}
                    style={styles.barWrap}
                    onPress={() => handleDaySelect(idx)}
                  >
                    <Text style={[styles.barMinutesText, isSelected && styles.barMinutesTextActive]}>
                      {item.isRest ? "REST" : `${item.minutes}m`}
                    </Text>

                    <View
                      style={[
                        styles.barBackground,
                        isSelected && styles.barSelectedOutline,
                      ]}
                    >
                      {item.isRest ? (
                        <View style={[styles.bar, styles.barRest]} />
                      ) : isSelected || isCurrentActive ? (
                        <LinearGradient
                          colors={["#7DD3FC", "#0EA5E9"]}
                          style={[styles.bar, { height: item.barHeight }]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                        />
                      ) : (
                        <LinearGradient
                          colors={["rgba(125,211,252,0.55)", "rgba(56,189,248,0.25)"]}
                          style={[styles.bar, { height: item.barHeight }]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                        />
                      )}
                    </View>

                    <View
                      style={[
                        styles.dayLabelCircle,
                        isSelected && styles.dayLabelCircleActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayLabel,
                          isSelected && styles.dayLabelActive,
                        ]}
                      >
                        {item.day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Selected Day Breakdown Card */}
          <View style={styles.selectedDayCard}>
            <View style={styles.selectedDayHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.selectedDayTitle}>
                  {selectedDay.fullDay} • {selectedDay.date}
                </Text>
                <Text style={styles.selectedDayWorkout} numberOfLines={1}>
                  {selectedDay.workoutName}
                </Text>
              </View>
              {selectedDay.isRest ? (
                <View style={styles.restBadge}>
                  <Text style={styles.restBadgeText}>REST</Text>
                </View>
              ) : (
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreBadgeText}>
                    {selectedDay.accuracy}% FORM
                  </Text>
                </View>
              )}
            </View>

            {!selectedDay.isRest && (
              <View style={styles.selectedDayStatsRow}>
                <View style={styles.selectedDayStatItem}>
                  <Clock size={12} color={ACCENT_SOFT} />
                  <Text style={styles.selectedDayStatText}>
                    {selectedDay.minutes}m
                  </Text>
                </View>
                <View style={styles.selectedDayStatItem}>
                  <Flame size={12} color={ACCENT_SOFT} />
                  <Text style={styles.selectedDayStatText}>
                    {selectedDay.calories} kcal
                  </Text>
                </View>
                <View style={styles.selectedDayStatItem}>
                  <CheckCircle2 size={12} color={ACCENT_SOFT} />
                  <Text style={styles.selectedDayStatText}>Done</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Volume & Muscle Split Breakdown */}
        <View style={styles.card}>
          <ProfileCardBackground />
          <View style={styles.cardHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconContainer}>
                <Dumbbell size={14} color={ACCENT} />
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>
                VOLUME & SPLIT
              </Text>
            </View>
            <View style={styles.tonnageBadge}>
              <TrendingUp
                size={12}
                color={ACCENT_SOFT}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.tonnageBadgeText}>+12% LOAD</Text>
            </View>
          </View>

          <View style={styles.tonnageSummaryRow}>
            <View>
              <Text style={styles.tonnageLabel}>TOTAL VOLUME</Text>
              <Text style={styles.tonnageValue}>
                14,850 <Text style={styles.tonnageUnit}>KG</Text>
              </Text>
            </View>
            <Text style={styles.tonnageSubDelta}>+1,650 kg vs last week</Text>
          </View>

          {/* Muscle distribution progress bars */}
          <View style={styles.muscleList}>
            {/* Back & Pull */}
            <View style={styles.muscleItem}>
              <View style={styles.muscleHeader}>
                <Text style={styles.muscleName}>Back & Biceps</Text>
                <Text style={styles.musclePercent}>38%</Text>
              </View>
              <View style={styles.muscleTrack}>
                <LinearGradient
                  colors={["#7DD3FC", "#38BDF8"]}
                  style={[styles.muscleFill, { width: "38%" }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>

            {/* Chest & Push */}
            <View style={styles.muscleItem}>
              <View style={styles.muscleHeader}>
                <Text style={styles.muscleName}>Chest & Triceps</Text>
                <Text style={styles.musclePercent}>32%</Text>
              </View>
              <View style={styles.muscleTrack}>
                <LinearGradient
                  colors={["rgba(125,211,252,0.8)", "rgba(56,189,248,0.8)"]}
                  style={[styles.muscleFill, { width: "32%" }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>

            {/* Legs & Core */}
            <View style={styles.muscleItem}>
              <View style={styles.muscleHeader}>
                <Text style={styles.muscleName}>Legs & Core</Text>
                <Text style={styles.musclePercent}>30%</Text>
              </View>
              <View style={styles.muscleTrack}>
                <LinearGradient
                  colors={["rgba(125,211,252,0.55)", "rgba(56,189,248,0.55)"]}
                  style={[styles.muscleFill, { width: "30%" }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Reploot AI Coach Weekly Insights */}
        <View style={styles.card}>
          <ProfileCardBackground />
          <View style={styles.cardHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconContainer}>
                <Sparkles size={14} color={ACCENT} />
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>
                FORM REVIEW
              </Text>
            </View>
            <View style={styles.aiPill}>
              <Text style={styles.aiPillText}>OPTIMAL</Text>
            </View>
          </View>

          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <View style={styles.insightDot}>
                <CheckCircle2 size={14} color={ACCENT} strokeWidth={2.4} />
              </View>
              <Text style={styles.insightText}>
                <Text style={styles.insightHighlight}>Squat Depth: </Text>
                +14% depth consistency with stable vertical bar path.
              </Text>
            </View>

            <View style={styles.insightItem}>
              <View style={styles.insightDot}>
                <CheckCircle2 size={14} color={ACCENT} strokeWidth={2.4} />
              </View>
              <Text style={styles.insightText}>
                <Text style={styles.insightHighlight}>Peak Power: </Text>
                95% sustained output preserved through rest protocol.
              </Text>
            </View>

            <View style={styles.insightItem}>
              <View style={styles.insightDot}>
                <CheckCircle2 size={14} color={ACCENT} strokeWidth={2.4} />
              </View>
              <Text style={styles.insightText}>
                <Text style={styles.insightHighlight}>Bar Path: </Text>
                Calibrated arm trajectory on heavy incline pressing.
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Milestone Badges */}
        <View style={styles.card}>
          <ProfileCardBackground />
          <View style={styles.cardHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconContainer}>
                <Award size={14} color={ACCENT} />
              </View>
              <Text style={styles.cardTitle}>MILESTONES UNLOCKED</Text>
            </View>
            <Text style={styles.badgesCount}>3 BADGES</Text>
          </View>

          <View style={styles.badgesRow}>
            <View style={styles.badgeCard}>
              <View style={styles.badgeIconWrapper}>
                <Target size={18} color={ACCENT} strokeWidth={2.3} />
              </View>
              <Text
                style={styles.badgeTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Consistency
              </Text>
              <Text style={styles.badgeSub}>5/5 Routines</Text>
            </View>

            <View style={styles.badgeCard}>
              <View style={styles.badgeIconWrapper}>
                <TrendingUp size={18} color={ACCENT} strokeWidth={2.3} />
              </View>
              <Text
                style={styles.badgeTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Volume Spike
              </Text>
              <Text style={styles.badgeSub}>+12% Load</Text>
            </View>

            <View style={styles.badgeCard}>
              <View style={styles.badgeIconWrapper}>
                <ShieldCheckIcon />
              </View>
              <Text
                style={styles.badgeTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Rest Protocol
              </Text>
              <Text style={styles.badgeSub}>Optimal Reset</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons: Share Report & Start Workout */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.shareBtn}
            onPress={handleShare}
          >
            <Share2 size={16} color={ACCENT_SOFT} strokeWidth={2.3} />
            <Text style={styles.shareBtnText}>SHARE REPORT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.workoutBtn}
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/workouts");
            }}
          >
            <LinearGradient
              colors={BUTTON_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.workoutBtnGradient}
            >
              <LinearGradient
                pointerEvents="none"
                colors={SHEEN}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.workoutBtnSheen}
              />
              <Dumbbell size={16} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.workoutBtnText}>TRAIN NEXT</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function ShieldCheckIcon() {
  return <CheckCircle2 size={18} color={ACCENT} strokeWidth={2.3} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#060810",
  },
  scrollContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 4,
  },
  titleSection: {
    marginTop: 4,
    marginBottom: 14,
  },
  maskedTitleWrapper: {
    height: 44,
    width: "100%",
  },
  maskedTitleView: {
    flex: 1,
    width: "100%",
  },
  maskWrapper: {
    backgroundColor: "transparent",
    flex: 1,
    justifyContent: "center",
  },
  mainTitle: {
    ...typography.pageTitle,
    color: "#FFFFFF",
  },
  titleDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  subtitle: {
    color: "#38EDD8",
    fontSize: clampFontSize(11),
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 6,
    padding: 4,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.14)",
  },
  tabButton: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabButtonActive: {
    backgroundColor: "rgba(56,189,248,0.16)",
    borderColor: "rgba(56,189,248,0.5)",
  },
  tabText: {
    ...typography.buttonSmall,
    color: "#8B9AB0",
    letterSpacing: 0.6,
  },
  tabTextActive: {
    color: "#F8FAFC",
  },
  card: {
    backgroundColor: "#111A25",
    borderRadius: 24,
    padding: isSmallDevice ? 16 : 18,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.18)",
    marginBottom: 14,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  verticalDivider: {
    width: 1,
    marginVertical: 6,
    backgroundColor: "rgba(148,163,184,0.14)",
  },
  heroStatCol: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  streakNumber: {
    ...typography.metric,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    color: "#F8FAFC",
    fontVariant: ["tabular-nums"],
  },
  streakLabel: {
    ...typography.overline,
    color: "#8B9AB0",
  },
  xpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  xpText: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: "#F1F5F9",
    fontVariant: ["tabular-nums"],
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
  xpTargetText: {
    ...typography.caption,
    fontWeight: "600",
    color: "#7DD3FC",
  },
  metricsUnifiedCard: {
    padding: 0,
  },
  metricsRow: {
    flexDirection: "row",
  },
  metricCell: {
    flex: 1,
    padding: isSmallDevice ? 14 : 16,
    gap: 4,
  },
  metricCellHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  metricLabel: {
    ...typography.overline,
    color: "#8B9AB0",
  },
  metricValue: {
    ...typography.metric,
    color: "#F8FAFC",
    fontVariant: ["tabular-nums"],
  },
  metricSub: {
    ...typography.caption,
    color: "#64748B",
  },
  metricVerticalDivider: {
    width: 1,
    backgroundColor: "rgba(148,163,184,0.12)",
  },
  metricHorizontalDivider: {
    height: 1,
    backgroundColor: "rgba(148,163,184,0.12)",
  },
  tonnageSubDelta: {
    ...typography.caption,
    fontWeight: "600",
    color: "#7DD3FC",
    flexShrink: 1,
    textAlign: "right",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  headerTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  cardTitle: {
    ...typography.sectionTitle,
    color: "#E5EEF8",
    flexShrink: 1,
  },
  chartLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#38BDF8",
  },
  legendText: {
    ...typography.overline,
    color: "#8B9AB0",
  },
  chartContainer: {
    height: 145,
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 2,
  },
  barWrap: {
    alignItems: "center",
    gap: 6,
  },
  barMinutesText: {
    ...typography.overline,
    color: "#64748B",
  },
  barBackground: {
    width: 36,
    height: 92,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 3,
    borderWidth: 1,
    borderColor: "transparent",
  },
  barSelectedOutline: {
    borderColor: "rgba(56,189,248,0.6)",
    backgroundColor: "rgba(56,189,248,0.08)",
  },
  bar: {
    width: "100%",
    borderRadius: 8,
  },
  barRest: {
    height: 10,
    backgroundColor: "rgba(148, 163, 184, 0.2)",
  },
  dayLabelCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  dayLabelCircleActive: {
    backgroundColor: "#0EA5E9",
  },
  dayLabel: {
    ...typography.overline,
    color: "#8B9AB0",
  },
  dayLabelActive: {
    color: "#FFFFFF",
  },
  selectedDayCard: {
    padding: 14,
    gap: 10,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  selectedDayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedDayTitle: {
    ...typography.overline,
    color: "#8B9AB0",
    marginBottom: 2,
  },
  selectedDayWorkout: {
    ...typography.cardTitle,
    color: "#F8FAFC",
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.12)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
  },
  scoreBadgeText: {
    ...typography.badge,
    color: "#7DD3FC",
  },
  restBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.10)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.25)",
  },
  restBadgeText: {
    ...typography.badge,
    color: "#94A3B8",
  },
  selectedDayStatsRow: {
    flexDirection: "row",
    gap: 16,
  },
  selectedDayStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  selectedDayStatText: {
    ...typography.caption,
    fontWeight: "600",
    color: "#CBD5E1",
  },
  tonnageSummaryRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 18,
  },
  tonnageLabel: {
    ...typography.overline,
    color: "#8B9AB0",
    marginBottom: 2,
  },
  tonnageValue: {
    ...typography.metricLarge,
    fontSize: 28,
    lineHeight: 32,
    color: "#F8FAFC",
    fontVariant: ["tabular-nums"],
  },
  tonnageUnit: {
    ...typography.metricUnit,
    color: "#8B9AB0",
  },
  tonnageBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  tonnageBadgeText: {
    ...typography.badge,
    color: "#7DD3FC",
  },
  muscleList: {
    gap: 14,
  },
  muscleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  muscleName: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: "#CBD5E1",
  },
  musclePercent: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: "#F8FAFC",
    fontVariant: ["tabular-nums"],
  },
  muscleTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  muscleFill: {
    height: "100%",
    borderRadius: 4,
  },
  aiPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  aiPillText: {
    ...typography.badge,
    color: "#7DD3FC",
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  insightDot: {
    marginTop: 2,
  },
  insightText: {
    ...typography.bodySmall,
    color: "#A8B5C7",
    flex: 1,
  },
  insightHighlight: {
    fontWeight: "700",
    color: "#F1F5F9",
  },
  badgesCount: {
    ...typography.badge,
    color: "#7DD3FC",
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
  },
  badgeCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  badgeIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
  },
  badgeTitle: {
    ...typography.caption,
    fontWeight: "700",
    color: "#F1F5F9",
    textAlign: "center",
  },
  badgeSub: {
    ...typography.caption,
    color: "#64748B",
    textAlign: "center",
  },
  bottomButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  shareBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(56,189,248,0.08)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  shareBtnText: {
    ...typography.buttonSmall,
    color: "#7DD3FC",
    letterSpacing: 0.8,
  },
  workoutBtn: {
    flex: 1,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#0EA5E9",
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {},
      default: { boxShadow: "0px 8px 20px rgba(14,165,233,0.30)" },
    }),
  },
  workoutBtnGradient: {
    height: 50,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  workoutBtnText: {
    ...typography.buttonSmall,
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },
  heroIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  barMinutesTextActive: {
    color: "#7DD3FC",
  },
  muscleItem: {
    gap: 7,
  },
  workoutBtnSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
});
