import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import { HORIZONTAL_PADDING, clampFontSize, isSmallDevice } from "@/shared/utils/responsive";
import { useNutritionPlanStore } from "@/stores/nutritionPlanStore";
import MaskedView from "@react-native-masked-view/masked-view";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Activity,
  Check,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Flame,
  Minus,
  Plus,
  RotateCcw,
  Scale,
  Sliders,
  Sparkles,
  Utensils,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Line as SvgLine } from "react-native-svg";

const { width } = Dimensions.get("window");

export interface IngredientData {
  id: string;
  name: string;
  description: string;
  portionGrams: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  accentColor: string;
}

const INITIAL_INGREDIENTS: IngredientData[] = [
  {
    id: "1",
    name: "Chicken Breast",
    description: "Lean poultry breast · High biological value protein",
    portionGrams: 180,
    caloriesPer100g: 144.44, // 180g -> 260 kcal
    proteinPer100g: 16.67,  // 180g -> 30g protein
    carbsPer100g: 0,
    fatPer100g: 3.89,       // 180g -> 7g fat
    accentColor: "#38BDF8",
  },
  {
    id: "2",
    name: "Brown Rice",
    description: "Cooked whole grain · Low GI complex carbohydrates",
    portionGrams: 100,
    caloriesPer100g: 150.0,  // 100g -> 150 kcal
    proteinPer100g: 3.0,    // 100g -> 3g protein
    carbsPer100g: 36.0,     // 100g -> 36g carbs
    fatPer100g: 3.0,        // 100g -> 3g fat
    accentColor: "#FBBF24",
  },
  {
    id: "3",
    name: "Steamed Broccoli",
    description: "Tender florets · High fiber, Vitamin C & Micronutrients",
    portionGrams: 40,
    caloriesPer100g: 100.0,  // 40g -> 40 kcal
    proteinPer100g: 5.0,    // 40g -> 2g protein
    carbsPer100g: 15.0,     // 40g -> 6g carbs
    fatPer100g: 5.0,        // 40g -> 2g fat
    accentColor: "#2DD4BF",
  },
];

export default function MealAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const [ingredients, setIngredients] = useState<IngredientData[]>(INITIAL_INGREDIENTS);
  const [isEditingPortions, setIsEditingPortions] = useState(false);

  const triggerHaptic = (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
  ) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(style).catch(() => {});
    }
  };

  const handleUpdatePortion = (id: string, delta: number) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setIngredients((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = Math.max(10, Math.min(500, item.portionGrams + delta));
          return { ...item, portionGrams: next };
        }
        return item;
      }),
    );
  };

  const {
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalWeight,
    proteinPercent,
    carbsPercent,
    fatPercent,
    caloricDensity,
  } = useMemo(() => {
    let cal = 0;
    let pro = 0;
    let carb = 0;
    let fat = 0;
    let wt = 0;
    ingredients.forEach((item) => {
      const factor = item.portionGrams / 100;
      cal += item.caloriesPer100g * factor;
      pro += item.proteinPer100g * factor;
      carb += item.carbsPer100g * factor;
      fat += item.fatPer100g * factor;
      wt += item.portionGrams;
    });

    const c = Math.round(cal);
    const p = Math.round(pro);
    const cb = Math.round(carb);
    const f = Math.round(fat);

    const proCal = p * 4;
    const carbCal = cb * 4;
    const fatCal = f * 9;
    const macroCalTotal = Math.max(1, proCal + carbCal + fatCal);

    const pPct = Math.round((proCal / macroCalTotal) * 100);
    const cbPct = Math.round((carbCal / macroCalTotal) * 100);
    const fPct = Math.max(0, 100 - pPct - cbPct);
    const density = wt > 0 ? (c / wt).toFixed(1) : "1.4";

    return {
      totalCalories: c,
      totalProtein: p,
      totalCarbs: cb,
      totalFat: f,
      totalWeight: wt,
      proteinPercent: pPct,
      carbsPercent: cbPct,
      fatPercent: fPct,
      caloricDensity: density,
    };
  }, [ingredients]);

  const logScannedMeal = useNutritionPlanStore((state) => state.logScannedMeal);

  const handleSaveMeal = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
    }

    // Save and log this meal to today's scheduled meals in shared state
    logScannedMeal({
      name: "Grilled Chicken & Brown Rice Bowl",
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      type: "LUNCH",
    });

    // Navigate to Today's Scheduled Meals
    router.push({
      pathname: "/meal-history",
      params: { tab: "today", justLogged: "true" },
    });
  };

  const handleScanAgain = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Cyber-Athletic Mesh Gradient Background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={["#121A35", "#0C1429", "#080D1A", "#060810"]}
          locations={[0, 0.28, 0.65, 1]}
          start={{ x: 0.9, y: 0 }}
          end={{ x: 0.15, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={["rgba(56, 189, 248, 0.08)", "rgba(56, 189, 248, 0)"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.2, y: 0.45 }}
          style={StyleSheet.absoluteFill}
        />
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
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
        </Svg>
      </View>

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
          { paddingBottom: Math.max(insets.bottom + 40, 56) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Header */}
        <View style={styles.titleSection}>
          <View style={styles.metaBadge}>
            <Sparkles size={11} color="#38BDF8" />
            <Text style={styles.metaBadgeText}>NEURAL VISION SCANNER</Text>
            <Text style={styles.metaBadgeDot}>•</Text>
            <Text style={styles.metaBadgeConfidence}>99.4% CONFIDENCE</Text>
          </View>
          <Text style={styles.mainTitle}>MEAL ANALYSIS</Text>
        </View>

        {/* Hero Food Visual Card */}
        <View style={styles.heroCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2000&auto=format&fit=crop",
            }}
            style={styles.heroImage}
            contentFit="cover"
          />

          {/* Floating AI Status Pill */}
          <View style={styles.heroTopRow}>
            <View style={styles.aiStatusBadge}>
              <View style={styles.aiLiveDot} />
              <Cpu size={12} color="#38BDF8" style={{ marginRight: 5 }} />
              <Text style={styles.aiStatusText}>VISION AI CLASSIFIED</Text>
            </View>
          </View>

          {/* Bottom Scrim with Dish Information */}
          <LinearGradient
            colors={["transparent", "rgba(7, 11, 20, 0.72)", "#070B14"]}
            locations={[0, 0.45, 1]}
            style={styles.heroBottomScrim}
          >
            <Text style={styles.dishName}>Grilled Chicken & Brown Rice Bowl</Text>
            <View style={styles.dishPillsRow}>
              <View style={styles.dishPill}>
                <Text style={styles.dishPillValue}>{totalWeight}g</Text>
                <Text style={styles.dishPillLabel}>NET WT</Text>
              </View>
              <View style={[styles.dishPill, styles.dishPillCyan]}>
                <Flame size={12} color="#38BDF8" style={{ marginRight: 4 }} />
                <Text style={styles.dishPillValueCyan}>{totalCalories}</Text>
                <Text style={styles.dishPillLabelCyan}>KCAL</Text>
              </View>
              <View style={styles.dishTag}>
                <Text style={styles.dishTagText}>CLEAN BULK</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Unified Macro Balance Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardBadge}>
              <Flame size={13} color="#38BDF8" />
              <Text style={styles.cardBadgeText}>MACRONUTRIENT BALANCE</Text>
            </View>
            <View style={styles.caloriePill}>
              <Text style={styles.caloriePillNumber}>{totalCalories}</Text>
              <Text style={styles.caloriePillUnit}>KCAL</Text>
            </View>
          </View>

          {/* Proportional Macro Distribution Bar */}
          <View style={styles.macroTrackContainer}>
            <View style={styles.macroTrack}>
              <View
                style={[
                  styles.macroSegment,
                  { width: `${proteinPercent}%`, backgroundColor: "#38BDF8" },
                ]}
              />
              <View
                style={[
                  styles.macroSegment,
                  { width: `${carbsPercent}%`, backgroundColor: "#FBBF24" },
                ]}
              />
              <View
                style={[
                  styles.macroSegment,
                  { width: `${fatPercent}%`, backgroundColor: "#FB7185" },
                ]}
              />
            </View>
          </View>

          {/* 3 Balanced Macro Columns */}
          <View style={styles.macrosRow}>
            {/* Protein */}
            <View style={[styles.macroBox, { borderColor: "rgba(56, 189, 248, 0.22)" }]}>
              <View style={styles.macroHeader}>
                <View style={[styles.macroDot, { backgroundColor: "#38BDF8" }]} />
                <Text style={[styles.macroLabel, { color: "#38BDF8" }]}>PROTEIN</Text>
              </View>
              <View style={styles.macroValueRow}>
                <Text style={styles.macroValue}>{totalProtein}</Text>
                <Text style={styles.macroUnit}>g</Text>
              </View>
              <Text style={styles.macroPercent}>{proteinPercent}% of meal</Text>
            </View>

            {/* Carbs */}
            <View style={[styles.macroBox, { borderColor: "rgba(251, 191, 36, 0.22)" }]}>
              <View style={styles.macroHeader}>
                <View style={[styles.macroDot, { backgroundColor: "#FBBF24" }]} />
                <Text style={[styles.macroLabel, { color: "#FBBF24" }]}>CARBS</Text>
              </View>
              <View style={styles.macroValueRow}>
                <Text style={styles.macroValue}>{totalCarbs}</Text>
                <Text style={styles.macroUnit}>g</Text>
              </View>
              <Text style={styles.macroPercent}>{carbsPercent}% of meal</Text>
            </View>

            {/* Fat */}
            <View style={[styles.macroBox, { borderColor: "rgba(251, 113, 133, 0.22)" }]}>
              <View style={styles.macroHeader}>
                <View style={[styles.macroDot, { backgroundColor: "#FB7185" }]} />
                <Text style={[styles.macroLabel, { color: "#FB7185" }]}>FAT</Text>
              </View>
              <View style={styles.macroValueRow}>
                <Text style={styles.macroValue}>{totalFat}</Text>
                <Text style={styles.macroUnit}>g</Text>
              </View>
              <Text style={styles.macroPercent}>{fatPercent}% of meal</Text>
            </View>
          </View>
        </View>

        {/* Detected Ingredients Section with Live Portion Control */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardBadge}>
              <Utensils size={13} color="#38BDF8" />
              <Text style={styles.cardBadgeText}>
                DETECTED INGREDIENTS ({ingredients.length})
              </Text>
            </View>
            <Pressable
              onPress={() => {
                triggerHaptic();
                setIsEditingPortions((prev) => !prev);
              }}
              style={styles.adjustTogglePressable}
              accessibilityRole="button"
              accessibilityLabel="Adjust ingredient portions"
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.adjustToggleInner,
                    isEditingPortions && styles.adjustToggleActive,
                    pressed && styles.adjustTogglePressed,
                  ]}
                >
                  <Sliders size={12} color={isEditingPortions ? "#38BDF8" : "#94A3B8"} />
                  <Text
                    style={[
                      styles.adjustToggleText,
                      isEditingPortions && styles.adjustToggleTextActive,
                    ]}
                  >
                    {isEditingPortions ? "DONE" : "ADJUST"}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.ingredientsList}>
            {ingredients.map((item) => {
              const itemKcal = Math.round(
                (item.caloriesPer100g * item.portionGrams) / 100,
              );
              return (
                <View key={item.id} style={styles.ingredientRow}>
                  {/* Color Pip */}
                  <View
                    style={[
                      styles.ingredientPip,
                      { backgroundColor: item.accentColor },
                    ]}
                  />

                  {/* Main Info */}
                  <View style={styles.ingredientInfo}>
                    <Text style={styles.ingredientName}>{item.name}</Text>
                    <Text style={styles.ingredientKcal}>~{itemKcal} KCAL</Text>
                  </View>

                  {/* Interactive Stepper or Compact Pill */}
                  {isEditingPortions ? (
                    <View style={styles.stepperContainer}>
                      <Pressable
                        style={styles.stepperPressable}
                        onPress={() => handleUpdatePortion(item.id, -10)}
                        accessibilityRole="button"
                        accessibilityLabel={`Decrease ${item.name} portion`}
                      >
                        {({ pressed }) => (
                          <View
                            style={[
                              styles.stepperBtnInner,
                              pressed && styles.stepperBtnPressed,
                            ]}
                          >
                            <Minus size={13} color="#38BDF8" strokeWidth={2.5} />
                          </View>
                        )}
                      </Pressable>
                      <Text style={styles.stepperValue}>{item.portionGrams}g</Text>
                      <Pressable
                        style={styles.stepperPressable}
                        onPress={() => handleUpdatePortion(item.id, 10)}
                        accessibilityRole="button"
                        accessibilityLabel={`Increase ${item.name} portion`}
                      >
                        {({ pressed }) => (
                          <View
                            style={[
                              styles.stepperBtnInner,
                              pressed && styles.stepperBtnPressed,
                            ]}
                          >
                            <Plus size={13} color="#38BDF8" strokeWidth={2.5} />
                          </View>
                        )}
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.portionPill}>
                      <Text style={styles.portionPillText}>
                        {item.portionGrams}g
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Nutritional Quality Telemetry Bar */}
        <View style={styles.telemetryCard}>
          <View style={styles.telemetryItem}>
            <View style={styles.telemetryHeader}>
              <Scale size={12} color="#38BDF8" />
              <Text style={styles.telemetryLabel}>CALORIC DENSITY</Text>
            </View>
            <View style={styles.telemetryValueRow}>
              <Text style={styles.telemetryValue}>{caloricDensity}</Text>
              <Text style={styles.telemetryUnit}>kcal/g</Text>
            </View>
            <Text style={styles.telemetryMeta}>Optimal Satiety</Text>
          </View>

          <View style={styles.telemetryDivider} />

          <View style={styles.telemetryItem}>
            <View style={styles.telemetryHeader}>
              <Activity size={12} color="#2DD4BF" />
              <Text style={[styles.telemetryLabel, { color: "#2DD4BF" }]}>
                NUTRIENT SCORE
              </Text>
            </View>
            <View style={styles.telemetryValueRow}>
              <Text style={styles.telemetryValue}>94</Text>
              <Text style={[styles.telemetryUnit, { color: "#2DD4BF" }]}>
                / 100
              </Text>
            </View>
            <Text style={[styles.telemetryMeta, { color: "#2DD4BF" }]}>
              Optimal Grade
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={styles.saveBtnPressable}
            onPress={handleSaveMeal}
            accessibilityRole="button"
            accessibilityLabel="Save meal to log"
          >
            {({ pressed }) => (
              <View style={[styles.saveBtnInner, pressed && styles.saveBtnPressed]}>
                <LinearGradient
                  colors={["#0284C7", "#0EA5E9", "#38BDF8"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.saveBtnGradient}
                >
                  <Check size={18} color="#FFFFFF" strokeWidth={2.8} style={{ marginRight: 8 }} />
                  <Text style={styles.saveBtnText}>SAVE MEAL TO LOG</Text>
                </LinearGradient>
              </View>
            )}
          </Pressable>

          <Pressable
            style={styles.scanAgainPressable}
            onPress={handleScanAgain}
            accessibilityRole="button"
            accessibilityLabel="Scan another meal"
          >
            {({ pressed }) => (
              <View style={[styles.scanAgainInner, pressed && styles.scanAgainPressed]}>
                <RotateCcw size={15} color="#38BDF8" style={{ marginRight: 8 }} />
                <Text style={styles.scanAgainText}>SCAN ANOTHER MEAL</Text>
              </View>
            )}
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
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 4,
  },
  titleSection: {
    marginTop: 2,
    marginBottom: 16,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.22)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    gap: 6,
  },
  metaBadgeText: {
    color: "#38BDF8",
    fontSize: clampFontSize(9.5),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  metaBadgeDot: {
    color: "#64748B",
    fontSize: 9,
  },
  metaBadgeConfidence: {
    color: "#2DD4BF",
    fontSize: clampFontSize(9.5),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  mainTitle: {
    color: "#FFFFFF",
    fontSize: clampFontSize(26),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  heroCard: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
    backgroundColor: "#0D1422",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  heroImage: {
    width: "100%",
    height: 190,
  },
  heroTopRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aiStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(7, 12, 23, 0.82)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.35)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  aiLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2DD4BF",
    marginRight: 6,
  },
  aiStatusText: {
    color: "#FFFFFF",
    fontSize: clampFontSize(9.5),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  heroBottomScrim: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    marginTop: -40,
  },
  dishName: {
    color: "#FFFFFF",
    fontSize: clampFontSize(17),
    fontWeight: "800",
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  dishPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  dishPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  dishPillValue: {
    color: "#FFFFFF",
    fontSize: clampFontSize(11.5),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "800",
  },
  dishPillLabel: {
    color: "#94A3B8",
    fontSize: clampFontSize(9),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "700",
  },
  dishPillCyan: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  dishPillValueCyan: {
    color: "#38BDF8",
    fontSize: clampFontSize(11.5),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "900",
  },
  dishPillLabelCyan: {
    color: "#38BDF8",
    fontSize: clampFontSize(9),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "700",
  },
  dishTag: {
    backgroundColor: "rgba(45, 212, 191, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.28)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dishTagText: {
    color: "#2DD4BF",
    fontSize: clampFontSize(9.5),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: "rgba(13, 19, 31, 0.88)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.18)",
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardBadgeText: {
    color: "#94A3B8",
    fontSize: clampFontSize(10),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  caloriePill: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.28)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  caloriePillNumber: {
    color: "#FFFFFF",
    fontSize: clampFontSize(13),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "900",
  },
  caloriePillUnit: {
    color: "#38BDF8",
    fontSize: clampFontSize(9.5),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "800",
  },
  macroTrackContainer: {
    marginBottom: 14,
  },
  macroTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    flexDirection: "row",
    overflow: "hidden",
  },
  macroSegment: {
    height: "100%",
  },
  macrosRow: {
    flexDirection: "row",
    gap: 10,
  },
  macroBox: {
    flex: 1,
    backgroundColor: "rgba(18, 26, 43, 0.5)",
    borderRadius: 14,
    borderWidth: 1,
    padding: 11,
  },
  macroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  macroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  macroLabel: {
    fontSize: clampFontSize(9),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  macroValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
    marginBottom: 2,
  },
  macroValue: {
    color: "#FFFFFF",
    fontSize: clampFontSize(18),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "900",
  },
  macroUnit: {
    color: "#94A3B8",
    fontSize: clampFontSize(11),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "700",
  },
  macroPercent: {
    color: "#64748B",
    fontSize: clampFontSize(9.5),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "700",
  },
  adjustTogglePressable: {
    borderRadius: 8,
    overflow: "hidden",
  },
  adjustToggleInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  adjustToggleActive: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderColor: "rgba(56, 189, 248, 0.35)",
  },
  adjustTogglePressed: {
    opacity: 0.75,
  },
  adjustToggleText: {
    color: "#94A3B8",
    fontSize: clampFontSize(9.5),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  adjustToggleTextActive: {
    color: "#38BDF8",
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18, 26, 43, 0.45)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  ingredientPip: {
    width: 3.5,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  ingredientInfo: {
    flex: 1,
    justifyContent: "center",
  },
  ingredientName: {
    color: "#FFFFFF",
    fontSize: clampFontSize(13),
    fontWeight: "700",
    marginBottom: 2,
  },
  ingredientKcal: {
    color: "#94A3B8",
    fontSize: clampFontSize(10.5),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "700",
  },
  portionPill: {
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  portionPillText: {
    color: "#38BDF8",
    fontSize: clampFontSize(11),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "800",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 15, 26, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 6,
  },
  stepperPressable: {
    borderRadius: 6,
    overflow: "hidden",
  },
  stepperBtnInner: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnPressed: {
    opacity: 0.7,
    backgroundColor: "rgba(56, 189, 248, 0.25)",
  },
  stepperValue: {
    color: "#FFFFFF",
    fontSize: clampFontSize(11.5),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "800",
    minWidth: 38,
    textAlign: "center",
  },
  telemetryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13, 19, 31, 0.88)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.16)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  telemetryItem: {
    flex: 1,
    alignItems: "center",
  },
  telemetryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  telemetryLabel: {
    color: "#94A3B8",
    fontSize: clampFontSize(9),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  telemetryValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    marginBottom: 2,
  },
  telemetryValue: {
    color: "#FFFFFF",
    fontSize: clampFontSize(19),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "900",
  },
  telemetryUnit: {
    color: "#94A3B8",
    fontSize: clampFontSize(10.5),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "700",
  },
  telemetryMeta: {
    color: "#64748B",
    fontSize: clampFontSize(9.5),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "700",
  },
  telemetryDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 8,
  },
  saveBtnPressable: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  saveBtnInner: {
    width: "100%",
    height: 54,
    borderRadius: 16,
    overflow: "hidden",
  },
  saveBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  saveBtnGradient: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: clampFontSize(12),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "900",
    letterSpacing: 1,
  },
  scanAgainPressable: {
    width: "100%",
    borderRadius: 15,
    overflow: "hidden",
  },
  scanAgainInner: {
    width: "100%",
    height: 50,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.35)",
    backgroundColor: "rgba(14, 22, 38, 0.8)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  scanAgainPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    borderColor: "rgba(56, 189, 248, 0.6)",
  },
  scanAgainText: {
    color: "#38BDF8",
    fontSize: clampFontSize(11.5),
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "800",
    letterSpacing: 0.8,
  },
});
