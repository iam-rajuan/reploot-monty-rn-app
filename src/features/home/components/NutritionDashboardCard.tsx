import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronRight, Utensils } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { Text } from "@/shared/components/typography";
import { HORIZONTAL_PADDING } from "@/shared/utils/responsive";
import { typography } from "@/theme/typography";

/**
 * Home "Today's Nutrition" card, in the same visual language as the
 * Nutrition tab: profile-card surface, round icon chip header, soft inner
 * tiles, a gradient calorie ring and slim macro bars.
 */

// Sample figures (the card is not wired to the nutrition store yet).
const CALORIES = { consumed: 1800, target: 2400 };
const MACROS = [
  {
    label: "Protein",
    color: "#A78BFA",
    icon: require("../../../../assets/figma/nutrition/nutrition-protein.svg"),
    value: 145,
    target: 180,
    unit: "g",
  },
  {
    label: "Carbs",
    color: "#FB923C",
    icon: require("../../../../assets/figma/nutrition/nutrition-carbs.svg"),
    value: 210,
    target: 250,
    unit: "g",
  },
  {
    label: "Fats",
    color: "#F87171",
    icon: require("../../../../assets/figma/nutrition/nutrition-fats.svg"),
    value: 52,
    target: 70,
    unit: "g",
  },
  {
    label: "Hydration",
    color: "#38BDF8",
    icon: require("../../../../assets/figma/nutrition/nutrition-hydration.svg"),
    value: 2.1,
    target: 3.0,
    unit: "L",
  },
] as const;

const RING_SIZE = 136;
const RING_STROKE = 9;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const SURFACE_WASH = [
  "rgba(56,189,248,0.12)",
  "rgba(139,92,246,0.07)",
  "rgba(255,255,255,0.02)",
] as const;

const percentOf = (value: number, target: number) =>
  target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;

export const NutritionDashboardCard = () => {
  const router = useRouter();
  const [linkPressed, setLinkPressed] = useState(false);
  const caloriePercent = percentOf(CALORIES.consumed, CALORIES.target);

  const handleViewNutrition = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push("/nutrition");
  };

  return (
    <View style={styles.card}>
      <LinearGradient
        pointerEvents="none"
        colors={SURFACE_WASH}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <View style={styles.iconChip}>
            <Utensils size={14} color="#38BDF8" />
          </View>
          <Text style={styles.sectionLabel} numberOfLines={1}>
            TODAY'S NUTRITION
          </Text>
        </View>

        {/* Visuals sit on an inner View: Pressable style functions are
            dropped on native in this app (NativeWind interop). */}
        <Pressable
          onPress={handleViewNutrition}
          onPressIn={() => setLinkPressed(true)}
          onPressOut={() => setLinkPressed(false)}
          accessibilityRole="button"
          accessibilityLabel="View nutrition details"
          hitSlop={6}
        >
          <View style={[styles.linkChip, linkPressed && styles.linkChipPressed]}>
            <ChevronRight size={17} color="#7DD3FC" strokeWidth={2.6} />
          </View>
        </Pressable>
      </View>

      {/* Calorie ring */}
      <View style={styles.ringPanel}>
        <View style={styles.ring}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Defs>
              <SvgLinearGradient id="homeCalorieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#2DD4BF" />
                <Stop offset="100%" stopColor="#38BDF8" />
              </SvgLinearGradient>
            </Defs>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke="url(#homeCalorieGrad)"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - caloriePercent / 100)}
              fill="none"
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>
          <View style={styles.ringCenter} pointerEvents="none">
            <Text style={styles.ringValue}>{CALORIES.consumed.toLocaleString()}</Text>
            <Text style={styles.ringCaption}>
              OF {CALORIES.target.toLocaleString()} KCAL
            </Text>
          </View>
        </View>

        <View style={styles.goalPill}>
          <View style={styles.goalDot} />
          <Text style={styles.goalText}>{caloriePercent}% OF DAILY GOAL</Text>
        </View>
      </View>

      {/* Macros */}
      <View style={styles.grid}>
        {MACROS.map((macro) => {
          const percent = percentOf(macro.value, macro.target);
          return (
            <View key={macro.label} style={styles.tile}>
              <View style={styles.tileTop}>
                <View style={[styles.tileIcon, { backgroundColor: `${macro.color}1F`, borderColor: `${macro.color}47` }]}>
                  <Image source={macro.icon} style={styles.tileIconImage} contentFit="contain" />
                </View>
                <Text style={[styles.tilePercent, { color: macro.color }]}>{percent}%</Text>
              </View>
              <Text style={[styles.tileLabel, { color: macro.color }]} numberOfLines={1}>
                {macro.label}
              </Text>
              <Text style={styles.tileValue}>
                {macro.value}
                <Text style={styles.tileUnit}>{macro.unit}</Text>
                <Text style={styles.tileTarget}>
                  {"  "}/ {macro.target}
                  {macro.unit}
                </Text>
              </Text>
              <View style={styles.track}>
                <View
                  style={[styles.fill, { width: `${percent}%`, backgroundColor: macro.color }]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111A25",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 20,
    padding: 18,
    gap: 14,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerTitle: {
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
  linkChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  linkChipPressed: {
    backgroundColor: "rgba(56,189,248,0.2)",
    transform: [{ scale: 0.97 }],
  },

  ringPanel: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.10)",
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
  },
  ringCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  ringValue: {
    ...typography.metric,
    fontSize: 24,
    lineHeight: 28,
    color: "#F8FAFC",
    fontVariant: ["tabular-nums"],
  },
  ringCaption: {
    ...typography.overline,
    letterSpacing: 0.4,
    color: "#64748B",
  },
  goalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(45,212,191,0.08)",
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.35)",
  },
  goalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2DD4BF",
  },
  goalText: {
    ...typography.badge,
    color: "#2DD4BF",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  tile: {
    width: "48.5%",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.10)",
    gap: 5,
  },
  tileTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tileIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  tileIconImage: {
    width: 14,
    height: 14,
  },
  tileLabel: {
    ...typography.overline,
    marginTop: 4,
  },
  tilePercent: {
    ...typography.badge,
    fontVariant: ["tabular-nums"],
  },
  tileValue: {
    ...typography.metric,
    fontSize: 18,
    lineHeight: 22,
    color: "#F8FAFC",
    fontVariant: ["tabular-nums"],
  },
  tileUnit: {
    ...typography.metricUnit,
    color: "#94A3B8",
  },
  tileTarget: {
    ...typography.caption,
    color: "#64748B",
  },
  track: {
    height: 5,
    borderRadius: 3,
    marginTop: 4,
    backgroundColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
});
