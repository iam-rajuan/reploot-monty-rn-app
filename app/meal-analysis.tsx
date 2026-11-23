import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import MaskedView from "@react-native-masked-view/masked-view";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  CheckCircle2,
  Cpu,
  Dumbbell,
  Flame,
  Hexagon,
  Leaf,
  Minus,
  Plus,
  RotateCcw,
  Scale,
  Sliders,
  Sparkles,
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

const { width } = Dimensions.get("window");

interface IngredientData {
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
    name: "CHICKEN BREAST",
    description: "Lean poultry breast · High biological value protein",
    portionGrams: 180,
    caloriesPer100g: 144.44, // 180g -> 260 kcal
    proteinPer100g: 16.67,  // 180g -> 30g protein
    carbsPer100g: 0,
    fatPer100g: 3.89,       // 180g -> 7g fat
    accentColor: "#2DD4BF",
  },
  {
    id: "2",
    name: "BROWN RICE",
    description: "Cooked whole grain · Low GI complex carbohydrates",
    portionGrams: 100,
    caloriesPer100g: 150.0,  // 100g -> 150 kcal
    proteinPer100g: 3.0,    // 100g -> 3g protein
    carbsPer100g: 36.0,     // 100g -> 36g carbs
    fatPer100g: 3.0,        // 100g -> 3g fat
    accentColor: "#FFB68C",
  },
  {
    id: "3",
    name: "STEAMED BROCCOLI",
    description: "Tender florets · High fiber, Vitamin C & Micronutrients",
    portionGrams: 40,
    caloriesPer100g: 100.0,  // 40g -> 40 kcal
    proteinPer100g: 5.0,    // 40g -> 2g protein
    carbsPer100g: 15.0,     // 40g -> 6g carbs
    fatPer100g: 5.0,        // 40g -> 2g fat
    accentColor: "#4ADE80",
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

  const handleSaveMeal = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/meal-history");
  };

  const handleScanAgain = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

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
          { paddingBottom: Math.max(insets.bottom + 48, 64) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section with Masked Gradient Title & Description */}
        <View style={styles.titleSection}>
          <View style={styles.metaBadge}>
            <View style={styles.metaLiveDot} />
            <Text style={styles.metaBadgeText}>NEURAL VISION SCANNER</Text>
            <Text style={styles.metaBadgeDivider}>•</Text>
            <Text style={styles.metaBadgeSub}>99.4% CONFIDENCE</Text>
          </View>

          <View style={styles.maskedTitleWrapper}>
            <MaskedView
              style={styles.maskedTitleView}
              maskElement={
                <View style={styles.maskWrapper}>
                  <Text style={styles.mainTitle} numberOfLines={1}>
                    MEAL ANALYSIS
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
          <Text style={styles.subtitle}>
            Computer vision macro breakdown & volumetric portion telemetry
          </Text>
        </View>

        {/* Meal Image with Cyber Viewfinder & HUD */}
        <View style={styles.imageCard}>
          <View style={styles.imageInnerWrapper}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2000&auto=format&fit=crop",
              }}
              style={styles.mealImage}
              contentFit="cover"
            />

            {/* Viewfinder Corner Reticles */}
            <View style={[styles.cornerReticle, styles.cornerTL]} />
            <View style={[styles.cornerReticle, styles.cornerTR]} />
            <View style={[styles.cornerReticle, styles.cornerBL]} />
            <View style={[styles.cornerReticle, styles.cornerBR]} />

            {/* Top HUD Badges */}
            <View style={styles.hudTopRow}>
              <View style={styles.hudChip}>
                <Cpu size={12} color="#38BDF8" style={{ marginRight: 5 }} />
                <Text style={styles.hudChipText}>VISION AI v4.2</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <CheckCircle2
                  size={12}
                  color="#2DD4BF"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.verifiedText}>CLASSIFIED</Text>
              </View>
            </View>

            {/* Bottom Scrim with Meal Identification */}
            <LinearGradient
              colors={["transparent", "rgba(7, 10, 19, 0.75)", "rgba(7, 10, 19, 0.96)"]}
              style={styles.imageBottomScrim}
            >
              <View style={styles.dishHeaderRow}>
                <View style={styles.dishInfoCol}>
                  <Text style={styles.dishTitle}>GRILLED CHICKEN & BROWN RICE BOWL</Text>
                  <Text style={styles.dishSubtitle}>
                    EST. {totalWeight}G NET WT · {totalCalories} KCAL
                  </Text>
                </View>
                <View style={styles.qualityTag}>
                  <Text style={styles.qualityTagText}>CLEAN BULK</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Metabolic Macro Telemetry Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.headerBadge}>
              <Flame size={14} color="#38BDF8" />
              <Text style={styles.headerBadgeText}>METABOLIC MACRO TELEMETRY</Text>
            </View>
            <View style={styles.macroTotalPill}>
              <Text style={styles.macroTotalPillText}>{totalCalories} KCAL</Text>
            </View>
          </View>

          {/* Proportional Macro Distribution Bar */}
          <View style={styles.macroRatioContainer}>
            <View style={styles.macroRatioBar}>
              <View
                style={[
                  styles.macroRatioSegment,
                  { width: `${proteinPercent}%`, backgroundColor: "#2DD4BF" },
                ]}
              />
              <View
                style={[
                  styles.macroRatioSegment,
                  { width: `${carbsPercent}%`, backgroundColor: "#FFB68C" },
                ]}
              />
              <View
                style={[
                  styles.macroRatioSegment,
                  { width: `${fatPercent}%`, backgroundColor: "#F43F5E" },
                ]}
              />
            </View>

            {/* Ratio Legend Row */}
            <View style={styles.macroLegendRow}>
              <View style={styles.macroLegendItem}>
                <View style={[styles.macroLegendDot, { backgroundColor: "#2DD4BF" }]} />
                <Text style={styles.macroLegendText}>
                  {proteinPercent}% PROTEIN ({totalProtein}g)
                </Text>
              </View>
              <View style={styles.macroLegendItem}>
                <View style={[styles.macroLegendDot, { backgroundColor: "#FFB68C" }]} />
                <Text style={styles.macroLegendText}>
                  {carbsPercent}% CARBS ({totalCarbs}g)
                </Text>
              </View>
              <View style={styles.macroLegendItem}>
                <View style={[styles.macroLegendDot, { backgroundColor: "#F43F5E" }]} />
                <Text style={styles.macroLegendText}>
                  {fatPercent}% FAT ({totalFat}g)
                </Text>
              </View>
            </View>
          </View>

          {/* 2x2 Macro Cards Grid */}
          <View style={styles.macrosGrid}>
            {/* Calories */}
            <View style={[styles.macroTile, { borderColor: "rgba(56, 189, 248, 0.4)" }]}>
              <View style={styles.macroTileHeader}>
                <Text style={[styles.macroTileLabel, { color: "#38BDF8" }]}>ENERGY</Text>
                <Flame color="#38BDF8" size={14} />
              </View>
              <Text style={styles.macroTileValue}>{totalCalories}</Text>
              <Text style={styles.macroTileUnit}>KCAL</Text>
              <Text style={styles.macroTileSub}>MEAL BUDGET</Text>
            </View>

            {/* Protein */}
            <View style={[styles.macroTile, { borderColor: "rgba(45, 212, 191, 0.4)" }]}>
              <View style={styles.macroTileHeader}>
                <Text style={[styles.macroTileLabel, { color: "#2DD4BF" }]}>PROTEIN</Text>
                <Dumbbell color="#2DD4BF" size={14} />
              </View>
              <Text style={styles.macroTileValue}>{totalProtein}g</Text>
              <Text style={[styles.macroTileUnit, { color: "#2DD4BF" }]}>HIGH TARGET</Text>
              <Text style={[styles.macroTileSub, { color: "#2DD4BF" }]}>{proteinPercent}% RATIO</Text>
            </View>

            {/* Carbs */}
            <View style={[styles.macroTile, { borderColor: "rgba(255, 182, 140, 0.4)" }]}>
              <View style={styles.macroTileHeader}>
                <Text style={[styles.macroTileLabel, { color: "#FFB68C" }]}>CARBS</Text>
                <Leaf color="#FFB68C" size={14} />
              </View>
              <Text style={styles.macroTileValue}>{totalCarbs}g</Text>
              <Text style={[styles.macroTileUnit, { color: "#FFB68C" }]}>COMPLEX</Text>
              <Text style={[styles.macroTileSub, { color: "#FFB68C" }]}>{carbsPercent}% RATIO</Text>
            </View>

            {/* Fat */}
            <View style={[styles.macroTile, { borderColor: "rgba(244, 63, 94, 0.4)" }]}>
              <View style={styles.macroTileHeader}>
                <Text style={[styles.macroTileLabel, { color: "#F43F5E" }]}>FAT</Text>
                <Hexagon color="#F43F5E" size={14} />
              </View>
              <Text style={styles.macroTileValue}>{totalFat}g</Text>
              <Text style={[styles.macroTileUnit, { color: "#F43F5E" }]}>ESSENTIAL</Text>
              <Text style={[styles.macroTileSub, { color: "#F43F5E" }]}>{fatPercent}% RATIO</Text>
            </View>
          </View>
        </View>

        {/* Detected Ingredients Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.headerBadge}>
              <Sparkles size={14} color="#38BDF8" />
              <Text style={styles.headerBadgeText}>
                DETECTED INGREDIENTS ({ingredients.length})
              </Text>
            </View>
            <Pressable
              onPress={() => {
                triggerHaptic();
                setIsEditingPortions((prev) => !prev);
              }}
              style={({ pressed }) => [
                styles.adjustToggleBtn,
                isEditingPortions && styles.adjustToggleBtnActive,
                pressed && { opacity: 0.8 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Adjust ingredient portions"
            >
              <Sliders size={12} color={isEditingPortions ? "#00f2fe" : "#94A3B8"} />
              <Text
                style={[
                  styles.adjustToggleText,
                  isEditingPortions && styles.adjustToggleTextActive,
                ]}
              >
                {isEditingPortions ? "DONE" : "ADJUST"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.ingredientsList}>
            {ingredients.map((item) => (
              <View key={item.id} style={styles.ingredientRow}>
                <View style={[styles.ingredientColorDot, { backgroundColor: item.accentColor }]} />
                <View style={styles.ingredientMainCol}>
                  <View style={styles.ingredientTopLine}>
                    <Text style={styles.ingredientName}>{item.name}</Text>
                    <Text style={styles.ingredientKcal}>
                      ~{Math.round((item.caloriesPer100g * item.portionGrams) / 100)} KCAL
                    </Text>
                  </View>
                  <Text style={styles.ingredientDesc}>{item.description}</Text>
                </View>

                {isEditingPortions ? (
                  <View style={styles.portionStepper}>
                    <Pressable
                      style={styles.stepperBtn}
                      onPress={() => handleUpdatePortion(item.id, -10)}
                      accessibilityRole="button"
                      accessibilityLabel={`Decrease ${item.name} portion`}
                    >
                      <Minus size={12} color="#38BDF8" />
                    </Pressable>
                    <Text style={styles.stepperValue}>{item.portionGrams}g</Text>
                    <Pressable
                      style={styles.stepperBtn}
                      onPress={() => handleUpdatePortion(item.id, 10)}
                      accessibilityRole="button"
                      accessibilityLabel={`Increase ${item.name} portion`}
                    >
                      <Plus size={12} color="#38BDF8" />
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.portionStaticPill}>
                    <Text style={styles.portionStaticText}>{item.portionGrams}g</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Volumetric & Nutrient Telemetry */}
        <View style={styles.metricsRow}>
          <View style={styles.metricTile}>
            <View style={styles.metricHeader}>
              <Scale size={13} color="#38BDF8" />
              <Text style={styles.metricLabel}>CALORIC DENSITY</Text>
            </View>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{caloricDensity}</Text>
              <Text style={styles.metricUnit}>KCAL/G</Text>
            </View>
            <View style={styles.metricPill}>
              <Text style={styles.metricPillText}>OPTIMAL SATIETY</Text>
            </View>
          </View>

          <View style={styles.metricTile}>
            <View style={styles.metricHeader}>
              <Sparkles size={13} color="#2DD4BF" />
              <Text style={[styles.metricLabel, { color: "#2DD4BF" }]}>NUTRIENT SCORE</Text>
            </View>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>94</Text>
              <Text style={[styles.metricUnit, { color: "#2DD4BF" }]}>/ 100</Text>
            </View>
            <View
              style={[
                styles.metricPill,
                {
                  borderColor: "rgba(45, 212, 191, 0.3)",
                  backgroundColor: "rgba(45, 212, 191, 0.08)",
                },
              ]}
            >
              <Text style={[styles.metricPillText, { color: "#2DD4BF" }]}>ELITE CLEAN</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleSaveMeal}
            accessibilityRole="button"
            accessibilityLabel="Save meal to log"
          >
            <LinearGradient
              colors={["#00f2fe", "#4facfe"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.saveGradient}
            >
              <CheckCircle2
                color="#050811"
                size={18}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.saveButtonText}>SAVE MEAL TO LOG</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.scanAgainButton,
              pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleScanAgain}
            accessibilityRole="button"
            accessibilityLabel="Scan another meal"
          >
            <RotateCcw color="#38BDF8" size={16} style={{ marginRight: 8 }} />
            <Text style={styles.scanAgainText}>SCAN ANOTHER MEAL</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090A10",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  titleSection: {
    marginTop: 4,
    marginBottom: 20,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
    gap: 6,
  },
  metaLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2DD4BF",
  },
  metaBadgeText: {
    color: "#38BDF8",
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 1,
  },
  metaBadgeDivider: {
    color: "#64748B",
    fontSize: 9,
  },
  metaBadgeSub: {
    color: "#2DD4BF",
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  maskedTitleWrapper: {
    height: 44,
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
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    fontFamily: "monospace",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: "monospace",
    fontWeight: "600",
    marginTop: 4,
  },
  imageCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.28)",
    backgroundColor: "#0B0E17",
    marginBottom: 20,
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  imageInnerWrapper: {
    width: "100%",
    aspectRatio: 1.32,
    position: "relative",
  },
  mealImage: {
    width: "100%",
    height: "100%",
  },
  cornerReticle: {
    position: "absolute",
    width: 18,
    height: 18,
    borderColor: "#00f2fe",
  },
  cornerTL: {
    top: 12,
    left: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    top: 12,
    right: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    bottom: 12,
    left: 12,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: 12,
    right: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  hudTopRow: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hudChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(9, 10, 16, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.4)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  hudChipText: {
    color: "#38BDF8",
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(9, 10, 16, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.45)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  verifiedText: {
    color: "#2DD4BF",
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  imageBottomScrim: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 40,
  },
  dishHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  dishInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  dishTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  dishSubtitle: {
    color: "#38BDF8",
    fontSize: 10.5,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  qualityTag: {
    backgroundColor: "rgba(45, 212, 191, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.4)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qualityTagText: {
    color: "#2DD4BF",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: "#0B0E17",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerBadgeText: {
    color: "#38BDF8",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  macroTotalPill: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.35)",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  macroTotalPillText: {
    color: "#38BDF8",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  macroRatioContainer: {
    marginBottom: 16,
  },
  macroRatioBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 10,
  },
  macroRatioSegment: {
    height: "100%",
  },
  macroLegendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 6,
  },
  macroLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  macroLegendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  macroLegendText: {
    color: "#94A3B8",
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  macrosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  macroTile: {
    width: (width - 40 - 36 - 10) / 2,
    backgroundColor: "#111827",
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 13,
  },
  macroTileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  macroTileLabel: {
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 1,
  },
  macroTileValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  macroTileUnit: {
    color: "#64748B",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 1,
  },
  macroTileSub: {
    color: "#64748B",
    fontSize: 8.5,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  adjustToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },
  adjustToggleBtnActive: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    borderColor: "#38BDF8",
  },
  adjustToggleText: {
    color: "#94A3B8",
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  adjustToggleTextActive: {
    color: "#00f2fe",
  },
  ingredientsList: {
    gap: 10,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.18)",
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  ingredientColorDot: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  ingredientMainCol: {
    flex: 1,
  },
  ingredientTopLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  ingredientName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  ingredientKcal: {
    color: "#38BDF8",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  ingredientDesc: {
    color: "#64748B",
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  portionStaticPill: {
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  portionStaticText: {
    color: "#38BDF8",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "800",
  },
  portionStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B0E17",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.35)",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 6,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderRadius: 5,
  },
  stepperValue: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "800",
    minWidth: 32,
    textAlign: "center",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  metricTile: {
    flex: 1,
    backgroundColor: "#0B0E17",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
    padding: 14,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  metricLabel: {
    color: "#38BDF8",
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  metricValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    marginBottom: 8,
  },
  metricValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "monospace",
    fontWeight: "900",
  },
  metricUnit: {
    color: "#64748B",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  metricPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  metricPillText: {
    color: "#38BDF8",
    fontSize: 8.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 4,
  },
  saveButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#00f2fe",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  saveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  saveButtonText: {
    color: "#050811",
    fontSize: 12.5,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  scanAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.4)",
    backgroundColor: "#131C2E",
  },
  scanAgainText: {
    color: "#38BDF8",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 1,
  },
});
