import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useNutritionPlanStore } from "@/stores/nutritionPlanStore";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, ArrowRight, Check, Pencil, Send, Sparkles } from "lucide-react-native";
import { CoachEmoji } from "@/features/ai-coach/components/CoachEmoji";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, TextInput } from "@/shared/components/typography";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { HORIZONTAL_PADDING, isSmallDevice } from "@/shared/utils/responsive";
import { typography } from "@/theme/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

type SetupStep = {
  key: string;
  question: string;
  helper: string;
  options: string[];
};

const setupSteps: SetupStep[] = [
  {
    key: "budget",
    question: "What weekly food budget feels comfortable?",
    helper: "I’ll keep the meal choices realistic for you.",
    options: ["Budget-friendly", "Balanced", "Flexible"],
  },
  {
    key: "meals",
    question: "How many meals would you like each day?",
    helper: "We can include snacks inside the plan too.",
    options: ["3 meals", "4 meals", "5 meals"],
  },
  {
    key: "focus",
    question: "What should the plan prioritize?",
    helper: "I’ll use this to shape portions and protein timing.",
    options: ["High protein", "Balanced energy", "Plant-forward"],
  },
  {
    key: "prep",
    question: "How much time do you want to spend cooking?",
    helper: "No judgment—this should fit your real week.",
    options: ["Quick prep", "Mix of both", "I enjoy cooking"],
  },
];

const adjustOptions = [
  "Swap a meal",
  "Lower my budget",
  "Add more protein",
  "Change meal timing",
];

// One accent for the whole page.
const ACCENT = "#38BDF8";
const SURFACE_WASH = [
  "rgba(56,189,248,0.12)",
  "rgba(139,92,246,0.07)",
  "rgba(255,255,255,0.02)",
] as const;
const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;

const Surface = ({ children, style }: { children: React.ReactNode; style?: object }) => (
  <View style={[styles.surface, style]}>
    <LinearGradient
      pointerEvents="none"
      colors={SURFACE_WASH}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
    {children}
  </View>
);

/** Answer option: radio circle, label, and a selected state. */
const OptionRow = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected: !!selected }}
    style={[styles.option, selected && styles.optionSelected]}
  >
    <View style={[styles.radio, selected && styles.radioOn]}>
      {selected && <Check size={11} color="#04121C" strokeWidth={3.2} />}
    </View>
    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

/** Text input with a send button inside the same field. */
const InlineInput = ({
  label,
  value,
  onChangeText,
  onSubmit,
  placeholder,
  accessibilityLabel,
  keyboardType,
  multiline,
}: {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
  accessibilityLabel: string;
  keyboardType?: "number-pad";
  multiline?: boolean;
}) => {
  const enabled = value.trim().length > 0;
  return (
    <View style={styles.inlineWrap}>
      {label && <Text style={styles.inlineLabel}>{label}</Text>}
      <View style={styles.inputField}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={multiline ? undefined : onSubmit}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          style={styles.input}
          keyboardType={keyboardType}
          returnKeyType={multiline ? "default" : "done"}
          multiline={multiline}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled: !enabled }}
          disabled={!enabled}
          onPress={onSubmit}
          style={styles.sendShell}
        >
          {enabled ? (
            <LinearGradient
              colors={BUTTON_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButton}
            >
              <Send color="#FFFFFF" size={16} strokeWidth={2.4} />
            </LinearGradient>
          ) : (
            <View style={[styles.sendButton, styles.sendButtonDisabled]}>
              <Send color="#64748B" size={16} strokeWidth={2.4} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function NutritionAiScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isAdjustMode = mode === "adjust";
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [budgetInput, setBudgetInput] = useState("");
  const [mealsInput, setMealsInput] = useState("");
  const [adjustment, setAdjustment] = useState("");
  const [isReady, setIsReady] = useState(false);
  const activateGeneratedPlan = useNutritionPlanStore(
    (state) => state.activateGeneratedPlan,
  );

  const current = setupSteps[step];
  const summary = useMemo(() => Object.values(answers).join(" • "), [answers]);

  const chooseSetup = (choice: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextAnswers = { ...answers, [current.key]: choice };
    setAnswers(nextAnswers);
    if (step === setupSteps.length - 1) {
      setIsReady(true);
    } else {
      setStep((value) => value + 1);
    }
  };

  const submitCustomBudget = () => {
    const value = budgetInput.trim();
    if (!value) return;
    chooseSetup(value);
  };

  const submitCustomMeals = () => {
    const count = Number.parseInt(mealsInput, 10);
    if (!Number.isFinite(count) || count < 1) return;
    chooseSetup(`${count} meals`);
  };

  const chooseAdjustment = (choice: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAdjustment(choice);
  };

  const finish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    activateGeneratedPlan();
    router.replace("/ai-meal-plan");
  };

  const continueAdjustment = () => {
    if (!adjustment.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsReady(true);
  };

  const editAnswers = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(0);
    setIsReady(false);
  };

  const heading = isAdjustMode ? "ADJUST YOUR PLAN" : "NUTRITION COACH";
  const opening = isAdjustMode
    ? "Tell me what you’d like to change. I’ll update the plan while keeping your goals and routine in mind."
    : "I’ll build a practical plan around your life—not an unrealistic food list.";
  const completedSteps = isReady ? setupSteps.length : step;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenBackground />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#E2E8F0" size={20} strokeWidth={2.4} />
        </TouchableOpacity>
        <View style={styles.headerIdentity}>
          <View>
            <View style={styles.coachBadge}>
              <CoachEmoji size="md" />
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.headerName}>Your coach</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>
      </View>

      <KeyboardAwareScrollView
        bottomOffset={16}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.title}>{heading}</Text>
        <Text style={styles.subtitle}>
          {isAdjustMode
            ? "Fine-tune your current meal plan"
            : "A personalized plan in under a minute"}
        </Text>

        {/* Step progress */}
        {!isAdjustMode && (
          <View style={styles.progress} accessibilityLabel={`Step ${Math.min(step + 1, setupSteps.length)} of ${setupSteps.length}`}>
            {setupSteps.map((s, i) => (
              <View
                key={s.key}
                style={[
                  styles.progressSegment,
                  i < completedSteps && styles.progressDone,
                  i === completedSteps && !isReady && styles.progressCurrent,
                ]}
              />
            ))}
          </View>
        )}

        {/* Coach message */}
        <View style={styles.assistantRow}>
          <View style={styles.avatar}>
            <CoachEmoji size="lg" />
          </View>
          <View style={styles.assistantBubble}>
            <Text style={styles.assistantText}>{opening}</Text>
          </View>
        </View>

        {/* Your answers */}
        {!isAdjustMode &&
          Object.entries(answers).map(([key, value]) => (
            <View key={key} style={styles.answerRow}>
              <View style={styles.userBubble}>
                <Text style={styles.userText}>{value}</Text>
              </View>
            </View>
          ))}

        {/* Setup question */}
        {!isReady && !isAdjustMode && (
          <Surface>
            <View style={styles.questionMeta}>
              <View style={styles.stepPill}>
                <Text style={styles.stepPillText}>
                  STEP {step + 1} OF {setupSteps.length}
                </Text>
              </View>
            </View>
            <View style={styles.questionCopy}>
              <Text style={styles.question}>{current.question}</Text>
              <Text style={styles.helper}>{current.helper}</Text>
            </View>
            <View style={styles.options}>
              {current.options.map((option) => (
                <OptionRow
                  key={option}
                  label={option}
                  selected={answers[current.key] === option}
                  onPress={() => chooseSetup(option)}
                />
              ))}
            </View>
            {current.key === "budget" && (
              <InlineInput
                label="Or enter your own weekly budget"
                value={budgetInput}
                onChangeText={setBudgetInput}
                onSubmit={submitCustomBudget}
                placeholder="e.g. 5,000 BDT / week"
                accessibilityLabel="Continue with custom budget"
              />
            )}
            {current.key === "meals" && (
              <InlineInput
                label="Or enter your own meals per day"
                value={mealsInput}
                onChangeText={(value) => setMealsInput(value.replace(/[^0-9]/g, ""))}
                onSubmit={submitCustomMeals}
                placeholder="e.g. 6"
                accessibilityLabel="Continue with custom number of meals"
                keyboardType="number-pad"
              />
            )}
          </Surface>
        )}

        {/* Adjust request */}
        {!isReady && isAdjustMode && (
          <Surface>
            <View style={styles.questionMeta}>
              <View style={styles.stepPill}>
                <Text style={styles.stepPillText}>PLAN UPDATE</Text>
              </View>
            </View>
            <View style={styles.questionCopy}>
              <Text style={styles.question}>How can I help with your meals?</Text>
              <Text style={styles.helper}>
                Choose a common adjustment or describe exactly what you need.
              </Text>
            </View>
            <View style={styles.options}>
              {adjustOptions.map((option) => (
                <OptionRow
                  key={option}
                  label={option}
                  selected={adjustment === option}
                  onPress={() => chooseAdjustment(option)}
                />
              ))}
            </View>
            <InlineInput
              value={adjustment}
              onChangeText={setAdjustment}
              onSubmit={continueAdjustment}
              placeholder="e.g. make lunch easier to prep"
              accessibilityLabel="Continue with adjustment"
              multiline
            />
          </Surface>
        )}

        {/* Ready */}
        {isReady && (
          <Surface style={styles.readyCard}>
            <LinearGradient
              colors={BUTTON_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.readyIcon}
            >
              <Check color="#FFFFFF" size={24} strokeWidth={3} />
            </LinearGradient>
            <View style={styles.questionCopy}>
              <Text style={[styles.question, styles.centered]}>
                {isAdjustMode ? "I’ve adjusted your plan." : "Your plan is ready."}
              </Text>
              <Text style={[styles.helper, styles.centered]}>
                {isAdjustMode
                  ? `I’ll update the plan for: ${adjustment}.`
                  : `Built around ${summary}.`}
              </Text>
            </View>

            <Pressable
              onPress={finish}
              accessibilityRole="button"
              accessibilityLabel={isAdjustMode ? "Apply updates to my plan" : "Generate my plan"}
              style={styles.primaryShadow}
            >
              <LinearGradient
                colors={BUTTON_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButton}
              >
                <LinearGradient
                  pointerEvents="none"
                  colors={SHEEN}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.primarySheen}
                />
                <Sparkles color="#FFFFFF" size={17} strokeWidth={2.4} />
                <Text style={styles.primaryText}>
                  {isAdjustMode ? "APPLY UPDATES" : "GENERATE MY PLAN"}
                </Text>
                <View style={styles.primaryTrail}>
                  <ArrowRight color="#FFFFFF" size={14} strokeWidth={2.6} />
                </View>
              </LinearGradient>
            </Pressable>

            {!isAdjustMode && (
              <TouchableOpacity
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Edit plan answers"
                onPress={editAnswers}
                style={styles.secondaryButton}
              >
                <Pencil color="#7DD3FC" size={15} strokeWidth={2.3} />
                <Text style={styles.secondaryText}>EDIT MY ANSWERS</Text>
              </TouchableOpacity>
            )}
          </Surface>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#060810" },

  // Header
  header: {
    height: 64,
    paddingHorizontal: HORIZONTAL_PADDING,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.10)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  coachBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#2DD4BF",
    borderWidth: 2,
    borderColor: "#0B1220",
  },
  headerName: {
    ...typography.cardTitle,
    fontSize: 14,
    lineHeight: 18,
    color: "#F1F5F9",
  },
  headerStatus: {
    ...typography.caption,
    color: "#2DD4BF",
  },

  // Content
  content: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 14,
  },
  title: {
    ...typography.pageTitle,
    color: "#F8FAFC",
  },
  subtitle: {
    ...typography.body,
    color: "#94A3B8",
    marginTop: -10,
  },
  progress: {
    flexDirection: "row",
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(148,163,184,0.16)",
  },
  progressDone: {
    backgroundColor: ACCENT,
  },
  progressCurrent: {
    backgroundColor: "rgba(56,189,248,0.45)",
  },
  surface: {
    backgroundColor: "#111A25",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    padding: isSmallDevice ? 16 : 18,
    gap: 14,
    overflow: "hidden",
  },

  // Chat
  assistantRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingRight: 24,
  },
  avatar: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  assistantBubble: {
    flex: 1,
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.14)",
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  assistantText: {
    ...typography.body,
    color: "#D5D9E2",
  },
  answerRow: { alignItems: "flex-end" },
  userBubble: {
    maxWidth: "80%",
    backgroundColor: "rgba(56,189,248,0.14)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
    borderRadius: 18,
    borderBottomRightRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userText: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: "#E0F2FE",
  },

  // Question
  questionMeta: {
    flexDirection: "row",
  },
  stepPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  stepPillText: {
    ...typography.badge,
    color: "#7DD3FC",
  },
  questionCopy: {
    gap: 6,
  },
  question: {
    ...typography.cardTitle,
    fontSize: 20,
    lineHeight: 26,
    color: "#F8FAFC",
  },
  helper: {
    ...typography.body,
    color: "#94A3B8",
  },
  centered: {
    textAlign: "center",
  },
  options: { gap: 8 },
  option: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
  },
  optionSelected: {
    backgroundColor: "rgba(56,189,248,0.12)",
    borderColor: "rgba(56,189,248,0.55)",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(148,163,184,0.45)",
  },
  radioOn: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  optionText: {
    ...typography.subtitle,
    fontWeight: "600",
    color: "#D5D9E2",
    flex: 1,
  },
  optionTextSelected: { color: "#F8FAFC" },

  // Inline input
  inlineWrap: {
    gap: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.10)",
  },
  inlineLabel: {
    ...typography.caption,
    fontWeight: "600",
    color: "#8B9AB0",
  },
  inputField: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 5,
    paddingLeft: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
  },
  input: {
    ...typography.bodySmall,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    color: "#F8FAFC",
    paddingVertical: 10,
  },
  sendShell: {
    borderRadius: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(148,163,184,0.10)",
  },

  // Ready
  readyCard: {
    alignItems: "stretch",
  },
  readyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryShadow: {
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
  primaryButton: {
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
  primarySheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  primaryText: {
    ...typography.button,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  primaryTrail: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  secondaryButton: {
    height: 48,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(56,189,248,0.08)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  secondaryText: {
    ...typography.button,
    color: "#7DD3FC",
    letterSpacing: 1,
  },
});
