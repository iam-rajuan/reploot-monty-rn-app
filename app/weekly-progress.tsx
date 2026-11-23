import { WorkoutHeader } from "@/features/workouts";
import MaskedView from "@react-native-masked-view/masked-view";
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
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Line as SvgLine } from "react-native-svg";
import {
  HORIZONTAL_PADDING,
  clampFontSize,
  isSmallDevice,
} from "@/shared/utils/responsive";

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
        workoutName: "Legs & Core Kinetic Squats",
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
        message: `⚡ KINETQX Weekly Report: ${currentWeek.dateRange} — 5 Workouts Completed, 3h 35m Training Time, 1,980 kcal burned with 93% AI accuracy score! #Kinetqx #TrainSmarter`,
        title: "Kinetqx Weekly Report",
      });
    } catch {
      // dismissed
    }
  };

  return (
    <View style={styles.screen}>
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
        {/* Title Section with Masked Gradient Title */}
        <View style={styles.titleSection}>
          <View style={styles.maskedTitleWrapper}>
            <MaskedView
              style={styles.maskedTitleView}
              maskElement={
                <View style={styles.maskWrapper}>
                  <Text style={styles.mainTitle} numberOfLines={1}>
                    WEEKLY REPORT
                  </Text>
                </View>
              }
            >
              <LinearGradient
                colors={["#00f2fe", "#4facfe"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              />
            </MaskedView>
          </View>
          <Text style={styles.subtitle}>
            Kinetic telemetry, training load & AI biomechanical analysis
          </Text>
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

        {/* Date Range Badge */}
        <View style={styles.dateBadgeRow}>
          <Calendar size={13} color="#38EDD8" style={{ marginRight: 6 }} />
          <Text style={styles.dateBadgeText}>{currentWeek.dateRange}</Text>
        </View>

        {/* Hero Athlete Status & XP Card (matching WeeklyProgressCard) */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            {/* Level 42 Box */}
            <View style={{ alignItems: "center" }}>
              <View style={styles.streakTopRow}>
                <Star size={26} color="#38EDD8" strokeWidth={2.5} />
                <Text style={[styles.streakNumber, { color: "#38EDD8" }]}>
                  42
                </Text>
              </View>
              <View style={styles.streakBottomRow}>
                <Text style={styles.streakLabel}>ELITE</Text>
                <Text style={styles.streakLabel}>TIER</Text>
              </View>
            </View>

            {/* Middle Divider */}
            <View style={styles.verticalDivider} />

            {/* Streak Box */}
            <View style={styles.streakContainer}>
              <View style={styles.streakTopRow}>
                <Zap size={26} color="#38EDD8" strokeWidth={2.5} />
                <Text style={styles.streakNumber}>12</Text>
              </View>
              <View style={styles.streakBottomRow}>
                <Text style={styles.streakLabel}>DAY</Text>
                <Text style={styles.streakLabel}>STREAK</Text>
              </View>
            </View>

            {/* Middle Divider */}
            <View style={styles.verticalDivider} />

            {/* Weekly XP Badge */}
            <View style={{ alignItems: "center" }}>
              <View style={styles.streakTopRow}>
                <TrendingUp size={24} color="#00f2fe" strokeWidth={2.5} />
                <Text style={[styles.streakNumber, { color: "#00f2fe" }]}>
                  +{currentWeek.totalXp}
                </Text>
              </View>
              <View style={styles.streakBottomRow}>
                <Text style={styles.streakLabel}>WEEKLY</Text>
                <Text style={styles.streakLabel}>XP GAIN</Text>
              </View>
            </View>
          </View>

          {/* XP Progress Bar to next level */}
          <View style={styles.xpRow}>
            <Text style={styles.xpText}>2,450 XP (LVL 42)</Text>
            <Text style={styles.xpText}>3,000 XP (LVL 43)</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <LinearGradient
              colors={["#707BFF", "#5260FF", "#38EDD8"]}
              style={[styles.progressBarFill, { width: "82%" }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>

          {/* Target Progress Callout */}
          <View style={styles.xpTargetRow}>
            <Sparkles size={13} color="#38EDD8" style={{ marginRight: 6 }} />
            <Text style={styles.xpTargetText}>
              550 XP remaining to unlock APEX TIER LEVEL 43
            </Text>
          </View>
        </View>

        {/* 4 Core Weekly Metrics Grid */}
        <View style={styles.statsGrid}>
          {/* Workouts */}
          <View style={[styles.statBox, styles.statBoxBlue]}>
            <View style={styles.statTopRow}>
              <View
                style={[
                  styles.statIconBadge,
                  { backgroundColor: "rgba(56, 189, 248, 0.14)" },
                ]}
              >
                <Dumbbell size={17} color="#38BDF8" strokeWidth={2.2} />
              </View>
              <View style={styles.statBadgePill}>
                <Text style={[styles.statBadgePillText, { color: "#38BDF8" }]}>
                  100% TARGET
                </Text>
              </View>
            </View>
            <Text style={styles.statLabel}>WORKOUTS</Text>
            <Text style={styles.statValue}>5 / 5</Text>
            <Text style={styles.statSub}>Full compliance</Text>
          </View>

          {/* Time Duration */}
          <View style={[styles.statBox, styles.statBoxIndigo]}>
            <View style={styles.statTopRow}>
              <View
                style={[
                  styles.statIconBadge,
                  { backgroundColor: "rgba(129, 140, 248, 0.14)" },
                ]}
              >
                <Clock size={17} color="#818CF8" strokeWidth={2.2} />
              </View>
              <View style={styles.statBadgePill}>
                <Text style={[styles.statBadgePillText, { color: "#818CF8" }]}>
                  AVG 43M/SESS
                </Text>
              </View>
            </View>
            <Text style={styles.statLabel}>DURATION</Text>
            <Text style={styles.statValue}>3h 35m</Text>
            <Text style={styles.statSub}>Total time under tension</Text>
          </View>

          {/* Calories */}
          <View style={[styles.statBox, styles.statBoxOrange]}>
            <View style={styles.statTopRow}>
              <View
                style={[
                  styles.statIconBadge,
                  { backgroundColor: "rgba(251, 146, 60, 0.14)" },
                ]}
              >
                <Flame size={17} color="#FB923C" strokeWidth={2.2} />
              </View>
              <View style={styles.statBadgePill}>
                <Text style={[styles.statBadgePillText, { color: "#FB923C" }]}>
                  BURNED
                </Text>
              </View>
            </View>
            <Text style={styles.statLabel}>CALORIES</Text>
            <Text style={styles.statValue}>1,980</Text>
            <Text style={styles.statSub}>Active energy expenditure</Text>
          </View>

          {/* Accuracy Score */}
          <View style={[styles.statBox, styles.statBoxMint]}>
            <View style={styles.statTopRow}>
              <View
                style={[
                  styles.statIconBadge,
                  { backgroundColor: "rgba(56, 237, 216, 0.14)" },
                ]}
              >
                <Activity size={17} color="#38EDD8" strokeWidth={2.2} />
              </View>
              <View style={styles.statBadgePill}>
                <Text style={[styles.statBadgePillText, { color: "#38EDD8" }]}>
                  APEX
                </Text>
              </View>
            </View>
            <Text style={styles.statLabel}>AI ACCURACY</Text>
            <Text style={styles.statValue}>93%</Text>
            <Text style={styles.statSub}>Biomechanical precision</Text>
          </View>
        </View>

        {/* 7-Day Activity & Training Load Chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconContainer}>
                <Activity size={14} color="#38EDD8" />
              </View>
              <Text style={styles.cardTitle}>DAILY TRAINING LOAD</Text>
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>ACTIVE MINUTES</Text>
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
                    <Text style={styles.barMinutesText}>
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
                      ) : isCurrentActive ? (
                        <LinearGradient
                          colors={["#00f2fe", "#38EDD8"]}
                          style={[styles.bar, { height: item.barHeight }]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                        />
                      ) : (
                        <LinearGradient
                          colors={["#6FA5F6", "#5260FF"]}
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
              <View>
                <Text style={styles.selectedDayTitle}>
                  {selectedDay.fullDay.toUpperCase()} • {selectedDay.date}
                </Text>
                <Text style={styles.selectedDayWorkout}>
                  {selectedDay.workoutName}
                </Text>
              </View>
              {selectedDay.isRest ? (
                <View style={styles.restBadge}>
                  <Text style={styles.restBadgeText}>RECOVERY</Text>
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
                  <Clock size={12} color="#94A3B8" />
                  <Text style={styles.selectedDayStatText}>
                    {selectedDay.minutes} MINS
                  </Text>
                </View>
                <View style={styles.selectedDayStatItem}>
                  <Flame size={12} color="#FB923C" />
                  <Text style={styles.selectedDayStatText}>
                    {selectedDay.calories} KCAL
                  </Text>
                </View>
                <View style={styles.selectedDayStatItem}>
                  <CheckCircle2 size={12} color="#38EDD8" />
                  <Text style={styles.selectedDayStatText}>COMPLETED</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Volume & Muscle Split Breakdown */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconContainer}>
                <Dumbbell size={14} color="#38BDF8" />
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>
                TONNAGE & MUSCLE SPLIT
              </Text>
            </View>
            <Text style={styles.tonnageHighlight}>+12% LOAD</Text>
          </View>

          <View style={styles.tonnageSummaryRow}>
            <View>
              <Text style={styles.tonnageLabel}>TOTAL VOLUME LIFTED</Text>
              <Text style={styles.tonnageValue}>
                14,850 <Text style={styles.tonnageUnit}>KG</Text>
              </Text>
            </View>
            <View style={styles.tonnageBadge}>
              <TrendingUp
                size={13}
                color="#2DD4BF"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.tonnageBadgeText}>
                +1,650 KG VS LAST WEEK
              </Text>
            </View>
          </View>

          {/* Muscle distribution progress bars */}
          <View style={styles.muscleList}>
            {/* Back & Pull */}
            <View style={styles.muscleItem}>
              <View style={styles.muscleHeader}>
                <Text style={styles.muscleName}>BACK & BICEPS (PULL)</Text>
                <Text style={styles.musclePercent}>38% (5,640 kg)</Text>
              </View>
              <View style={styles.muscleTrack}>
                <LinearGradient
                  colors={["#00f2fe", "#38EDD8"]}
                  style={[styles.muscleFill, { width: "38%" }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>

            {/* Chest & Push */}
            <View style={styles.muscleItem}>
              <View style={styles.muscleHeader}>
                <Text style={styles.muscleName}>CHEST & TRICEPS (PUSH)</Text>
                <Text style={styles.musclePercent}>32% (4,750 kg)</Text>
              </View>
              <View style={styles.muscleTrack}>
                <LinearGradient
                  colors={["#818CF8", "#5260FF"]}
                  style={[styles.muscleFill, { width: "32%" }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>

            {/* Legs & Core */}
            <View style={styles.muscleItem}>
              <View style={styles.muscleHeader}>
                <Text style={styles.muscleName}>LEGS & POSTERIOR CHAIN</Text>
                <Text style={styles.musclePercent}>30% (4,460 kg)</Text>
              </View>
              <View style={styles.muscleTrack}>
                <LinearGradient
                  colors={["#FB923C", "#F97316"]}
                  style={[styles.muscleFill, { width: "30%" }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Kinetic AI Coach Weekly Insights */}
        <View style={[styles.card, styles.aiCardBorder]}>
          <View style={styles.cardHeader}>
            <View style={styles.headerTitleRow}>
              <View
                style={[
                  styles.headerIconContainer,
                  { backgroundColor: "rgba(56, 189, 248, 0.15)" },
                ]}
              >
                <Sparkles size={14} color="#38BDF8" />
              </View>
              <Text style={[styles.cardTitle, { color: "#38BDF8" }]}>
                KINETIC AI BIOMECHANICAL REVIEW
              </Text>
            </View>
            <View style={styles.aiPill}>
              <Text style={styles.aiPillText}>OPTIMAL</Text>
            </View>
          </View>

          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>
                Squat depth consistency improved by{" "}
                <Text style={styles.insightHighlight}>+14%</Text> during heavy
                sets, maintaining vertical spinal alignment.
              </Text>
            </View>

            <View style={styles.insightItem}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>
                Optimal neuromuscular recovery: Friday rest day preserved{" "}
                <Text style={styles.insightHighlight}>95% power output</Text> on
                Saturday functional flow.
              </Text>
            </View>

            <View style={styles.insightItem}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>
                Form Alert: Minor right elbow flare noted on incline dumbbell
                bench press set 3. Kinetic HUD calibrated bar path.
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Milestone Badges */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconContainer}>
                <Award size={14} color="#38EDD8" />
              </View>
              <Text style={styles.cardTitle}>MILESTONES UNLOCKED</Text>
            </View>
            <Text style={styles.badgesCount}>3 BADGES</Text>
          </View>

          <View style={styles.badgesRow}>
            <View style={styles.badgeCard}>
              <View style={styles.badgeIconWrapper}>
                <Target size={20} color="#38EDD8" />
              </View>
              <Text
                style={styles.badgeTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                CONSISTENCY
              </Text>
              <Text style={styles.badgeSub}>5/5 Routines</Text>
            </View>

            <View style={styles.badgeCard}>
              <View style={styles.badgeIconWrapper}>
                <TrendingUp size={20} color="#00f2fe" />
              </View>
              <Text
                style={styles.badgeTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                VOLUME SPIKE
              </Text>
              <Text style={styles.badgeSub}>+12% Tonnage</Text>
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
                REST WARRIOR
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
            <Share2 size={16} color="#38EDD8" style={{ marginRight: 8 }} />
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
              colors={["#00f2fe", "#4facfe"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.workoutBtnGradient}
            >
              <Dumbbell size={16} color="#090A10" style={{ marginRight: 8 }} />
              <Text style={styles.workoutBtnText}>TRAIN NEXT</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function ShieldCheckIcon() {
  return <CheckCircle2 size={20} color="#818CF8" />;
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
  gradient: {
    flex: 1,
  },
  mainTitle: {
    color: "#FFFFFF",
    fontSize: clampFontSize(28),
    lineHeight: 34,
    fontWeight: "900",
    fontStyle: "italic",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  subtitle: {
    color: "#8E9BAE",
    fontSize: clampFontSize(12),
    lineHeight: 18,
    fontFamily: Platform.select({ android: "sans-serif", ios: "System" }),
    fontWeight: "500",
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(12, 18, 32, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(104, 123, 255, 0.22)",
    borderRadius: 18,
    padding: 4,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  tabButtonActive: {
    backgroundColor: "#0284C7",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: {
    color: "#8E9BAE",
    fontSize: clampFontSize(11),
    fontWeight: "800",
    letterSpacing: 0.8,
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  dateBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "rgba(56, 237, 216, 0.07)",
    borderWidth: 1,
    borderColor: "rgba(56, 237, 216, 0.22)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
  },
  dateBadgeText: {
    color: "#38EDD8",
    fontSize: clampFontSize(11),
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: "rgba(13, 19, 33, 0.82)",
    borderRadius: 22,
    padding: isSmallDevice ? 16 : 20,
    borderWidth: 1,
    borderColor: "rgba(104, 123, 255, 0.22)",
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  aiCardBorder: {
    borderColor: "rgba(56, 189, 248, 0.35)",
    backgroundColor: "rgba(12, 20, 38, 0.85)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  verticalDivider: {
    width: 1,
    height: 42,
    backgroundColor: "rgba(104, 123, 255, 0.2)",
  },
  streakContainer: {
    alignItems: "center",
  },
  streakTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  streakNumber: {
    color: "#FFFFFF",
    fontSize: clampFontSize(28),
    fontWeight: "900",
    lineHeight: 32,
    letterSpacing: -0.5,
    fontFamily: "JetBrainsMono_700Bold",
  },
  streakBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakLabel: {
    color: "#8E9BAE",
    fontSize: clampFontSize(9),
    fontWeight: "800",
    letterSpacing: 1.2,
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
  },
  xpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  xpText: {
    color: "#CBD5E1",
    fontSize: clampFontSize(11),
    fontWeight: "700",
    letterSpacing: 0.5,
    fontFamily: "JetBrainsMono_700Bold",
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 999,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 8,
    borderRadius: 999,
  },
  xpTargetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56, 237, 216, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(56, 237, 216, 0.2)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  xpTargetText: {
    color: "#38EDD8",
    fontSize: clampFontSize(11),
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginBottom: 16,
  },
  statBox: {
    width: "48.2%",
    backgroundColor: "rgba(13, 19, 33, 0.85)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(104, 123, 255, 0.2)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  statBoxBlue: {
    borderColor: "rgba(56, 189, 248, 0.28)",
  },
  statBoxIndigo: {
    borderColor: "rgba(129, 140, 248, 0.28)",
  },
  statBoxOrange: {
    borderColor: "rgba(251, 146, 60, 0.28)",
  },
  statBoxMint: {
    borderColor: "rgba(56, 237, 216, 0.28)",
  },
  statTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statBadgePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  statBadgePillText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
  },
  statLabel: {
    color: "#8E9BAE",
    fontSize: clampFontSize(11),
    fontWeight: "800",
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: clampFontSize(24),
    fontWeight: "900",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: -0.5,
    marginBottom: 3,
  },
  statSub: {
    color: "#64748B",
    fontSize: clampFontSize(11),
    fontFamily: Platform.select({ android: "sans-serif", ios: "System" }),
    fontWeight: "500",
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  headerIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "rgba(56, 237, 216, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: clampFontSize(12),
    fontWeight: "800",
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
    letterSpacing: 1,
  },
  chartLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#38EDD8",
  },
  legendText: {
    color: "#8E9BAE",
    fontSize: clampFontSize(9),
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
    letterSpacing: 0.8,
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
    color: "#8E9BAE",
    fontSize: clampFontSize(10),
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
  },
  barBackground: {
    width: 36,
    height: 92,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 10,
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 3,
  },
  barSelectedOutline: {
    borderWidth: 1.5,
    borderColor: "#38EDD8",
    backgroundColor: "rgba(56, 237, 216, 0.08)",
  },
  bar: {
    width: "100%",
    borderRadius: 7,
  },
  barRest: {
    height: 14,
    backgroundColor: "rgba(148, 163, 184, 0.25)",
  },
  dayLabelCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  dayLabelCircleActive: {
    backgroundColor: "#0284C7",
  },
  dayLabel: {
    color: "#8E9BAE",
    fontSize: clampFontSize(11),
    fontWeight: "800",
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
  },
  dayLabelActive: {
    color: "#FFFFFF",
  },
  selectedDayCard: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(56, 237, 216, 0.2)",
  },
  selectedDayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  selectedDayTitle: {
    color: "#38EDD8",
    fontSize: clampFontSize(11),
    fontWeight: "800",
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
    letterSpacing: 1,
    marginBottom: 2,
  },
  selectedDayWorkout: {
    color: "#FFFFFF",
    fontSize: clampFontSize(14),
    fontWeight: "700",
    fontFamily: Platform.select({
      android: "sans-serif-medium",
      ios: "System",
    }),
    maxWidth: "72%",
  },
  scoreBadge: {
    backgroundColor: "rgba(56, 237, 216, 0.15)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(56, 237, 216, 0.35)",
  },
  scoreBadgeText: {
    color: "#38EDD8",
    fontSize: clampFontSize(10),
    fontWeight: "800",
    fontFamily: "JetBrainsMono_700Bold",
  },
  restBadge: {
    backgroundColor: "rgba(148, 163, 184, 0.15)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.3)",
  },
  restBadgeText: {
    color: "#94A3B8",
    fontSize: clampFontSize(10),
    fontWeight: "800",
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
  },
  selectedDayStatsRow: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  selectedDayStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  selectedDayStatText: {
    color: "#CBD5E1",
    fontSize: clampFontSize(10),
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
  },
  tonnageHighlight: {
    color: "#38EDD8",
    fontSize: clampFontSize(11),
    fontWeight: "800",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 1,
  },
  tonnageSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  tonnageLabel: {
    color: "#8E9BAE",
    fontSize: clampFontSize(10),
    fontWeight: "700",
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
    letterSpacing: 1,
    marginBottom: 4,
  },
  tonnageValue: {
    color: "#FFFFFF",
    fontSize: clampFontSize(26),
    fontWeight: "900",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: -0.5,
  },
  tonnageUnit: {
    color: "#38EDD8",
    fontSize: clampFontSize(14),
    fontWeight: "800",
  },
  tonnageBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(45, 212, 191, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.3)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tonnageBadgeText: {
    color: "#2DD4BF",
    fontSize: clampFontSize(10),
    fontWeight: "800",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 0.5,
  },
  muscleList: {
    gap: 12,
  },
  muscleItem: {},
  muscleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  muscleName: {
    color: "#CBD5E1",
    fontSize: clampFontSize(11),
    fontWeight: "700",
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
  },
  musclePercent: {
    color: "#8E9BAE",
    fontSize: clampFontSize(11),
    fontWeight: "800",
    fontFamily: "JetBrainsMono_700Bold",
  },
  muscleTrack: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 999,
    overflow: "hidden",
  },
  muscleFill: {
    height: 8,
    borderRadius: 999,
  },
  aiPill: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.35)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiPillText: {
    color: "#38BDF8",
    fontSize: clampFontSize(9),
    fontWeight: "800",
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
    letterSpacing: 0.8,
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#38BDF8",
    marginTop: 6,
  },
  insightText: {
    color: "#CBD5E1",
    fontSize: clampFontSize(12),
    lineHeight: 18,
    fontFamily: Platform.select({ android: "sans-serif", ios: "System" }),
    fontWeight: "500",
    flex: 1,
  },
  insightHighlight: {
    color: "#38EDD8",
    fontWeight: "800",
  },
  badgesCount: {
    color: "#8E9BAE",
    fontSize: clampFontSize(10),
    fontWeight: "800",
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
  },
  badgesRow: {
    flexDirection: "row",
    gap: 10,
  },
  badgeCard: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(104, 123, 255, 0.18)",
  },
  badgeIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeTitle: {
    color: "#FFFFFF",
    fontSize: clampFontSize(10),
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  badgeSub: {
    color: "#8E9BAE",
    fontSize: clampFontSize(9),
    fontFamily: Platform.select({ android: "sans-serif", ios: "System" }),
    fontWeight: "600",
    textAlign: "center",
  },
  bottomButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    marginBottom: 24,
  },
  shareBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "rgba(56, 237, 216, 0.4)",
    backgroundColor: "rgba(56, 237, 216, 0.08)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  shareBtnText: {
    color: "#38EDD8",
    fontSize: clampFontSize(12),
    fontWeight: "800",
    letterSpacing: 1,
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
  },
  workoutBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  workoutBtnGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  workoutBtnText: {
    color: "#050811",
    fontSize: clampFontSize(12),
    fontWeight: "900",
    letterSpacing: 1,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
  },
});
