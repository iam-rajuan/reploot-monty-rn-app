import { WorkoutHeader } from "@/features/workouts";
import { useNutritionPlanStore } from "@/stores/nutritionPlanStore";
import { HORIZONTAL_PADDING, isSmallDevice } from "@/shared/utils/responsive";
import { CoachEmoji } from "@/features/ai-coach/components/CoachEmoji";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Camera,
  History,
  MessageCircle,
  type LucideIcon,
  Check,
  ChevronRight,
  Droplet,
  Flame,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Utensils,
  ArrowRight,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Text, TextInput } from "@/shared/components/typography";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Line as SvgLine,
  Stop,
} from "react-native-svg";
import { typography } from "@/theme/typography";

interface LoggedMeal {
  id: number;
  type: string;
  typeColor: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}


const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const WATER_GOAL = 3.0;
const WATER_RING_SIZE = isSmallDevice ? 172 : 194;
const WATER_STROKE_WIDTH = 11;
const WATER_RADIUS = (WATER_RING_SIZE - WATER_STROKE_WIDTH) / 2;
const WATER_CIRCUMFERENCE = 2 * Math.PI * WATER_RADIUS;

// Profile-card surface (docs/profile-card-design-language.md §4.1).
const SURFACE_WASH = [
  "rgba(56,189,248,0.12)",
  "rgba(139,92,246,0.07)",
  "rgba(255,255,255,0.02)",
] as const;

/* ---------------------------------------------------------------------------
 * Button system for this page. One look per role, so every action reads the
 * same way: primary (main action), danger, secondary (tinted), ghost (cancel)
 * and round icon buttons.
 * ------------------------------------------------------------------------ */

const PRIMARY_GRADIENTS = {
  brand: ["#38BDF8", "#0EA5E9", "#0284C7"],
  danger: ["#FB7185", "#E11D48", "#BE123C"],
} as const;

const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;

type ButtonTone = keyof typeof PRIMARY_GRADIENTS;

/**
 * Tap: a Pressable whose visuals live on an inner View. Styles passed through
 * Pressable's `style={({ pressed }) => …}` are dropped on native in this app
 * (NativeWind interop), so pressed state is tracked here instead.
 */
const Tap = ({
  style,
  pressedStyle,
  containerStyle,
  children,
  onPressIn,
  onPressOut,
  ...rest
}: Omit<PressableProps, "style" | "children"> & {
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode | ((pressed: boolean) => React.ReactNode);
}) => {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      {...rest}
      style={containerStyle}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
    >
      <View style={[style, pressed && pressedStyle, pressed && styles.btnPressed]}>
        {typeof children === "function" ? children(pressed) : children}
      </View>
    </Pressable>
  );
};

const PrimaryButton = ({
  label,
  icon: Icon,
  trailingArrow = false,
  tone = "brand",
  onPress,
  accessibilityLabel,
}: {
  label: string;
  icon?: LucideIcon;
  trailingArrow?: boolean;
  tone?: ButtonTone;
  onPress: () => void;
  accessibilityLabel?: string;
}) => (
  <Tap
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel ?? label}
    style={[styles.primaryShadow, tone === "danger" && styles.primaryShadowDanger]}
  >
    <LinearGradient
      colors={PRIMARY_GRADIENTS[tone]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.primaryFill}
    >
      <LinearGradient
        pointerEvents="none"
        colors={SHEEN}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.primarySheen}
      />
      {Icon && <Icon size={17} color="#FFFFFF" strokeWidth={2.4} />}
      <Text style={styles.primaryText}>{label}</Text>
      {trailingArrow && (
        <View style={styles.primaryTrail}>
          <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.6} />
        </View>
      )}
    </LinearGradient>
  </Tap>
);

const SecondaryButton = ({
  label,
  icon: Icon,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  icon?: LucideIcon;
  onPress: () => void;
  accessibilityLabel?: string;
}) => (
  <Tap
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel ?? label}
    style={styles.secondaryBtn}
    pressedStyle={styles.secondaryBtnPressed}
  >
    {Icon && <Icon size={16} color="#7DD3FC" strokeWidth={2.3} />}
    <Text style={styles.secondaryText}>{label}</Text>
    <View style={styles.secondaryTrail}>
      <ChevronRight size={14} color="#7DD3FC" strokeWidth={2.6} />
    </View>
  </Tap>
);

const GhostButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Tap
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={styles.ghostBtn}
    pressedStyle={styles.ghostBtnPressed}
  >
    <Text style={styles.ghostText}>{label}</Text>
  </Tap>
);

const IconButton = ({
  icon: Icon,
  onPress,
  accessibilityLabel,
  active = false,
  tone = "neutral",
}: {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
  active?: boolean;
  tone?: "neutral" | "danger";
}) => (
  <Tap
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    hitSlop={6}
    style={[styles.iconBtn, active && styles.iconBtnActive]}
    pressedStyle={styles.iconBtnActive}
  >
    {(pressed) => (
      <Icon
        size={15}
        strokeWidth={2.3}
        color={
          tone === "danger" && pressed
            ? "#FB7185"
            : active || pressed
              ? "#38BDF8"
              : "#A8B5C7"
        }
      />
    )}
  </Tap>
);

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

export default function NutritionTabRoute() {
  const insets = useSafeAreaInsets();
  const [waterInput, setWaterInput] = useState("");
  const [waterTotal, setWaterTotal] = useState(1.8);
  const [waterGoal, setWaterGoal] = useState(3.0);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [tempGoalInput, setTempGoalInput] = useState("3.0");
  const hasGeneratedPlan = useNutritionPlanStore(
    (state) => state.hasGeneratedPlan,
  );
  const hasHydrated = useNutritionPlanStore((state) => state.hasHydrated);
  const resetNutritionJourney = useNutritionPlanStore(
    (state) => state.resetNutritionJourney,
  );
  const lastApprovedAdjustment = useNutritionPlanStore(
    (state) => state.lastApprovedAdjustment,
  );
  const meals = useNutritionPlanStore((state) => state.meals);

  const loggedNutrition = useMemo(
    () =>
      meals.reduce(
        (totals, meal) => {
          if (!meal.completed) return totals;
          return {
            calories: totals.calories + meal.calories,
            protein: totals.protein + meal.protein,
            carbs: totals.carbs + meal.carbs,
            fat: totals.fat + meal.fat,
          };
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [meals],
  );
  const calorieTarget = hasGeneratedPlan ? 2300 : 0;
  const proteinTarget = hasGeneratedPlan ? 180 : 0;
  const carbsTarget = hasGeneratedPlan ? 250 : 0;
  const fatTarget = hasGeneratedPlan ? 70 : 0;
  const calorieProgress =
    calorieTarget > 0
      ? Math.min(
          100,
          Math.round((loggedNutrition.calories / calorieTarget) * 100),
        )
      : 0;
  const caloriesRemaining = Math.max(
    0,
    calorieTarget - loggedNutrition.calories,
  );

  const lunchMeal = useMemo(
    () => meals.find((m) => m.type.toUpperCase() === "LUNCH"),
    [meals],
  );

  const animatedWaterProgress = useRef(new Animated.Value(1.8 / 3.0)).current;

  useEffect(() => {
    Animated.timing(animatedWaterProgress, {
      toValue: Math.min(1, Math.max(0, waterTotal / waterGoal)),
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [waterTotal, waterGoal]);

  const waterStrokeDashoffset = animatedWaterProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [WATER_CIRCUMFERENCE, 0],
  });

  const getHydrationStatus = () => {
    const percent = Math.round((waterTotal / waterGoal) * 100);
    if (percent >= 100) {
      return {
        label: "GOAL REACHED 🎉",
        color: "#2EE5C5",
        border: "rgba(46, 229, 197, 0.4)",
        bg: "rgba(46, 229, 197, 0.12)",
      };
    }
    if (percent >= 50) {
      return {
        label: "HYDRATED",
        color: "#2DD4BF",
        border: "rgba(45, 212, 191, 0.35)",
        bg: "rgba(45, 212, 191, 0.08)",
      };
    }
    return {
      label: "NEEDS WATER",
      color: "#F43F5E",
      border: "rgba(244, 63, 94, 0.35)",
      bg: "rgba(244, 63, 94, 0.08)",
    };
  };

  const hydrationStatus = getHydrationStatus();

  const triggerHaptic = (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
  ) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(style).catch(() => {});
    }
  };

  const handleQuickAddWater = (ml: number) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setWaterTotal((prev) => Math.min(+(prev + ml / 1000).toFixed(2), 10.0));
  };

  const handleSaveCustomWater = () => {
    const val = parseFloat(waterInput);
    if (!isNaN(val) && val > 0) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      setWaterTotal((prev) => Math.min(+(prev + val / 1000).toFixed(2), 10.0));
      setWaterInput("");
    }
  };

  const handleResetWater = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setWaterTotal(0);
    setWaterInput("");
  };

  const handleSaveGoal = (val?: number) => {
    const target = val !== undefined ? val : parseFloat(tempGoalInput);
    if (!isNaN(target) && target > 0 && target <= 10) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      setWaterGoal(+target.toFixed(1));
      setTempGoalInput(target.toFixed(1));
      setIsEditingGoal(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Multi-layered gradient background */}
      <View
        style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={["#121A35", "#0C1429", "#080D1A", "#060810"]}
          locations={[0, 0.26, 0.62, 1]}
          start={{ x: 0.9, y: 0 }}
          end={{ x: 0.18, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={["rgba(56, 189, 248, 0.07)", "rgba(56, 189, 248, 0)"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.2, y: 0.45 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={["rgba(45, 212, 191, 0)", "rgba(45, 212, 191, 0.035)"]}
          start={{ x: 0.3, y: 0.5 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Svg
          style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}
          pointerEvents="none"
        >
          <SvgLine
            x1="420"
            y1="-20"
            x2="-40"
            y2="440"
            stroke="rgba(147, 164, 255, 0.04)"
            strokeWidth="1"
          />
          <SvgLine
            x1="460"
            y1="260"
            x2="-40"
            y2="760"
            stroke="rgba(78, 143, 255, 0.03)"
            strokeWidth="1"
          />
          <SvgLine
            x1="480"
            y1="560"
            x2="-40"
            y2="1080"
            stroke="rgba(48, 211, 195, 0.025)"
            strokeWidth="1"
          />
        </Svg>
      </View>

      <WorkoutHeader transparent={true} />

      <KeyboardAwareScrollView
        bottomOffset={16}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: Math.max(insets.bottom + 120, 140) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Masked Gradient Title */}
        <View style={styles.heroSection}>
          <View style={styles.maskedTitleWrapper}>
            <View style={styles.maskedTitleView}>
              <View style={styles.maskWrapper}>
                <Text style={[styles.mainTitle, { color: "#F6F8FF" }]} numberOfLines={1}>
                  FUEL YOURSELF
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.stack}>
          {hasHydrated && !hasGeneratedPlan && (
            <Surface>
              <View style={styles.setupTop}>
                <View style={styles.flexCopy}>
                  <Text style={styles.eyebrow}>NUTRITION COACH</Text>
                  <Text style={styles.cardTitle}>Personalized Nutrition Plan</Text>
                </View>
              </View>
              <Text style={styles.cardBody}>
                Macros and meal timing built around your goal.
              </Text>
              <PrimaryButton
                label="GENERATE PLAN"
                icon={Sparkles}
                trailingArrow
                accessibilityLabel="Generate nutrition plan"
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                  router.push("/nutrition-ai?mode=setup");
                }}
              />
            </Surface>
          )}

          {/* Daily energy budget */}
          <Surface>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderTitle}>
                <View style={styles.iconChip}>
                  <Flame size={14} color="#38BDF8" />
                </View>
                <Text style={styles.sectionLabel}>ENERGY BUDGET</Text>
              </View>
              {(hasGeneratedPlan || loggedNutrition.calories > 0) && (
                <View style={styles.headerActions}>
                  <IconButton
                    icon={RotateCcw}
                    tone="danger"
                    accessibilityLabel="Reset nutrition plan and meal logs"
                    onPress={() => {
                      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                      setIsResetModalVisible(true);
                    }}
                  />
                  <Tap
                    accessibilityRole="button"
                    accessibilityLabel="View meal logs"
                    hitSlop={4}
                    onPress={() => {
                      triggerHaptic();
                      router.push("/meal-history");
                    }}
                    style={styles.linkChip}
                    pressedStyle={styles.linkChipPressed}
                  >
                    <History size={14} color="#7DD3FC" strokeWidth={2.3} />
                    <Text style={styles.linkChipText}>LOGS</Text>
                  </Tap>
                </View>
              )}
            </View>

            <View style={styles.energyPanel}>
              <Text style={styles.panelLabel}>CONSUMED TODAY</Text>
              <View style={styles.energyRow}>
                <Text style={styles.energyValue}>
                  {loggedNutrition.calories.toLocaleString()}
                </Text>
                <Text style={styles.energyTarget}>
                  / {calorieTarget.toLocaleString()} kcal
                </Text>
              </View>
              <View style={styles.energyTrack}>
                <LinearGradient
                  colors={["#2DD4BF", "#38BDF8"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.energyFill, { width: `${calorieProgress}%` }]}
                />
              </View>
              <View style={styles.energyMeta}>
                <Text style={styles.energyMetaText}>
                  <Text style={styles.energyMetaStrong}>
                    {caloriesRemaining.toLocaleString()}
                  </Text>{" "}
                  kcal left
                </Text>
                <Text style={styles.energyMetaText}>
                  <Text style={styles.energyMetaStrong}>{calorieProgress}%</Text> done
                </Text>
              </View>
            </View>

            <View style={styles.macroRow}>
              {[
                { label: "Protein", color: "#A78BFA", fillColor: "#A78BFA", value: loggedNutrition.protein, target: proteinTarget },
                { label: "Carbs", color: "#FB923C", fillColor: "#FB923C", value: loggedNutrition.carbs, target: carbsTarget },
                { label: "Fat", color: "#F87171", fillColor: "#EF4444", value: loggedNutrition.fat, target: fatTarget },
              ].map((macro) => {
                const percent =
                  macro.target > 0
                    ? Math.min(100, Math.round((macro.value / macro.target) * 100))
                    : 0;
                return (
                  <View key={macro.label} style={styles.macroTile}>
                    <View style={styles.macroName}>
                      <View style={[styles.macroDot, { backgroundColor: macro.color }]} />
                      <Text style={[styles.macroLabel, { color: macro.color }]}>{macro.label}</Text>
                    </View>
                    <Text style={[styles.macroValue, { color: macro.color }]}>
                      {macro.value}
                      <Text style={[styles.macroUnit, { color: macro.color }]}>g</Text>
                    </Text>
                    <Text style={styles.macroTarget}>of {macro.target}g</Text>
                    <View style={styles.macroTrack}>
                      <View
                        style={[styles.macroFill, { width: `${percent}%`, backgroundColor: macro.fillColor }]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            <PrimaryButton
              label="SCAN TODAY'S MEAL"
              icon={Camera}
              accessibilityLabel="Scan today's meal"
              onPress={() => {
                triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/scan-meal");
              }}
            />
          </Surface>

          {/* Hydration */}
          <Surface>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderTitle}>
                <View style={styles.iconChip}>
                  <Droplet size={14} color="#38BDF8" />
                </View>
                <Text style={styles.sectionLabel}>HYDRATION</Text>
              </View>
              <View style={styles.headerActions}>
                <IconButton
                  icon={Pencil}
                  active={isEditingGoal}
                  accessibilityLabel="Edit daily hydration goal"
                  onPress={() => {
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                    setTempGoalInput(waterGoal.toFixed(1));
                    setIsEditingGoal(true);
                  }}
                />
                <IconButton
                  icon={RotateCcw}
                  tone="danger"
                  accessibilityLabel="Reset water intake to zero"
                  onPress={handleResetWater}
                />
              </View>
            </View>

            <View
              style={styles.ringContainer}
            >
              <Svg width={WATER_RING_SIZE} height={WATER_RING_SIZE}>
                <Defs>
                  <SvgLinearGradient id="hydrationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#38BDF8" />
                    <Stop offset="100%" stopColor="#2DD4BF" />
                  </SvgLinearGradient>
                </Defs>
                <Circle
                  cx={WATER_RING_SIZE / 2}
                  cy={WATER_RING_SIZE / 2}
                  r={WATER_RADIUS}
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth={WATER_STROKE_WIDTH}
                  fill="none"
                />
                <AnimatedCircle
                  cx={WATER_RING_SIZE / 2}
                  cy={WATER_RING_SIZE / 2}
                  r={WATER_RADIUS}
                  stroke="url(#hydrationGrad)"
                  strokeWidth={WATER_STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeDasharray={WATER_CIRCUMFERENCE}
                  strokeDashoffset={waterStrokeDashoffset as any}
                  fill="none"
                  transform={`rotate(-90 ${WATER_RING_SIZE / 2} ${WATER_RING_SIZE / 2})`}
                />
              </Svg>
              <View style={styles.ringCenter} pointerEvents="none">
                <View style={styles.ringValueRow}>
                  <Text style={styles.ringValue}>{waterTotal.toFixed(1)}</Text>
                  <Text style={styles.ringUnit}>L</Text>
                </View>
                <Text style={styles.ringCaption}>OF {waterGoal.toFixed(1)} L GOAL</Text>
                <View
                  style={[
                    styles.statusPill,
                    { borderColor: hydrationStatus.border, backgroundColor: hydrationStatus.bg },
                  ]}
                >
                  <View style={[styles.statusDot, { backgroundColor: hydrationStatus.color }]} />
                  <Text style={[styles.statusPillText, { color: hydrationStatus.color }]} numberOfLines={1}>
                    {hydrationStatus.label}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.quickRow}>
              {[250, 500, 750].map((ml) => (
                <Tap
                  key={ml}
                  containerStyle={styles.flexOne}
                  style={styles.quickChip}
                  pressedStyle={styles.quickChipPressed}
                  onPress={() => handleQuickAddWater(ml)}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${ml} millilitres`}
                >
                  <Droplet size={13} color="#38BDF8" strokeWidth={2.4} fill="rgba(56,189,248,0.25)" />
                  <Text style={styles.quickChipText}>
                    +{ml}
                    <Text style={styles.quickChipUnit}> ml</Text>
                  </Text>
                </Tap>
              ))}
            </View>

            <View style={styles.customWaterRow}>
              <View style={styles.customWaterIconWrap}>
                <Droplet color="#38BDF8" size={15} />
              </View>
              <TextInput
                style={styles.waterInput}
                placeholder="Custom amount"
                placeholderTextColor="#64748B"
                keyboardType="number-pad"
                value={waterInput}
                onChangeText={(text) => setWaterInput(text.replace(/[^0-9]/g, ""))}
                maxLength={5}
                accessibilityLabel="Custom water amount in millilitres"
              />
              <View style={styles.waterInputUnitWrap}>
                <Text style={styles.waterInputUnit}>ML</Text>
              </View>
              <Tap
                disabled={!waterInput}
                style={styles.addBtnShell}
                onPress={handleSaveCustomWater}
                accessibilityRole="button"
                accessibilityLabel="Add water"
                accessibilityState={{ disabled: !waterInput }}
              >
                {waterInput ? (
                  <LinearGradient
                    colors={PRIMARY_GRADIENTS.brand}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.addBtn}
                  >
                    <Plus size={15} color="#FFFFFF" strokeWidth={2.8} />
                    <Text style={styles.addBtnText}>ADD</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.addBtn, styles.addBtnDisabled]}>
                    <Plus size={15} color="#64748B" strokeWidth={2.8} />
                    <Text style={[styles.addBtnText, styles.addBtnTextDisabled]}>ADD</Text>
                  </View>
                )}
              </Tap>
            </View>
          </Surface>

          {/* Nutrition coach */}
          <Surface>
            <View style={styles.setupTop}>
              <View>
                <View style={[styles.coachCircle, styles.coachCircleCompact]}>
                  <View style={styles.coachArtworkCompact}>
                    <CoachEmoji size="md" />
                  </View>
                </View>
                <View style={[styles.coachActiveDot, styles.coachActiveDotCompact]} />
              </View>
              <View style={styles.flexCopy}>
                <Text style={styles.eyebrow}>NUTRITION COACH</Text>
                <Text style={styles.cardTitle}>
                  Need <Text style={styles.highlight}>24g protein</Text> today
                </Text>
              </View>
            </View>

            {lastApprovedAdjustment && (
              <View style={styles.approvedNotice}>
                <Check size={13} color="#2DD4BF" />
                <Text style={styles.approvedText} numberOfLines={2}>
                  Plan updated: {lastApprovedAdjustment}
                </Text>
              </View>
            )}

            <View style={styles.mealTile}>
              <View style={styles.mealIcon}>
                <Utensils size={16} color="#2DD4BF" />
              </View>
              <View style={styles.flexCopy}>
                <Text style={styles.mealEyebrow}>RECOMMENDED LUNCH</Text>
                <Text style={styles.mealName} numberOfLines={2}>
                  {lunchMeal?.name || "Grilled Chicken Quinoa Bowl"}
                </Text>
                <Text style={styles.mealMeta}>
                  {lunchMeal?.calories ?? 680} kcal
                  <Text style={styles.mealMetaDot}>  •  </Text>
                  <Text style={styles.mealMetaProtein}>{lunchMeal?.protein ?? 48}g protein</Text>
                </Text>
              </View>
            </View>

            <SecondaryButton
              label="ASK YOUR COACH"
              icon={MessageCircle}
              accessibilityLabel="Ask your nutrition coach"
              onPress={() => {
                triggerHaptic();
                router.push("/coach?context=nutrition");
              }}
            />
          </Surface>
        </View>
      </KeyboardAwareScrollView>

      <Modal
        visible={isResetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsResetModalVisible(false)}
      >
        <View style={styles.resetModalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsResetModalVisible(false)}
            accessibilityLabel="Close reset confirmation"
          />
          <View style={styles.resetModalCard}>
            <View style={styles.resetModalHeader}>
              <View style={styles.resetModalTitleRow}>
                <View style={styles.resetModalIcon}>
                  <RotateCcw size={16} color="#FB7185" strokeWidth={2.4} />
                </View>
                <Text style={styles.resetModalTitle}>RESET NUTRITION</Text>
              </View>
              <IconButton
                icon={X}
                accessibilityLabel="Close reset confirmation"
                onPress={() => setIsResetModalVisible(false)}
              />
            </View>
            <Text style={styles.resetModalText}>Clear plan and meal logs.</Text>
            <View style={styles.resetModalActions}>
              <PrimaryButton
                label="RESET PLAN"
                icon={RotateCcw}
                tone="danger"
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
                  resetNutritionJourney();
                  setIsResetModalVisible(false);
                }}
              />
              <GhostButton
                label="KEEP MY PLAN"
                onPress={() => setIsResetModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Daily Hydration Target Modal */}
      <Modal
        visible={isEditingGoal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditingGoal(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsEditingGoal(false)}
          />
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderBadge}>
                <Droplet size={15} color="#38BDF8" />
                <Text style={styles.modalHeaderTitle}>
                  DAILY HYDRATION GOAL
                </Text>
              </View>
              <IconButton
                icon={X}
                accessibilityLabel="Close goal settings"
                onPress={() => setIsEditingGoal(false)}
              />
            </View>

            {/* Presets Row */}
            <View style={styles.modalPresetsRow}>
              {[2.0, 2.5, 3.0, 3.5, 4.0].map((preset) => {
                const isSelected = parseFloat(tempGoalInput) === preset;
                return (
                  <Tap
                    key={preset}
                    containerStyle={styles.flexOne}
                    style={[styles.presetChip, isSelected && styles.presetChipActive]}
                    onPress={() => {
                      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                      setTempGoalInput(preset.toFixed(1));
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${preset} liters preset`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[styles.presetText, isSelected && styles.presetTextActive]}
                      numberOfLines={1}
                    >
                      {preset.toFixed(1)}L
                    </Text>
                  </Tap>
                );
              })}
            </View>

            {/* Custom Input Section */}
            <View style={styles.modalInputRow}>
              <Droplet size={18} color="#38BDF8" style={{ marginLeft: 14 }} />
              <TextInput
                style={styles.modalTextInput}
                keyboardType="decimal-pad"
                value={tempGoalInput}
                onChangeText={setTempGoalInput}
                placeholder="3.0"
                placeholderTextColor="#64748B"
                maxLength={4}
              />
              <Text style={styles.modalInputUnit}>LITERS</Text>
            </View>

            {/* Separate, Prominent SET GOAL Button */}
            <PrimaryButton
              label="SET DAILY GOAL"
              icon={Check}
              accessibilityLabel="Confirm and save hydration goal"
              onPress={() => handleSaveGoal()}
            />
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#060810",
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 4,
  },
  heroSection: {
    marginTop: 4,
    marginBottom: 16,
  },
  maskedTitleWrapper: {
    height: 44,
    width: "100%",
  },
  maskedTitleView: {
    height: 44,
    width: "100%",
  },
  maskWrapper: {
    backgroundColor: "transparent",
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  gradient: {
    flex: 1,
  },
  mainTitle: {
    ...typography.pageTitle,
    color: "#FFFFFF",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(3, 7, 18, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  resetModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 14, 0.76)",
    justifyContent: "flex-end",
  },
  resetModalCard: {
    width: "100%",
    backgroundColor: "#101722",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(148, 163, 184, 0.14)",
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 26,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 16,
  },
  resetModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resetModalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  resetModalIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244, 63, 94, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.2)",
  },
  resetModalTitle: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  resetModalText: {
    color: "#8B9AAF",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    marginBottom: 16,
  },
  resetModalActions: {
    width: "100%",
    gap: 9,
  },
  modalCard: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#0B0E17",
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.45)",
    padding: 20,
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalHeaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  modalHeaderTitle: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  modalPresetsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  modalInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#162238",
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.4)",
    borderRadius: 12,
    height: 46,
    marginBottom: 16,
  },
  modalTextInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 10,
    paddingVertical: 0,
  },
  modalInputUnit: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    marginRight: 14,
    letterSpacing: 0.8,
  },
  stack: {
    gap: 18,
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
  flexCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },


  // Shared copy
  eyebrow: {
    ...typography.overline,
    color: "#2DD4BF",
  },
  cardTitle: {
    ...typography.cardTitle,
    color: "#F8FAFC",
  },
  cardBody: {
    ...typography.body,
    color: "#94A3B8",
    marginTop: -6,
  },
  highlight: {
    color: "#38BDF8",
  },

  // Buttons

  // Setup + coach header
  setupTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  coachCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  coachCircleCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  coachArtworkCompact: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: 1 }, { scale: 0.86 }],
  },
  coachActiveDot: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2DD4BF",
    borderWidth: 2,
    borderColor: "#111A25",
  },
  coachActiveDotCompact: {
    right: 0,
    bottom: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },



  // Coach
  approvedNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "rgba(45,212,191,0.08)",
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.22)",
  },
  approvedText: {
    ...typography.bodySmall,
    flex: 1,
    color: "#99F6E4",
  },
  mealTile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.10)",
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(45,212,191,0.10)",
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.22)",
  },
  mealEyebrow: {
    ...typography.overline,
    color: "#64748B",
  },
  mealName: {
    ...typography.subtitle,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  mealMeta: {
    ...typography.bodySmall,
    color: "#94A3B8",
  },
  mealMetaDot: {
    color: "#475569",
  },
  mealMetaProtein: {
    color: "#38BDF8",
    fontWeight: "600",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderTitle: {
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
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  energyPanel: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.10)",
    gap: 10,
  },
  panelLabel: {
    ...typography.overline,
    color: "#64748B",
  },
  energyRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: -4,
  },
  energyValue: {
    ...typography.metricLarge,
    color: "#F8FAFC",
    fontVariant: ["tabular-nums"],
  },
  energyTarget: {
    ...typography.subtitle,
    color: "#64748B",
    fontVariant: ["tabular-nums"],
  },
  energyTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  energyFill: {
    height: "100%",
    borderRadius: 4,
  },
  energyMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  energyMetaText: {
    ...typography.bodySmall,
    color: "#64748B",
  },
  energyMetaStrong: {
    fontWeight: "700",
    color: "#CBD5E1",
  },
  macroRow: {
    flexDirection: "row",
    gap: 8,
  },
  macroTile: {
    flex: 1,
    minWidth: 0,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.10)",
    gap: 2,
  },
  macroName: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  macroDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  macroLabel: {
    ...typography.caption,
    fontWeight: "600",
    color: "#CBD5E1",
  },
  macroValue: {
    ...typography.metric,
    color: "#F8FAFC",
    fontVariant: ["tabular-nums"],
  },
  macroUnit: {
    ...typography.metricUnit,
    color: "#94A3B8",
  },
  macroTarget: {
    ...typography.caption,
    color: "#64748B",
  },
  macroTrack: {
    height: 5,
    borderRadius: 3,
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  macroFill: {
    height: "100%",
    borderRadius: 3,
  },
  ringContainer: {
    alignSelf: "center",
    width: WATER_RING_SIZE,
    height: WATER_RING_SIZE,
  },
  ringCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  ringValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  ringValue: {
    ...typography.metricLarge,
    color: "#F8FAFC",
    fontVariant: ["tabular-nums"],
  },
  ringUnit: {
    ...typography.cardTitle,
    color: "#38BDF8",
  },
  ringCaption: {
    ...typography.overline,
    color: "#64748B",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    ...typography.badge,
  },
  quickRow: {
    flexDirection: "row",
    gap: 8,
  },
  customWaterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 48,
    paddingLeft: 14,
    paddingRight: 5,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.14)",
  },
  customWaterIconWrap: {
    width: 18,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  waterInput: {
    ...typography.input,
    flex: 1,
    minWidth: 0,
    height: 22,
    alignSelf: "center",
    color: "#F8FAFC",
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  waterInputUnit: {
    ...typography.caption,
    color: "#64748B",
    lineHeight: 22,
    includeFontPadding: false,
  },
  waterInputUnitWrap: {
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  // Buttons
  flexOne: {
    flex: 1,
  },
  btnPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  primaryShadow: {
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
  primaryShadowDanger: {
    ...Platform.select({
      ios: { shadowColor: "#E11D48" },
      android: {},
      default: { boxShadow: "0px 8px 20px rgba(225,29,72,0.28)" },
    }),
  },
  primaryFill: {
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
  primarySheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  primaryText: {
    ...typography.button,
    color: "#FFFFFF",
    letterSpacing: 1,
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
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 18,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.32)",
  },
  secondaryBtnPressed: {
    backgroundColor: "rgba(56,189,248,0.18)",
    borderColor: "rgba(56,189,248,0.5)",
  },
  secondaryText: {
    ...typography.button,
    color: "#7DD3FC",
    letterSpacing: 1,
  },
  secondaryTrail: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.16)",
  },
  ghostBtn: {
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  ghostBtnPressed: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  ghostText: {
    ...typography.button,
    color: "#CBD5E1",
    letterSpacing: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  iconBtnActive: {
    backgroundColor: "rgba(56,189,248,0.14)",
    borderColor: "rgba(56,189,248,0.4)",
  },
  linkChip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  linkChipPressed: {
    backgroundColor: "rgba(56,189,248,0.2)",
  },
  linkChipText: {
    ...typography.buttonSmall,
    color: "#7DD3FC",
    letterSpacing: 0.8,
  },
  quickChip: {
    height: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(56,189,248,0.07)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  quickChipPressed: {
    backgroundColor: "rgba(56,189,248,0.18)",
    borderColor: "rgba(56,189,248,0.5)",
  },
  quickChipText: {
    ...typography.button,
    color: "#F1F5F9",
    fontVariant: ["tabular-nums"],
  },
  quickChipUnit: {
    ...typography.caption,
    color: "#64748B",
  },
  addBtnShell: {
    borderRadius: 12,
  },
  addBtn: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  addBtnDisabled: {
    backgroundColor: "rgba(148,163,184,0.10)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
  },
  addBtnText: {
    ...typography.buttonSmall,
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },
  addBtnTextDisabled: {
    color: "#64748B",
  },
  presetChip: {
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  presetChipActive: {
    backgroundColor: "rgba(56,189,248,0.16)",
    borderColor: "#38BDF8",
  },
  presetText: {
    ...typography.buttonSmall,
    color: "#CBD5E1",
  },
  presetTextActive: {
    color: "#FFFFFF",
  },
});
