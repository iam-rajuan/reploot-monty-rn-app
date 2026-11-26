import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  ArrowRight,
  Dumbbell,
  Flame,
  Minus,
  Pause,
  Play,
  Plus,
  ShieldCheck,
  Timer,
  TrendingUp,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import {
  REST_ACTION_EXTEND,
  REST_REMINDER_KIND,
  notificationPermissionService,
  notificationService,
} from "@/services/notifications/NotificationService";
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
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { typography } from "@/theme/typography";
import { WorkoutExerciseItem } from "../data/workoutPathDetailData";

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
const DEFAULT_REST_TARGET = 45;

export interface AiWorkoutLiveScreenProps {
  currentExercise: WorkoutExerciseItem;
  exerciseIndex: number;
  totalExercises: number;
  onNextExercise: () => void;
  onEndWorkout: () => void;
  onBack?: () => void;
}

export const AiWorkoutLiveScreen: React.FC<AiWorkoutLiveScreenProps> = ({
  currentExercise,
  exerciseIndex,
  totalExercises,
  onNextExercise,
  onEndWorkout,
  onBack,
}) => {
  const insets = useSafeAreaInsets();

  // Dynamic Workout Tracking State
  const [reps, setReps] = useState<number>(exerciseIndex === 0 ? 12 : 0);
  const [targetReps, setTargetReps] = useState<number>(15);
  const [accuracy, setAccuracy] = useState<number>(
    exerciseIndex === 0 ? 94 : 98,
  );
  const [restSec, setRestSec] = useState<number>(0);
  const [restTargetSec, setRestTargetSec] = useState<number>(DEFAULT_REST_TARGET);
  /** Bumped whenever a new rest window starts, so the reminder reschedules. */
  const [restCycle, setRestCycle] = useState(0);
  const [currentSet, setCurrentSet] = useState<number>(
    exerciseIndex === 0 ? 2 : 1,
  );
  const [totalSets, setTotalSets] = useState<number>(4);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // When exercise changes (e.g. clicking NEXT EXERCISE to redirect to Exercise 2)
  useEffect(() => {
    const matchReps = currentExercise.subtitle?.match(/(\d+)\s*(?:Reps|reps)/);
    const parsedTarget = matchReps ? parseInt(matchReps[1], 10) : 12;
    const matchSets = currentExercise.subtitle?.match(/(\d+)\s*(?:Sets|sets)/);
    const parsedSets = matchSets ? parseInt(matchSets[1], 10) : 4;

    setTargetReps(parsedTarget);
    setTotalSets(parsedSets);
    setCurrentSet(1);

    if (exerciseIndex === 0) {
      setReps(12);
      setAccuracy(94);
    } else {
      setReps(0);
      setAccuracy(98);
    }
    setRestSec(0);
    setRestCycle((cycle) => cycle + 1);
    setIsPaused(false);
  }, [currentExercise.id, exerciseIndex]);

  // Rest timer counts up from 00:00 and stops exactly at the target.
  // It is anchored to the clock, so it stays correct after the app was in
  // the background (JS intervals are throttled there).
  const restDone = restSec >= restTargetSec;
  const restSecRef = useRef(restSec);
  restSecRef.current = restSec;

  useEffect(() => {
    if (isPaused || restDone) return;
    const anchor = Date.now() - restSecRef.current * 1000;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - anchor) / 1000);
      setRestSec(Math.min(elapsed, restTargetSec));
    };
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [isPaused, restDone, restTargetSec, restCycle]);

  // In-app banner + haptic the moment rest ends while the screen is open.
  const [showRestBanner, setShowRestBanner] = useState(false);
  const wasDoneRef = useRef(false);
  useEffect(() => {
    if (restDone && !wasDoneRef.current && restSec > 0) {
      setShowRestBanner(true);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => {},
        );
      }
    }
    if (!restDone) setShowRestBanner(false);
    wasDoneRef.current = restDone;
  }, [restDone, restSec]);

  // System notification for when the app is in the background.
  const reminderIdRef = useRef<string | null>(null);
  const isLastExercise = exerciseIndex + 1 >= totalExercises;
  const nextUpText = isLastExercise
    ? "Last exercise — finish strong."
    : `Exercise ${exerciseIndex + 2} of ${totalExercises} is up next.`;

  useEffect(() => {
    notificationService.configureHandler().catch(() => {});
    notificationPermissionService
      .getPermission()
      .then((granted) => {
        if (!granted) notificationPermissionService.requestPermission();
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cancelReminder = () => {
      const id = reminderIdRef.current;
      reminderIdRef.current = null;
      if (id) notificationService.cancelScheduled(id).catch(() => {});
    };

    cancelReminder();
    const remaining = restTargetSec - restSecRef.current;
    if (!isPaused && remaining > 0) {
      notificationService
        .scheduleRestReminder({
          title: "⏱ Rest is over",
          subtitle: `${currentExercise.title.replace(/\n/g, " ")} · Set ${currentSet} of ${totalSets}`,
          body: `${nextUpText} Tap to jump back in.`,
          seconds: remaining,
        })
        .then((id) => {
          if (cancelled) {
            if (id) notificationService.cancelScheduled(id).catch(() => {});
          } else {
            reminderIdRef.current = id;
          }
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
      cancelReminder();
    };
  }, [
    isPaused,
    restTargetSec,
    restCycle,
    currentExercise.title,
    currentSet,
    totalSets,
    nextUpText,
  ]);

  const restartRest = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setRestSec(0);
    setRestCycle((cycle) => cycle + 1);
  };

  const extendRest = (seconds: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setShowRestBanner(false);
    setRestTargetSec((prev) => Math.min(300, prev + seconds));
  };

  // Notification buttons: "+30 sec rest" extends, "Start next" just opens the app.
  const extendRestRef = useRef(extendRest);
  extendRestRef.current = extendRest;
  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const content = response.notification.request.content;
      if (content.data?.kind !== REST_REMINDER_KIND) return;
      if (response.actionIdentifier === REST_ACTION_EXTEND) {
        extendRestRef.current(30);
      }
      notificationService
        .dismiss(response.notification.request.identifier)
        .catch(() => {});
    });
    return () => sub.remove();
  }, []);

  // Ring Gauge Calculations
  const radius = 36;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - accuracy / 100);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainingSec).padStart(2, "0")}`;
  };

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }
    onNextExercise();
  };

  const togglePause = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setIsPaused((prev) => !prev);
  };

  const adjustReps = (delta: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setReps((prev) => Math.max(0, Math.min(30, prev + delta)));
  };

  const adjustRestTarget = (delta: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setRestTargetSec((prev) => {
      const next = Math.max(15, Math.min(300, prev + delta));
      // Shortening below the elapsed time ends the rest right there.
      setRestSec((elapsed) => Math.min(elapsed, next));
      return next;
    });
  };

  const cleanExerciseTitle = currentExercise.title.replace(/\n/g, " ");
  const repsProgress = Math.min(100, Math.round((reps / targetReps) * 100));

  // Dynamic set breakdown
  const setsData = Array.from({ length: totalSets }, (_, i) => {
    const setNum = i + 1;
    const isCompleted = setNum < currentSet;
    const isCurrent = setNum === currentSet;
    const targetSetReps = targetReps;
    const setRepsLogged = isCompleted ? targetSetReps : isCurrent ? reps : "-";
    const weightKg = 60 + i * 2.5;
    const acc = isCompleted ? 96 - i : isCurrent ? accuracy : "-";
    return {
      setNum,
      isCompleted,
      isCurrent,
      reps: setRepsLogged,
      weightKg,
      acc,
    };
  });

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={[styles.topHeader, { paddingTop: Math.max(insets.top + 8, 20) }]}
      >
        {onBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.roundBtn}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back to exercise routine"
          >
            <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        ) : (
          <View style={styles.roundBtnSpacer} />
        )}

        <View style={styles.headerCenter}>
          <Text style={styles.headerKicker}>LIVE SESSION</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            EXERCISE TELEMETRY
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          style={[styles.roundBtn, styles.pauseBtn, isPaused && styles.pauseBtnActive]}
          onPress={togglePause}
          accessibilityRole="button"
          accessibilityLabel={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? (
            <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
          ) : (
            <Pause size={16} color={ACCENT_SOFT} strokeWidth={2.6} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 100 },
        ]}
      >
        {/* Current exercise */}
        <View style={styles.card}>
          <LinearGradient
            colors={SURFACE_WASH}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.heroRow}>
            <View style={styles.heroThumbWrap}>
              {currentExercise.image ? (
                <Image
                  source={currentExercise.image}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
              ) : null}
              <View style={styles.indexBadge}>
                <Text style={styles.indexBadgeText}>
                  {currentExercise.index || String(exerciseIndex + 1).padStart(2, "0")}
                </Text>
              </View>
            </View>

            <View style={styles.heroTextCol}>
              <View style={styles.heroStatusRow}>
                <View style={styles.statusPill}>
                  <View style={[styles.statusDot, isPaused && styles.statusDotPaused]} />
                  <Text style={styles.statusPillText}>
                    {isPaused ? "PAUSED" : "IN PROGRESS"}
                  </Text>
                </View>
                <Text style={styles.counterText}>
                  {exerciseIndex + 1}/{totalExercises}
                </Text>
              </View>
              <Text style={styles.exerciseNameText} numberOfLines={2}>
                {cleanExerciseTitle}
              </Text>
              <Text style={styles.exerciseSubtitleText} numberOfLines={1}>
                Set {currentSet} of {totalSets} · {currentExercise.subtitle}
              </Text>
            </View>
          </View>
          <View style={styles.exerciseSteps}>
            {Array.from({ length: totalExercises }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.exerciseStep,
                  i < exerciseIndex && styles.exerciseStepDone,
                  i === exerciseIndex && styles.exerciseStepActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Reps + Form */}
        <View style={styles.statsGridRow}>
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <View style={styles.iconChip}>
                <Dumbbell size={13} color={ACCENT} strokeWidth={2.4} />
              </View>
              <Text style={styles.statCardLabel}>REPS</Text>
            </View>

            <View style={styles.valueRow}>
              <Text style={styles.bigNumber}>{reps}</Text>
              <Text style={styles.unitText}>/ {targetReps}</Text>
            </View>

            <View style={styles.track}>
              <LinearGradient
                colors={["#6366F1", "#38BDF8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.trackFill, { width: `${repsProgress}%` }]}
              />
            </View>
            <Text style={styles.captionText}>{repsProgress}% of target</Text>

            <View style={styles.adjustRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.adjustBtn}
                onPress={() => adjustReps(-1)}
                accessibilityRole="button"
                accessibilityLabel="Decrease rep"
              >
                <Minus size={15} color={ACCENT_SOFT} strokeWidth={2.6} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.adjustBtn, styles.adjustBtnAdd]}
                onPress={() => adjustReps(1)}
                accessibilityRole="button"
                accessibilityLabel="Increase rep"
              >
                <LinearGradient
                  colors={BUTTON_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View>
                  <Plus size={15} color="#FFFFFF" strokeWidth={2.8} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <View style={styles.iconChip}>
                <ShieldCheck size={13} color={ACCENT} strokeWidth={2.4} />
              </View>
              <Text style={styles.statCardLabel}>FORM</Text>
            </View>

            <View style={styles.ringCenterContainer}>
              <Svg width="84" height="84" viewBox="0 0 84 84">
                <Defs>
                  <SvgGradient id="formRing" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#7DD3FC" />
                    <Stop offset="1" stopColor="#6366F1" />
                  </SvgGradient>
                </Defs>
                <SvgCircle
                  cx="42"
                  cy="42"
                  r={radius}
                  stroke="rgba(148,163,184,0.14)"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                <SvgCircle
                  cx="42"
                  cy="42"
                  r={radius}
                  stroke="url(#formRing)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  transform="rotate(-90 42 42)"
                />
              </Svg>
              <View style={styles.ringAbsoluteCenter}>
                <Text style={styles.ringValue}>{accuracy}%</Text>
              </View>
            </View>

            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {accuracy >= 90 ? "OPTIMAL" : "STEADY"}
              </Text>
            </View>
          </View>
        </View>

        {/* Rest + Energy */}
        <View style={styles.statsGridRow}>
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <View style={styles.iconChip}>
                <Timer size={13} color={ACCENT} strokeWidth={2.4} />
              </View>
              <Text style={styles.statCardLabel}>REST</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={restartRest}
              accessibilityRole="button"
              accessibilityLabel="Restart rest timer"
              accessibilityHint={`Rest stops at ${formatSeconds(restTargetSec)}`}
            >
              <Text style={[styles.bigNumber, restDone && styles.bigNumberDone]}>
                {formatSeconds(restSec)}
              </Text>
            </TouchableOpacity>
            <View style={styles.track}>
              <View
                style={[
                  styles.trackFillSolid,
                  { width: `${Math.min(100, (restSec / Math.max(1, restTargetSec)) * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.captionText}>
              {restDone ? "Done · tap to restart" : `Stops at ${formatSeconds(restTargetSec)}`}
            </Text>

            <View style={styles.adjustRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.chipBtn}
                onPress={() => adjustRestTarget(-15)}
                accessibilityRole="button"
                accessibilityLabel="Shorter rest target"
              >
                <Text style={styles.chipBtnText}>−15S</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.chipBtn}
                onPress={() => adjustRestTarget(15)}
                accessibilityRole="button"
                accessibilityLabel="Longer rest target"
              >
                <Text style={styles.chipBtnText}>+15S</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <View style={styles.iconChip}>
                <Flame size={13} color={ACCENT} strokeWidth={2.4} />
              </View>
              <Text style={styles.statCardLabel}>ENERGY</Text>
            </View>

            <View style={styles.valueRow}>
              <Text style={styles.bigNumber}>92</Text>
              <Text style={styles.unitText}>KCAL</Text>
            </View>
            <Text style={styles.captionText}>Estimated burn</Text>

            <View style={styles.volumeTile}>
              <TrendingUp size={13} color={ACCENT_SOFT} strokeWidth={2.4} />
              <View>
                <Text style={styles.volumeLabel}>VOLUME</Text>
                <Text style={styles.volumeValue}>720 kg</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Rest-over banner (designed in-app version of the notification) */}
      {showRestBanner ? (
        <Animated.View
          entering={Platform.OS === "web" ? undefined : FadeInUp.duration(220)}
          exiting={Platform.OS === "web" ? undefined : FadeOutUp.duration(180)}
          style={[styles.restBanner, { top: Math.max(insets.top + 8, 20) }]}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          <LinearGradient
            colors={["rgba(56,189,248,0.22)", "rgba(99,102,241,0.10)", "rgba(17,26,37,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.bannerTop}>
            <View style={styles.bannerIcon}>
              <LinearGradient
                colors={BUTTON_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View>
                <Timer size={18} color="#FFFFFF" strokeWidth={2.4} />
              </View>
            </View>
            <View style={styles.bannerCopy}>
              <View style={styles.bannerTitleRow}>
                <Text style={styles.bannerTitle}>Rest is over</Text>
                <Text style={styles.bannerMeta}>{formatSeconds(restTargetSec)}</Text>
              </View>
              <Text style={styles.bannerBody} numberOfLines={2}>
                {nextUpText}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowRestBanner(false)}
              style={styles.bannerClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
            >
              <X size={14} color="#94A3B8" strokeWidth={2.6} />
            </TouchableOpacity>
          </View>
          <View style={styles.bannerActions}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => extendRest(30)}
              style={styles.bannerGhostBtn}
              accessibilityRole="button"
              accessibilityLabel="Add 30 seconds of rest"
            >
              <Text style={styles.bannerGhostText}>+30S REST</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setShowRestBanner(false);
                handleNext();
              }}
              style={styles.bannerPrimaryBtn}
              accessibilityRole="button"
              accessibilityLabel={isLastExercise ? "Finish workout" : "Start next exercise"}
            >
              <LinearGradient
                colors={BUTTON_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.bannerPrimaryText}>
                {isLastExercise ? "FINISH" : "START NEXT"}
              </Text>
              <View>
                <ArrowRight size={13} color="#FFFFFF" strokeWidth={2.8} />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : null}

      {/* Bottom action */}
      <View
        style={[
          styles.bottomActionBar,
          { paddingBottom: Math.max(insets.bottom + 12, 24) },
        ]}
      >
        <LinearGradient
          colors={["rgba(6,8,16,0)", "rgba(6,8,16,0.96)"]}
          style={styles.bottomFade}
          pointerEvents="none"
        />
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.primaryBtn}
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={
            exerciseIndex + 1 >= totalExercises ? "Finish workout" : "Next exercise"
          }
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
          <Text style={styles.primaryBtnText}>
            {exerciseIndex + 1 >= totalExercises ? "FINISH WORKOUT" : "NEXT EXERCISE"}
          </Text>
          <View style={styles.primaryTrail}>
            <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.6} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#060810",
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  roundBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
  },
  roundBtnSpacer: {
    width: 42,
  },
  headerCenter: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },
  headerKicker: {
    ...typography.overline,
    color: ACCENT_SOFT,
  },
  headerTitle: {
    ...typography.pageTitleCompact,
    color: "#F6F8FF",
  },
  pauseBtn: {
    backgroundColor: "rgba(56,189,248,0.10)",
    borderColor: "rgba(56,189,248,0.35)",
  },
  pauseBtnActive: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },

  // Exercise card
  card: {
    backgroundColor: "#111A25",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    padding: 14,
    gap: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroThumbWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#0B111B",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
  },
  indexBadge: {
    position: "absolute",
    top: 5,
    left: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 999,
    backgroundColor: "rgba(6,8,16,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  indexBadgeText: {
    ...typography.badge,
    letterSpacing: 0.4,
    color: "#FFFFFF",
  },
  heroTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  heroStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.12)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  statusDotPaused: {
    backgroundColor: "#94A3B8",
  },
  statusPillText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },
  counterText: {
    ...typography.badge,
    color: "#7C8BA1",
  },
  exerciseNameText: {
    ...typography.cardTitle,
    lineHeight: 20,
    color: "#F8FAFC",
    textTransform: "uppercase",
  },
  exerciseSubtitleText: {
    ...typography.caption,
    color: "#8B9AB0",
  },
  exerciseSteps: {
    flexDirection: "row",
    gap: 4,
  },
  exerciseStep: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(148,163,184,0.18)",
  },
  exerciseStepDone: {
    backgroundColor: "rgba(56,189,248,0.5)",
  },
  exerciseStepActive: {
    backgroundColor: ACCENT,
  },

  // Stat cards
  statsGridRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    gap: 10,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconChip: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  statCardLabel: {
    ...typography.overline,
    color: "#94A3B8",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  bigNumber: {
    ...typography.metricLarge,
    color: "#F8FAFC",
  },
  bigNumberDone: {
    color: ACCENT_SOFT,
  },
  unitText: {
    ...typography.metricUnit,
    color: "#64748B",
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: "rgba(148,163,184,0.14)",
  },
  trackFill: {
    height: "100%",
    borderRadius: 3,
  },
  trackFillSolid: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  captionText: {
    ...typography.caption,
    color: "#8B9AB0",
    marginTop: -4,
  },
  adjustRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: "auto",
  },
  adjustBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.08)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.28)",
  },
  adjustBtnAdd: {
    borderWidth: 0,
  },
  chipBtn: {
    flex: 1,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.08)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.28)",
  },
  chipBtnText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },
  ringCenterContainer: {
    alignSelf: "center",
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
  },
  ringAbsoluteCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  ringValue: {
    ...typography.cardTitle,
    fontSize: 18,
    lineHeight: 22,
    color: "#F8FAFC",
  },
  pill: {
    alignSelf: "center",
    paddingHorizontal: 10,
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
  volumeTile: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "rgba(56,189,248,0.08)",
  },
  volumeLabel: {
    ...typography.microTag,
    color: "#7C8BA1",
  },
  volumeValue: {
    ...typography.badge,
    letterSpacing: 0.3,
    color: "#E2E8F0",
  },

  // Bottom
  bottomActionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "rgba(6,8,16,0.96)",
  },
  bottomFade: {
    position: "absolute",
    top: -28,
    left: 0,
    right: 0,
    height: 28,
  },
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

  // Rest-over banner
  restBanner: {
    position: "absolute",
    left: 14,
    right: 14,
    zIndex: 50,
    padding: 14,
    gap: 12,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.4)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
      },
      android: { elevation: 12 },
      web: { boxShadow: "0 14px 34px rgba(0,0,0,0.5)" } as any,
      default: {},
    }),
  },
  bannerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  bannerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bannerTitle: {
    ...typography.cardTitle,
    color: "#F8FAFC",
  },
  bannerMeta: {
    ...typography.badge,
    color: ACCENT_SOFT,
    fontVariant: ["tabular-nums"],
  },
  bannerBody: {
    ...typography.bodySmall,
    color: "#A7B3C5",
  },
  bannerClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignSelf: "flex-start",
  },
  bannerActions: {
    flexDirection: "row",
    gap: 8,
  },
  bannerGhostBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.08)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  bannerGhostText: {
    ...typography.buttonSmall,
    letterSpacing: 1,
    color: ACCENT_SOFT,
  },
  bannerPrimaryBtn: {
    flex: 1.4,
    height: 40,
    borderRadius: 12,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  bannerPrimaryText: {
    ...typography.buttonSmall,
    letterSpacing: 1,
    color: "#FFFFFF",
  },
});
