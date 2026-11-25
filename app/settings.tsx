import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/shared/components/typography";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import MaskedView from "@react-native-masked-view/masked-view";
import {
  Calendar,
  Check,
  Dumbbell,
  Home,
  Flame,
  Zap,
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
} from "lucide-react-native";
import { router } from "expo-router";
import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  autoGenerateCalendarPlan,
  updateTrainingSettings,
} from "@/store/slices/workoutSlice";
import { typography } from "@/theme/typography";

const FREQUENCY_OPTIONS = [
  { id: 3, label: "3 DAYS" },
  { id: 4, label: "4 DAYS" },
  { id: 5, label: "5 DAYS" },
  { id: 6, label: "6 DAYS" },
];

const LOCATION_OPTIONS = [
  { id: "gym", label: "GYM", icon: Dumbbell },
  { id: "home", label: "HOME", icon: Home },
];

const EXPERIENCE_OPTIONS = [
  { id: "beginner", label: "BEGINNER" },
  { id: "intermed", label: "INTERMEDIATE" },
  { id: "advanced", label: "ADVANCED" },
];

const GOAL_OPTIONS = [
  { id: "muscle", label: "BUILD MUSCLE", icon: Dumbbell },
  { id: "fat", label: "FAT LOSS", icon: Flame },
  { id: "strength", label: "STRENGTH", icon: Zap },
  { id: "endurance", label: "ENDURANCE", icon: Activity },
];

const SPLIT_OPTIONS = [
  { id: "push", label: "Push Day", color: "#38BDF8", bgColor: "rgba(56, 189, 248, 0.12)" },
  { id: "pull", label: "Pull Day", color: "#2DD4BF", bgColor: "rgba(45, 212, 191, 0.12)" },
  { id: "chest", label: "Chest Day", color: "#38EDD8", bgColor: "rgba(56, 237, 216, 0.12)" },
  { id: "upper", label: "Upper Body", color: "#C084FC", bgColor: "rgba(192, 132, 252, 0.12)" },
  { id: "lower", label: "Lower Body", color: "#FFB68C", bgColor: "rgba(255, 182, 140, 0.12)" },
  { id: "fullbody", label: "Full Body", color: "#F43F5E", bgColor: "rgba(244, 63, 94, 0.12)" },
];

const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const trainingSettings = useAppSelector(
    (state) => state.workout.trainingSettings,
  );

  const [frequency, setFrequency] = useState(trainingSettings?.frequency || 4);
  const [location, setLocation] = useState(trainingSettings?.location || "gym");
  const [experience, setExperience] = useState(
    trainingSettings?.experience || "intermed",
  );
  const [goal, setGoal] = useState(trainingSettings?.goal || "muscle");
  const [stylesSelected, setStylesSelected] = useState<string[]>(
    trainingSettings?.stylesSelected && trainingSettings.stylesSelected.length > 0
      ? trainingSettings.stylesSelected.map((s) => (s === "full" ? "fullbody" : s))
      : ["push", "pull", "chest", "upper", "lower"],
  );

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (trainingSettings) {
      if (trainingSettings.frequency) setFrequency(trainingSettings.frequency);
      if (trainingSettings.location) setLocation(trainingSettings.location);
      if (trainingSettings.experience) setExperience(trainingSettings.experience);
      if (trainingSettings.goal) setGoal(trainingSettings.goal);
      if (
        trainingSettings.stylesSelected &&
        trainingSettings.stylesSelected.length > 0
      ) {
        setStylesSelected(
          trainingSettings.stylesSelected.map((s) =>
            s === "full" ? "fullbody" : s,
          ),
        );
      }
    }
  }, [trainingSettings]);

  const triggerHaptic = useCallback(
    (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(style).catch(() => {});
      }
    },
    [],
  );

  const toggleStyle = useCallback(
    (id: string) => {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
      setStylesSelected((prev) => {
        if (prev.includes(id)) {
          if (prev.length <= 1) return prev;
          return prev.filter((s) => s !== id);
        } else {
          return [...prev, id];
        }
      });
    },
    [triggerHaptic],
  );

  // Month calculation
  const currentMonthTelemetry = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthName = MONTH_NAMES[month];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let activeDaysOfWeek: number[] = [1, 2, 4, 5];
    if (frequency === 3) activeDaysOfWeek = [1, 3, 5];
    else if (frequency === 4) activeDaysOfWeek = [1, 2, 4, 5];
    else if (frequency === 5) activeDaysOfWeek = [1, 2, 3, 5, 6];
    else if (frequency === 6) activeDaysOfWeek = [1, 2, 3, 4, 5, 6];

    let sessionCount = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = new Date(year, month, d).getDay();
      if (activeDaysOfWeek.includes(dayOfWeek)) {
        sessionCount++;
      }
    }

    return {
      monthName,
      year,
      sessionCount,
    };
  }, [frequency]);

  const handleGenerateAndSync = useCallback(() => {
    if (isSyncing) return;
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setIsSyncing(true);

    setTimeout(() => {
      dispatch(
        autoGenerateCalendarPlan({
          frequency,
          location,
          experience,
          goal,
          stylesSelected,
        }),
      );

      dispatch(
        updateTrainingSettings({
          frequency,
          location,
          experience,
          goal,
          stylesSelected,
        }),
      );

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
      }

      setIsSyncing(false);
      setIsSynced(true);

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setIsSynced(false);
      }, 3000);
    }, 600);
  }, [
    isSyncing,
    triggerHaptic,
    dispatch,
    frequency,
    location,
    experience,
    goal,
    stylesSelected,
  ]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Header */}
      <CustomHeader
        titleVariant="text"
        title=""
        showBackButton={true}
        showSearch={true}
        showNotifications={true}
        showAvatar={true}
        transparent={true}
        onPressBack={() =>
          router.canGoBack() ? router.back() : router.replace("/(tabs)/home")
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 80, 100) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <View style={styles.titleSection}>
          <View style={styles.maskedTitleWrapper}>
            <MaskedView
              style={styles.maskedTitleView}
              maskElement={
                <View style={styles.maskWrapper}>
                  <Text style={styles.mainTitle} numberOfLines={1}>
                    SETTINGS
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
        </View>

        {/* 1. WEEKLY FREQUENCY */}
        <Text style={styles.sectionTitle}>WEEKLY FREQUENCY</Text>
        <View style={styles.frequencyRow}>
          {FREQUENCY_OPTIONS.map((opt) => {
            const isSelected = frequency === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.75}
                onPress={() => {
                  triggerHaptic();
                  setFrequency(opt.id);
                }}
                style={[
                  styles.freqBtn,
                  isSelected && styles.freqBtnSelected,
                ]}
              >
                <Text
                  style={[
                    styles.freqText,
                    isSelected && styles.freqTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. LOCATION */}
        <Text style={styles.sectionTitle}>WORKOUT LOCATION</Text>
        <View style={styles.segmentRow}>
          {LOCATION_OPTIONS.map((opt) => {
            const isSelected = location === opt.id;
            const Icon = opt.icon;
            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.75}
                onPress={() => {
                  triggerHaptic();
                  setLocation(opt.id);
                }}
                style={[
                  styles.segmentBtn,
                  isSelected && styles.segmentBtnSelected,
                ]}
              >
                <Icon
                  size={16}
                  color={isSelected ? "#00f2fe" : "#94A3B8"}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.segmentText,
                    isSelected && styles.segmentTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 3. EXPERIENCE LEVEL */}
        <Text style={styles.sectionTitle}>EXPERIENCE LEVEL</Text>
        <View style={styles.segmentRow}>
          {EXPERIENCE_OPTIONS.map((opt) => {
            const isSelected = experience === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.75}
                onPress={() => {
                  triggerHaptic();
                  setExperience(opt.id);
                }}
                style={[
                  styles.segmentBtn,
                  isSelected && styles.segmentBtnSelected,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    isSelected && styles.segmentTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. WORKOUT GOAL */}
        <Text style={styles.sectionTitle}>PRIMARY GOAL</Text>
        <View style={styles.grid2}>
          {GOAL_OPTIONS.map((opt) => {
            const isSelected = goal === opt.id;
            const Icon = opt.icon;
            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.75}
                onPress={() => {
                  triggerHaptic();
                  setGoal(opt.id);
                }}
                style={[
                  styles.goalCard,
                  isSelected && styles.goalCardSelected,
                ]}
              >
                <Icon
                  size={18}
                  color={isSelected ? "#00f2fe" : "#94A3B8"}
                />
                <Text
                  style={[
                    styles.goalText,
                    isSelected && styles.goalTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
                {isSelected && (
                  <View style={styles.goalCheck}>
                    <Check size={11} color="#070A11" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 5. WORKOUT SPLITS */}
        <View style={styles.splitsHeaderRow}>
          <Text style={styles.sectionTitleNoMargin}>WORKOUT SPLITS</Text>
          <Text style={styles.splitsCountText}>
            {stylesSelected.length} SELECTED
          </Text>
        </View>
        <View style={styles.grid2}>
          {SPLIT_OPTIONS.map((opt) => {
            const isSelected = stylesSelected.includes(opt.id);
            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.75}
                onPress={() => toggleStyle(opt.id)}
                style={[
                  styles.splitChip,
                  isSelected && {
                    borderColor: opt.color,
                    backgroundColor: opt.bgColor,
                  },
                ]}
              >
                <View
                  style={[
                    styles.splitColorDot,
                    { backgroundColor: opt.color },
                  ]}
                />
                <Text
                  style={[
                    styles.splitChipText,
                    isSelected && { color: "#FFFFFF", fontWeight: "800" },
                  ]}
                >
                  {opt.label}
                </Text>
                {isSelected && (
                  <Check
                    size={13}
                    color={opt.color}
                    strokeWidth={2.5}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 6. MONTHLY SUMMARY CARD */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTitleRow}>
              <Calendar size={14} color="#00f2fe" style={{ marginRight: 6 }} />
              <Text style={styles.summaryMonth}>
                {currentMonthTelemetry.monthName} {currentMonthTelemetry.year}
              </Text>
            </View>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeText}>
                {currentMonthTelemetry.sessionCount} SESSIONS
              </Text>
            </View>
          </View>

          {/* Simple split flow */}
          <Text style={styles.summaryFlowText} numberOfLines={1}>
            {stylesSelected
              .map((id) => SPLIT_OPTIONS.find((s) => s.id === id)?.label || id)
              .join("  →  ")}
          </Text>
        </View>

        {/* CTA BUTTON */}
        <TouchableOpacity
          activeOpacity={0.82}
          disabled={isSyncing}
          style={styles.ctaButtonWrapper}
          onPress={handleGenerateAndSync}
        >
          <LinearGradient
            colors={isSynced ? ["#10B981", "#059669"] : ["#00f2fe", "#4facfe"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.ctaButton}
          >
            {isSyncing ? (
              <View style={styles.ctaCenterRow}>
                <ActivityIndicator size="small" color="#050811" />
                <Text style={styles.ctaButtonText}>
                  SYNCING CALENDAR...
                </Text>
              </View>
            ) : isSynced ? (
              <View style={styles.ctaCenterRow}>
                <CheckCircle2 size={16} color="#050811" />
                <Text style={styles.ctaButtonText}>
                  CALENDAR PLAN SYNCED
                </Text>
              </View>
            ) : (
              <View style={styles.ctaCenterRow}>
                <Text style={styles.ctaButtonText}>
                  GENERATE & SYNC CALENDAR
                </Text>
                <ArrowRight color="#050811" size={16} />
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Link to Calendar */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            triggerHaptic();
            router.push("/workout-calendar");
          }}
          style={styles.calendarLinkBtn}
        >
          <Text style={styles.calendarLinkText}>VIEW CALENDAR</Text>
          <ChevronRight size={13} color="#00f2fe" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080B11",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  titleSection: {
    marginTop: 4,
    marginBottom: 20,
  },
  maskedTitleWrapper: {
    height: 42,
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
    ...typography.pageTitle,
    color: "#FFFFFF",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  sectionTitle: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitleNoMargin: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  frequencyRow: {
    flexDirection: "row",
    gap: 8,
  },
  freqBtn: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    position: "relative",
  },
  freqBtnSelected: {
    borderColor: "#00f2fe",
    backgroundColor: "rgba(0, 242, 254, 0.08)",
  },
  freqText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
  },
  freqTextSelected: {
    color: "#00f2fe",
    fontWeight: "800",
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  segmentBtnSelected: {
    borderColor: "#00f2fe",
    backgroundColor: "rgba(0, 242, 254, 0.08)",
  },
  segmentText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  segmentTextSelected: {
    color: "#00f2fe",
    fontWeight: "800",
  },
  grid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  goalCard: {
    flexBasis: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  goalCardSelected: {
    borderColor: "#00f2fe",
    backgroundColor: "rgba(0, 242, 254, 0.08)",
  },
  goalText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 10,
    flex: 1,
  },
  goalTextSelected: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  goalCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#00f2fe",
    justifyContent: "center",
    alignItems: "center",
  },
  splitsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  splitsCountText: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
  },
  splitChip: {
    flexBasis: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  splitColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 9,
  },
  splitChipText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
  },
  summaryCard: {
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 22,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryMonth: {
    color: "#E2E8F0",
    fontSize: 11,
    fontWeight: "700",
  },
  summaryBadge: {
    backgroundColor: "rgba(0, 242, 254, 0.12)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  summaryBadgeText: {
    color: "#00f2fe",
    fontSize: 10,
    fontWeight: "700",
  },
  summaryFlowText: {
    color: "#64748B",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  ctaButtonWrapper: {
    marginTop: 22,
    borderRadius: 14,
    overflow: "hidden",
  },
  ctaButton: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaCenterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaButtonText: {
    color: "#050811",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  calendarLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    paddingVertical: 8,
    gap: 4,
  },
  calendarLinkText: {
    color: "#00f2fe",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});
