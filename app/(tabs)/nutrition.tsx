import { WorkoutHeader } from "@/features/workouts";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Camera } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
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
  Path,
  Stop,
} from "react-native-svg";

const coachArtwork = require("../../assets/figma/nutrition/ai-nutrition-coach-figma.jpeg");
const coachSparkles = require("../../assets/figma/nutrition/coach-sparkles.svg");
const mealUtensils = require("../../assets/figma/nutrition/meal-utensils.svg");
const chevronRight = require("../../assets/figma/nutrition/chevron-right.svg");

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const macros = [
  ["PROTEIN", "120g", "#A983FF", "rgba(197,192,255,0.3)"],
  ["CARBS", "180g", "#EA9744", "#EA9744"],
  ["FAT", "55g", "#F93E3E", "rgba(249,62,62,0.3)"],
] as const;

const GOAL = 3.0;
const RING_SIZE = 240;
const STROKE_WIDTH = 15;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Crisp vector droplet for the center with glowing cyber fill
const WaterDropletIcon = ({
  size = 26,
  color = "#44CCEA",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={(size * 20) / 16} viewBox="0 0 16 20" fill="none">
    <Path
      d="M15 12.6482C15 16.5462 12.2958 19 8 19C3.70424 19 1 16.5462 1 12.6482C1 8.46532 6.01813 2.81842 7.55715 1.18504C7.61192 1.12701 7.67987 1.08042 7.75636 1.04848C7.83285 1.01654 7.91605 1 8.00024 1C8.08444 1 8.16764 1.01654 8.24413 1.04848C8.32061 1.08042 8.38857 1.12701 8.44333 1.18504C9.98187 2.81842 15 8.46532 15 12.6482Z"
      strokeWidth={2}
      strokeMiterlimit={10}
      stroke={color}
      fill="rgba(68, 204, 234, 0.22)"
    />
    <Path
      d="M12.2773 13.001C12.2773 13.8433 11.9086 14.6511 11.2522 15.2466C10.5958 15.8422 9.7056 16.1768 8.77734 16.1768"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke={color}
    />
  </Svg>
);

export default function NutritionTabRoute() {
  const insets = useSafeAreaInsets();
  const [water, setWater] = useState(1.8);
  const [input, setInput] = useState("");

  const animatedProgress = useRef(new Animated.Value(1.8 / GOAL)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: Math.min(1, Math.max(0, water / GOAL)),
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [water]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const tap = (strength = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== "web") Haptics.impactAsync(strength).catch(() => {});
  };

  const addWater = (amount: number) => {
    tap(Haptics.ImpactFeedbackStyle.Medium);
    setWater((prev) => +(prev + amount / 1000).toFixed(2));
  };

  const saveWater = () => {
    const value = Number.parseFloat(input);
    if (value > 0) {
      addWater(value);
      setInput("");
    }
  };

  const percent = Math.round((water / GOAL) * 100);

  const getStatus = () => {
    if (percent >= 100) {
      return {
        label: "GOAL REACHED 🎉",
        color: "#2EE5C5",
        border: "rgba(46, 229, 197, 0.4)",
        bg: "rgba(46, 229, 197, 0.15)",
      };
    }
    if (percent >= 60) {
      return {
        label: "HYDRATED",
        color: "#44CCEA",
        border: "rgba(68, 204, 234, 0.35)",
        bg: "rgba(68, 204, 234, 0.12)",
      };
    }
    if (percent >= 30) {
      return {
        label: "HYDRATING",
        color: "#38BDF8",
        border: "rgba(56, 189, 248, 0.3)",
        bg: "rgba(56, 189, 248, 0.1)",
      };
    }
    return {
      label: "NEEDS WATER",
      color: "#F87171",
      border: "rgba(248, 113, 113, 0.35)",
      bg: "rgba(248, 113, 113, 0.12)",
    };
  };

  const status = getStatus();

  return (
    <View style={s.screen}>
      <StatusBar style="light" />
      <WorkoutHeader showBorderBottom />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          s.content,
          { paddingBottom: Math.max(insets.bottom + 128, 150) },
        ]}
      >
        <View style={s.hero}>
          <Text style={s.heroTitle} numberOfLines={1}>
            FUEL YOURSELF
          </Text>
          <Text style={s.subtitle}>
            Eat smarter with AI-powered{"\n"}nutrition tracking.
          </Text>
        </View>

        <View style={s.macroCard}>
          <Text style={s.budgetLabel}>DAILY BUDGET</Text>
          <View style={s.budgetRow}>
            <Text style={s.budget}>1,850</Text>
            <Text style={s.total}>/ 2,300</Text>
          </View>
          <Text style={s.remaining}>KCAL REMAINING</Text>
          <View style={s.macroRow}>
            {macros.map(([label, value, color, border]) => (
              <View key={label} style={[s.macro, { borderColor: border }]}>
                <Text style={[s.macroLabel, { color }]}>{label}</Text>
                <Text style={s.macroValue}>{value}</Text>
              </View>
            ))}
          </View>
          <LinearGradient
            colors={["#0F4C77", "#3385C0"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={s.roundButton}
          >
            <View pointerEvents="none" style={s.buttonContent}>
              <Camera color="#fff" size={20} />
              <Text style={s.buttonText}>SCAN TODAY'S MEAL</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Scan today's meal"
              onPress={() => {
                tap(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/scan-meal");
              }}
              style={({ pressed }) => [s.buttonOverlay, pressed && s.pressed]}
            />
          </LinearGradient>
        </View>

        {/* WATER INTAKE CARD */}
        <View style={s.waterCard}>
          <View style={s.waterHeader}>
            <Text style={s.waterTitle}>WATER INTAKE</Text>
            <View
              style={[
                s.status,
                { borderColor: status.border, backgroundColor: status.bg },
              ]}
            >
              <Text style={[s.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>

          {/* Centered Dynamic Progress Ring with Prominent Icon */}
          <View style={s.ringWrap}>
            <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
              <Defs>
                <SvgLinearGradient
                  id="waterGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <Stop offset="0%" stopColor="#5FFFD7" />
                  <Stop offset="100%" stopColor="#30BAFF" />
                </SvgLinearGradient>
              </Defs>

              {/* Background Circular Track */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />

              {/* Dynamic Animated Arc */}
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke="url(#waterGradient)"
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset as any}
                fill="none"
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </Svg>

            {/* Centered Telemetry Content */}
            <View style={s.ringCopy} pointerEvents="none">
              <WaterDropletIcon size={26} color="#44CCEA" />
              <View style={s.litres}>
                <Text style={s.litresValue}>{water.toFixed(1)}</Text>
                <Text style={s.litresUnit}>L</Text>
              </View>
              <Text style={s.goal}>GOAL: {GOAL.toFixed(1)} L</Text>
              <View style={s.percentBadge}>
                <Text style={s.percentBadgeText}>{percent}% COMPLETED</Text>
              </View>
            </View>
          </View>

          {/* Quick-Add Interactive Buttons */}
          <View style={s.quickRow}>
            {[250, 500, 750].map((amount) => (
              <Pressable
                key={amount}
                accessibilityRole="button"
                accessibilityLabel={`Add ${amount} millilitres of water`}
                onPress={() => addWater(amount)}
                style={({ pressed }) => [s.quick, pressed && s.quickPressed]}
              >
                <WaterDropletIcon size={16} color="#44CCEA" />
                <Text style={s.quickText}>+{amount}ML</Text>
              </Pressable>
            ))}
          </View>

          {/* Custom Millilitres Input Row */}
          <View style={s.inputRow}>
            <View style={s.inputDropWrap}>
              <WaterDropletIcon size={18} color="#44CCEA" />
            </View>
            <TextInput
              style={s.input}
              value={input}
              onChangeText={(value) =>
                setInput(value.replace(/[^0-9]/g, ""))
              }
              placeholder="0"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              maxLength={5}
            />
            <Text style={s.ml}>ML</Text>
          </View>

          {/* Save Water Button */}
          <LinearGradient
            colors={["#0F4C77", "#3385C0"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={s.save}
          >
            <View pointerEvents="none" style={s.buttonContent}>
              <Text style={s.buttonText}>SAVE WATER</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save water intake"
              onPress={saveWater}
              style={({ pressed }) => [s.buttonOverlay, pressed && s.pressed]}
            />
          </LinearGradient>
        </View>

        {/* AI NUTRITION COACH */}
        <LinearGradient
          colors={["rgba(108,92,255,0.3)", "#34343A", "#121318"]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.coachCard}
        >
          <Image
            source={coachSparkles}
            contentFit="contain"
            style={s.coachDecor}
          />
          <View style={s.coachTop}>
            <View style={s.avatarShell}>
              <View style={s.avatarGlow} />
              <View style={s.avatarPanel}>
                <Image
                  source={coachArtwork}
                  contentFit="cover"
                  style={s.avatar}
                />
              </View>
            </View>
            <View style={s.coachCopy}>
              <View style={s.coachLabelRow}>
                <Text style={s.coachLabel}>AI NUTRITION COACH</Text>
              </View>
              <Text style={s.coachText}>
                "You still need{" "}
                <Text style={s.protein}>
                  24g of{"\n"}protein
                </Text>{" "}
                today."
              </Text>
            </View>
          </View>
          <View style={s.lunch}>
            <View style={s.lunchLabelRow}>
              <Image
                source={mealUtensils}
                contentFit="contain"
                style={s.mealIcon}
              />
              <Text style={s.lunchLabel}>RECOMMENDED NEXT LUNCH</Text>
            </View>
            <Text style={s.lunchText}>Grilled Chicken with Brown Rice</Text>
          </View>
          <View style={s.plan}>
            <View pointerEvents="none" style={s.planContent}>
              <Text style={s.planText}>VIEW AI MEAL PLAN</Text>
              <Image
                source={chevronRight}
                contentFit="contain"
                style={s.planChevron}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View AI meal plan"
              onPress={() => {
                tap();
                router.push("/ai-meal-plan");
              }}
              style={({ pressed }) => [s.buttonOverlay, pressed && s.pressed]}
            />
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#1E2731" },
  content: { paddingHorizontal: 24, paddingTop: 34, gap: 32 },
  hero: { gap: 0 },
  heroTitle: {
    color: "#fff",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -1.1,
    textShadowColor: "rgba(95,255,215,.42)",
    textShadowRadius: 14,
  },
  subtitle: { color: "#C8C4D8", fontSize: 16, lineHeight: 24, marginTop: 10 },
  macroCard: {
    borderRadius: 36,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.1)",
    backgroundColor: "#252B35",
    padding: 32,
    gap: 12,
    shadowColor: "#6C5CFF",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 0,
  },
  budgetLabel: {
    color: "#C8C4D8",
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 12,
    letterSpacing: 1.2,
    textAlign: "center",
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
  },
  budget: {
    color: "#fff",
    fontSize: 48,
    lineHeight: 52,
    fontWeight: "900",
    letterSpacing: -1.2,
  },
  total: { color: "#918EA1", fontSize: 24, fontWeight: "700", marginLeft: 5 },
  remaining: {
    color: "#44EAC3",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.35,
    textAlign: "center",
    marginBottom: 12,
  },
  macroRow: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
    marginBottom: 12,
  },
  macro: {
    flex: 1,
    minHeight: 78,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,.05)",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  macroLabel: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 9,
    letterSpacing: 0.45,
    marginBottom: 4,
  },
  macroValue: {
    color: "#E3E1E9",
    fontSize: 23,
    lineHeight: 28,
    fontWeight: "900",
  },
  roundButton: {
    width: "100%",
    alignSelf: "stretch",
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#6C5CFF",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 15,
    elevation: 0,
  },
  buttonContent: {
    position: "absolute",
    inset: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  buttonOverlay: { position: "absolute", inset: 0 },
  buttonText: {
    color: "#fff",
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0,
  },
  waterCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#6C5CFF",
    backgroundColor: "rgba(255,255,255,.03)",
    padding: 24,
    gap: 18,
  },
  waterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 4,
  },
  waterTitle: {
    color: "#44CCEA",
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  status: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
  },
  statusText: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  ringWrap: {
    height: RING_SIZE,
    width: RING_SIZE,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: 4,
  },
  ringCopy: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  litres: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },
  litresValue: {
    color: "#FFFFFF",
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  litresUnit: {
    color: "#918EA1",
    fontSize: 20,
    lineHeight: 26,
    marginLeft: 4,
    fontWeight: "700",
  },
  goal: {
    color: "#918EA1",
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    marginTop: 3,
  },
  percentBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "rgba(46, 229, 197, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(46, 229, 197, 0.25)",
  },
  percentBadgeText: {
    color: "#2EE5C5",
    fontSize: 9,
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 0.6,
  },
  quickRow: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
  },
  quick: {
    flex: 1,
    height: 68,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "#46505C",
    backgroundColor: "#2B333D",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  quickPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
    borderColor: "#44CCEA",
    backgroundColor: "rgba(68, 204, 234, 0.15)",
  },
  quickText: {
    color: "#C8C4D8",
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 11,
    lineHeight: 15,
  },
  inputRow: {
    height: 58,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.1)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  inputDropWrap: {
    marginRight: 10,
  },
  input: {
    color: "#E3E1E9",
    fontSize: 22,
    flex: 1,
    paddingVertical: 0,
    fontFamily: "JetBrainsMono_700Bold",
  },
  ml: {
    color: "#44CCEA",
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 16,
    letterSpacing: 1.6,
    paddingRight: 12,
  },
  save: {
    width: "100%",
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginTop: 4,
  },
  coachCard: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#6C5CFF",
    padding: 25,
    gap: 16,
    overflow: "hidden",
    shadowColor: "#6C5CFF",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 0,
  },
  coachDecor: {
    position: "absolute",
    width: 22,
    height: 28,
    right: -16,
    top: -16,
    opacity: 0.1,
  },
  coachTop: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatarShell: {
    width: 64,
    height: 64,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarGlow: {
    position: "absolute",
    inset: 0,
    borderRadius: 32,
    backgroundColor: "rgba(197,192,255,.3)",
    opacity: 0.65,
  },
  avatarPanel: {
    width: 64,
    height: 64,
    borderRadius: 16,
    padding: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "rgba(30,31,37,.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.1)",
  },
  avatar: { width: 48, height: 48, borderRadius: 0 },
  coachCopy: { flex: 1 },
  coachLabelRow: { flexDirection: "row", alignItems: "center" },
  coachLabel: {
    color: "#C5C0FF",
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 2,
  },
  coachText: {
    color: "#E3E1E9",
    fontSize: 16,
    fontWeight: "800",
    fontStyle: "italic",
    lineHeight: 20,
    marginTop: 0,
  },
  protein: { color: "#44EAC3", fontWeight: "400" },
  lunch: {
    backgroundColor: "rgba(0,0,0,.4)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.1)",
    padding: 17,
  },
  lunchLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  mealIcon: { width: 15, height: 20 },
  lunchLabel: {
    color: "#C8C4D8",
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.5,
  },
  lunchText: { color: "#E3E1E9", fontSize: 16, lineHeight: 24, fontWeight: "700" },
  plan: {
    position: "relative",
    width: "100%",
    alignSelf: "stretch",
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.1)",
    backgroundColor: "rgba(255,255,255,.05)",
    overflow: "hidden",
  },
  planContent: {
    position: "absolute",
    inset: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  planText: {
    color: "#E3E1E9",
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
  },
  planChevron: { width: 7.4, height: 12 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
});
