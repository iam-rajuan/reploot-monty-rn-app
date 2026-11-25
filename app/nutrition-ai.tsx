import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useNutritionPlanStore } from "@/stores/nutritionPlanStore";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Check, Send, Sparkles } from "lucide-react-native";
import { CoachEmoji } from "@/features/ai-coach/components/CoachEmoji";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text, TextInput } from "@/shared/components/typography";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  HORIZONTAL_PADDING,
  clampFontSize,
  isSmallDevice,
} from "@/shared/utils/responsive";
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

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenBackground />
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#E2E8F0" size={22} />
        </Pressable>
        <View style={styles.headerIdentity}>
          <View style={styles.botBadge}>
            <CoachEmoji size="md" />
          </View>
          <Text style={styles.headerLabel}>NUTRITION COACH</Text>
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

        <View style={styles.assistantRow}>
          <View style={styles.avatar}>
            <CoachEmoji size="lg" />
          </View>
          <View style={styles.assistantBubble}>
            <Text style={styles.assistantText}>{opening}</Text>
          </View>
        </View>

        {!isAdjustMode &&
          Object.entries(answers).map(([key, value]) => (
            <View key={key} style={styles.answerRow}>
              <View style={styles.userBubble}>
                <Text style={styles.userText}>{value}</Text>
              </View>
            </View>
          ))}

        {!isReady && !isAdjustMode && (
          <View style={styles.questionCard}>
            <View style={styles.questionMeta}>
              <Sparkles color="#44EAC3" size={14} />
              <Text style={styles.questionCount}>
                STEP {step + 1} OF {setupSteps.length}
              </Text>
            </View>
            <Text style={styles.question}>{current.question}</Text>
            <Text style={styles.helper}>{current.helper}</Text>
            <View style={styles.options}>
              {current.options.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => chooseSetup(option)}
                  style={styles.option}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </Pressable>
              ))}
            </View>
            {current.key === "budget" && (
              <View style={styles.customBudgetWrap}>
                <Text style={styles.customBudgetLabel}>
                  OR ENTER YOUR OWN WEEKLY BUDGET
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    value={budgetInput}
                    onChangeText={setBudgetInput}
                    onSubmitEditing={submitCustomBudget}
                    placeholder="e.g. 5,000 BDT / week"
                    placeholderTextColor="#64748B"
                    style={styles.input}
                    returnKeyType="done"
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Continue with custom budget"
                    onPress={submitCustomBudget}
                    style={[
                      styles.sendButton,
                      !budgetInput.trim() && styles.sendButtonDisabled,
                    ]}
                  >
                    <Send color="#071018" size={16} />
                  </Pressable>
                </View>
              </View>
            )}
            {current.key === "meals" && (
              <View style={styles.customBudgetWrap}>
                <Text style={styles.customBudgetLabel}>
                  OR ENTER YOUR OWN MEALS PER DAY
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    value={mealsInput}
                    onChangeText={(value) =>
                      setMealsInput(value.replace(/[^0-9]/g, ""))
                    }
                    onSubmitEditing={submitCustomMeals}
                    placeholder="e.g. 6"
                    placeholderTextColor="#64748B"
                    style={styles.input}
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Continue with custom number of meals"
                    onPress={submitCustomMeals}
                    style={[
                      styles.sendButton,
                      !mealsInput.trim() && styles.sendButtonDisabled,
                    ]}
                  >
                    <Send color="#071018" size={16} />
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}

        {!isReady && isAdjustMode && (
          <View style={styles.questionCard}>
            <View style={styles.questionMeta}>
              <Sparkles color="#44EAC3" size={14} />
              <Text style={styles.questionCount}>PLAN UPDATE</Text>
            </View>
            <Text style={styles.question}>How can I help with your meals?</Text>
            <Text style={styles.helper}>
              Choose a common adjustment or describe exactly what you need.
            </Text>
            <View style={styles.options}>
              {adjustOptions.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => chooseAdjustment(option)}
                  style={[
                    styles.option,
                    adjustment === option && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      adjustment === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.inputRow}>
              <TextInput
                value={adjustment}
                onChangeText={setAdjustment}
                placeholder="e.g. make lunch easier to prep"
                placeholderTextColor="#64748B"
                style={styles.input}
                multiline
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue with adjustment"
                onPress={continueAdjustment}
                style={[
                  styles.sendButton,
                  !adjustment.trim() && styles.sendButtonDisabled,
                ]}
              >
                <Send color="#071018" size={16} />
              </Pressable>
            </View>
          </View>
        )}

        {isReady && (
          <View style={styles.readyCard}>
            <View style={styles.readyIcon}>
              <Check color="#071018" size={22} strokeWidth={3} />
            </View>
            <Text style={styles.readyTitle}>
              {isAdjustMode
                ? "I’ve adjusted your plan."
                : "Your plan is ready to generate."}
            </Text>
            <Text style={styles.readyText}>
              {isAdjustMode
                ? `I’ll update the plan for: ${adjustment}.`
                : `Built around ${summary}.`}
            </Text>
            {!isAdjustMode && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit plan answers"
                onPress={editAnswers}
                style={styles.editAnswersButton}
              >
                <Text style={styles.editAnswersText}>EDIT MY ANSWERS</Text>
              </Pressable>
            )}
            <Pressable onPress={finish} style={styles.primaryButton}>
              <LinearGradient
                colors={["#00D9EA", "#3C9EFF"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.primaryGradient}
              >
                <Sparkles color="#071018" size={17} />
                <Text style={styles.primaryText}>
                  {isAdjustMode
                    ? "APPLY UPDATES TO MY PLAN"
                    : "GENERATE MY PERSONALIZED PLAN"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#090A10" },
  header: {
    height: 64,
    paddingHorizontal: HORIZONTAL_PADDING,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,.06)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#14141C",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginLeft: 12,
  },
  botBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(56,189,248,.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLabel: {
    color: "#C5C0FF",
    fontSize: 11,
    letterSpacing: 1.2,
  },
  content: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    ...typography.pageTitle,
    color: "#F8FAFC",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: clampFontSize(13),
    lineHeight: 19,
    marginTop: 5,
    marginBottom: 22,
  },
  assistantRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
    paddingRight: 24,
  },
  avatar: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  assistantBubble: {
    flex: 1,
    backgroundColor: "#14141C",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.08)",
    borderRadius: 18,
    borderBottomLeftRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  assistantText: {
    color: "#D5D9E2",
    fontSize: clampFontSize(14),
    lineHeight: 20,
    fontWeight: "600",
  },
  answerRow: { alignItems: "flex-end", marginBottom: 12 },
  userBubble: {
    maxWidth: "80%",
    backgroundColor: "rgba(56,189,248,.14)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,.22)",
    borderRadius: 18,
    borderBottomRightRadius: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userText: {
    color: "#DCEBFF",
    fontSize: clampFontSize(13),
    fontWeight: "700",
  },
  questionCard: {
    backgroundColor: "#14141C",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.08)",
    padding: isSmallDevice ? 16 : 18,
  },
  questionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },
  questionCount: {
    color: "#44EAC3",
    fontSize: 10,
    letterSpacing: 1,
  },
  question: {
    color: "#F8FAFC",
    fontSize: clampFontSize(20),
    lineHeight: 24,
    fontWeight: "800",
  },
  helper: {
    color: "#94A3B8",
    fontSize: clampFontSize(13),
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 15,
  },
  options: { gap: 8 },
  option: {
    minHeight: 46,
    backgroundColor: "#1A1A24",
    borderRadius: 13,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.08)",
  },
  optionSelected: {
    backgroundColor: "rgba(68,234,195,.12)",
    borderColor: "rgba(68,234,195,.5)",
  },
  optionText: {
    color: "#D5D9E2",
    fontSize: clampFontSize(14),
    fontWeight: "700",
  },
  optionTextSelected: { color: "#44EAC3" },
  customBudgetWrap: {
    marginTop: 15,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,.07)",
  },
  customBudgetLabel: {
    color: "#64748B",
    fontSize: 10,
    letterSpacing: 0.8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginTop: 12,
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 100,
    color: "#F8FAFC",
    backgroundColor: "#0D0E13",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.09)",
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: clampFontSize(13),
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#44EAC3",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: { opacity: 0.35 },
  readyCard: {
    backgroundColor: "#14141C",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(68,234,195,.3)",
    padding: isSmallDevice ? 18 : 22,
    alignItems: "center",
  },
  readyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#44EAC3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  readyTitle: {
    color: "#F8FAFC",
    fontSize: clampFontSize(20),
    fontWeight: "800",
    textAlign: "center",
  },
  readyText: {
    color: "#94A3B8",
    fontSize: clampFontSize(13),
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  editAnswersButton: {
    minHeight: 44,
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.12)",
    backgroundColor: "#1A1A24",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  editAnswersText: {
    color: "#D5D9E2",
    fontSize: 11,
    letterSpacing: 0.8,
  },
  primaryButton: { width: "100%", borderRadius: 14, overflow: "hidden" },
  primaryGradient: {
    minHeight: 52,
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: "#071018",
    fontSize: clampFontSize(13),
    fontWeight: "800",
    letterSpacing: 0.8,
    textAlign: "center",
  },
});
