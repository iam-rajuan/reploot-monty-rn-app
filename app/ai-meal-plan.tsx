import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import {
  ArrowRight,
  Calendar,
  Camera,
  MessageCircle,
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
import DraggableFlatList, {
  useNestableScrollContainerContext,
  type RenderItemParams,
} from "react-native-draggable-flatlist";
import {
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/shared/components/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  HORIZONTAL_PADDING,
  clampFontSize,
  isSmallDevice,
} from "@/shared/utils/responsive";
import {
  useNutritionPlanStore,
  type UnifiedMeal,
} from "@/stores/nutritionPlanStore";
import { typography } from "@/theme/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

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
// One accent for the whole page.
const ACCENT = "#38BDF8";
const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;
const SURFACE_WASH = [
  "rgba(56,189,248,0.10)",
  "rgba(139,92,246,0.05)",
  "rgba(255,255,255,0.02)",
] as const;
const MealItemSeparator = () => <View style={styles.mealItemSeparator} />;

const MealSwipeShell = ({
  mealName,
  onSwipeStart,
  onSwipeOpen,
  onSwipeClose,
  onRegenerate,
  onDelete,
  onLongPress,
  isDragging = false,
  children,
}: {
  mealName: string;
  onSwipeStart: () => void;
  onSwipeOpen: (closeActiveRow: () => void) => void;
  onSwipeClose: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
  onLongPress?: () => void;
  isDragging?: boolean;
  children: React.ReactNode;
}) => {
  const swipeableRef = useRef<SwipeableMethods | null>(null);
  const nestableContext = useNestableScrollContainerContext();
  const scrollableRef = nestableContext?.scrollableRef;

  const runAction = (callback: () => void) => {
    swipeableRef.current?.close();
    callback();
  };

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      enabled={!isDragging}
      simultaneousWithExternalGesture={scrollableRef}
      friction={1.5}
      rightThreshold={MEAL_ACTION_DRAWER_WIDTH * 0.32}
      dragOffsetFromRightEdge={8}
      overshootRight={false}
      containerStyle={styles.mealSwipeShell}
      renderRightActions={() => (
        <View style={styles.mealSwipeActions}>
          <Pressable
            onPress={() => runAction(onRegenerate)}
            style={styles.mealSwipeAction}
            accessibilityRole="button"
            accessibilityLabel={`Regenerate ${mealName}`}
          >
            <View style={styles.mealRegenerateCircle}>
              <RefreshCw size={18} color="#FFF" />
            </View>
            <Text style={styles.mealRegenerateLabel}>Regenerate</Text>
          </Pressable>
          <Pressable
            onPress={() => runAction(onDelete)}
            style={styles.mealSwipeAction}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${mealName}`}
          >
            <View style={styles.mealDeleteCircle}>
              <Trash2 size={18} color="#FFF" />
            </View>
            <Text style={styles.mealDeleteLabel}>Delete</Text>
          </Pressable>
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
        delayLongPress={240}
        accessibilityHint={
          onLongPress
            ? "Press and hold to drag and rearrange this meal"
            : undefined
        }
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
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
        const todayCalories = loggedMeals.reduce(
          (acc, m) => acc + m.calories,
          0,
        );
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

  const commonHeader = (
    <>
      {/* Title Header */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>MEALS & LOGS</Text>
        <Text style={styles.titleSub}>
          {loggedMeals.length}/{meals.length} meals logged today
        </Text>
      </View>

      {/* Meal Logged Confirmation Banner */}
      {justLoggedBannerVisible && (
        <View style={styles.loggedSuccessBanner}>
          <LinearGradient
            colors={["rgba(56, 189, 248, 0.16)", "rgba(56, 189, 248, 0.06)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.loggedSuccessGradient}
          >
            <View style={styles.loggedSuccessIconCircle}>
              <Check size={13} color="#FFFFFF" strokeWidth={3} />
            </View>
            <View style={styles.loggedSuccessTextCol}>
              <Text style={styles.loggedSuccessTitle}>
                Meal logged
              </Text>
              <Text style={styles.loggedSuccessSub}>
                Added to today's schedule as completed
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
          style={[styles.tabBtn, viewMode === "today" && styles.tabBtnActive]}
          onPress={() => {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
            setViewMode("today");
          }}
          accessibilityRole="button"
          accessibilityLabel="View today's schedule"
        >
          <Utensils
            size={13}
            color={viewMode === "today" ? "#F8FAFC" : "#64748B"}
          />
          <Text
            style={[
              styles.tabBtnText,
              viewMode === "today" && styles.tabBtnTextActive,
            ]}
          >
            TODAY
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabBtn, viewMode === "week" && styles.tabBtnActive]}
          onPress={() => {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
            setViewMode("week");
          }}
          accessibilityRole="button"
          accessibilityLabel="View weekly history"
        >
          <Calendar
            size={13}
            color={viewMode === "week" ? "#F8FAFC" : "#64748B"}
          />
          <Text
            style={[
              styles.tabBtnText,
              viewMode === "week" && styles.tabBtnTextActive,
            ]}
          >
            HISTORY
          </Text>
        </Pressable>
      </View>
    </>
  );

  const bottomActions = (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.scanBtn}
        onPress={() => {
          triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/scan-meal");
        }}
        accessibilityRole="button"
        accessibilityLabel="Scan food to log"
      >
        <LinearGradient
          colors={BUTTON_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scanBtnGradient}
        >
          <LinearGradient
            pointerEvents="none"
            colors={SHEEN}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.btnSheen}
          />
          <Camera size={17} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.scanBtnText}>SCAN A MEAL</Text>
          <View style={styles.btnTrail}>
            <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.6} />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.adjustBtn}
        onPress={() => {
          triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/coach?context=nutrition");
        }}
        accessibilityRole="button"
        accessibilityLabel="Adjust meal plan with your coach"
      >
        <MessageCircle size={16} color="#7DD3FC" strokeWidth={2.3} />
        <Text style={styles.adjustBtnText}>ADJUST WITH COACH</Text>
      </TouchableOpacity>
    </View>
  );

  const todayListHeader = useMemo(
    () => (
      <>
        {commonHeader}
        {/* Meal Schedule Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconBadge}>
            <Utensils size={13} color={ACCENT} />
          </View>
          <Text style={styles.sectionTitle}>TODAY'S MEALS</Text>
          <View style={styles.sectionCountBadge}>
            <Text style={styles.sectionCountText}>
              {loggedMeals.length}/{meals.length} LOGGED
            </Text>
          </View>
        </View>
      </>
    ),
    [commonHeader, loggedMeals.length, meals.length],
  );

  return (
    <View style={styles.container}>
      <ScreenBackground />
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

      {viewMode === "today" ? (
        <DraggableFlatList
          data={meals}
          keyExtractor={(meal) => String(meal.id)}
          activationDistance={18}
          autoscrollThreshold={90}
          autoscrollSpeed={78}
          animationConfig={{
            damping: 18,
            stiffness: 360,
            mass: 0.25,
            overshootClamping: true,
            energyThreshold: 0.01,
          }}
          contentContainerStyle={[
            styles.scrollContent,
            styles.mealList,
            { paddingBottom: Math.max(insets.bottom + 90, 110) },
          ]}
          ItemSeparatorComponent={MealItemSeparator}
          ListHeaderComponent={todayListHeader}
          ListFooterComponent={bottomActions}
          onDragEnd={({ data }) => {
            handleMealReorder(data);
          }}
          renderItem={({
            item: meal,
            drag,
            isActive,
            getIndex,
          }: RenderItemParams<UnifiedMeal>) => {
            const index = getIndex() ?? 0;
            const isFirstScanned =
              meal.type === "SCANNED" &&
              (index === 0 || meals[index - 1]?.type !== "SCANNED");

            return (
              <View key={meal.id}>
                {isFirstScanned && (
                  <View style={styles.scannedDividerRow}>
                    <View style={styles.scannedDividerLine} />
                    <View style={styles.scannedDividerBadge}>
                      <Camera
                        size={11}
                        color="#38BDF8"
                        style={{ marginRight: 5 }}
                      />
                      <Text style={styles.scannedDividerText}>
                        SCANNED MEALS QUEUE
                      </Text>
                    </View>
                    <View style={styles.scannedDividerLine} />
                  </View>
                )}

                <MealSwipeShell
                  mealName={meal.name}
                  isDragging={isActive}
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
                    <LinearGradient
                      pointerEvents="none"
                      colors={SURFACE_WASH}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
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
                              <Camera
                                size={10}
                                color="#38BDF8"
                                style={{ marginRight: 4 }}
                              />
                              <Text style={styles.scannedTypeText}>
                                SCANNED
                              </Text>
                            </View>
                          ) : (
                            <Text style={styles.typeText}>{meal.type}</Text>
                          )}
                        </View>

                        <View style={styles.timingBadge}>
                          <Clock size={11} color="#64748B" />
                          <Text style={styles.timingText}>{meal.time}</Text>
                          <Text style={styles.prepTimeDot}>•</Text>
                          <Text style={styles.prepTimeText}>
                            {meal.prepTime}
                          </Text>
                        </View>
                      </View>

                      {/* Log / Completed Action Button */}
                      {meal.completed ? (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.completedBtn}
                          onPress={() => handleToggleMealLog(meal.id)}
                          accessibilityRole="button"
                          accessibilityLabel="Meal logged, tap to unmark"
                        >
                          <Check size={12} color="#04121C" strokeWidth={3} />
                          <Text style={styles.completedBtnText}>LOGGED</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.logBtn}
                          onPress={() => handleToggleMealLog(meal.id)}
                          accessibilityRole="button"
                          accessibilityLabel="Log meal"
                        >
                          <Plus size={12} color="#7DD3FC" strokeWidth={2.8} />
                          <Text style={styles.logBtnText}>LOG</Text>
                        </TouchableOpacity>
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
              </View>
            );
          }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 90, 110) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {commonHeader}
          {/* Week History Section Header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBadge}>
              <Calendar size={13} color={ACCENT} />
            </View>
            <Text style={styles.sectionTitle}>LAST 7 DAYS</Text>
            <View style={styles.sectionCountBadge}>
              <Text style={styles.sectionCountText}>
                {computedWeekHistory.filter((d) => d.mealsLogged === d.totalMeals).length}/7 COMPLETE
              </Text>
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
                  <LinearGradient
                    pointerEvents="none"
                    colors={SURFACE_WASH}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
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
                            <Text style={styles.currentBadgeText}>CURRENT</Text>
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
                          color={isFullyLogged ? "#7DD3FC" : "#94A3B8"}
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
                        colors={["#0EA5E9", "#7DD3FC"]}
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
          {bottomActions}
        </ScrollView>
      )}
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
    marginBottom: 16,
    gap: 4,
  },
  mainTitle: {
    ...typography.pageTitle,
    color: "#FFFFFF",
  },
  tabSwitcher: {
    flexDirection: "row",
    gap: 6,
    padding: 4,
    marginBottom: 18,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.14)",
  },
  tabBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabBtnActive: {
    backgroundColor: "rgba(56,189,248,0.16)",
    borderColor: "rgba(56,189,248,0.5)",
  },
  tabBtnText: {
    ...typography.buttonSmall,
    color: "#8B9AB0",
    letterSpacing: 0.8,
  },
  tabBtnTextActive: {
    color: "#F8FAFC",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: "#E5EEF8",
    flex: 1,
  },
  sectionCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  sectionCountText: {
    ...typography.badge,
    color: "#7DD3FC",
  },
  mealList: {
    marginBottom: 22,
  },
  mealItemSeparator: {
    height: 12,
  },
  mealSwipeShell: { width: "100%" },
  mealSwipeActions: {
    width: MEAL_ACTION_DRAWER_WIDTH,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    paddingRight: 4,
  },
  mealSwipeAction: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  mealRegenerateCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.18)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.45)",
  },
  mealDeleteCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244,63,94,0.18)",
    borderWidth: 1,
    borderColor: "rgba(244,63,94,0.45)",
  },
  mealRegenerateLabel: {
    ...typography.caption,
    fontWeight: "600",
    color: "#7DD3FC",
    marginTop: 4,
  },
  mealDeleteLabel: {
    ...typography.caption,
    fontWeight: "600",
    color: "#FB7185",
    marginTop: 4,
  },
  mealCard: {
    backgroundColor: "#111A25",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.16)",
    padding: isSmallDevice ? 14 : 16,
    gap: 10,
    overflow: "hidden",
  },
  mealCardDragging: {
    borderColor: "#38BDF8",
    transform: [{ scale: 1.02 }],
  },
  mealCardCompleted: {
    borderColor: "rgba(56,189,248,0.35)",
  },
  mealCardScanned: {
    borderStyle: "dashed",
  },
  scannedTypeBadge: {
    backgroundColor: "rgba(56,189,248,0.14)",
  },
  scannedBadgeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  scannedTypeText: {
    ...typography.badge,
    color: "#7DD3FC",
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
    fontSize: clampFontSize(10),
    letterSpacing: 0.8,
  },
  mealCardJustLogged: {
    borderColor: "#38BDF8",
    borderWidth: 1.5,
  },
  loggedSuccessBanner: {
    marginBottom: 14,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
  },
  loggedSuccessGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  loggedSuccessIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0EA5E9",
  },
  loggedSuccessTextCol: {
    flex: 1,
    gap: 2,
  },
  loggedSuccessTitle: {
    ...typography.cardTitle,
    fontSize: 14,
    lineHeight: 18,
    color: "#F8FAFC",
  },
  loggedSuccessSub: {
    ...typography.caption,
    color: "#94A3B8",
  },
  loggedSuccessDismiss: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  mealTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  mealBadgeGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
  },
  typeText: {
    ...typography.badge,
    color: "#7DD3FC",
  },
  timingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  timingText: {
    ...typography.caption,
    color: "#8B9AB0",
  },
  prepTimeDot: {
    ...typography.caption,
    color: "#475569",
  },
  prepTimeText: {
    ...typography.caption,
    color: "#8B9AB0",
  },
  completedBtn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#38BDF8",
    borderWidth: 1,
    borderColor: "#38BDF8",
  },
  completedBtnText: {
    ...typography.badge,
    color: "#04121C",
  },
  logBtn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
  },
  logBtnText: {
    ...typography.badge,
    color: "#7DD3FC",
  },
  mealName: {
    ...typography.cardTitle,
    color: "#F8FAFC",
  },
  mealBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.10)",
  },
  kcalBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  kcalNumber: {
    ...typography.cardTitle,
    color: "#F8FAFC",
    fontVariant: ["tabular-nums"],
  },
  kcalLabel: {
    ...typography.overline,
    color: "#8B9AB0",
  },
  mealMacrosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  macroVal: {
    ...typography.caption,
    fontWeight: "700",
    color: "#CBD5E1",
    fontVariant: ["tabular-nums"],
  },
  macroDotDivider: {
    ...typography.caption,
    color: "#334155",
  },
  macroKey: {
    fontWeight: "600",
    color: "#64748B",
  },
  historyList: {
    gap: 12,
    marginBottom: 22,
  },
  historyCard: {
    backgroundColor: "#111A25",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.14)",
    padding: isSmallDevice ? 14 : 16,
    gap: 12,
    overflow: "hidden",
  },
  historyCardToday: {
    borderColor: "rgba(56,189,248,0.45)",
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
    ...typography.cardTitle,
    fontSize: 14,
    lineHeight: 18,
    color: "#E5EEF8",
  },
  historyDayTitleToday: {
    color: "#F8FAFC",
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#0EA5E9",
  },
  currentBadgeText: {
    ...typography.badge,
    color: "#FFFFFF",
  },
  historyDateSubtitle: {
    ...typography.overline,
    color: "#64748B",
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
    ...typography.cardTitle,
    color: "#F8FAFC",
    fontVariant: ["tabular-nums"],
  },
  historyTargetText: {
    ...typography.caption,
    color: "#64748B",
  },
  mealsLoggedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.08)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
  },
  mealsLoggedPillComplete: {
    backgroundColor: "rgba(56,189,248,0.10)",
    borderColor: "rgba(56,189,248,0.35)",
  },
  mealsLoggedText: {
    ...typography.badge,
    color: "#94A3B8",
  },
  mealsLoggedTextComplete: {
    color: "#7DD3FC",
  },
  historyBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 12,
  },
  historyBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  historyBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  historyProgressPercent: {
    ...typography.caption,
    fontWeight: "700",
    color: "#CBD5E1",
    fontVariant: ["tabular-nums"],
    minWidth: 34,
    textAlign: "right",
  },
  historyNutrientsRow: {
    flexDirection: "row",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.10)",
  },
  nutrientCol: {
    flex: 1,
    alignItems: "flex-start",
  },
  nutrientLabel: {
    ...typography.overline,
    color: "#64748B",
  },
  nutrientValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  nutrientValue: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: "#F1F5F9",
    fontVariant: ["tabular-nums"],
  },
  nutrientTarget: {
    ...typography.caption,
    color: "#64748B",
  },
  nutrientDivider: {
    width: 1,
    marginHorizontal: 10,
    backgroundColor: "rgba(148,163,184,0.12)",
  },
  actionsContainer: {
    gap: 10,
    marginTop: 8,
  },
  scanBtn: {
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
  scanBtnGradient: {
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
  scanBtnText: {
    ...typography.button,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  adjustBtn: {
    height: 50,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(56,189,248,0.08)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  adjustBtnText: {
    ...typography.button,
    color: "#7DD3FC",
    letterSpacing: 1,
  },
  titleSub: {
    ...typography.body,
    color: "#94A3B8",
  },
  btnSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  btnTrail: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
