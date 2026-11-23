import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import { useNutritionPlanStore } from "@/stores/nutritionPlanStore";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  Calendar,
  Camera,
  Check,
  Clock,
  Plus,
  RefreshCw,
  Sparkles,
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

export interface UnifiedMeal {
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
  completed: boolean;
}

export interface DayHistory {
  id: string;
  dayName: string;
  dateStr: string;
  isToday: boolean;
  caloriesTaken: number;
  caloriesTarget: number;
  proteinTaken: number;
  proteinTarget: number;
  carbsTaken: number;
  carbsTarget: number;
  fatTaken: number;
  fatTarget: number;
  mealsLogged: number;
  totalMeals: number;
}

const WEEK_HISTORY_DATA: DayHistory[] = [
  {
    id: "sun",
    dayName: "TODAY",
    dateStr: "SUN • NOV 23",
    isToday: true,
    caloriesTaken: 1950,
    caloriesTarget: 2200,
    proteinTaken: 130,
    proteinTarget: 140,
    carbsTaken: 136,
    carbsTarget: 180,
    fatTaken: 64,
    fatTarget: 65,
    mealsLogged: 3,
    totalMeals: 4,
  },
  {
    id: "sat",
    dayName: "YESTERDAY",
    dateStr: "SAT • NOV 22",
    isToday: false,
    caloriesTaken: 2180,
    caloriesTarget: 2200,
    proteinTaken: 142,
    proteinTarget: 140,
    carbsTaken: 185,
    carbsTarget: 180,
    fatTaken: 62,
    fatTarget: 65,
    mealsLogged: 4,
    totalMeals: 4,
  },
  {
    id: "fri",
    dayName: "FRIDAY",
    dateStr: "FRI • NOV 21",
    isToday: false,
    caloriesTaken: 2250,
    caloriesTarget: 2200,
    proteinTaken: 148,
    proteinTarget: 140,
    carbsTaken: 192,
    carbsTarget: 180,
    fatTaken: 66,
    fatTarget: 65,
    mealsLogged: 4,
    totalMeals: 4,
  },
  {
    id: "thu",
    dayName: "THURSDAY",
    dateStr: "THU • NOV 20",
    isToday: false,
    caloriesTaken: 2040,
    caloriesTarget: 2200,
    proteinTaken: 135,
    proteinTarget: 140,
    carbsTaken: 170,
    carbsTarget: 180,
    fatTaken: 60,
    fatTarget: 65,
    mealsLogged: 4,
    totalMeals: 4,
  },
  {
    id: "wed",
    dayName: "WEDNESDAY",
    dateStr: "WED • NOV 19",
    isToday: false,
    caloriesTaken: 2190,
    caloriesTarget: 2200,
    proteinTaken: 144,
    proteinTarget: 140,
    carbsTaken: 182,
    carbsTarget: 180,
    fatTaken: 63,
    fatTarget: 65,
    mealsLogged: 4,
    totalMeals: 4,
  },
  {
    id: "tue",
    dayName: "TUESDAY",
    dateStr: "TUE • NOV 18",
    isToday: false,
    caloriesTaken: 1980,
    caloriesTarget: 2200,
    proteinTaken: 128,
    proteinTarget: 140,
    carbsTaken: 165,
    carbsTarget: 180,
    fatTaken: 58,
    fatTarget: 65,
    mealsLogged: 3,
    totalMeals: 4,
  },
  {
    id: "mon",
    dayName: "MONDAY",
    dateStr: "MON • NOV 17",
    isToday: false,
    caloriesTaken: 2150,
    caloriesTarget: 2200,
    proteinTaken: 140,
    proteinTarget: 140,
    carbsTaken: 178,
    carbsTarget: 180,
    fatTaken: 62,
    fatTarget: 65,
    mealsLogged: 4,
    totalMeals: 4,
  },
];

export default function UnifiedMealPlanScreen() {
  const insets = useSafeAreaInsets();
  const activateGeneratedPlan = useNutritionPlanStore(
    (state) => state.activateGeneratedPlan,
  );
  const hasGeneratedPlan = useNutritionPlanStore(
    (state) => state.hasGeneratedPlan,
  );

  const [viewMode, setViewMode] = useState<"today" | "week">("today");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [planApplied, setPlanApplied] = useState(hasGeneratedPlan);

  const [meals, setMeals] = useState<UnifiedMeal[]>([
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
      completed: true,
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
      completed: false,
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
      completed: false,
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
      completed: false,
    },
  ]);

  const triggerHaptic = (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
  ) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(style).catch(() => {});
    }
  };

  const toggleMealLog = (id: number) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setMeals((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextCompleted = !m.completed;
          if (nextCompleted && Platform.OS !== "web") {
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            ).catch(() => {});
          }
          return { ...m, completed: nextCompleted };
        }
        return m;
      }),
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

  const loggedMeals = useMemo(() => meals.filter((m) => m.completed), [meals]);

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
            <Text style={styles.titleBadgeText}>AI NUTRITION MATRIX</Text>
          </View>
          <Text style={styles.mainTitle}>MEALS & LOGS</Text>
          <Text style={styles.subtitle}>
            Daily meal schedule, macro targets & log telemetry.
          </Text>
        </View>

        {/* View Mode Switcher: Today's Schedule vs Week History */}
        <View style={styles.tabSwitcher}>
          <Pressable
            style={[
              styles.tabBtn,
              viewMode === "today" && styles.tabBtnActive,
            ]}
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              setViewMode("today");
            }}
            accessibilityRole="button"
            accessibilityLabel="View today's schedule"
          >
            <Utensils
              size={12}
              color={viewMode === "today" ? "#38BDF8" : "#64748B"}
            />
            <Text
              style={[
                styles.tabBtnText,
                viewMode === "today" && styles.tabBtnTextActive,
              ]}
            >
              TODAY'S SCHEDULE
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.tabBtn,
              viewMode === "week" && styles.tabBtnActive,
            ]}
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              setViewMode("week");
            }}
            accessibilityRole="button"
            accessibilityLabel="View weekly history"
          >
            <Calendar
              size={12}
              color={viewMode === "week" ? "#38BDF8" : "#64748B"}
            />
            <Text
              style={[
                styles.tabBtnText,
                viewMode === "week" && styles.tabBtnTextActive,
              ]}
            >
              WEEK HISTORY
            </Text>
          </Pressable>
        </View>

        {/* Dynamic Section Content */}
        {viewMode === "today" ? (
          <>
            {/* Meal Schedule Section Header */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBadge}>
                <Utensils size={12} color="#38BDF8" />
              </View>
              <Text style={styles.sectionTitle}>TODAY'S SCHEDULE & LOGS</Text>
              <Text style={styles.sectionCount}>
                {loggedMeals.length}/{meals.length} LOGGED
              </Text>
            </View>

            {/* Meals List */}
            <View style={styles.mealList}>
              {meals.map((meal) => {
                return (
                  <View
                    key={meal.id}
                    style={[
                      styles.mealCard,
                      meal.completed && styles.mealCardCompleted,
                    ]}
                  >
                    {/* Meal Header Row */}
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
                        <Text
                          style={[styles.typeText, { color: meal.typeColor }]}
                        >
                          {meal.type}
                        </Text>
                      </View>

                      <View style={styles.timingBadge}>
                        <Clock size={11} color="#64748B" />
                        <Text style={styles.timingText}>{meal.time}</Text>
                        <Text style={styles.prepTimeText}>• {meal.prepTime}</Text>
                      </View>
                    </View>

                    {/* Meal Name */}
                    <Text style={styles.mealName}>{meal.name}</Text>

                    {/* Macro Details & Action Button Row */}
                    <View style={styles.mealBottomRow}>
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

                      {/* Log / Completed Action Button */}
                      {meal.completed ? (
                        <Pressable
                          style={styles.completedBtn}
                          onPress={() => toggleMealLog(meal.id)}
                          accessibilityRole="button"
                          accessibilityLabel="Meal logged, tap to unmark"
                        >
                          <Check size={12} color="#2DD4BF" strokeWidth={2.5} />
                          <Text style={styles.completedBtnText}>COMPLETED</Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          style={styles.logBtn}
                          onPress={() => toggleMealLog(meal.id)}
                          accessibilityRole="button"
                          accessibilityLabel="Log meal"
                        >
                          <Plus size={12} color="#38BDF8" strokeWidth={2.5} />
                          <Text style={styles.logBtnText}>LOG MEAL</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Nutrient Timing Insight */}
            <View style={styles.insightBox}>
              <Calendar color="#38BDF8" size={15} style={{ marginTop: 2 }} />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>NUTRIENT TIMING</Text>
                <Text style={styles.insightText}>
                  Carbs are concentrated post-workout to support glycogen
                  recovery and sustained energy.
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Week History Section Header */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBadge}>
                <Calendar size={12} color="#38BDF8" />
              </View>
              <Text style={styles.sectionTitle}>7-DAY NUTRITION HISTORY</Text>
              <Text style={styles.sectionCount}>PAST 7 DAYS</Text>
            </View>

            {/* Week History Cards List */}
            <View style={styles.historyList}>
              {WEEK_HISTORY_DATA.map((day) => {
                const progressPct = Math.min(
                  100,
                  Math.round((day.caloriesTaken / day.caloriesTarget) * 100),
                );
                return (
                  <View
                    key={day.id}
                    style={[
                      styles.historyCard,
                      day.isToday && styles.historyCardToday,
                    ]}
                  >
                    {/* Header Row: Day, Date & Calories */}
                    <View style={styles.historyCardHeader}>
                      <View style={styles.historyDateCol}>
                        <Text
                          style={[
                            styles.historyDayTitle,
                            day.isToday && styles.historyDayTitleToday,
                          ]}
                        >
                          {day.dayName}
                        </Text>
                        <Text style={styles.historyDateSubtitle}>
                          {day.dateStr}
                        </Text>
                      </View>
                      <View style={styles.historyCalorieBadge}>
                        <Text style={styles.historyCaloriesText}>
                          {day.caloriesTaken.toLocaleString()} KCAL
                        </Text>
                        <Text style={styles.historyTargetText}>
                          / {day.caloriesTarget.toLocaleString()} target
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.historyBarTrack}>
                      <LinearGradient
                        colors={
                          progressPct >= 95
                            ? ["#0284C7", "#2DD4BF"]
                            : ["#0284C7", "#38BDF8"]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={[
                          styles.historyBarFill,
                          { width: `${progressPct}%` },
                        ]}
                      />
                    </View>

                    {/* Nutrients Taken Row */}
                    <View style={styles.historyNutrientsRow}>
                      <View style={styles.nutrientChip}>
                        <Text
                          style={[
                            styles.nutrientLabel,
                            { color: "#38BDF8" },
                          ]}
                        >
                          PROTEIN
                        </Text>
                        <Text style={styles.nutrientValue}>
                          {day.proteinTaken}g
                        </Text>
                      </View>

                      <View style={styles.nutrientChip}>
                        <Text
                          style={[
                            styles.nutrientLabel,
                            { color: "#FFB68C" },
                          ]}
                        >
                          CARBS
                        </Text>
                        <Text style={styles.nutrientValue}>
                          {day.carbsTaken}g
                        </Text>
                      </View>

                      <View style={styles.nutrientChip}>
                        <Text
                          style={[
                            styles.nutrientLabel,
                            { color: "#F43F5E" },
                          ]}
                        >
                          FAT
                        </Text>
                        <Text style={styles.nutrientValue}>
                          {day.fatTaken}g
                        </Text>
                      </View>

                      <View style={styles.mealsLoggedPill}>
                        <Check size={11} color="#2DD4BF" />
                        <Text style={styles.mealsLoggedText}>
                          {day.mealsLogged}/{day.totalMeals} LOGGED
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Bottom Actions */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={styles.scanBtn}
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/scan-meal");
            }}
            accessibilityRole="button"
            accessibilityLabel="Scan food to log"
          >
            <LinearGradient
              colors={["#0284C7", "#0EA5E9", "#38BDF8"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.scanBtnGradient}
            >
              <Camera size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.scanBtnText}>SCAN MEAL TO LOG</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={styles.applyBtn}
            onPress={handleApplyPlan}
            accessibilityRole="button"
            accessibilityLabel="Apply plan to schedule"
          >
            <View style={styles.applyBtnContent}>
              {planApplied ? (
                <>
                  <Check size={15} color="#2DD4BF" style={{ marginRight: 6 }} />
                  <Text style={styles.applyBtnAppliedText}>
                    PLAN ACTIVE IN DASHBOARD
                  </Text>
                </>
              ) : (
                <Text style={styles.applyBtnText}>APPLY TO DAILY SCHEDULE</Text>
              )}
            </View>
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
                size={13}
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
    marginBottom: 16,
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
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#0D131F",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.2)",
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: "#16233B",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.4)",
  },
  tabBtnText: {
    color: "#64748B",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  tabBtnTextActive: {
    color: "#38BDF8",
    fontWeight: "900",
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
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.07)",
    padding: 14,
  },
  mealCardCompleted: {
    borderColor: "rgba(45, 212, 191, 0.4)",
    backgroundColor: "#0D171E",
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
  mealName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Platform.select({ android: "sans-serif-medium", ios: "System" }),
    fontWeight: "800",
    letterSpacing: 0.2,
    marginBottom: 10,
  },
  mealBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  mealMacrosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
    flex: 1,
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
  completedBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(45, 212, 191, 0.14)",
    borderWidth: 1.5,
    borderColor: "#2DD4BF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  completedBtnText: {
    color: "#2DD4BF",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  logBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.4)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  logBtnText: {
    color: "#38BDF8",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  historyList: {
    gap: 10,
    marginBottom: 20,
  },
  historyCard: {
    backgroundColor: "#0D131F",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.07)",
    padding: 14,
  },
  historyCardToday: {
    borderColor: "rgba(56, 189, 248, 0.35)",
    backgroundColor: "#0D1524",
  },
  historyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  historyDateCol: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  historyDayTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  historyDayTitleToday: {
    color: "#38BDF8",
  },
  historyDateSubtitle: {
    color: "#64748B",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  historyCalorieBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  historyCaloriesText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontFamily: "monospace",
    fontWeight: "900",
  },
  historyTargetText: {
    color: "#64748B",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  historyBarTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
    marginBottom: 12,
  },
  historyBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  historyNutrientsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  nutrientChip: {
    flex: 1,
    backgroundColor: "#111A29",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  nutrientLabel: {
    fontSize: 8,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  nutrientValue: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "800",
  },
  mealsLoggedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(45, 212, 191, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.25)",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 4,
  },
  mealsLoggedText: {
    color: "#2DD4BF",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.5,
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
  scanBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  scanBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 14,
    overflow: "hidden",
  },
  scanBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 1,
  },
  applyBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "#101624",
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnText: {
    color: "#E2E8F0",
    fontSize: 11.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 1,
  },
  applyBtnAppliedText: {
    color: "#2DD4BF",
    fontSize: 11.5,
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
