import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import {
  Calendar,
  Camera,
  Check,
  Clock,
  Flame,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Utensils,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  ScaleDecorator,
  type RenderItemParams,
} from "react-native-draggable-flatlist";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HORIZONTAL_PADDING, clampFontSize, isSmallDevice } from "@/shared/utils/responsive";
import { useNutritionPlanStore, type UnifiedMeal } from "@/stores/nutritionPlanStore";

export type { UnifiedMeal };

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

const MEAL_ACTION_DRAWER_WIDTH = 144;
const MealSwipeShell = ({
  mealName,
  onSwipeStart,
  onSwipeOpen,
  onSwipeClose,
  onRegenerate,
  onDelete,
  onLongPress,
  children,
}: {
  mealName: string;
  onSwipeStart: () => void;
  onSwipeOpen: (closeActiveRow: () => void) => void;
  onSwipeClose: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
}) => {
  const swipeableRef = useRef<SwipeableMethods | null>(null);

  const runAction = (callback: () => void) => {
    swipeableRef.current?.close();
    callback();
  };

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={1.5}
      rightThreshold={MEAL_ACTION_DRAWER_WIDTH * 0.32}
      dragOffsetFromRightEdge={8}
      overshootRight={false}
      containerStyle={styles.mealSwipeShell}
      renderRightActions={() => (
        <View style={styles.mealSwipeActions}>
          <Pressable onPress={() => runAction(onRegenerate)} style={styles.mealSwipeAction} accessibilityRole="button" accessibilityLabel={`Regenerate ${mealName}`}><View style={styles.mealRegenerateCircle}><RefreshCw size={18} color="#FFF" /></View><Text style={styles.mealRegenerateLabel}>Regenerate</Text></Pressable>
          <Pressable onPress={() => runAction(onDelete)} style={styles.mealSwipeAction} accessibilityRole="button" accessibilityLabel={`Delete ${mealName}`}><View style={styles.mealDeleteCircle}><Trash2 size={18} color="#FFF" /></View><Text style={styles.mealDeleteLabel}>Delete</Text></Pressable>
        </View>
      )}
      onSwipeableOpenStartDrag={(direction) => {
        if (direction === "left") onSwipeStart();
      }}
      onSwipeableWillOpen={(direction) => {
        if (direction === "left") {
          // A new row should be able to take over immediately, so reset the
          // prior row without waiting for its close animation.
          onSwipeOpen(() => swipeableRef.current?.reset());
        }
      }}
      onSwipeableClose={onSwipeClose}
    >
      <Pressable
        onLongPress={onLongPress}
        delayLongPress={450}
        accessibilityHint={onLongPress ? "Press and hold to drag and rearrange this meal" : undefined}
      >
        {children}
      </Pressable>
    </ReanimatedSwipeable>
  );
};

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
  const params = useLocalSearchParams<{ tab?: string; justLogged?: string }>();

  const [viewMode, setViewMode] = useState<"today" | "week">(
    params.tab === "week" ? "week" : "today",
  );
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [justLoggedBannerVisible, setJustLoggedBannerVisible] = useState(
    params.justLogged === "true",
  );
  const activeSwipeCloserRef = useRef<(() => void) | null>(null);

  const meals = useNutritionPlanStore((state) => state.meals);
  const toggleMealLog = useNutritionPlanStore((state) => state.toggleMealLog);
  const regenerateMeal = useNutritionPlanStore((state) => state.regenerateMeal);
  const deleteMeal = useNutritionPlanStore((state) => state.deleteMeal);
  const reorderMeals = useNutritionPlanStore((state) => state.reorderMeals);
  const randomizeCalories = useNutritionPlanStore(
    (state) => state.randomizeCalories,
  );
  const lastSavedMealId = useNutritionPlanStore(
    (state) => state.lastSavedMealId,
  );

  useEffect(() => {
    if (params.tab === "today" || params.justLogged === "true") {
      setViewMode("today");
    }
    if (params.justLogged === "true") {
      setJustLoggedBannerVisible(true);
      const timer = setTimeout(() => {
        setJustLoggedBannerVisible(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [params.tab, params.justLogged]);

  const triggerHaptic = (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
  ) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(style).catch(() => {});
    }
  };

  const handleToggleMealLog = (id: number) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    const target = meals.find((m) => m.id === id);
    if (target && !target.completed && Platform.OS !== "web") {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
    }
    toggleMealLog(id);
  };

  const handleRegenerate = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      randomizeCalories();
    }, 1000);
  };

  const loggedMeals = useMemo(() => meals.filter((m) => m.completed), [meals]);

  const handleMealReorder = (orderedMeals: UnifiedMeal[]) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    reorderMeals(orderedMeals.map((meal) => meal.id));
  };

  const computedWeekHistory = useMemo(() => {
    return WEEK_HISTORY_DATA.map((day) => {
      if (day.isToday) {
        const todayCalories = loggedMeals.reduce((acc, m) => acc + m.calories, 0);
        return {
          ...day,
          mealsLogged: loggedMeals.length,
          totalMeals: meals.length,
          caloriesTaken: Math.max(day.caloriesTaken, todayCalories),
        };
      }
      return day;
    });
  }, [loggedMeals, meals.length]);

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

      <NestableScrollContainer
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 90, 110) },
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
        </View>

        {/* Meal Logged Confirmation Banner */}
        {justLoggedBannerVisible && (
          <View style={styles.loggedSuccessBanner}>
            <LinearGradient
              colors={["rgba(45, 212, 191, 0.16)", "rgba(56, 189, 248, 0.08)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loggedSuccessGradient}
            >
              <View style={styles.loggedSuccessIconCircle}>
                <Check size={13} color="#2DD4BF" strokeWidth={3} />
              </View>
              <View style={styles.loggedSuccessTextCol}>
                <Text style={styles.loggedSuccessTitle}>
                  MEAL LOGGED TO TODAY'S SCHEDULE
                </Text>
                <Text style={styles.loggedSuccessSub}>
                  Saved to today's schedule and marked as completed
                </Text>
              </View>
              <Pressable
                onPress={() => setJustLoggedBannerVisible(false)}
                hitSlop={8}
                style={styles.loggedSuccessDismiss}
                accessibilityRole="button"
                accessibilityLabel="Dismiss confirmation"
              >
                <X size={14} color="#94A3B8" />
              </Pressable>
            </LinearGradient>
          </View>
        )}

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
            <NestableDraggableFlatList
              data={meals}
              keyExtractor={(meal) => String(meal.id)}
              activationDistance={12}
              autoscrollThreshold={170}
              autoscrollSpeed={110}
              dragItemOverflow
              animationConfig={{ damping: 22, stiffness: 180, mass: 0.45 }}
              contentContainerStyle={styles.mealList}
              onDragEnd={({ data }) => handleMealReorder(data)}
              renderItem={({ item: meal, drag, isActive, getIndex }: RenderItemParams<UnifiedMeal>) => {
                const index = getIndex() ?? 0;
                const isFirstScanned =
                  meal.type === "SCANNED" &&
                  (index === 0 || meals[index - 1]?.type !== "SCANNED");

                return (
                  <ScaleDecorator activeScale={1.025}>
                    <React.Fragment key={meal.id}>
                    {isFirstScanned && (
                      <View style={styles.scannedDividerRow}>
                        <View style={styles.scannedDividerLine} />
                        <View style={styles.scannedDividerBadge}>
                          <Camera size={11} color="#38BDF8" style={{ marginRight: 5 }} />
                          <Text style={styles.scannedDividerText}>SCANNED MEALS QUEUE</Text>
                        </View>
                        <View style={styles.scannedDividerLine} />
                      </View>
                    )}

                    <MealSwipeShell
                      mealName={meal.name}
                      onSwipeStart={() => activeSwipeCloserRef.current?.()}
                      onSwipeOpen={(closeRow) => {
                        activeSwipeCloserRef.current = closeRow;
                      }}
                      onSwipeClose={() => {
                        activeSwipeCloserRef.current = null;
                      }}
                      onRegenerate={() => regenerateMeal(meal.id)}
                      onDelete={() => deleteMeal(meal.id)}
                      onLongPress={() => {
                        activeSwipeCloserRef.current?.();
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                        drag();
                      }}
                    >
                      <View
                        style={[
                          styles.mealCard,
                          isActive && styles.mealCardDragging,
                          meal.completed && styles.mealCardCompleted,
                          meal.type === "SCANNED" && styles.mealCardScanned,
                          meal.id === lastSavedMealId &&
                            justLoggedBannerVisible &&
                            styles.mealCardJustLogged,
                        ]}
                      >
                        {/* Top Row: Type Label + Time + Action Button */}
                        <View style={styles.mealTopRow}>
                          <View style={styles.mealBadgeGroup}>
                            <View
                              style={[
                                styles.typeBadge,
                                meal.type === "SCANNED" && styles.scannedTypeBadge,
                              ]}
                            >
                              {meal.type === "SCANNED" ? (
                                <View style={styles.scannedBadgeContent}>
                                  <Camera size={10} color="#38BDF8" style={{ marginRight: 4 }} />
                                  <Text style={styles.scannedTypeText}>SCANNED</Text>
                                </View>
                              ) : (
                                <Text
                                  style={[styles.typeText, { color: meal.typeColor }]}
                                >
                                  {meal.type}
                                </Text>
                              )}
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
                              onPress={() => handleToggleMealLog(meal.id)}
                              accessibilityRole="button"
                              accessibilityLabel="Meal logged, tap to unmark"
                            >
                              <Check size={12} color="#2DD4BF" strokeWidth={2.5} />
                              <Text style={styles.completedBtnText}>LOGGED</Text>
                            </Pressable>
                          ) : (
                            <Pressable
                              style={styles.logBtn}
                              onPress={() => handleToggleMealLog(meal.id)}
                              accessibilityRole="button"
                              accessibilityLabel="Log meal"
                            >
                              <Plus size={12} color="#38BDF8" strokeWidth={2.5} />
                              <Text style={styles.logBtnText}>LOG</Text>
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
                    </MealSwipeShell>
                    </React.Fragment>
                  </ScaleDecorator>
                );
              }}
            />
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
              {computedWeekHistory.map((day) => {
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
              pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
            ]}
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/coach?context=nutrition");
            }}
            accessibilityRole="button"
            accessibilityLabel="Adjust meal plan with AI"
          >
            <LinearGradient
              colors={["rgba(56, 189, 248, 0.14)", "rgba(2, 132, 199, 0.05)"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.adjustBtnGradient}
            >
              <Sparkles size={15} color="#38BDF8" style={{ marginRight: 8 }} />
              <Text style={styles.adjustBtnText}>ADJUST MEAL PLAN WITH AI</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </NestableScrollContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070A11",
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
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
    fontSize: clampFontSize(10),
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 1.2,
  },
  mainTitle: {
    color: "#FFFFFF",
    fontSize: clampFontSize(26),
    lineHeight: 32,
    fontWeight: "900",
    fontFamily: Platform.select({ android: "sans-serif-medium", ios: "System" }),
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: clampFontSize(12.5),
    lineHeight: 18,
    fontFamily: Platform.select({ android: "sans-serif", ios: "System" }),
    fontWeight: "500",
    marginTop: 4,
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
    fontSize: clampFontSize(11),
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
    fontSize: clampFontSize(11.5),
    fontFamily: "JetBrainsMono_700Bold",
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
    fontSize: clampFontSize(10),
    fontFamily: "JetBrainsMono_700Bold",
  },
  mealList: {
    gap: 12,
    marginBottom: 22,
  },
  mealSwipeShell: { width: "100%" },
  mealSwipeActions: { width: MEAL_ACTION_DRAWER_WIDTH, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8, paddingRight: 4 },
  mealSwipeAction: { width: 64, alignItems: "center", justifyContent: "center" },
  mealRegenerateCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#222736", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
  mealDeleteCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#EF4444", borderWidth: 1, borderColor: "#DC2626" },
  mealRegenerateLabel: { color: "#CBD5E1", fontSize: 9, fontWeight: "700", marginTop: 4 },
  mealDeleteLabel: { color: "#EF4444", fontSize: 9, fontWeight: "700", marginTop: 4 },
  mealCard: {
    backgroundColor: "#0D1322",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    padding: isSmallDevice ? 14 : 16,
  },
  mealCardDragging: {
    opacity: 0.92,
    transform: [{ scale: 1.015 }],
  },
  mealCardCompleted: {
    borderColor: "rgba(45, 212, 191, 0.32)",
    backgroundColor: "#0C171F",
  },
  mealCardScanned: {
    borderColor: "rgba(56, 189, 248, 0.35)",
    backgroundColor: "#0B1422",
  },
  scannedTypeBadge: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.35)",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  scannedBadgeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  scannedTypeText: {
    color: "#38BDF8",
    fontSize: clampFontSize(9.5),
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 0.8,
  },
  scannedDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    marginBottom: 6,
  },
  scannedDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(56, 189, 248, 0.2)",
  },
  scannedDividerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(14, 22, 38, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.28)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scannedDividerText: {
    color: "#38BDF8",
    fontSize: clampFontSize(9.5),
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 0.8,
  },
  mealCardJustLogged: {
    borderColor: "rgba(45, 212, 191, 0.8)",
    borderWidth: 1.5,
  },
  loggedSuccessBanner: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.4)",
  },
  loggedSuccessGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  loggedSuccessIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(45, 212, 191, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  loggedSuccessTextCol: {
    flex: 1,
  },
  loggedSuccessTitle: {
    color: "#2DD4BF",
    fontSize: clampFontSize(11),
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 0.5,
  },
  loggedSuccessSub: {
    color: "#94A3B8",
    fontSize: clampFontSize(9.5),
    marginTop: 2,
  },
  loggedSuccessDismiss: {
    padding: 4,
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
    fontSize: clampFontSize(10),
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 0.8,
  },
  timingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timingText: {
    color: "#94A3B8",
    fontSize: clampFontSize(10.5),
    fontFamily: "JetBrainsMono_700Bold",
  },
  prepTimeDot: {
    color: "#475569",
    fontSize: 9,
  },
  prepTimeText: {
    color: "#94A3B8",
    fontSize: clampFontSize(10.5),
    fontFamily: "JetBrainsMono_700Bold",
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
    fontSize: clampFontSize(10),
    fontFamily: "JetBrainsMono_700Bold",
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
    fontSize: clampFontSize(10),
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 0.6,
  },
  mealName: {
    color: "#F8FAFC",
    fontSize: clampFontSize(15),
    lineHeight: 20,
    fontFamily: Platform.select({ android: "sans-serif-medium", ios: "System" }),
    fontWeight: "700",
    letterSpacing: 0.2,
    marginTop: 10,
    marginBottom: 12,
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
    fontSize: clampFontSize(13),
    fontFamily: "JetBrainsMono_700Bold",
  },
  kcalLabel: {
    color: "#38BDF8",
    fontSize: clampFontSize(9.5),
    fontFamily: "JetBrainsMono_700Bold",
    opacity: 0.85,
  },
  mealMacrosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  macroVal: {
    color: "#CBD5E1",
    fontSize: clampFontSize(11.5),
    fontFamily: "JetBrainsMono_700Bold",
  },
  macroDotDivider: {
    color: "#64748B",
    fontSize: 11,
    lineHeight: 14,
    marginHorizontal: 1,
  },
  macroKey: {
    color: "#94A3B8",
    fontSize: clampFontSize(9.5),
    fontFamily: "JetBrainsMono_700Bold",
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
    padding: isSmallDevice ? 14 : 16,
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
    fontSize: clampFontSize(13),
    fontFamily: "JetBrainsMono_700Bold",
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
    fontSize: clampFontSize(8.5),
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 0.5,
  },
  historyDateSubtitle: {
    color: "#94A3B8",
    fontSize: clampFontSize(10),
    fontFamily: "JetBrainsMono_700Bold",
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
    fontSize: clampFontSize(13),
    fontFamily: "JetBrainsMono_700Bold",
  },
  historyTargetText: {
    color: "#94A3B8",
    fontSize: clampFontSize(10),
    fontFamily: "JetBrainsMono_700Bold",
  },
  mealsLoggedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
    gap: 4,
  },
  mealsLoggedPillComplete: {
    backgroundColor: "rgba(45, 212, 191, 0.12)",
    borderColor: "rgba(45, 212, 191, 0.35)",
  },
  mealsLoggedText: {
    color: "#94A3B8",
    fontSize: clampFontSize(9),
    fontFamily: "JetBrainsMono_700Bold",
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
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  historyBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  historyProgressPercent: {
    color: "#38BDF8",
    fontSize: clampFontSize(10),
    fontFamily: "JetBrainsMono_700Bold",
    width: 34,
    textAlign: "right",
  },
  historyNutrientsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: isSmallDevice ? 10 : 14,
  },
  nutrientCol: {
    flex: 1,
    alignItems: "flex-start",
  },
  nutrientLabel: {
    color: "#94A3B8",
    fontSize: clampFontSize(9.5),
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  nutrientValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  nutrientValue: {
    color: "#FFFFFF",
    fontSize: clampFontSize(12),
    fontFamily: "JetBrainsMono_700Bold",
  },
  nutrientTarget: {
    color: "#94A3B8",
    fontSize: clampFontSize(10),
    fontFamily: "JetBrainsMono_700Bold",
  },
  nutrientDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginHorizontal: isSmallDevice ? 4 : 8,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 14,
    marginBottom: 8,
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
    fontSize: clampFontSize(12),
    fontWeight: "900",
    letterSpacing: 1,
  },
  adjustBtn: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.45)",
    backgroundColor: "#0D172A",
    overflow: "hidden",
  },
  adjustBtnGradient: {
    minHeight: 47,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  adjustBtnText: {
    color: "#38BDF8",
    fontSize: clampFontSize(12),
    fontWeight: "900",
    letterSpacing: 1,
  },
  regenerateBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    backgroundColor: "#0B1324",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  regenerateBtnPressed: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
  },
  regenerateBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  regenerateText: {
    color: "#38BDF8",
    fontSize: clampFontSize(11.5),
    fontWeight: "900",
    letterSpacing: 1,
  },
});
