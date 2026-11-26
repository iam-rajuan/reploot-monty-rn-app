import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Flame,
  RotateCcw,
  Share2,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { WorkoutShareCard } from "./WorkoutShareCard";
import { ShareImageSheet } from "./ShareImageSheet";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/shared/components/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle as SvgCircle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";
import { WorkoutExerciseItem } from "../data/workoutPathDetailData";
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
const RING = 184;

export interface WorkoutSummaryScreenProps {
  score?: number;
  xpEarned?: number;
  accuracy?: number;
  completedExercisesCount?: number;
  totalExercisesCount?: number;
  durationFormatted?: string;
  caloriesBurned?: number;
  paceMps?: string;
  workoutTitle?: string;
  workoutSubtitle?: string;
  description?: string;
  dateFormatted?: string;
  exercises?: WorkoutExerciseItem[];
  onBackToHome?: () => void;
  onRepeatWorkout?: () => void;
}

const DEFAULT_EXERCISE_ITEMS = [
  {
    id: "bench-press",
    index: "01",
    title: "BENCH PRESS (BARBELL)",
    setsReps: "4 Sets • 10 Reps • 60 kg",
    acc: 96,
    image: require("../../../../assets/pushDay/pd4.png"),
  },
  {
    id: "overhead-press",
    index: "02",
    title: "OVERHEAD PRESS (DUMBBELL)",
    setsReps: "3 Sets • 12 Reps • 24 kg",
    acc: 98,
    image: require("../../../../assets/pushDay/pd3.png"),
  },
  {
    id: "incline-fly",
    index: "03",
    title: "INCLINE CHEST FLY",
    setsReps: "3 Sets • 12 Reps • 16 kg",
    acc: 95,
    image: require("../../../../assets/pushDay/pd2.png"),
  },
  {
    id: "incline-barbell-press",
    index: "04",
    title: "INCLINE BENCH PRESS",
    setsReps: "4 Sets • 10 Reps • 55 kg",
    acc: 98,
    image: require("../../../../assets/pushDay/pd4.png"),
  },
  {
    id: "dips-chest-triceps",
    index: "05",
    title: "PARALLEL BAR DIPS",
    setsReps: "3 Sets • 15 Reps • Bodyweight",
    acc: 97,
    image: require("../../../../assets/workoutLibraryDetails/wld1.png"),
  },
  {
    id: "cable-lateral-raise",
    index: "06",
    title: "CABLE LATERAL RAISES",
    setsReps: "4 Sets • 15 Reps • 12.5 kg",
    acc: 99,
    image: require("../../../../assets/pushDay/pd3.png"),
  },
  {
    id: "tricep-rope-pushdown",
    index: "07",
    title: "TRICEP ROPE PUSHDOWN",
    setsReps: "3 Sets • 15 Reps • 25 kg",
    acc: 98,
    image: require("../../../../assets/workoutLibraryDetails/wld2.png"),
  },
  {
    id: "skull-crushers",
    index: "08",
    title: "LYING SKULL CRUSHERS",
    setsReps: "3 Sets • 12 Reps • 30 kg",
    acc: 96,
    image: require("../../../../assets/workoutLibraryDetails/wld3.png"),
  },
];

export const WorkoutSummaryScreen: React.FC<WorkoutSummaryScreenProps> = ({
  score = 992,
  xpEarned = 850,
  accuracy = 98.4,
  completedExercisesCount = 8,
  totalExercisesCount = 8,
  durationFormatted = "45:12",
  caloriesBurned = 560,
  paceMps = "1.25 m/s",
  workoutTitle = "PUSH DAY PROTOCOL",
  workoutSubtitle = "Chest, Shoulders & Triceps Focus",
  description,
  dateFormatted,
  exercises,
  onBackToHome,
  onRepeatWorkout,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showAllExercises, setShowAllExercises] = useState(false);

  const coachNote =
    description ||
    (accuracy >= 95
      ? `Clean form — ${accuracy}% accuracy across ${completedExercisesCount} exercises. Add a little weight next time.`
      : `Solid session. Slow the tempo next time to push accuracy past ${Math.ceil(accuracy)}%.`);

  const strokeWidth = 12;
  const ringRadius = (RING - strokeWidth) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  // Sweep dynamically proportional to score (e.g. 992/1000 = ~0.89 sweep)
  const progressPercent = Math.min(Math.max((score / 1000) * 0.9, 0.1), 0.96);
  const strokeDashoffset = circumference * (1 - progressPercent);

  // Formatted date string
  const resolvedDate = useMemo(() => {
    if (dateFormatted) return dateFormatted;
    try {
      const now = new Date();
      return now
        .toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
        .toUpperCase();
    } catch {
      return "OCTOBER 19, 2026";
    }
  }, [dateFormatted]);

  const handleHome = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (onBackToHome) {
      onBackToHome();
    } else {
      router.replace("/(tabs)/home" as any);
    }
  };

  const handleRepeat = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    if (onRepeatWorkout) {
      onRepeatWorkout();
    } else {
      router.replace("/workouts");
    }
  };

  // Share sheet: designed 4:5 card shared as an image.
  const [shareOpen, setShareOpen] = useState(false);
  const shareText = `Just finished ${workoutTitle} — score ${score}, ${accuracy}% form, ${caloriesBurned} kcal in ${durationFormatted}. Tracked with REPLOOT.`;

  const handleShare = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setShareOpen(true);
  };

  // Resolved list of completed exercises
  const exerciseList = useMemo(() => {
    if (exercises && exercises.length > 0) {
      return exercises.map((item, idx) => ({
        id: item.id || `ex-${idx}`,
        index: item.index || (idx < 9 ? `0${idx + 1}` : `${idx + 1}`),
        title: item.title.replace(/\n/g, " "),
        setsReps: item.subtitle,
        acc: Math.min(95 + (idx % 4), 99),
        image: item.image,
      }));
    }
    return DEFAULT_EXERCISE_ITEMS;
  }, [exercises]);

  const displayedExercises = showAllExercises
    ? exerciseList
    : exerciseList.slice(0, 4);

  const stats = [
    { key: "acc", Icon: Target, value: `${accuracy}%`, label: "ACCURACY" },
    {
      key: "done",
      Icon: CheckCircle2,
      value: `${completedExercisesCount}/${totalExercisesCount}`,
      label: "EXERCISES",
    },
    { key: "kcal", Icon: Flame, value: `${caloriesBurned}`, label: "KCAL" },
    { key: "time", Icon: Clock, value: durationFormatted, label: "MINUTES" },
  ];

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <StatusBar style="light" />

      <CustomHeader
        transparent={true}
        showBackButton={true}
        onPressBack={handleHome}
        showSearch={false}
        showNotifications={false}
        showAvatar={false}
        rightContent={
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.shareIconButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share workout summary"
          >
            <Share2 size={17} color={ACCENT_SOFT} strokeWidth={2.4} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 24, 40) },
        ]}
      >
        <View style={styles.titleSection}>
          <Text style={styles.categoryBadge}>WORKOUT COMPLETE</Text>
          <Text style={styles.mainTitle} numberOfLines={1} adjustsFontSizeToFit>
            SUMMARY
          </Text>
          <View style={styles.dateRow}>
            <Calendar size={13} color="#7C8BA1" strokeWidth={2.2} />
            <Text style={styles.dateText}>{resolvedDate}</Text>
          </View>
        </View>

        {/* Score */}
        <View style={styles.card}>
          <LinearGradient
            colors={SURFACE_WASH}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.dialContainer}>
            <Svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`}>
              <Defs>
                <SvgGradient id="scoreRing" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#7DD3FC" />
                  <Stop offset="0.5" stopColor="#38BDF8" />
                  <Stop offset="1" stopColor="#6366F1" />
                </SvgGradient>
              </Defs>
              <SvgCircle
                cx={RING / 2}
                cy={RING / 2}
                r={ringRadius}
                stroke="rgba(148,163,184,0.14)"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <SvgCircle
                cx={RING / 2}
                cy={RING / 2}
                r={ringRadius}
                stroke="url(#scoreRing)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
              />
            </Svg>
            <View style={styles.dialInnerContent}>
              <Text style={styles.dialLabel}>SCORE</Text>
              <Text style={styles.scoreNumberLarge}>{score}</Text>
              <View style={styles.xpPill}>
                <Zap size={11} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.xpPillText}>+{xpEarned} XP</Text>
              </View>
            </View>
          </View>
          <View style={styles.tierRow}>
            <Trophy size={14} color={ACCENT} strokeWidth={2.4} />
            <Text style={styles.tierText}>Elite athlete</Text>
            <Text style={styles.tierDot}>·</Text>
            <Text style={styles.workoutName} numberOfLines={1}>
              {workoutTitle}
            </Text>
          </View>
        </View>

        {/* Key stats */}
        <View style={styles.statsGrid}>
          {stats.map(({ key, Icon, value, label }) => (
            <View key={key} style={styles.statTile}>
              <View style={styles.iconChip}>
                <Icon size={14} color={ACCENT} strokeWidth={2.4} />
              </View>
              <View style={styles.statCopy}>
                <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                  {value}
                </Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Coach note */}
        <View style={styles.coachCard}>
          <View style={styles.iconChip}>
            <Sparkles size={14} color={ACCENT} strokeWidth={2.4} />
          </View>
          <Text style={styles.coachText}>
            <Text style={styles.coachBold}>Coach note · </Text>
            {coachNote}
          </Text>
        </View>

        {/* Exercises */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionLeft}>
            <View style={styles.iconChip}>
              <Dumbbell size={14} color={ACCENT} strokeWidth={2.4} />
            </View>
            <Text style={styles.sectionLabel}>EXERCISES</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>
              {completedExercisesCount}/{totalExercisesCount} DONE
            </Text>
          </View>
        </View>

        <View style={styles.listCard}>
          {displayedExercises.map((item, idx) => (
            <View
              key={item.id}
              style={[styles.exerciseRow, idx > 0 && styles.exerciseRowDivider]}
            >
              <View style={styles.exerciseThumbBox}>
                {item.image ? (
                  <Image
                    source={item.image}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                  />
                ) : (
                  <Dumbbell size={16} color={ACCENT} />
                )}
              </View>
              <View style={styles.exerciseInfoCol}>
                <Text style={styles.exerciseTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.exerciseSubtitle} numberOfLines={1}>
                  {item.setsReps}
                </Text>
              </View>
              <View style={styles.accPill}>
                <Check size={10} color={ACCENT_SOFT} strokeWidth={3.4} />
                <Text style={styles.accPillText}>{item.acc}%</Text>
              </View>
            </View>
          ))}

          {exerciseList.length > 4 ? (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.toggleMoreBtn}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                    () => {},
                  );
                }
                setShowAllExercises((prev) => !prev);
              }}
              accessibilityRole="button"
              accessibilityLabel={
                showAllExercises ? "Show fewer exercises" : "Show all exercises"
              }
            >
              <Text style={styles.toggleMoreText}>
                {showAllExercises ? "SHOW LESS" : `SHOW ALL ${exerciseList.length}`}
              </Text>
              {showAllExercises ? (
                <ChevronUp size={14} color={ACCENT_SOFT} strokeWidth={2.6} />
              ) : (
                <ChevronDown size={14} color={ACCENT_SOFT} strokeWidth={2.6} />
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Actions */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.primaryBtn}
          onPress={handleHome}
          accessibilityRole="button"
          accessibilityLabel="Return to home screen"
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
          <Text style={styles.primaryBtnText}>BACK TO HOME</Text>
          <View style={styles.primaryTrail}>
            <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.6} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.secondaryBtn}
          onPress={handleRepeat}
          accessibilityRole="button"
          accessibilityLabel="Repeat this workout"
        >
          <RotateCcw size={14} color={ACCENT_SOFT} strokeWidth={2.4} />
          <Text style={styles.secondaryBtnText}>REPEAT WORKOUT</Text>
        </TouchableOpacity>
      </ScrollView>

      <ShareImageSheet
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Your workout card"
        shareText={shareText}
        filename="reploot-workout"
        renderCard={(ref, theme) => (
          <WorkoutShareCard
            ref={ref}
            theme={theme}
            workoutTitle={workoutTitle}
            workoutSubtitle={workoutSubtitle}
            dateLabel={resolvedDate}
            score={score}
            xpEarned={xpEarned}
            accuracy={accuracy}
            completed={completedExercisesCount}
            total={totalExercisesCount}
            calories={caloriesBurned}
            duration={durationFormatted}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#060810",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  shareIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
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
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    ...typography.caption,
    color: "#7C8BA1",
  },

  // Shared
  card: {
    backgroundColor: "#111A25",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
    overflow: "hidden",
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

  // Score
  dialContainer: {
    width: RING,
    height: RING,
    alignItems: "center",
    justifyContent: "center",
  },
  dialInnerContent: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  dialLabel: {
    ...typography.overline,
    color: "#7C8BA1",
  },
  scoreNumberLarge: {
    ...typography.metricHero,
    color: "#F8FAFC",
    textShadowColor: "rgba(56,189,248,0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  xpPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#0EA5E9",
  },
  xpPillText: {
    ...typography.badge,
    color: "#FFFFFF",
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "100%",
  },
  tierText: {
    ...typography.subtitle,
    fontSize: 13,
    lineHeight: 18,
    color: "#E2E8F0",
  },
  tierDot: {
    ...typography.subtitle,
    color: "#475569",
  },
  workoutName: {
    ...typography.caption,
    color: "#8B9AB0",
    flexShrink: 1,
  },

  // Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    marginBottom: 12,
  },
  statTile: {
    width: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
  },
  statCopy: {
    flex: 1,
    minWidth: 0,
  },
  statValue: {
    ...typography.metric,
    color: "#F8FAFC",
  },
  statLabel: {
    ...typography.overline,
    color: "#7C8BA1",
  },

  // Coach
  coachCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "rgba(56,189,248,0.07)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
    marginBottom: 22,
  },
  coachText: {
    ...typography.bodySmall,
    flex: 1,
    color: "#CBD5E1",
    paddingTop: 5,
  },
  coachBold: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: ACCENT_SOFT,
  },

  // Exercises
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  sectionLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionLabel: {
    ...typography.sectionTitle,
    color: "#E5EEF8",
  },
  listCard: {
    backgroundColor: "#111A25",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    paddingHorizontal: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  exerciseRowDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.10)",
  },
  exerciseThumbBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B111B",
  },
  exerciseInfoCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  exerciseTitle: {
    ...typography.cardTitle,
    fontSize: 13,
    lineHeight: 17,
    color: "#F8FAFC",
    textTransform: "uppercase",
  },
  exerciseSubtitle: {
    ...typography.caption,
    color: "#8B9AB0",
  },
  accPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
  },
  accPillText: {
    ...typography.badge,
    letterSpacing: 0.3,
    color: ACCENT_SOFT,
  },
  toggleMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.10)",
  },
  toggleMoreText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },

  // Buttons
  primaryBtn: {
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
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
  secondaryBtn: {
    height: 48,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(56,189,248,0.08)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  secondaryBtnText: {
    ...typography.button,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    color: ACCENT_SOFT,
  },

});
