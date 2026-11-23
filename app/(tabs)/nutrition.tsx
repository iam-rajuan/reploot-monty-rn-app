import { WorkoutHeader } from "@/features/workouts";
import { useNutritionPlanStore } from "@/stores/nutritionPlanStore";
import { HORIZONTAL_PADDING, isSmallDevice } from "@/shared/utils/responsive";
import MaskedView from "@react-native-masked-view/masked-view";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Camera,
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
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Line as SvgLine,
  Stop,
} from "react-native-svg";

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

const nutritionCoachArtwork = require("../../assets/figma/nutrition/ai-nutrition-coach-figma.jpeg");

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const WATER_GOAL = 3.0;
const WATER_RING_SIZE = isSmallDevice ? 172 : 194;
const WATER_STROKE_WIDTH = 11;
const WATER_RADIUS = (WATER_RING_SIZE - WATER_STROKE_WIDTH) / 2;
const WATER_CIRCUMFERENCE = 2 * Math.PI * WATER_RADIUS;

export default function NutritionTabRoute() {
  const insets = useSafeAreaInsets();
  const [waterInput, setWaterInput] = useState("");
  const [waterTotal, setWaterTotal] = useState(1.8);
  const [waterGoal, setWaterGoal] = useState(3.0);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoalInput, setTempGoalInput] = useState("3.0");
  const hasGeneratedPlan = useNutritionPlanStore((state) => state.hasGeneratedPlan);
  const resetGeneratedPlan = useNutritionPlanStore((state) => state.resetGeneratedPlan);

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
      setWaterGoal(+(target.toFixed(1)));
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
            x1="420" y1="-20" x2="-40" y2="440"
            stroke="rgba(147, 164, 255, 0.04)"
            strokeWidth="1"
          />
          <SvgLine
            x1="460" y1="260" x2="-40" y2="760"
            stroke="rgba(78, 143, 255, 0.03)"
            strokeWidth="1"
          />
          <SvgLine
            x1="480" y1="560" x2="-40" y2="1080"
            stroke="rgba(48, 211, 195, 0.025)"
            strokeWidth="1"
          />
        </Svg>
      </View>

      <WorkoutHeader transparent={true} />

      <ScrollView
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
            <MaskedView
              style={styles.maskedTitleView}
              maskElement={
                <View style={styles.maskWrapper}>
                  <Text style={styles.mainTitle} numberOfLines={1}>
                    FUEL YOURSELF
                  </Text>
                </View>
              }
            >
              <LinearGradient
                colors={["#F6F8FF", "#F6F8FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              />
            </MaskedView>
          </View>
        </View>

        {hasGeneratedPlan ? (
          <View style={styles.card}>
            {/* Header: Badge + Actions */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.budgetBadge}>
                <Flame size={13} color="#38BDF8" />
                <Text style={styles.budgetBadgeText}>DAILY ENERGY BUDGET</Text>
              </View>
              <View style={styles.cardActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Reset nutrition plan"
                  onPress={() => {
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                    resetGeneratedPlan();
                  }}
                  style={({ pressed }) => [
                    styles.resetPlanButton,
                    pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
                  ]}
                >
                  <RotateCcw size={13} color="#94A3B8" />
                </Pressable>
                <Pressable
                  onPress={() => {
                    triggerHaptic();
                    router.push("/meal-history");
                  }}
                  style={({ pressed }) => [
                    styles.headerLink,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="View meal logs"
                >
                  <Text style={styles.headerLinkText}>LOGS</Text>
                  <ChevronRight size={11} color="#38BDF8" />
                </Pressable>
              </View>
            </View>

            {/* Calorie Telemetry Row */}
            <View style={styles.budgetRow}>
              <Text style={styles.budgetMain}>1,850</Text>
              <Text style={styles.budgetTargetSlash}>/</Text>
              <Text style={styles.budgetTargetTotal}>2,300</Text>
              <Text style={styles.budgetTargetUnit}>KCAL</Text>
            </View>

            {/* Progress Meter */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={["#0284C7", "#0EA5E9", "#38BDF8"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[StyleSheet.absoluteFill, { width: "80%" }]}
                />
              </View>
              <View style={styles.progressMeta}>
                <View style={styles.progressMetaLeft}>
                  <View style={styles.metaDot} />
                  <Text style={styles.progressRemaining}>450 KCAL REMAINING</Text>
                </View>
                <Text style={styles.progressPercent}>80% CONSUMED</Text>
              </View>
            </View>

            {/* 3 Macro Cards with Micro Progress */}
            <View style={styles.macrosRow}>
              {/* Protein */}
              <View style={[styles.macroBox, { borderColor: "rgba(56, 189, 248, 0.22)" }]}>
                <View style={styles.macroHeader}>
                  <View style={[styles.macroDot, { backgroundColor: "#38BDF8" }]} />
                  <Text style={[styles.macroLabel, { color: "#38BDF8" }]}>PROTEIN</Text>
                </View>
                <View style={styles.macroValueRow}>
                  <Text style={styles.macroValue}>120</Text>
                  <Text style={styles.macroUnit}>g</Text>
                </View>
                <Text style={styles.macroTarget}>of 180g</Text>
                <View style={styles.macroTrackBg}>
                  <View style={[styles.macroTrackFill, { width: "67%", backgroundColor: "#38BDF8" }]} />
                </View>
              </View>

              {/* Carbs */}
              <View style={[styles.macroBox, { borderColor: "rgba(251, 191, 36, 0.22)" }]}>
                <View style={styles.macroHeader}>
                  <View style={[styles.macroDot, { backgroundColor: "#FBBF24" }]} />
                  <Text style={[styles.macroLabel, { color: "#FBBF24" }]}>CARBS</Text>
                </View>
                <View style={styles.macroValueRow}>
                  <Text style={styles.macroValue}>180</Text>
                  <Text style={styles.macroUnit}>g</Text>
                </View>
                <Text style={styles.macroTarget}>of 250g</Text>
                <View style={styles.macroTrackBg}>
                  <View style={[styles.macroTrackFill, { width: "72%", backgroundColor: "#FBBF24" }]} />
                </View>
              </View>

              {/* Fat */}
              <View style={[styles.macroBox, { borderColor: "rgba(251, 113, 133, 0.22)" }]}>
                <View style={styles.macroHeader}>
                  <View style={[styles.macroDot, { backgroundColor: "#FB7185" }]} />
                  <Text style={[styles.macroLabel, { color: "#FB7185" }]}>FAT</Text>
                </View>
                <View style={styles.macroValueRow}>
                  <Text style={styles.macroValue}>55</Text>
                  <Text style={styles.macroUnit}>g</Text>
                </View>
                <Text style={styles.macroTarget}>of 70g</Text>
                <View style={styles.macroTrackBg}>
                  <View style={[styles.macroTrackFill, { width: "78%", backgroundColor: "#FB7185" }]} />
                </View>
              </View>
            </View>

            {/* CTA Button */}
            <Pressable
              style={({ pressed }) => [
                styles.scanBtn,
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
              ]}
              onPress={() => {
                triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/scan-meal");
              }}
              accessibilityRole="button"
              accessibilityLabel="Scan today's meal"
            >
              <LinearGradient
                colors={["#0284C7", "#0EA5E9", "#38BDF8"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.scanBtnGradient}
              >
                <Camera color="#FFFFFF" size={16} style={{ marginRight: 8 }} />
                <Text style={styles.scanBtnText}>SCAN TODAY'S MEAL</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <LinearGradient
            colors={["rgba(14, 20, 36, 0.9)", "rgba(9, 13, 26, 0.9)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.planHeroCard}
          >
            {/* Header Row */}
            <View style={styles.planHeroHeader}>
              <View style={styles.planHeroBadge}>
                <Sparkles size={12} color="#38BDF8" />
                <Text style={styles.planHeroBadgeText}>AI NUTRITIONIST</Text>
              </View>
            </View>

            {/* Title & Description */}
            <Text style={styles.planHeroTitle}>Personalized Nutrition Plan</Text>
            <Text style={styles.planHeroBody}>
              Smart macros and meal timing calibrated to your goal.
            </Text>

            {/* Call to Action Button */}
            <Pressable
              style={({ pressed }) => [
                styles.planHeroBtn,
                pressed && styles.planHeroBtnPressed,
              ]}
              onPress={() => {
                triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/nutrition-ai?mode=setup");
              }}
              accessibilityRole="button"
              accessibilityLabel="Generate nutrition plan"
            >
              <LinearGradient
                colors={["#0284C7", "#0EA5E9", "#38BDF8"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.planHeroBtnGradient}
              >
                <Sparkles color="#FFFFFF" size={15} style={{ marginRight: 6 }} />
                <Text style={styles.planHeroBtnText}>GENERATE PLAN</Text>
                <ArrowRight color="#FFFFFF" size={14} style={{ marginLeft: 6 }} />
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        )}

        {/* Water Intake Card (Hydration Telemetry) */}
        <LinearGradient
          colors={["rgba(18, 28, 48, 0.88)", "rgba(10, 15, 27, 0.88)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hydrationCard}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.hydrationBadge}>
              <Droplet size={13} color="#38BDF8" />
              <Text style={styles.hydrationBadgeText}>
                HYDRATION TELEMETRY
              </Text>
            </View>
            <View style={styles.hydrationHeaderActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit daily hydration goal"
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  setTempGoalInput(waterGoal.toFixed(1));
                  setIsEditingGoal(true);
                }}
                style={({ pressed }) => [
                  styles.hydrationIconBtn,
                  isEditingGoal && styles.hydrationIconBtnActive,
                  pressed && styles.hydrationIconBtnPressed,
                ]}
              >
                <Pencil size={13} color={isEditingGoal ? "#38BDF8" : "#94A3B8"} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reset water intake to zero"
                onPress={handleResetWater}
                style={({ pressed }) => [
                  styles.hydrationIconBtn,
                  pressed && styles.hydrationIconBtnPressed,
                ]}
              >
                <RotateCcw size={13} color="#94A3B8" />
              </Pressable>

              <View
                style={[
                  styles.statusPill,
                  {
                    borderColor: hydrationStatus.border,
                    backgroundColor: hydrationStatus.bg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    { color: hydrationStatus.color },
                  ]}
                >
                  {hydrationStatus.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Centered Dynamic Progress Ring Gauge */}
          <Pressable
            style={styles.ringContainer}
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              router.push("/drink-water");
            }}
            accessibilityRole="button"
            accessibilityLabel="Open full hydration protocol screen"
          >
            <Svg
              width={WATER_RING_SIZE}
              height={WATER_RING_SIZE}
              viewBox={`0 0 ${WATER_RING_SIZE} ${WATER_RING_SIZE}`}
            >
              <Defs>
                <SvgLinearGradient
                  id="hydrationGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <Stop offset="0%" stopColor="#38BDF8" />
                  <Stop offset="50%" stopColor="#0EA5E9" />
                  <Stop offset="100%" stopColor="#2DD4BF" />
                </SvgLinearGradient>
              </Defs>
              {/* Background Circular Track */}
              <Circle
                cx={WATER_RING_SIZE / 2}
                cy={WATER_RING_SIZE / 2}
                r={WATER_RADIUS}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth={WATER_STROKE_WIDTH}
                fill="rgba(14, 22, 38, 0.65)"
              />
              {/* Calculating Animated Arc */}
              <AnimatedCircle
                cx={WATER_RING_SIZE / 2}
                cy={WATER_RING_SIZE / 2}
                r={WATER_RADIUS}
                stroke="url(#hydrationGrad)"
                strokeWidth={WATER_STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={WATER_CIRCUMFERENCE}
                strokeDashoffset={waterStrokeDashoffset as any}
                fill="transparent"
                transform={`rotate(-90 ${WATER_RING_SIZE / 2} ${WATER_RING_SIZE / 2})`}
              />
            </Svg>

            {/* Centered Telemetry Stats */}
            <View style={styles.ringCenterContent} pointerEvents="none">
              <Droplet color="#38BDF8" size={22} style={{ marginBottom: 4 }} />
              <View style={styles.ringTextRow}>
                <Text style={styles.ringMain}>{waterTotal.toFixed(1)}</Text>
                <Text style={styles.ringUnit}>L</Text>
              </View>
              <Text style={styles.ringGoal}>GOAL: {waterGoal.toFixed(1)} L</Text>
            </View>
          </Pressable>

          {/* Quick-Add Water Buttons */}
          <View style={styles.quickAddRow}>
            {/* 250 ML */}
            <View style={styles.quickAddBtnWrapper}>
              <Pressable
                style={({ pressed }) => [
                  styles.quickAddBtn,
                  pressed && styles.quickAddBtnPressed,
                ]}
                onPress={() => handleQuickAddWater(250)}
                accessibilityRole="button"
                accessibilityLabel="Add 250 millilitres"
              >
                <View style={styles.quickAddContent}>
                  <Plus size={12} color="#38BDF8" strokeWidth={2.5} />
                  <Text style={styles.quickAddText} numberOfLines={1}>
                    250 ML
                  </Text>
                </View>
              </Pressable>
            </View>

            {/* 500 ML */}
            <View style={styles.quickAddBtnWrapper}>
              <Pressable
                style={({ pressed }) => [
                  styles.quickAddBtn,
                  pressed && styles.quickAddBtnPressed,
                ]}
                onPress={() => handleQuickAddWater(500)}
                accessibilityRole="button"
                accessibilityLabel="Add 500 millilitres"
              >
                <View style={styles.quickAddContent}>
                  <Plus size={12} color="#38BDF8" strokeWidth={2.5} />
                  <Text style={styles.quickAddText} numberOfLines={1}>
                    500 ML
                  </Text>
                </View>
              </Pressable>
            </View>

            {/* 750 ML */}
            <View style={styles.quickAddBtnWrapper}>
              <Pressable
                style={({ pressed }) => [
                  styles.quickAddBtn,
                  pressed && styles.quickAddBtnPressed,
                ]}
                onPress={() => handleQuickAddWater(750)}
                accessibilityRole="button"
                accessibilityLabel="Add 750 millilitres"
              >
                <View style={styles.quickAddContent}>
                  <Plus size={12} color="#38BDF8" strokeWidth={2.5} />
                  <Text style={styles.quickAddText} numberOfLines={1}>
                    750 ML
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Custom Water Input & Add Button */}
          <View style={styles.customWaterRow}>
            <Droplet color="#38BDF8" size={16} />
            <TextInput
              style={styles.waterInput}
              placeholder="0"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              value={waterInput}
              onChangeText={(text) =>
                setWaterInput(text.replace(/[^0-9]/g, ""))
              }
              maxLength={5}
            />
            <Text style={styles.waterInputUnit}>ML</Text>
            <Pressable
              style={({ pressed }) => [
                styles.saveInlineBtn,
                pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
              ]}
              onPress={handleSaveCustomWater}
              accessibilityRole="button"
              accessibilityLabel="Add water"
            >
              <LinearGradient
                colors={["#0284C7", "#0EA5E9", "#38BDF8"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.saveInlineBtnGradient}
              >
                <Text style={styles.saveInlineText}>ADD</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={["rgba(15, 22, 38, 0.88)", "rgba(11, 16, 29, 0.88)", "rgba(7, 10, 18, 0.88)"]}
          locations={[0, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.nutritionCoachCard}
        >
          {/* Header Row: Avatar + Coach Badge + Insight */}
          <View style={styles.nutritionCoachTop}>
            <View style={styles.nutritionAvatarShell}>
              <View style={styles.nutritionAvatarPanel}>
                <Image
                  source={nutritionCoachArtwork}
                  contentFit="cover"
                  style={styles.nutritionAvatar}
                />
              </View>
              <View style={styles.coachActiveDot} />
            </View>

            <View style={styles.nutritionCoachCopy}>
              <View style={styles.coachBadgeRow}>
                <Sparkles size={11} color="#38BDF8" />
                <Text style={styles.nutritionCoachLabel}>AI COACH</Text>
              </View>
              <Text style={styles.nutritionCoachText}>
                Need <Text style={styles.nutritionProtein}>24g protein</Text> today
              </Text>
            </View>
          </View>

          {/* Recommended Next Meal Card */}
          <View style={styles.nutritionLunch}>
            <View style={styles.nutritionLunchLabelRow}>
              <Utensils size={12} color="#2DD4BF" />
              <Text style={styles.nutritionLunchLabel}>
                RECOMMENDED LUNCH
              </Text>
            </View>

            <Text style={styles.nutritionLunchText}>
              Grilled Chicken & Brown Rice
            </Text>

            {/* Meal Macro & Calorie Telemetry */}
            <View style={styles.nutritionLunchMacrosRow}>
              <Flame size={12} color="#38BDF8" />
              <Text style={styles.lunchKcalText}>580 KCAL</Text>
              <Text style={styles.lunchDivider}>•</Text>
              <Text style={styles.lunchProteinHighlight}>48g PROTEIN</Text>
            </View>
          </View>

          {/* Action Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adjust plan with AI"
            onPress={() => {
              triggerHaptic();
              router.push("/nutrition-ai?mode=adjust");
            }}
            style={({ pressed }) => [
              styles.nutritionPlan,
              pressed && styles.nutritionPlanPressed,
            ]}
          >
            <View style={styles.nutritionPlanContent}>
              <Sparkles size={13} color="#38BDF8" />
              <Text style={styles.nutritionPlanText}>ADJUST PLAN WITH AI</Text>
              <ChevronRight size={14} color="#38BDF8" strokeWidth={2.5} />
            </View>
          </Pressable>
        </LinearGradient>
      </ScrollView>

      {/* Daily Hydration Target Modal */}
      <Modal
        visible={isEditingGoal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditingGoal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsEditingGoal(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderBadge}>
                <Droplet size={15} color="#38BDF8" />
                <Text style={styles.modalHeaderTitle}>DAILY HYDRATION GOAL</Text>
              </View>
              <Pressable
                onPress={() => setIsEditingGoal(false)}
                hitSlop={10}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Close goal settings"
              >
                <X size={16} color="#94A3B8" />
              </Pressable>
            </View>

            {/* Presets Row */}
            <View style={styles.modalPresetsRow}>
              {[2.0, 2.5, 3.0, 3.5, 4.0].map((preset) => {
                const isSelected = parseFloat(tempGoalInput) === preset;
                return (
                  <View
                    key={preset}
                    style={[
                      styles.modalPresetBtnWrapper,
                      isSelected && styles.modalPresetBtnWrapperActive,
                    ]}
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.modalPresetBtn,
                        pressed && styles.modalPresetBtnPressed,
                      ]}
                      onPress={() => {
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                        setTempGoalInput(preset.toFixed(1));
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`${preset} liters preset`}
                    >
                      <View style={styles.modalPresetContent}>
                        <Text
                          style={[
                            styles.modalPresetText,
                            isSelected && styles.modalPresetTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {preset.toFixed(1)}L
                        </Text>
                      </View>
                    </Pressable>
                  </View>
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
            <Pressable
              style={({ pressed }) => [
                styles.modalSaveBtn,
                pressed && styles.modalSaveBtnPressed,
              ]}
              onPress={() => handleSaveGoal()}
              accessibilityRole="button"
              accessibilityLabel="Confirm and save hydration goal"
            >
              <LinearGradient
                colors={["#0284C7", "#0EA5E9", "#38BDF8"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.modalSaveBtnGradient}
              >
                <Check size={18} color="#FFFFFF" strokeWidth={2.8} style={{ marginRight: 6 }} />
                <Text style={styles.modalSaveBtnText}>SET DAILY GOAL</Text>
              </LinearGradient>
            </Pressable>
          </Pressable>
        </Pressable>
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
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    letterSpacing: -0.8,
    textShadowColor: "rgba(120, 145, 255, 0.22)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    textAlign: "left",
    textTransform: "uppercase",
  },
  heroSubtitle: {
    color: "#94A3B8",
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: Platform.select({ android: "sans-serif", ios: "System" }),
    fontWeight: "500",
    marginTop: 4,
  },
  card: {
    backgroundColor: "rgba(13, 19, 31, 0.85)",
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: "rgba(56, 189, 248, 0.16)",
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  budgetBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  budgetBadgeText: {
    color: "#38BDF8",
    fontSize: 9.5,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "800",
    letterSpacing: 1,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resetPlanButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
  },
  headerLinkText: {
    color: "#38BDF8",
    fontSize: 10,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  statusPill: {
    backgroundColor: "rgba(45, 212, 191, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.3)",
  },
  statusPillText: {
    color: "#2DD4BF",
    fontSize: 9,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginTop: 2,
    marginBottom: 14,
  },
  budgetMain: {
    color: "#FFFFFF",
    fontSize: 38,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  budgetTargetSlash: {
    color: "#475569",
    fontSize: 18,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    marginHorizontal: 6,
  },
  budgetTargetTotal: {
    color: "#94A3B8",
    fontSize: 18,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "800",
  },
  budgetTargetUnit: {
    color: "#64748B",
    fontSize: 11,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "800",
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
    marginBottom: 8,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressMetaLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#38BDF8",
    marginRight: 6,
  },
  progressRemaining: {
    color: "#38BDF8",
    fontSize: 10,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  progressPercent: {
    color: "#94A3B8",
    fontSize: 10,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
  },
  macrosRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
    width: "100%",
  },
  macroBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  macroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  macroDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  macroLabel: {
    fontSize: 9.5,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  macroValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 2,
  },
  macroValue: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "900",
  },
  macroUnit: {
    color: "#94A3B8",
    fontSize: 10,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    marginLeft: 1,
  },
  macroTarget: {
    color: "#64748B",
    fontSize: 9,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    marginBottom: 6,
  },
  macroTrackBg: {
    width: "100%",
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  macroTrackFill: {
    height: "100%",
    borderRadius: 2,
  },
  scanBtn: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  scanBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  scanBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  planHeroCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.22)",
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
  },
  planHeroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  planHeroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planHeroBadgeText: {
    color: "#38BDF8",
    fontSize: 9.5,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "800",
    letterSpacing: 1,
  },
  planHeroTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    fontWeight: "900",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  planHeroBody: {
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Platform.select({ android: "sans-serif", ios: "System" }),
    fontWeight: "500",
    marginBottom: 14,
  },
  planHeroBtn: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  planHeroBtnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  planHeroBtnGradient: {
    height: 46,
    borderRadius: 14,
    overflow: "hidden",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  planHeroBtnText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
  },
  hydrationCard: {
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: "rgba(56, 189, 248, 0.16)",
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  hydrationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hydrationBadgeText: {
    color: "#38BDF8",
    fontSize: 9.5,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "800",
    letterSpacing: 1,
  },
  hydrationHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hydrationIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  hydrationIconBtnActive: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    borderColor: "rgba(56, 189, 248, 0.5)",
  },
  hydrationIconBtnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(3, 7, 18, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
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
    fontSize: 11.5,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalPresetsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  modalPresetBtnWrapper: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#162238",
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.45)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  modalPresetBtnWrapperActive: {
    backgroundColor: "#0284C7",
    borderColor: "#38BDF8",
  },
  modalPresetBtn: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalPresetBtnPressed: {
    opacity: 0.8,
  },
  modalPresetContent: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalPresetText: {
    color: "#E0F2FE",
    fontSize: 11,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "800",
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  modalPresetTextActive: {
    color: "#FFFFFF",
    fontWeight: "900",
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
    fontSize: 15,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "800",
    marginLeft: 10,
    paddingVertical: 0,
  },
  modalInputUnit: {
    color: "#64748B",
    fontSize: 10.5,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "800",
    marginRight: 14,
    letterSpacing: 0.8,
  },
  modalSaveBtn: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  modalSaveBtnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  modalSaveBtnGradient: {
    height: 46,
    borderRadius: 12,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  ringContainer: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: WATER_RING_SIZE,
    height: WATER_RING_SIZE,
    marginVertical: 10,
    marginBottom: 18,
  },
  ringCenterContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  ringTextRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 2,
  },
  ringMain: {
    color: "#FFFFFF",
    fontSize: 40,
    lineHeight: 44,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  ringUnit: {
    color: "#38BDF8",
    fontSize: 18,
    lineHeight: 22,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    fontWeight: "900",
    marginLeft: 3,
  },
  ringGoal: {
    color: "#64748B",
    fontSize: 10,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    letterSpacing: 1.2,
    marginTop: 2,
  },
  quickAddRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 14,
  },
  quickAddBtnWrapper: {
    flex: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.035)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.22)",
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  quickAddBtn: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  quickAddBtnPressed: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
  },
  quickAddContent: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 4,
  },
  quickAddText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  customWaterRow: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.22)",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    paddingRight: 6,
    height: 44,
    borderRadius: 12,
  },
  waterInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13.5,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    marginLeft: 8,
    paddingVertical: 0,
  },
  waterInputUnit: {
    color: "#64748B",
    fontSize: 10.5,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "700",
    marginRight: 8,
  },
  saveInlineBtn: {
    borderRadius: 9,
    overflow: "hidden",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  saveInlineBtnGradient: {
    height: 32,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveInlineText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  nutritionCoachCard: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.22)",
    padding: 16,
    gap: 12,
    overflow: "hidden",
    shadowColor: "#0284C7",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 3,
  },
  nutritionCoachTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nutritionAvatarShell: {
    width: 44,
    height: 44,
    position: "relative",
  },
  nutritionAvatarPanel: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#131E33",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  nutritionAvatar: {
    width: 44,
    height: 44,
  },
  coachActiveDot: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2DD4BF",
    borderWidth: 1.5,
    borderColor: "#0F1626",
  },
  nutritionCoachCopy: {
    flex: 1,
    gap: 2,
  },
  coachBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  nutritionCoachLabel: {
    color: "#38BDF8",
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  nutritionCoachText: {
    color: "#E2E8F0",
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: "800",
    fontFamily: Platform.select({ android: "sans-serif-medium", ios: "System" }),
  },
  nutritionProtein: {
    color: "#2DD4BF",
    fontWeight: "900",
  },
  nutritionLunch: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 4,
  },
  nutritionLunchLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  nutritionLunchLabel: {
    color: "#2DD4BF",
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  nutritionLunchText: {
    color: "#F8FAFC",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: Platform.select({ android: "sans-serif-medium", ios: "System" }),
  },
  nutritionLunchMacrosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  lunchKcalText: {
    color: "#38BDF8",
    fontSize: 10.5,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "800",
  },
  lunchDivider: {
    color: "#475569",
    fontSize: 10,
  },
  lunchProteinHighlight: {
    color: "#2DD4BF",
    fontSize: 10.5,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "800",
  },
  nutritionPlan: {
    width: "100%",
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
    backgroundColor: "#101827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  nutritionPlanPressed: {
    backgroundColor: "#162238",
    borderColor: "rgba(56, 189, 248, 0.5)",
  },
  nutritionPlanContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  nutritionPlanText: {
    color: "#38BDF8",
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
