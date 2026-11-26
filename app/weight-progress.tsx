import { WorkoutHeader } from "@/features/workouts";
import { useProfileSetupStore } from "@/features/profile-onboarding/store/profileSetupStore";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Activity,
  LineChart,
  Minus,
  Plus,
  Ruler,
  Scale,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, TextInput } from "@/shared/components/typography";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  Line as SvgLine,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { typography } from "@/theme/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

const { width } = Dimensions.get("window");

// One accent for the whole page.
const ACCENT = "#38BDF8";
const ACCENT_SOFT = "#7DD3FC";
const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;
const SURFACE_WASH = [
  "rgba(56,189,248,0.12)",
  "rgba(139,92,246,0.06)",
  "rgba(255,255,255,0.02)",
] as const;

type TabType = "WEEKLY" | "MONTHLY" | "3 MONTHS";

interface TrendPoint {
  label: string;
  weight: number;
}

export default function WeightProgressScreen() {
  const insets = useSafeAreaInsets();
  const heightCm = useProfileSetupStore((state) => state.data.heightCm);
  const [selectedTab, setSelectedTab] = useState<TabType>("MONTHLY");
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
    null,
  );
  const [currentWeight, setCurrentWeight] = useState(72.4);
  const targetWeight = 68.0;
  const remainingWeight = Math.max(0, currentWeight - targetWeight);
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? currentWeight / (heightM * heightM) : 0;
  const bmiStatus =
    bmi < 18.5
      ? "BELOW RANGE"
      : bmi < 25
        ? "HEALTHY"
        : bmi < 30
          ? "ABOVE RANGE"
          : "HIGH";

  // Modal for logging new weight
  const [isLogModalVisible, setIsLogModalVisible] = useState(false);
  const [inputWeight, setInputWeight] = useState("");

  const triggerHaptic = (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
  ) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(style).catch(() => {});
    }
  };

  const handleTabPress = (tab: TabType) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTab(tab);
    setSelectedPointIndex(null);
  };

  const handleOpenLogModal = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setInputWeight(currentWeight.toFixed(1));
    setIsLogModalVisible(true);
  };

  const handleSaveWeight = () => {
    const val = parseFloat(inputWeight);
    if (!isNaN(val) && val > 30 && val < 300) {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
      setCurrentWeight(parseFloat(val.toFixed(1)));
    }
    setIsLogModalVisible(false);
  };

  // Trend dataset for each tab
  const trendData: Record<TabType, TrendPoint[]> = {
    WEEKLY: [
      { label: "MON", weight: 73.2 },
      { label: "TUE", weight: 73.0 },
      { label: "WED", weight: 72.8 },
      { label: "THU", weight: 72.9 },
      { label: "FRI", weight: 72.6 },
      { label: "SAT", weight: 72.5 },
      { label: "SUN", weight: currentWeight },
    ],
    MONTHLY: [
      { label: "WEEK 1", weight: 74.8 },
      { label: "WEEK 2", weight: 74.0 },
      { label: "WEEK 3", weight: 73.1 },
      { label: "WEEK 4", weight: currentWeight },
    ],
    "3 MONTHS": [
      { label: "MONTH 1", weight: 77.2 },
      { label: "MONTH 2", weight: 75.9 },
      { label: "MONTH 3", weight: 74.0 },
      { label: "NOW", weight: currentWeight },
    ],
  };

  const currentPoints = trendData[selectedTab];
  const monthStart = trendData.MONTHLY[0].weight;
  const monthChange = currentWeight - monthStart;
  const goalProgress = Math.max(
    0,
    Math.min(1, (monthStart - currentWeight) / Math.max(0.1, monthStart - targetWeight)),
  );
  const activePoint = selectedPointIndex ?? currentPoints.length - 1;

  // Graph dimensions (card padding 16 + page padding 20 on each side)
  const graphWidth = width - 72;
  const graphHeight = 140;
  const padX = 14;
  const padTop = 30;
  const padBottom = 14;

  const minW = Math.min(...currentPoints.map((p) => p.weight)) - 0.6;
  const maxW = Math.max(...currentPoints.map((p) => p.weight)) + 0.6;
  const range = maxW - minW || 1;

  const pts = currentPoints.map((p, idx) => {
    const x = padX + (idx / (currentPoints.length - 1)) * (graphWidth - padX * 2);
    const y = padTop + (1 - (p.weight - minW) / range) * (graphHeight - padTop - padBottom);
    return { x, y };
  });

  const curvePath = pts.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const midX = prev.x + (point.x - prev.x) / 2;
    return `${acc} C ${midX} ${prev.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
  const areaPath = `${curvePath} L ${pts[pts.length - 1].x} ${graphHeight} L ${pts[0].x} ${graphHeight} Z`;
  const tipX = Math.max(34, Math.min(pts[activePoint].x, graphWidth - 34));

  const adjustInput = (delta: number) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    const base = parseFloat(inputWeight);
    const next = (isNaN(base) ? currentWeight : base) + delta;
    setInputWeight(Math.max(30, Math.min(300, next)).toFixed(1));
  };

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <StatusBar style="light" />

      <WorkoutHeader
        transparent={true}
        showBackButton={true}
        onPressBack={() => {
          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
          router.canGoBack() ? router.back() : router.replace("/(tabs)/progress");
        }}
      />

      <KeyboardAwareScrollView
        bottomOffset={16}
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: Math.max(insets.bottom + 28, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.categoryBadge}>PROGRESS</Text>
          <Text style={styles.mainTitle} numberOfLines={1} adjustsFontSizeToFit>
            BODY METRICS
          </Text>
        </View>

        {/* Current weight */}
        <View style={styles.card}>
          <LinearGradient
            colors={SURFACE_WASH}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.iconChip}>
                <Scale size={14} color={ACCENT} strokeWidth={2.4} />
              </View>
              <Text style={styles.sectionLabel}>CURRENT WEIGHT</Text>
            </View>
            <View style={styles.pill}>
              {monthChange <= 0 ? (
                <TrendingDown size={11} color={ACCENT_SOFT} strokeWidth={2.6} />
              ) : (
                <TrendingUp size={11} color={ACCENT_SOFT} strokeWidth={2.6} />
              )}
              <Text style={styles.pillText}>
                {monthChange <= 0 ? "−" : "+"}
                {Math.abs(monthChange).toFixed(1)} KG
              </Text>
            </View>
          </View>

          <View style={styles.weightRow}>
            <Text style={styles.weightValue}>{currentWeight.toFixed(1)}</Text>
            <Text style={styles.weightUnit}>KG</Text>
          </View>

          <View style={styles.goalBlock}>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={["#6366F1", "#4F9DFB", "#38BDF8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${Math.max(4, goalProgress * 100)}%` }]}
              />
            </View>
            <View style={styles.goalLabels}>
              <Text style={styles.goalLabel}>
                START <Text style={styles.goalLabelStrong}>{monthStart.toFixed(1)}</Text>
              </Text>
              <View style={styles.goalRemaining}>
                <Target size={11} color={ACCENT_SOFT} strokeWidth={2.6} />
                <Text style={styles.goalRemainingText}>
                  {remainingWeight > 0
                    ? `${remainingWeight.toFixed(1)} KG TO GOAL`
                    : "GOAL REACHED"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Height · BMI · Target */}
        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <View style={styles.iconChipSm}>
              <Ruler size={13} color={ACCENT} strokeWidth={2.4} />
            </View>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{heightCm}</Text>
              <Text style={styles.statUnit}>CM</Text>
            </View>
            <Text style={styles.statLabel}>HEIGHT</Text>
          </View>

          <View style={styles.statTile}>
            <View style={styles.iconChipSm}>
              <Activity size={13} color={ACCENT} strokeWidth={2.4} />
            </View>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{bmi.toFixed(1)}</Text>
              <Text style={styles.statUnit}>BMI</Text>
            </View>
            <Text style={[styles.statLabel, styles.statLabelAccent]} numberOfLines={1}>
              {bmiStatus}
            </Text>
          </View>

          <View style={styles.statTile}>
            <View style={styles.iconChipSm}>
              <Target size={13} color={ACCENT} strokeWidth={2.4} />
            </View>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{targetWeight.toFixed(1)}</Text>
              <Text style={styles.statUnit}>KG</Text>
            </View>
            <Text style={styles.statLabel}>TARGET</Text>
          </View>
        </View>

        {/* Trend */}
        <View style={styles.card}>
          <LinearGradient
            colors={SURFACE_WASH}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.cardHeaderLeft}>
            <View style={styles.iconChip}>
              <LineChart size={14} color={ACCENT} strokeWidth={2.4} />
            </View>
            <Text style={styles.sectionLabel}>WEIGHT TREND</Text>
          </View>

          <View style={styles.segment}>
            {(["WEEKLY", "MONTHLY", "3 MONTHS"] as TabType[]).map((tab) => {
              const isActive = selectedTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.8}
                  style={[styles.segmentItem, isActive && styles.segmentItemActive]}
                  onPress={() => handleTabPress(tab)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                >
                  <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ width: graphWidth, height: graphHeight, alignSelf: "center" }}>
            <Svg width={graphWidth} height={graphHeight}>
              <Defs>
                <SvgLinearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={ACCENT} stopOpacity="0.32" />
                  <Stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                </SvgLinearGradient>
                <SvgLinearGradient id="weightLine" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#6366F1" />
                  <Stop offset="100%" stopColor="#38BDF8" />
                </SvgLinearGradient>
              </Defs>
              {[0.25, 0.5, 0.75].map((f) => (
                <SvgLine
                  key={f}
                  x1={0}
                  x2={graphWidth}
                  y1={padTop + f * (graphHeight - padTop - padBottom)}
                  y2={padTop + f * (graphHeight - padTop - padBottom)}
                  stroke="rgba(148,163,184,0.10)"
                  strokeDasharray="4 6"
                />
              ))}
              <Path d={areaPath} fill="url(#weightFill)" />
              <Path
                d={curvePath}
                fill="none"
                stroke="url(#weightLine)"
                strokeWidth={3}
                strokeLinecap="round"
              />
              <SvgLine
                x1={pts[activePoint].x}
                x2={pts[activePoint].x}
                y1={pts[activePoint].y}
                y2={graphHeight}
                stroke="rgba(125,211,252,0.35)"
                strokeDasharray="3 4"
              />
              {pts.map((pt, i) => (
                <React.Fragment key={i}>
                  <Circle
                    cx={pt.x}
                    cy={pt.y}
                    r={18}
                    fill="transparent"
                    onPress={() => {
                      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedPointIndex(i);
                    }}
                  />
                  <Circle
                    cx={pt.x}
                    cy={pt.y}
                    r={i === activePoint ? 7 : 4.5}
                    fill={i === activePoint ? "#0EA5E9" : "#0D1522"}
                    stroke={i === activePoint ? "#FFFFFF" : ACCENT}
                    strokeWidth={2}
                    pointerEvents="none"
                  />
                </React.Fragment>
              ))}
            </Svg>

            <View
              pointerEvents="none"
              style={[styles.tooltip, { left: tipX - 34, top: Math.max(0, pts[activePoint].y - 30) }]}
            >
              <Text style={styles.tooltipText}>
                {currentPoints[activePoint].weight.toFixed(1)} kg
              </Text>
            </View>
          </View>

          <View style={[styles.axisLabelsRow, { width: graphWidth }]}>
            {currentPoints.map((item, i) => (
              <Text
                key={i}
                style={[styles.axisLabel, i === activePoint && styles.axisLabelActive]}
              >
                {item.label}
              </Text>
            ))}
          </View>
        </View>

        {/* Coach note */}
        <View style={styles.coachCard}>
          <View style={styles.iconChip}>
            <Sparkles size={14} color={ACCENT} strokeWidth={2.4} />
          </View>
          <Text style={styles.coachText}>
            {monthChange < 0 ? (
              <>
                You're down{" "}
                <Text style={styles.coachStrong}>{Math.abs(monthChange).toFixed(1)} kg</Text>{" "}
                this month. Keep the steady pace — small changes add up.
              </>
            ) : (
              "Log your weight each morning to see a clear trend."
            )}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.primaryBtn}
          onPress={handleOpenLogModal}
          accessibilityRole="button"
          accessibilityLabel="Log morning weight"
        >
          <LinearGradient
            colors={BUTTON_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={SHEEN}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.primarySheen}
            pointerEvents="none"
          />
          <View>
            <Plus size={16} color="#FFFFFF" strokeWidth={2.8} />
          </View>
          <Text style={styles.primaryBtnText}>LOG MORNING WEIGHT</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      {/* Log weight modal */}
      <Modal
        visible={isLogModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLogModalVisible(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.iconChip}>
                  <Scale size={14} color={ACCENT} strokeWidth={2.4} />
                </View>
                <Text style={styles.modalTitle}>Log weight</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsLogModalVisible(false)}
                style={styles.modalCloseBtn}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X color="#94A3B8" size={16} strokeWidth={2.6} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Your morning reading, before breakfast.</Text>

            <View style={styles.modalInputRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.stepBtn}
                onPress={() => adjustInput(-0.1)}
                accessibilityLabel="Decrease by 0.1 kg"
              >
                <Minus size={16} color={ACCENT_SOFT} strokeWidth={2.6} />
              </TouchableOpacity>
              <View style={styles.modalInputBox}>
                <TextInput
                  value={inputWeight}
                  onChangeText={setInputWeight}
                  keyboardType="decimal-pad"
                  style={styles.modalInput}
                  autoFocus
                  selectTextOnFocus
                  placeholder="72.4"
                  placeholderTextColor="#64748B"
                  maxLength={5}
                />
                <Text style={styles.modalInputUnit}>KG</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.stepBtn}
                onPress={() => adjustInput(0.1)}
                accessibilityLabel="Increase by 0.1 kg"
              >
                <Plus size={16} color={ACCENT_SOFT} strokeWidth={2.6} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.primaryBtn, styles.modalPrimary]}
              onPress={handleSaveWeight}
              accessibilityRole="button"
              accessibilityLabel="Save weight"
            >
              <LinearGradient
                colors={BUTTON_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                colors={SHEEN}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.primarySheen}
                pointerEvents="none"
              />
              <Text style={styles.primaryBtnText}>SAVE WEIGHT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.ghostBtn}
              onPress={() => setIsLogModalVisible(false)}
              accessibilityRole="button"
            >
              <Text style={styles.ghostBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#060810",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  titleSection: {
    marginTop: 4,
    marginBottom: 18,
    gap: 4,
  },
  categoryBadge: {
    ...typography.overline,
    fontSize: 11,
    lineHeight: 16,
    color: ACCENT_SOFT,
  },
  mainTitle: {
    ...typography.pageTitle,
    color: "#F6F8FF",
  },

  // Shared
  card: {
    backgroundColor: "#111A25",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    padding: 16,
    gap: 14,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardHeaderLeft: {
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
  iconChipSm: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  sectionLabel: {
    ...typography.sectionTitle,
    color: "#E5EEF8",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
  },
  pillText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },

  // Weight card
  weightRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: -4,
  },
  weightValue: {
    ...typography.metricHero,
    color: "#F8FAFC",
  },
  weightUnit: {
    ...typography.metricUnit,
    fontSize: 14,
    lineHeight: 18,
    color: ACCENT_SOFT,
  },
  goalBlock: {
    gap: 8,
  },
  progressBarBg: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(148,163,184,0.12)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.10)",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  goalLabels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalLabel: {
    ...typography.overline,
    color: "#7C8BA1",
  },
  goalLabelStrong: {
    ...typography.overline,
    color: "#E2E8F0",
  },
  goalRemaining: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  goalRemainingText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },

  // Stat tiles
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  statTile: {
    flex: 1,
    gap: 6,
    padding: 12,
    borderRadius: 20,
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  statValue: {
    ...typography.metric,
    fontSize: 20,
    lineHeight: 26,
    color: "#F8FAFC",
  },
  statUnit: {
    ...typography.microTag,
    color: "#7C8BA1",
  },
  statLabel: {
    ...typography.microTag,
    color: "#7C8BA1",
    letterSpacing: 0.6,
  },
  statLabelAccent: {
    color: ACCENT_SOFT,
  },

  // Trend
  segment: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 14,
    backgroundColor: "rgba(6,8,16,0.5)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  segmentItem: {
    flex: 1,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentItemActive: {
    backgroundColor: "rgba(56,189,248,0.16)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.4)",
  },
  segmentText: {
    ...typography.badge,
    color: "#7C8BA1",
  },
  segmentTextActive: {
    color: ACCENT_SOFT,
  },
  tooltip: {
    position: "absolute",
    width: 68,
    alignItems: "center",
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#0EA5E9",
  },
  tooltipText: {
    ...typography.badge,
    letterSpacing: 0.3,
    color: "#FFFFFF",
    textTransform: "none",
  },
  axisLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    marginTop: -6,
  },
  axisLabel: {
    ...typography.microTag,
    color: "#64748B",
    letterSpacing: 0.6,
  },
  axisLabelActive: {
    color: ACCENT_SOFT,
  },

  // Coach
  coachCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "rgba(56,189,248,0.07)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
    marginBottom: 20,
  },
  coachText: {
    ...typography.bodySmall,
    flex: 1,
    color: "#CBD5E1",
    paddingTop: 5,
  },
  coachStrong: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: ACCENT_SOFT,
  },

  // Buttons
  primaryBtn: {
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
      },
      web: { boxShadow: "0 8px 22px rgba(56,189,248,0.28)" } as any,
      default: {},
    }),
  },
  primarySheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  primaryBtnText: {
    ...typography.button,
    letterSpacing: 1,
    color: "#FFFFFF",
  },
  ghostBtn: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostBtnText: {
    ...typography.buttonSmall,
    letterSpacing: 1,
    color: "#94A3B8",
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(2,4,10,0.78)",
  },
  modalCard: {
    padding: 18,
    gap: 14,
    borderRadius: 26,
    backgroundColor: "#0D1420",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    ...typography.cardTitle,
    color: "#F8FAFC",
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  modalSubtitle: {
    ...typography.bodySmall,
    color: "#94A3B8",
  },
  modalInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  modalInputBox: {
    flex: 1,
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 18,
    backgroundColor: "rgba(6,8,16,0.6)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  modalInput: {
    ...typography.metricLarge,
    width: 96,
    padding: 0,
    textAlign: "center",
    color: "#F8FAFC",
  },
  modalInputUnit: {
    ...typography.metricUnit,
    color: ACCENT_SOFT,
  },
  modalPrimary: {
    marginTop: 4,
  },
});
