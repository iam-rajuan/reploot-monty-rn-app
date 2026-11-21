import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  regenerateWorkout,
  removeExerciseFromWorkout,
  replaceExerciseInWorkout,
  setActiveWorkoutPathId,
  setSelectedWorkoutCategory,
} from "@/store/slices/workoutSlice";
import MaskedView from "@react-native-masked-view/masked-view";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check, Dumbbell, RefreshCw, Sparkles } from "lucide-react-native";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DynamicWorkoutPathDetail,
  WORKOUT_PATH_DETAILS_MAP,
  WorkoutExerciseItem,
} from "../data/workoutPathDetailData";
import { PushDayExerciseList } from "./PushDayExerciseCard";
import { PushDayHeroCard } from "./PushDayHeroCard";

export interface GenericWorkoutDetailScreenProps {
  workout?: DynamicWorkoutPathDetail;
  pathId?: string;
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
  onBack,
  onStartWorkout,
  onSelectExercise,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ pathId?: string; split?: string }>();

  // Local override when user taps category tabs
  const [selectedCategoryOverride, setSelectedCategoryOverride] =
    useState<string | null>(null);

  // Determine active category from local tab override, props, route params, or Redux state
  const reduxSelectedCategory = useAppSelector(
    (state) => state.workout?.selectedWorkoutCategory || "push"
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
    (state) => state.workout?.workoutsByPath || {}
  );
  const workout: DynamicWorkoutPathDetail =
    workoutsByPath[activePathId] ||
    propWorkout ||
    WORKOUT_PATH_DETAILS_MAP[activePathId] ||
    WORKOUT_PATH_DETAILS_MAP.push;

  const completedExerciseIds = useAppSelector(
    (state) => state.workout?.completedExerciseIds || []
  );
  const completedCount = workout.exercises.filter((ex) =>
    completedExerciseIds.includes(ex.id)
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
      })
    );
    showToast("EXERCISE REMOVED FROM ROUTINE");
  };

  // 2. REPLACE ONE EXERCISE: only that exercise changes, picking next appropriate mock exercise
  const handleReplaceExercise = (exerciseId: string) => {
    dispatch(
      replaceExerciseInWorkout({
        pathId: activePathId,
        exerciseId,
      })
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

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <CustomHeader
        transparent={true}
        showBackButton
        onPressBack={handleBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 160 },
        ]}
      >
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
                <Pressable
                  key={tab.id}
                  onPress={() => handleTabChange(tab.id)}
                  style={[
                    styles.categoryPill,
                    isActive && styles.categoryPillActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={tab.label}
                >
                  <Dumbbell
                    size={12}
                    color={isActive ? "#00f2fe" : "#64748B"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.categoryPillText,
                      isActive && styles.categoryPillTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Title Section with AI-Recommended Badge and Masked Gradient Title */}
        <View style={styles.titleSection}>
          <View style={styles.aiBadgeRow}>
            <Sparkles size={13} color="#44EAC3" />
            <Text style={styles.categoryBadge}>
              AI-RECOMMENDED DAILY WORKOUT
            </Text>
          </View>

          <View style={styles.maskedTitleWrapper}>
            <MaskedView
              style={styles.maskedTitleView}
              maskElement={
                <View style={styles.maskWrapper}>
                  <Text
                    style={styles.mainTitle}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {workout.title}
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
            {workout.subtitle} • {workout.exercises.length} AI-recommended exercises
          </Text>
        </View>

        {/* Hero Card with Stats */}
        <PushDayHeroCard
          image={workout.heroImage}
          xpText={workout.xpText}
          durationText={workout.durationText}
          caloriesText={workout.caloriesText}
        />

        {/* Section Header for Exercise List */}
        <View style={styles.exerciseHeaderRow}>
          <View style={styles.exerciseHeaderLeft}>
            <Text style={styles.exerciseHeaderTitle}>EXERCISES</Text>
            <Text style={styles.exerciseHint}>
              Tap 🔄 to swap • 🗑️ to remove
            </Text>
          </View>

          {completedCount > 0 ? (
            <View
              style={[styles.exerciseCountBadge, styles.completedCountBadge]}
            >
              <Text style={styles.completedCountText}>
                {completedCount}/{workout.exercises.length} COMPLETED
              </Text>
            </View>
          ) : (
            <View style={styles.exerciseCountBadge}>
              <Text style={styles.exerciseCountText}>
                {workout.exercises.length} TARGETS
              </Text>
            </View>
          )}
        </View>

        {/* Exercise List with Individual Management Actions */}
        <PushDayExerciseList
          exercises={workout.exercises}
          onExercisePress={handleExercisePress}
          onReplaceExercise={handleReplaceExercise}
          onDeleteExercise={handleDeleteExercise}
        />
      </ScrollView>

      {/* Floating HUD Feedback Toast */}
      {toastMessage ? (
        <View style={styles.hudToast}>
          <Check size={14} color="#00f2fe" style={{ marginRight: 6 }} />
          <Text style={styles.hudToastText}>{toastMessage}</Text>
        </View>
      ) : null}

      {/* Bottom Action CTAs: Regenerate Workout immediately before Start AI Workout */}
      <View
        style={[
          styles.bottomCtaContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 6 },
        ]}
      >
        <View style={styles.ctaButtonsCol}>
          {/* 1. REGENERATE WORKOUT BUTTON (immediately before Start AI Workout) */}
          <Pressable
            onPress={handleRegenerate}
            style={({ pressed }) => [
              styles.regenerateBtn,
              pressed && styles.regenerateBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Regenerate Workout"
          >
            <RefreshCw
              size={15}
              color="#38BDF8"
              strokeWidth={2.4}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.regenerateBtnText}>REGENERATE WORKOUT</Text>
          </Pressable>

          {/* 2. START AI WORKOUT BUTTON */}
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.startWorkoutBtn,
              pressed && styles.startWorkoutBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Start AI Workout"
          >
            <LinearGradient
              colors={["#00f2fe", "#4facfe"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.startWorkoutGradient}
            >
              <Sparkles
                size={18}
                color="#050811"
                fill="#050811"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.startWorkoutText}>START AI WORKOUT</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#070A11",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  categoryTabsWrapper: {
    marginBottom: 16,
  },
  categoryTabsScroll: {
    flexDirection: "row",
    gap: 8,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  categoryPillActive: {
    backgroundColor: "rgba(0, 242, 254, 0.1)",
    borderColor: "#00f2fe",
  },
  categoryPillText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "800",
    fontFamily: "monospace",
    letterSpacing: 0.8,
  },
  categoryPillTextActive: {
    color: "#00f2fe",
  },
  titleSection: {
    marginBottom: 18,
    marginTop: 2,
  },
  aiBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  categoryBadge: {
    color: "#44EAC3",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    fontFamily: "monospace",
    textTransform: "uppercase",
  },
  maskedTitleWrapper: {
    height: 44,
    width: "100%",
    marginBottom: 4,
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
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    fontFamily: "monospace",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  exerciseHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  exerciseHeaderLeft: {
    flex: 1,
  },
  exerciseHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  exerciseHint: {
    color: "#64748B",
    fontSize: 10,
    fontFamily: "monospace",
    marginTop: 2,
  },
  exerciseCountBadge: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exerciseCountText: {
    color: "#38BDF8",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  completedCountBadge: {
    backgroundColor: "rgba(56, 237, 216, 0.15)",
    borderColor: "rgba(56, 237, 216, 0.45)",
  },
  completedCountText: {
    color: "#38EDD8",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  hudToast: {
    position: "absolute",
    top: 70,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 20, 32, 0.94)",
    borderWidth: 1,
    borderColor: "rgba(0, 242, 254, 0.35)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    zIndex: 99,
    shadowColor: "#00f2fe",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  hudToastText: {
    color: "#00f2fe",
    fontSize: 10.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  bottomCtaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    zIndex: 99,
    backgroundColor: "#070A11",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  ctaButtonsCol: {
    gap: 12,
  },
  regenerateBtn: {
    height: 48,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111622",
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.55)",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  regenerateBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
    backgroundColor: "rgba(56, 189, 248, 0.2)",
  },
  regenerateBtnText: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "900",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  startWorkoutBtn: {
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    shadowColor: "#00f2fe",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  startWorkoutBtnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  startWorkoutGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  startWorkoutText: {
    color: "#050811",
    fontSize: 14,
    fontWeight: "900",
    fontFamily: "monospace",
    letterSpacing: 1.2,
  },
});
