import React, { useState, useEffect, useCallback, useRef } from "react";
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
import {
  Check,
  Dumbbell,
  Home,
  Flame,
  Zap,
  Activity,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  Layers,
  Target,
  type LucideIcon,
} from "lucide-react-native";
import { router } from "expo-router";
import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  autoGenerateCalendarPlan,
  updateTrainingSettings,
} from "@/store/slices/workoutSlice";
import { typography } from "@/theme/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

const FREQUENCY_OPTIONS = [
  { id: 3, label: "3 DAYS" },
  { id: 4, label: "4 DAYS" },
  { id: 5, label: "5 DAYS" },
  { id: 6, label: "6 DAYS" },
];

const LOCATION_OPTIONS = [
  { id: "gym", label: "Gym", icon: Dumbbell },
  { id: "home", label: "Home", icon: Home },
];

const EXPERIENCE_OPTIONS = [
  { id: "beginner", label: "Beginner" },
  { id: "intermed", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const GOAL_OPTIONS = [
  { id: "muscle", label: "Build Muscle", icon: Dumbbell },
  { id: "fat", label: "Fat Loss", icon: Flame },
  { id: "strength", label: "Strength", icon: Zap },
  { id: "endurance", label: "Endurance", icon: Activity },
];

const SPLIT_OPTIONS = [
  { id: "push", label: "Push Day" },
  { id: "pull", label: "Pull Day" },
  { id: "chest", label: "Chest Day" },
  { id: "upper", label: "Upper Body" },
  { id: "lower", label: "Lower Body" },
  { id: "fullbody", label: "Full Body" },
];

// One accent for the whole page.
const ACCENT = "#38BDF8";
const MUTED = "#94A3B8";
const SURFACE_WASH = [
  "rgba(56,189,248,0.12)",
  "rgba(139,92,246,0.07)",
  "rgba(255,255,255,0.02)",
] as const;
const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;

const Surface = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.surface}>
    <LinearGradient
      pointerEvents="none"
      colors={SURFACE_WASH}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
    {children}
  </View>
);

const CardHeader = ({
  icon: Icon,
  title,
  right,
}: {
  icon: LucideIcon;
  title: string;
  right?: React.ReactNode;
}) => (
  <View style={styles.cardHeader}>
    <View style={styles.cardHeaderTitle}>
      <View style={styles.iconChip}>
        <Icon size={14} color={ACCENT} strokeWidth={2.3} />
      </View>
      <Text style={styles.sectionLabel} numberOfLines={1}>
        {title}
      </Text>
    </View>
    {right}
  </View>
);

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
      <ScreenBackground />
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
            <View style={styles.maskedTitleView}>
              <View style={styles.maskWrapper}>
                <Text style={[styles.mainTitle, { color: "#F6F8FF" }]} numberOfLines={1}>
                  SETTINGS
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.stack}>
          {/* Schedule: frequency + location */}
          <Surface>
            <CardHeader icon={CalendarDays} title="SCHEDULE" />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Days per week</Text>
              <View style={styles.row}>
                {FREQUENCY_OPTIONS.map((opt) => {
                  const isSelected = frequency === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`${opt.id} days per week`}
                      onPress={() => {
                        triggerHaptic();
                        setFrequency(opt.id);
                      }}
                      style={[styles.option, styles.rowItem, styles.optionCompact, isSelected && styles.optionSelected]}
                    >
                      <Text style={[styles.optionValue, isSelected && styles.optionTextSelected]}>
                        {opt.id}
                      </Text>
                      <Text style={[styles.optionUnit, isSelected && styles.optionUnitSelected]}>
                        DAYS
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Location</Text>
              <View style={styles.row}>
                {LOCATION_OPTIONS.map((opt) => {
                  const isSelected = location === opt.id;
                  const Icon = opt.icon;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => {
                        triggerHaptic();
                        setLocation(opt.id);
                      }}
                      style={[styles.option, styles.rowItem, styles.optionRow, isSelected && styles.optionSelected]}
                    >
                      <Icon size={16} color={isSelected ? ACCENT : MUTED} strokeWidth={2.3} />
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </Surface>

          {/* Profile: level + goal */}
          <Surface>
            <CardHeader icon={Target} title="YOUR PROFILE" />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Experience level</Text>
              <View style={styles.row}>
                {EXPERIENCE_OPTIONS.map((opt) => {
                  const isSelected = experience === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => {
                        triggerHaptic();
                        setExperience(opt.id);
                      }}
                      style={[styles.option, styles.rowItem, styles.optionRow, isSelected && styles.optionSelected]}
                    >
                      <Text
                        style={[styles.optionText, isSelected && styles.optionTextSelected]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.85}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Primary goal</Text>
              <View style={styles.grid}>
                {GOAL_OPTIONS.map((opt) => {
                  const isSelected = goal === opt.id;
                  const Icon = opt.icon;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => {
                        triggerHaptic();
                        setGoal(opt.id);
                      }}
                      style={[styles.option, styles.gridItem, styles.goalOption, isSelected && styles.optionSelected]}
                    >
                      <View style={[styles.goalIcon, isSelected && styles.goalIconSelected]}>
                        <Icon size={15} color={isSelected ? ACCENT : MUTED} strokeWidth={2.3} />
                      </View>
                      <Text
                        style={[styles.optionText, styles.goalText, isSelected && styles.optionTextSelected]}
                        numberOfLines={1}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </Surface>

          {/* Splits */}
          <Surface>
            <CardHeader
              icon={Layers}
              title="WORKOUT SPLITS"
              right={
                <View style={styles.countPill}>
                  <Text style={styles.countPillText}>{stylesSelected.length} SELECTED</Text>
                </View>
              }
            />
            <View style={styles.grid}>
              {SPLIT_OPTIONS.map((opt) => {
                const isSelected = stylesSelected.includes(opt.id);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.8}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    onPress={() => toggleStyle(opt.id)}
                    style={[styles.option, styles.gridItem, styles.splitOption, isSelected && styles.optionSelected]}
                  >
                    <View style={[styles.checkCircle, isSelected && styles.checkCircleOn]}>
                      {isSelected && <Check size={11} color="#04121C" strokeWidth={3.2} />}
                    </View>
                    <Text
                      style={[styles.splitText, isSelected && styles.optionTextSelected]}
                      numberOfLines={1}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Surface>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.88}
              disabled={isSyncing}
              onPress={handleGenerateAndSync}
              accessibilityRole="button"
              accessibilityLabel="Generate and sync calendar"
              style={styles.ctaShadow}
            >
              <LinearGradient
                colors={BUTTON_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaButton}
              >
                <LinearGradient
                  pointerEvents="none"
                  colors={SHEEN}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.ctaSheen}
                />
                {isSyncing ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.ctaButtonText}>SYNCING CALENDAR…</Text>
                  </>
                ) : isSynced ? (
                  <>
                    <CheckCircle2 size={17} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.ctaButtonText}>CALENDAR SYNCED</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.ctaButtonText}>GENERATE & SYNC</Text>
                    <View style={styles.ctaTrail}>
                      <ArrowRight color="#FFFFFF" size={14} strokeWidth={2.6} />
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="View calendar"
              onPress={() => {
                triggerHaptic();
                router.push("/workout-calendar");
              }}
              style={styles.secondaryBtn}
            >
              <CalendarDays size={16} color="#7DD3FC" strokeWidth={2.3} />
              <Text style={styles.secondaryBtnText}>VIEW CALENDAR</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  stack: {
    gap: 14,
  },
  surface: {
    backgroundColor: "#111A25",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    padding: 18,
    gap: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardHeaderTitle: {
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
  sectionLabel: {
    ...typography.sectionTitle,
    color: "#E5EEF8",
    flexShrink: 1,
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  countPillText: {
    ...typography.badge,
    color: "#7DD3FC",
  },
  field: {
    gap: 10,
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: "600",
    color: "#8B9AB0",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  gridItem: {
    width: "48.6%",
  },

  // Option (one look, one accent)
  rowItem: {
    flex: 1,
  },
  option: {
    minHeight: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.14)",
  },
  optionSelected: {
    backgroundColor: "rgba(56,189,248,0.12)",
    borderColor: "rgba(56,189,248,0.55)",
  },
  optionCompact: {
    minHeight: 54,
    gap: 0,
  },
  optionRow: {
    flexDirection: "row",
    gap: 8,
  },
  optionValue: {
    ...typography.metric,
    fontSize: 20,
    lineHeight: 24,
    color: "#CBD5E1",
    fontVariant: ["tabular-nums"],
  },
  optionUnit: {
    ...typography.overline,
    color: "#64748B",
  },
  optionUnitSelected: {
    color: "#7DD3FC",
  },
  optionText: {
    ...typography.buttonSmall,
    color: "#A8B5C7",
    letterSpacing: 0.1,
  },
  optionTextSelected: {
    color: "#F8FAFC",
  },
  goalOption: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 8,
    paddingHorizontal: 8,
    minHeight: 52,
  },
  goalIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  goalIconSelected: {
    backgroundColor: "rgba(56,189,248,0.16)",
  },
  goalText: {
    flexShrink: 1,
  },
  splitOption: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
    paddingHorizontal: 12,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(148,163,184,0.4)",
  },
  checkCircleOn: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  splitText: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: "#A8B5C7",
    flexShrink: 1,
  },

  actions: {
    gap: 10,
    marginTop: 4,
  },
  ctaShadow: {
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
  ctaButton: {
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  ctaSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  ctaButtonText: {
    ...typography.button,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  ctaTrail: {
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
    color: "#7DD3FC",
    letterSpacing: 1,
  },
});
