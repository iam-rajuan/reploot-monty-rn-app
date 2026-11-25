import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  regenerateWorkout,
  removeExerciseFromWorkout,
  replaceExerciseInWorkout,
  reorderWorkoutExercises,
  setActiveWorkoutPathId,
  setSelectedWorkoutCategory,
} from "@/store/slices/workoutSlice";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, Check, Dumbbell, RefreshCw } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";
import { Text } from "@/shared/components/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DynamicWorkoutPathDetail,
  WORKOUT_PATH_DETAILS_MAP,
  WorkoutExerciseItem,
} from "../data/workoutPathDetailData";
import { PushDayExerciseList } from "./PushDayExerciseCard";
import { PushDayHeroCard } from "./PushDayHeroCard";
import { typography } from "@/theme/typography";

const ACCENT = "#38BDF8";
const ACCENT_SOFT = "#7DD3FC";
const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;

export interface GenericWorkoutDetailScreenProps {
  workout?: DynamicWorkoutPathDetail;
  pathId?: string;
  /** Gym and Home library entry points show the full 20-exercise catalog. */
  showFullExerciseLibrary?: boolean;
  onBack?: () => void;
  onStartWorkout?: () => void;
  onSelectExercise?: (exerciseId: string) => void;
}

const WORKOUT_SPLIT_TABS = [
  { id: "push", label: "PUSH DAY" },
  { id: "pull", label: "PULL DAY" },
  { id: "chest", label: "CHEST DAY" },
  { id: "upper", label: "UPPER BODY" },
  { id: "lower", label: "LOWER BODY" },
  { id: "fullbody", label: "FULL BODY" },
];

export const GenericWorkoutDetailScreen: React.FC<
  GenericWorkoutDetailScreenProps
> = ({
  workout: propWorkout,
  pathId: propPathId,
  showFullExerciseLibrary = false,
  onBack,
  onStartWorkout,
  onSelectExercise,
}) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 24);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{
    pathId?: string;
    split?: string;
    source?: string;
  }>();

  // Local override when user taps category tabs
  const [selectedCategoryOverride, setSelectedCategoryOverride] = useState<
    string | null
  >(null);

  // Determine active category from local tab override, props, route params, or Redux state
  const reduxSelectedCategory = useAppSelector(
    (state) => state.workout?.selectedWorkoutCategory || "push",
  );
  const activePathId = (
    selectedCategoryOverride ||
    propPathId ||
    params.pathId ||
    params.split ||
    propWorkout?.id ||
    reduxSelectedCategory ||
    "push"
  ).toLowerCase();

  // Read current workout from shared Redux store (preserves user modifications)
  const workoutsByPath = useAppSelector(
    (state) => state.workout?.workoutsByPath || {},
  );
  const workout: DynamicWorkoutPathDetail =
    workoutsByPath[activePathId] ||
    propWorkout ||
    WORKOUT_PATH_DETAILS_MAP[activePathId] ||
    WORKOUT_PATH_DETAILS_MAP.push;

  const completedExerciseIds = useAppSelector(
    (state) => state.workout?.completedExerciseIds || [],
  );
  const isMission = params.source === "mission";
  const shouldShowFullLibrary =
    showFullExerciseLibrary || !isMission;
  const visibleExercises = shouldShowFullLibrary
    ? workout.exercises
    : workout.exercises
        .filter((exercise) => exercise.isAiRecommended !== false)
        .slice(0, 8);
  const visibleCompletedCount = visibleExercises.filter((exercise) =>
    completedExerciseIds.includes(exercise.id),
  ).length;

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/workouts");
    }
  };

  const handleTabChange = (targetCategory: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setSelectedCategoryOverride(targetCategory);
    dispatch(setSelectedWorkoutCategory(targetCategory));
  };

  const handleStart = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    dispatch(setActiveWorkoutPathId(activePathId));
    if (onStartWorkout) {
      onStartWorkout();
    } else {
      router.push({
        pathname: "/workouts/ai-session" as any,
        params: {
          pathId: activePathId,
          exerciseIds: visibleExercises
            .slice(0, 8)
            .map((exercise) => exercise.id)
            .join(","),
        },
      });
    }
  };

  const handleExercisePress = (exercise: WorkoutExerciseItem) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (onSelectExercise) {
      onSelectExercise(exercise.id);
    } else {
      router.push({
        pathname: "/workouts/exercise-detail" as any,
        params: {
          id: exercise.id,
          title: exercise.title.replace(/\n/g, " "),
          pathId: activePathId,
        },
      });
    }
  };

  // 1. DELETE ONE EXERCISE: only that exercise is removed, list updates immediately
  const handleDeleteExercise = (exerciseId: string) => {
    dispatch(
      removeExerciseFromWorkout({
        pathId: activePathId,
        exerciseId,
      }),
    );
    showToast("EXERCISE REMOVED FROM ROUTINE");
  };

  const handleReorderExercises = (orderedExerciseIds: string[]) => {
    dispatch(
      reorderWorkoutExercises({
        pathId: activePathId,
        orderedExerciseIds,
      }),
    );
  };

  // 2. REPLACE ONE EXERCISE: only that exercise changes, picking next appropriate mock exercise
  const handleReplaceExercise = (exerciseId: string) => {
    dispatch(
      replaceExerciseInWorkout({
        pathId: activePathId,
        exerciseId,
      }),
    );
    showToast("EXERCISE REPLACED WITH ALTERNATIVE");
  };

  // 3. REGENERATE WORKOUT: replaces whole list with another AI recommendation, preserving category
  const handleRegenerate = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    dispatch(regenerateWorkout({ pathId: activePathId }));
    showToast(`${workout.title} REGENERATED (AI SET)`);
  };

  const workoutListHeader = useMemo(
    () => (
      <>
        {/* Workout Category Selector Pills */}
        <View style={styles.categoryTabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabsScroll}
          >
            {WORKOUT_SPLIT_TABS.map((tab) => {
              const isActive = tab.id === activePathId;
              return (
                <TouchableOpacity
                  key={tab.id}
                  activeOpacity={0.8}
                  onPress={() => handleTabChange(tab.id)}
                  style={[
                    styles.categoryPill,
                    isActive && styles.categoryPillActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={tab.label}
                >
                  <Dumbbell
                    size={12}
                    color={isActive ? ACCENT : "#64748B"}
                    strokeWidth={2.4}
                  />
                  <Text
                    style={[
                      styles.categoryPillText,
                      isActive && styles.categoryPillTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Title Section matching clean Figma design */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle} numberOfLines={1} adjustsFontSizeToFit>
            {workout.title}
          </Text>
          <Text style={styles.subtitle}>
            {visibleExercises.length} exercises · hold a card to reorder
          </Text>
        </View>

        {/* Hero Card with Stats */}
        <PushDayHeroCard
          image={workout.heroImage}
          xpText={workout.xpText}
          durationText={workout.durationText}
          caloriesText={workout.caloriesText}
        />

        {/* Completion Progress Pill (only shown when user has checked off exercises) */}
        {visibleCompletedCount > 0 ? (
          <View style={styles.completedHeaderRow}>
            <View style={styles.completedPill}>
              <Check size={12} color={ACCENT_SOFT} strokeWidth={3} />
              <Text style={styles.completedCountText}>
                {visibleCompletedCount} OF {visibleExercises.length} COMPLETED
              </Text>
            </View>
          </View>
        ) : null}
      </>
    ),
    [
      activePathId,
      workout.title,
      workout.heroImage,
      workout.xpText,
      workout.durationText,
      workout.caloriesText,
      visibleCompletedCount,
      visibleExercises.length,
    ],
  );

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <StatusBar style="light" />

      <CustomHeader
        transparent={true}
        showBackButton
        onPressBack={handleBack}
      />

      <PushDayExerciseList
        exercises={visibleExercises}
        showRecommendationSections={shouldShowFullLibrary}
        onExercisePress={handleExercisePress}
        onReplaceExercise={handleReplaceExercise}
        onDeleteExercise={handleDeleteExercise}
        onReorderExercises={handleReorderExercises}
        style={[
          styles.scrollContent,
          {
            paddingBottom: bottomInset + 180,
          },
        ]}
        ListHeaderComponent={workoutListHeader}
      />

      {/* Floating HUD Feedback Toast */}
      {toastMessage ? (
        <View style={styles.hudToast}>
          <View style={styles.hudToastIcon}>
            <Check size={11} color={ACCENT} strokeWidth={3} />
          </View>
          <Text style={styles.hudToastText}>{toastMessage}</Text>
        </View>
      ) : null}

      {/* Floating Bottom Action Dock: REGENERATE WORKOUT and START AI WORKOUT */}
      <View
        style={[
          styles.bottomCtaContainer,
          { paddingBottom: bottomInset + 8 },
        ]}
        pointerEvents="box-none"
      >
        {/* Soft fade gradient above the dock so scrolling cards dissolve seamlessly */}
        <LinearGradient
          colors={["rgba(6,8,16,0)", "rgba(6,8,16,0.96)"]}
          style={styles.fadeGradient}
          pointerEvents="none"
        />

        <View style={styles.ctaButtonsCol}>
          <TouchableOpacity
            onPress={handleRegenerate}
            activeOpacity={0.75}
            hitSlop={5}
            style={styles.secondaryBtn}
            accessibilityRole="button"
            accessibilityLabel="Regenerate Workout"
          >
            <RefreshCw size={14} color={ACCENT_SOFT} strokeWidth={2.4} />
            <Text style={styles.secondaryBtnText} numberOfLines={1}>
              REGENERATE WORKOUT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleStart}
            activeOpacity={0.85}
            hitSlop={5}
            style={styles.primaryBtn}
            accessibilityRole="button"
            accessibilityLabel="Start AI Workout"
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
            <Text style={styles.primaryBtnText} numberOfLines={1}>
              START AI WORKOUT
            </Text>
            <View style={styles.primaryTrail}>
              <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.6} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingTop: 8,
  },
  categoryTabsWrapper: {
    marginBottom: 18,
    marginHorizontal: -20,
  },
  categoryTabsScroll: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
  },
  categoryPill: {
    height: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
  },
  categoryPillActive: {
    backgroundColor: "rgba(56,189,248,0.12)",
    borderColor: "rgba(56,189,248,0.45)",
  },
  categoryPillText: {
    ...typography.badge,
    color: "#7C8BA1",
  },
  categoryPillTextActive: {
    color: ACCENT_SOFT,
  },
  titleSection: {
    marginTop: 2,
    marginBottom: 18,
    gap: 4,
  },
  mainTitle: {
    ...typography.pageTitle,
    color: "#F6F8FF",
  },
  subtitle: {
    ...typography.body,
    color: "#94A3B8",
  },
  completedHeaderRow: {
    marginBottom: 14,
    alignItems: "flex-start",
  },
  completedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  completedCountText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },
  hudToast: {
    position: "absolute",
    top: 70,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 6,
    paddingRight: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
    zIndex: 99,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  hudToastIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.14)",
  },
  hudToastText: {
    ...typography.badge,
    color: "#E2E8F0",
  },
  fadeGradient: {
    position: "absolute",
    top: -36,
    left: 0,
    right: 0,
    height: 36,
  },
  bottomCtaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    zIndex: 99,
    backgroundColor: "rgba(6,8,16,0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(56,189,248,0.12)",
  },
  ctaButtonsCol: {
    gap: 10,
    width: "100%",
    flexShrink: 0,
  },
  secondaryBtn: {
    height: 46,
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
  primaryBtn: {
    height: 50,
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
