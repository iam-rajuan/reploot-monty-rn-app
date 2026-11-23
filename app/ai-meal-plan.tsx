import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import { useNutritionPlanStore } from "@/stores/nutritionPlanStore";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Flame,
  Heart,
  RefreshCw,
  Sparkles,
  Target,
  Utensils,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PlannedMeal {
  id: number;
  time: string;
  type: string;
  typeColor: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  liked: boolean;
}

export default function AiMealPlanScreen() {
  const insets = useSafeAreaInsets();
  const activateGeneratedPlan = useNutritionPlanStore(
    (state) => state.activateGeneratedPlan,
  );
  const hasGeneratedPlan = useNutritionPlanStore(
    (state) => state.hasGeneratedPlan,
  );

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [planApplied, setPlanApplied] = useState(hasGeneratedPlan);

  const [meals, setMeals] = useState<PlannedMeal[]>([
    {
      id: 1,
      time: "08:30 AM",
      type: "BREAKFAST",
      typeColor: "#38BDF8",
      name: "Avocado & Poached Egg Toast",
      calories: 420,
      protein: 22,
      carbs: 34,
      fat: 16,
      prepTime: "10m",
      liked: true,
    },
    {
      id: 2,
      time: "01:00 PM",
      type: "LUNCH",
      typeColor: "#2DD4BF",
      name: "Grilled Chicken Quinoa Bowl",
      calories: 680,
      protein: 48,
      carbs: 62,
      fat: 14,
      prepTime: "20m",
      liked: false,
    },
    {
      id: 3,
      time: "04:30 PM",
      type: "SNACK",
      typeColor: "#FFB68C",
      name: "Almond & Whey Cacao Crunch",
      calories: 310,
      protein: 18,
      carbs: 24,
      fat: 12,
      prepTime: "5m",
      liked: false,
    },
    {
      id: 4,
      time: "07:45 PM",
      type: "DINNER",
      typeColor: "#C084FC",
      name: "Atlantic Salmon & Grilled Greens",
      calories: 540,
      protein: 42,
      carbs: 16,
      fat: 22,
      prepTime: "25m",
      liked: true,
    },
  ]);

  const triggerHaptic = (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
  ) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(style).catch(() => {});
    }
  };

  const toggleLike = (id: number) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, liked: !m.liked } : m)),
    );
  };

  const handleApplyPlan = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    activateGeneratedPlan();
    setPlanApplied(true);
  };

  const handleRegenerate = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      setMeals((prev) =>
        prev.map((m) => ({
          ...m,
          calories: m.calories + Math.floor(Math.random() * 20) - 10,
        })),
      );
    }, 1000);
  };

  const totalCalories = useMemo(
    () => meals.reduce((sum, m) => sum + m.calories, 0),
    [meals],
  );
  const totalProtein = useMemo(
    () => meals.reduce((sum, m) => sum + m.protein, 0),
    [meals],
  );
  const totalCarbs = useMemo(
    () => meals.reduce((sum, m) => sum + m.carbs, 0),
    [meals],
  );
  const totalFat = useMemo(
    () => meals.reduce((sum, m) => sum + m.fat, 0),
    [meals],
  );

  const totalMacroGrams = totalProtein + totalCarbs + totalFat || 1;
  const proteinPct = Math.round((totalProtein / totalMacroGrams) * 100);
  const carbsPct = Math.round((totalCarbs / totalMacroGrams) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CustomHeader
        titleVariant="text"
        title=""
        showBackButton={true}
        showSearch={true}
        showNotifications={true}
        showAvatar={true}
        transparent={true}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 40, 60) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Header */}
        <View style={styles.titleSection}>
          <View style={styles.titleBadge}>
            <Sparkles size={11} color="#38BDF8" />
            <Text style={styles.titleBadgeText}>AI NUTRITION</Text>
          </View>
          <Text style={styles.mainTitle}>MEAL PLAN</Text>
          <Text style={styles.subtitle}>
            Calibrated daily targets and meal timing.
          </Text>
        </View>

        {/* Daily Target Hero Card */}
        <View style={styles.targetCard}>
          <View style={styles.targetHeader}>
            <View style={styles.targetBadge}>
              <Target size={12} color="#38BDF8" />
              <Text style={styles.targetBadgeText}>DAILY TARGET</Text>
            </View>
            <View style={styles.targetStatusPill}>
              <Text style={styles.targetStatusText}>{meals.length} MEALS</Text>
            </View>
          </View>

          {/* Hero Calorie Count */}
          <View style={styles.caloriesRow}>
            <Flame size={20} color="#38BDF8" style={{ marginRight: 6 }} />
            <Text style={styles.caloriesNumber}>
              {totalCalories.toLocaleString()}
            </Text>
            <Text style={styles.caloriesUnit}>KCAL</Text>
          </View>

          {/* Segmented Macro Distribution Bar */}
          <View style={styles.macroRatioBar}>
            <View
              style={[
                styles.ratioSegment,
                { width: `${proteinPct}%`, backgroundColor: "#38BDF8" },
              ]}
            />
            <View
              style={[
                styles.ratioSegment,
                { width: `${carbsPct}%`, backgroundColor: "#FFB68C" },
              ]}
            />
            <View
              style={[
                styles.ratioSegment,
                { width: `${fatPct}%`, backgroundColor: "#F43F5E" },
              ]}
            />
          </View>

          {/* Macro KPI Cards */}
          <View style={styles.macroCardsRow}>
            {/* Protein */}
            <View
              style={[
                styles.macroCard,
                { borderColor: "rgba(56, 189, 248, 0.25)" },
              ]}
            >
              <View style={styles.macroCardHeader}>
                <View
                  style={[styles.macroDot, { backgroundColor: "#38BDF8" }]}
                />
                <Text style={[styles.macroCardLabel, { color: "#38BDF8" }]}>
                  PROTEIN
                </Text>
              </View>
              <Text style={styles.macroCardValue}>{totalProtein}g</Text>
              <Text style={styles.macroCardPct}>{proteinPct}%</Text>
            </View>

            {/* Carbs */}
            <View
              style={[
                styles.macroCard,
                { borderColor: "rgba(255, 182, 140, 0.25)" },
              ]}
            >
              <View style={styles.macroCardHeader}>
                <View
                  style={[styles.macroDot, { backgroundColor: "#FFB68C" }]}
                />
                <Text style={[styles.macroCardLabel, { color: "#FFB68C" }]}>
                  CARBS
                </Text>
              </View>
              <Text style={styles.macroCardValue}>{totalCarbs}g</Text>
              <Text style={styles.macroCardPct}>{carbsPct}%</Text>
            </View>

            {/* Fat */}
            <View
              style={[
                styles.macroCard,
                { borderColor: "rgba(244, 63, 94, 0.25)" },
              ]}
            >
              <View style={styles.macroCardHeader}>
                <View
                  style={[styles.macroDot, { backgroundColor: "#F43F5E" }]}
                />
                <Text style={[styles.macroCardLabel, { color: "#F43F5E" }]}>
                  FAT
                </Text>
              </View>
              <Text style={styles.macroCardValue}>{totalFat}g</Text>
              <Text style={styles.macroCardPct}>{fatPct}%</Text>
            </View>
          </View>
        </View>

        {/* Adjust Plan Quick Action */}
        <Pressable
          style={styles.adjustPill}
          onPress={() => {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
            router.push("/nutrition-ai?mode=adjust");
          }}
          accessibilityRole="button"
          accessibilityLabel="Adjust plan with AI"
        >
          <View style={styles.adjustLeft}>
            <Sparkles color="#44EAC3" size={14} />
            <Text style={styles.adjustText}>
              Adjust calories, meals, or budget
            </Text>
          </View>
          <ChevronRight size={16} color="#44EAC3" />
        </Pressable>

        {/* Meal Schedule Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconBadge}>
            <Utensils size={12} color="#38BDF8" />
          </View>
          <Text style={styles.sectionTitle}>TODAY'S SCHEDULE</Text>
          <Text style={styles.sectionCount}>{meals.length} MEALS</Text>
        </View>

        {/* Meals List */}
        <View style={styles.mealList}>
          {meals.map((meal) => (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealTopRow}>
                <View
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor: `${meal.typeColor}15`,
                      borderColor: `${meal.typeColor}40`,
                    },
                  ]}
                >
                  <Text style={[styles.typeText, { color: meal.typeColor }]}>
                    {meal.type}
                  </Text>
                </View>

                <View style={styles.timingBadge}>
                  <Clock size={11} color="#64748B" />
                  <Text style={styles.timingText}>{meal.time}</Text>
                  <Text style={styles.prepTimeText}>• {meal.prepTime}</Text>
                </View>

                <Pressable
                  style={styles.likeBtn}
                  onPress={() => toggleLike(meal.id)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Like ${meal.name}`}
                >
                  <Heart
                    color={meal.liked ? "#F43F5E" : "#475569"}
                    fill={meal.liked ? "#F43F5E" : "transparent"}
                    size={16}
                  />
                </Pressable>
              </View>

              <Text style={styles.mealName}>{meal.name}</Text>

              <View style={styles.mealMacrosRow}>
                <View style={styles.kcalBadge}>
                  <Text style={styles.kcalText}>{meal.calories} KCAL</Text>
                </View>
                <Text style={styles.macroPillText}>{meal.protein}g P</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.macroPillText}>{meal.carbs}g C</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.macroPillText}>{meal.fat}g F</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Nutrient Timing Insight */}
        <View style={styles.insightBox}>
          <Calendar color="#38BDF8" size={15} style={{ marginTop: 2 }} />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>NUTRIENT TIMING</Text>
            <Text style={styles.insightText}>
              Carbs are concentrated post-workout to support glycogen recovery
              and sustained energy.
            </Text>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionsContainer}>
          <Pressable style={styles.applyBtn} onPress={handleApplyPlan}>
            <LinearGradient
              colors={["#0284C7", "#0EA5E9", "#38BDF8"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.applyBtnGradient}
            >
              {planApplied ? (
                <>
                  <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.applyBtnText}>
                    PLAN APPLIED TO SCHEDULE
                  </Text>
                </>
              ) : (
                <Text style={styles.applyBtnText}>APPLY TO DAILY SCHEDULE</Text>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.regenerateBtn,
              pressed && styles.regenerateBtnPressed,
            ]}
            onPress={handleRegenerate}
            disabled={isRegenerating}
            accessibilityRole="button"
            accessibilityLabel="Regenerate plan"
          >
            <View style={styles.regenerateBtnContent}>
              <RefreshCw
                color="#38BDF8"
                size={14}
                style={[
                  { marginRight: 8 },
                  isRegenerating && { transform: [{ rotate: "180deg" }] },
                ]}
              />
              <Text style={styles.regenerateText}>
                {isRegenerating ? "GENERATING..." : "REGENERATE PLAN"}
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070A12",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  titleSection: {
    marginTop: 4,
    marginBottom: 18,
  },
  titleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
    marginBottom: 6,
  },
  titleBadgeText: {
    color: "#38BDF8",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  mainTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    fontFamily: "monospace",
    letterSpacing: 1.2,
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: "monospace",
    fontWeight: "600",
    marginTop: 4,
  },
  targetCard: {
    backgroundColor: "#0D131F",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.25)",
    padding: 18,
    marginBottom: 14,
  },
  targetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  targetBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  targetBadgeText: {
    color: "#38BDF8",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  targetStatusPill: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  targetStatusText: {
    color: "#94A3B8",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  caloriesRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 14,
  },
  caloriesNumber: {
    color: "#FFFFFF",
    fontSize: 38,
    lineHeight: 42,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  caloriesUnit: {
    color: "#38BDF8",
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "800",
    marginLeft: 6,
    letterSpacing: 1,
  },
  macroRatioBar: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 16,
    gap: 2,
  },
  ratioSegment: {
    height: "100%",
    borderRadius: 2,
  },
  macroCardsRow: {
    flexDirection: "row",
    gap: 8,
  },
  macroCard: {
    flex: 1,
    backgroundColor: "#121A2B",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  macroCardHeader: {
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
  macroCardLabel: {
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  macroCardValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "monospace",
    fontWeight: "900",
    marginBottom: 1,
  },
  macroCardPct: {
    color: "#64748B",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  adjustPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(68, 234, 195, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(68, 234, 195, 0.22)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  adjustLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adjustText: {
    color: "#44EAC3",
    fontFamily: "monospace",
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  sectionTitle: {
    color: "#94A3B8",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 1.2,
    flex: 1,
  },
  sectionCount: {
    color: "#64748B",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  mealList: {
    gap: 10,
    marginBottom: 20,
  },
  mealCard: {
    backgroundColor: "#0D131F",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    padding: 14,
  },
  mealTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  timingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    marginLeft: 8,
  },
  timingText: {
    color: "#94A3B8",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  prepTimeText: {
    color: "#64748B",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  likeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  mealName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Platform.select({ android: "sans-serif-medium", ios: "System" }),
    fontWeight: "800",
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  mealMacrosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  kcalBadge: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kcalText: {
    color: "#38BDF8",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "800",
  },
  macroPillText: {
    color: "#94A3B8",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  dot: {
    color: "#475569",
    fontSize: 9,
  },
  insightBox: {
    backgroundColor: "rgba(56, 189, 248, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.18)",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    color: "#38BDF8",
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 3,
  },
  insightText: {
    color: "#94A3B8",
    fontSize: 11.5,
    fontFamily: "monospace",
    lineHeight: 16,
  },
  actionsContainer: {
    gap: 10,
  },
  applyBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  applyBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 14,
    overflow: "hidden",
  },
  applyBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 1,
  },
  regenerateBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.35)",
    backgroundColor: "#101A2C",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  regenerateBtnPressed: {
    backgroundColor: "rgba(56, 189, 248, 0.18)",
  },
  regenerateBtnContent: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  regenerateText: {
    color: "#38BDF8",
    fontSize: 11.5,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 1,
  },
});
