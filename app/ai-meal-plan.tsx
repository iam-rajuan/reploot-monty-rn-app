import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  Calendar,
  Camera,
  Check,
  Clock,
  Flame,
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

  const [viewMode, setViewMode] = useState<"today" | "week">("today");
  const [isRegenerating, setIsRegenerating] = useState(false);

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
      typeColor: "#38BDF8",
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
      typeColor: "#38BDF8",
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
      typeColor: "#38BDF8",
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
              size={13}
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
              size={13}
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
              <Text style={styles.sectionTitle}>TODAY'S SCHEDULE</Text>
              <View style={styles.sectionCountBadge}>
                <Text style={styles.sectionCountText}>
                  {loggedMeals.length}/{meals.length} LOGGED
                </Text>
              </View>
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
                    {/* Top Row: Type Label + Time + Action Button */}
                    <View style={styles.mealTopRow}>
                      <View style={styles.mealBadgeGroup}>
                        <View style={styles.typeBadge}>
                          <Text
                            style={[styles.typeText, { color: meal.typeColor }]}
                          >
                            {meal.type}
                          </Text>
                        </View>

                        <View style={styles.timingBadge}>
                          <Clock size={11} color="#64748B" />
                          <Text style={styles.timingText}>{meal.time}</Text>
                          <Text style={styles.prepTimeDot}>•</Text>
                          <Text style={styles.prepTimeText}>{meal.prepTime}</Text>
                        </View>
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

                    {/* Meal Name */}
                    <Text style={styles.mealName}>{meal.name}</Text>

                    {/* Macro Details & Calories Row */}
                    <View style={styles.mealBottomRow}>
                      {/* Calories badge */}
                      <View style={styles.kcalBadge}>
                        <Flame size={12} color="#38BDF8" />
                        <Text style={styles.kcalNumber}>{meal.calories}</Text>
                        <Text style={styles.kcalLabel}>KCAL</Text>
                      </View>

                      {/* Clean Macro Telemetry */}
                      <View style={styles.mealMacrosRow}>
                        <Text style={styles.macroVal}>
                          {meal.protein}g <Text style={styles.macroKey}>P</Text>
                        </Text>
                        <Text style={styles.macroDotDivider}>•</Text>
                        <Text style={styles.macroVal}>
                          {meal.carbs}g <Text style={styles.macroKey}>C</Text>
                        </Text>
                        <Text style={styles.macroDotDivider}>•</Text>
                        <Text style={styles.macroVal}>
                          {meal.fat}g <Text style={styles.macroKey}>F</Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
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
              <View style={styles.sectionCountBadge}>
                <Text style={styles.sectionCountText}>PAST 7 DAYS</Text>
              </View>
            </View>

            {/* Week History Cards List */}
            <View style={styles.historyList}>
              {WEEK_HISTORY_DATA.map((day) => {
                const progressPct = Math.min(
                  100,
                  Math.round((day.caloriesTaken / day.caloriesTarget) * 100),
                );
                const isFullyLogged = day.mealsLogged === day.totalMeals;

                return (
                  <View
                    key={day.id}
                    style={[
                      styles.historyCard,
                      day.isToday && styles.historyCardToday,
                    ]}
                  >
                    {/* Header Row: Day Info on Left, Calories & Status on Right */}
                    <View style={styles.historyCardHeader}>
                      <View style={styles.historyDateCol}>
                        <View style={styles.historyDayTitleRow}>
                          <Text
                            style={[
                              styles.historyDayTitle,
                              day.isToday && styles.historyDayTitleToday,
                            ]}
                          >
                            {day.dayName}
                          </Text>
                          {day.isToday && (
                            <View style={styles.currentBadge}>
                              <Text style={styles.currentBadgeText}>
                                CURRENT
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.historyDateSubtitle}>
                          {day.dateStr}
                        </Text>
                      </View>

                      <View style={styles.historyRightCol}>
                        <View style={styles.historyCalorieBadge}>
                          <Text style={styles.historyCaloriesText}>
                            {day.caloriesTaken.toLocaleString()}
                          </Text>
                          <Text style={styles.historyTargetText}>
                            /{day.caloriesTarget.toLocaleString()} kcal
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.mealsLoggedPill,
                            isFullyLogged && styles.mealsLoggedPillComplete,
                          ]}
                        >
                          <Check
                            size={10}
                            color={isFullyLogged ? "#2DD4BF" : "#94A3B8"}
                          />
                          <Text
                            style={[
                              styles.mealsLoggedText,
                              isFullyLogged && styles.mealsLoggedTextComplete,
                            ]}
                          >
                            {day.mealsLogged}/{day.totalMeals} LOGGED
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Progress Bar with Percentage */}
                    <View style={styles.historyBarContainer}>
                      <View style={styles.historyBarTrack}>
                        <LinearGradient
                          colors={
                            progressPct >= 95
                              ? ["#0284C7", "#2DD4BF"]
                              : ["#0284C7", "#38BDF8"]
                          }
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0.5 }}
                          style={[
                            styles.historyBarFill,
                            { width: `${progressPct}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.historyProgressPercent}>
                        {progressPct}%
                      </Text>
                    </View>

                    {/* Unified Macro Telemetry Bar */}
                    <View style={styles.historyNutrientsRow}>
                      <View style={styles.nutrientCol}>
                        <Text style={styles.nutrientLabel}>PROTEIN</Text>
                        <View style={styles.nutrientValueRow}>
                          <Text style={styles.nutrientValue}>
                            {day.proteinTaken}g
                          </Text>
                          <Text style={styles.nutrientTarget}>
                            /{day.proteinTarget}g
                          </Text>
                        </View>
                      </View>

                      <View style={styles.nutrientDivider} />

                      <View style={styles.nutrientCol}>
                        <Text style={styles.nutrientLabel}>CARBS</Text>
                        <View style={styles.nutrientValueRow}>
                          <Text style={styles.nutrientValue}>
                            {day.carbsTaken}g
                          </Text>
                          <Text style={styles.nutrientTarget}>
                            /{day.carbsTarget}g
                          </Text>
                        </View>
                      </View>

                      <View style={styles.nutrientDivider} />

                      <View style={styles.nutrientCol}>
                        <Text style={styles.nutrientLabel}>FAT</Text>
                        <View style={styles.nutrientValueRow}>
                          <Text style={styles.nutrientValue}>
                            {day.fatTaken}g
                          </Text>
                          <Text style={styles.nutrientTarget}>
                            /{day.fatTarget}g
                          </Text>
                        </View>
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
            style={({ pressed }) => [
              styles.scanBtn,
              pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
            ]}
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
            style={({ pressed }) => [
              styles.adjustBtn,
              pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
            ]}
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/nutrition-ai?mode=adjust");
            }}
            accessibilityRole="button"
            accessibilityLabel="Adjust meal plan with AI"
          >
            <LinearGradient
              colors={["rgba(56, 189, 248, 0.16)", "rgba(2, 132, 199, 0.08)"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.adjustBtnGradient}
            >
              <Sparkles size={15} color="#38BDF8" />
              <Text style={styles.adjustBtnText}>ADJUST MEAL PLAN WITH AI</Text>
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
    backgroundColor: "#070A11",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  titleSection: {
    marginTop: 6,
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
    marginBottom: 8,
  },
  titleBadgeText: {
    color: "#38BDF8",
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  mainTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "900",
    fontFamily: Platform.select({ android: "sans-serif-medium", ios: "System" }),
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: Platform.select({ android: "sans-serif", ios: "System" }),
    fontWeight: "500",
    marginTop: 5,
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#0B101D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 3,
    marginBottom: 20,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: "#162035",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.35)",
  },
  tabBtnText: {
    color: "#64748B",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  tabBtnTextActive: {
    color: "#38BDF8",
    fontWeight: "900",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  sectionTitle: {
    color: "#CBD5E1",
    fontSize: 11.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 1,
    flex: 1,
  },
  sectionCountBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sectionCountText: {
    color: "#94A3B8",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  mealList: {
    gap: 12,
    marginBottom: 22,
  },
  mealCard: {
    backgroundColor: "#0D1322",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    padding: 16,
  },
  mealCardCompleted: {
    borderColor: "rgba(45, 212, 191, 0.32)",
    backgroundColor: "#0C171F",
  },
  mealTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mealBadgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  typeText: {
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  timingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timingText: {
    color: "#94A3B8",
    fontSize: 10.5,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  prepTimeDot: {
    color: "#475569",
    fontSize: 9,
  },
  prepTimeText: {
    color: "#64748B",
    fontSize: 10.5,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  completedBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(45, 212, 191, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.45)",
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
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.35)",
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
  mealName: {
    color: "#F8FAFC",
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Platform.select({ android: "sans-serif-medium", ios: "System" }),
    fontWeight: "700",
    letterSpacing: 0.2,
    marginTop: 12,
    marginBottom: 14,
  },
  mealBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  kcalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  kcalNumber: {
    color: "#38BDF8",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "900",
  },
  kcalLabel: {
    color: "#38BDF8",
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "800",
    opacity: 0.85,
  },
  mealMacrosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  macroVal: {
    color: "#CBD5E1",
    fontSize: 11.5,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  macroDotDivider: {
    color: "#334155",
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "monospace",
    marginHorizontal: 1,
  },
  macroKey: {
    color: "#64748B",
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "800",
  },
  historyList: {
    gap: 12,
    marginBottom: 22,
  },
  historyCard: {
    backgroundColor: "#0D1322",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    padding: 16,
  },
  historyCardToday: {
    borderColor: "rgba(56, 189, 248, 0.32)",
    backgroundColor: "#0D1829",
  },
  historyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  historyDateCol: {
    flex: 1,
  },
  historyDayTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  currentBadge: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  currentBadgeText: {
    color: "#38BDF8",
    fontSize: 8.5,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  historyDateSubtitle: {
    color: "#64748B",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
    marginTop: 2,
  },
  historyRightCol: {
    alignItems: "flex-end",
    gap: 4,
  },
  historyCalorieBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  historyCaloriesText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "900",
  },
  historyTargetText: {
    color: "#64748B",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  mealsLoggedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
    gap: 4,
  },
  mealsLoggedPillComplete: {
    backgroundColor: "rgba(45, 212, 191, 0.1)",
    borderColor: "rgba(45, 212, 191, 0.3)",
  },
  mealsLoggedText: {
    color: "#94A3B8",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  mealsLoggedTextComplete: {
    color: "#2DD4BF",
  },
  historyBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 12,
  },
  historyBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  historyBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  historyProgressPercent: {
    color: "#94A3B8",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "800",
    width: 32,
    textAlign: "right",
  },
  historyNutrientsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.025)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  nutrientCol: {
    flex: 1,
    alignItems: "flex-start",
  },
  nutrientLabel: {
    color: "#64748B",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  nutrientValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  nutrientValue: {
    color: "#F8FAFC",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "800",
  },
  nutrientTarget: {
    color: "#475569",
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  nutrientDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginHorizontal: 8,
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
    height: 50,
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
  adjustBtn: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.55)",
    backgroundColor: "#0D172A",
    overflow: "hidden",
  },
  adjustBtnGradient: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  adjustBtnText: {
    color: "#38BDF8",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 1,
  },
  regenerateBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
    backgroundColor: "#0D1527",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  regenerateBtnPressed: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
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
