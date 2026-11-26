import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  markExerciseComplete,
  unmarkExerciseComplete,
} from "@/store/slices/workoutSlice";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowRight,
  Check,
  Dumbbell,
  Flame,
  Gauge,
  ListOrdered,
  Minus,
  Play,
  Plus,
  Radio,
  Sliders,
  Timer,
  Video,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, TextInput } from "@/shared/components/typography";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ExerciseDetailConfig,
  SetDetailItem,
} from "../data/exerciseDetailsData";
import { typography } from "@/theme/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

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

export interface ExerciseDetailScreenProps {
  exerciseData: ExerciseDetailConfig;
  onBack?: () => void;
  onStartExercise?: () => void;
  onViewFullWorkout?: () => void;
  onMarkDone?: () => void;
}

interface EditableSetValueProps {
  value: number;
  label: string;
  allowDecimal?: boolean;
  onCommit: (value: number) => void;
}

function EditableSetValue({
  value,
  label,
  allowDecimal = false,
  onCommit,
}: EditableSetValueProps) {
  const [draft, setDraft] = useState(String(value));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) setDraft(String(value));
  }, [isEditing, value]);

  const commit = () => {
    const parsed = Number(draft.replace(",", "."));
    const minimum = allowDecimal ? 0 : 1;
    const nextValue = Number.isFinite(parsed)
      ? Math.max(
          minimum,
          allowDecimal ? Math.round(parsed * 2) / 2 : Math.round(parsed),
        )
      : value;

    onCommit(nextValue);
    setDraft(String(nextValue));
    setIsEditing(false);
  };

  return (
    <TextInput
      accessibilityLabel={label}
      value={draft}
      onFocus={(event) => {
        setIsEditing(true);
      }}
      onChangeText={(text) => {
        const normalized = text.replace(",", ".");
        if (/^\d*\.?\d*$/.test(normalized)) setDraft(normalized);
      }}
      onBlur={commit}
      onSubmitEditing={commit}
      keyboardType={allowDecimal ? "decimal-pad" : "number-pad"}
      inputMode={allowDecimal ? "decimal" : "numeric"}
      showSoftInputOnFocus
      returnKeyType="done"
      selectTextOnFocus
      maxLength={5}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      style={styles.miniStepperInput}
    />
  );
}

function createInitialSets(sourceSets: SetDetailItem[]): SetDetailItem[] {
  const fallback = sourceSets[sourceSets.length - 1] ?? {
    setNumber: 1,
    reps: 8,
    weightKg: 20,
  };

  return Array.from({ length: 3 }, (_, index) => {
    const source = sourceSets[index] ?? fallback;
    return { ...source, setNumber: index + 1 };
  });
}

export const ExerciseDetailScreen: React.FC<ExerciseDetailScreenProps> = ({
  exerciseData,
  onBack,
  onStartExercise,
  onMarkDone,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Selected Step Tab (0, 1, 2)
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const reduxCompleted = useAppSelector((state) =>
    state.workout?.completedExerciseIds.includes(exerciseData.id),
  );
  const [internalDone, setInternalDone] = useState<boolean>(false);
  const isMarkedDone = reduxCompleted ?? internalDone;

  // Dynamic Sets State
  const [sets, setSets] = useState<SetDetailItem[]>(() =>
    createInitialSets(exerciseData.sets),
  );
  const [totalSetsCount, setTotalSetsCount] = useState<number>(3);

  // Rest Period input
  const [restSeconds, setRestSeconds] = useState<string>(
    String(exerciseData.defaultRestSec || 75),
  );

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/workouts");
    }
  };

  const handleStartExercise = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    if (onStartExercise) {
      onStartExercise();
    } else {
      router.push({
        pathname: "/workouts/ai-session" as any,
        params: {
          exerciseId: exerciseData.id,
        },
      });
    }
  };

  const handleToggleMarkDone = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }
    if (isMarkedDone) {
      dispatch(unmarkExerciseComplete(exerciseData.id));
      setInternalDone(false);
    } else {
      dispatch(markExerciseComplete(exerciseData.id));
      setInternalDone(true);
    }
    onMarkDone?.();
  };

  const handleStepSelect = (index: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setActiveStepIndex(index);
  };

  // Modify sets count (+ / -)
  const handleModifySets = (delta: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    const newCount = Math.max(1, Math.min(8, totalSetsCount + delta));
    setTotalSetsCount(newCount);

    if (delta > 0 && sets.length < newCount) {
      const last = sets[sets.length - 1] || { reps: 8, weightKg: 50 };
      setSets([
        ...sets,
        {
          setNumber: newCount,
          reps: last.reps,
          weightKg: last.weightKg,
        },
      ]);
    } else if (delta < 0 && sets.length > newCount) {
      setSets(sets.slice(0, newCount));
    }
  };

  // Modify reps or weight for a specific set index
  const handleUpdateSet = (
    index: number,
    field: "reps" | "weightKg",
    delta: number,
  ) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setSets((prevSets) =>
      prevSets.map((s, idx) => {
        if (idx !== index) return s;
        const currentVal = s[field];
        const stepAmount = field === "weightKg" ? 2.5 : 1;
        const minVal = field === "weightKg" ? 0 : 1;
        const updatedVal = Math.max(minVal, currentVal + delta * stepAmount);
        return {
          ...s,
          [field]: updatedVal,
        };
      }),
    );
  };

  const handleSetValueCommit = (
    index: number,
    field: "reps" | "weightKg",
    value: number,
  ) => {
    setSets((currentSets) =>
      currentSets.map((set, setIndex) =>
        setIndex === index ? { ...set, [field]: value } : set,
      ),
    );
  };

  const currentStep =
    exerciseData.executionSteps[activeStepIndex] ||
    exerciseData.executionSteps[0];

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScreenBackground />

      <CustomHeader
        transparent={true}
        showBackButton
        onPressBack={handleBack}
      />

      <KeyboardAwareScrollView
        style={styles.keyboardAvoidingView}
        bottomOffset={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 40, 60) },
        ]}
      >
        <View style={styles.titleSection}>
          <Text style={styles.categoryBadge}>EXERCISE GUIDE</Text>
          <Text style={styles.mainTitle} numberOfLines={1} adjustsFontSizeToFit>
            EXERCISE DETAILS
          </Text>
        </View>

        {/* Hero */}
        <View style={styles.heroPosterCard}>
          <Image
            source={exerciseData.heroImage}
            style={styles.heroPosterImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(6,8,16,0)", "rgba(6,8,16,0.45)", "rgba(6,8,16,0.95)"]}
            locations={[0.35, 0.65, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.heroPosterContent}>
            <View style={styles.heroFocusPill}>
              <Zap size={10} color={ACCENT_SOFT} fill={ACCENT_SOFT} />
              <Text style={styles.heroFocusTag}>
                {exerciseData.focusBadge || "POWER FOCUS"}
              </Text>
            </View>
            <Text style={styles.heroExerciseTitle} numberOfLines={2}>
              {exerciseData.title}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.primaryBtn}
          onPress={handleStartExercise}
          accessibilityRole="button"
          accessibilityLabel="Start exercise"
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
          <Text style={styles.primaryBtnText}>START EXERCISE</Text>
          <View style={styles.primaryTrail}>
            <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.6} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          style={[styles.secondaryBtn, isMarkedDone && styles.secondaryBtnDone]}
          onPress={handleToggleMarkDone}
          accessibilityRole="button"
          accessibilityState={{ checked: isMarkedDone }}
          accessibilityLabel={isMarkedDone ? "Completed" : "Mark as done"}
        >
          <View style={[styles.doneCircle, isMarkedDone && styles.doneCircleActive]}>
            <Check
              size={12}
              color={isMarkedDone ? "#FFFFFF" : ACCENT_SOFT}
              strokeWidth={3}
            />
          </View>
          <Text style={styles.secondaryBtnText}>
            {isMarkedDone ? "COMPLETED" : "MARK AS DONE"}
          </Text>
        </TouchableOpacity>

        {/* Demo */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionLeft}>
            <View style={styles.iconChip}>
              <Video size={14} color={ACCENT} strokeWidth={2.4} />
            </View>
            <Text style={styles.sectionLabel}>WATCH DEMO</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>FORM TRACKING</Text>
          </View>
        </View>

        <View style={styles.demoThumbnailCard}>
          <Image
            source={
              exerciseData.demoVideoThumbnail ||
              require("../../../../assets/workoutLibraryDetails/wld_hero.png")
            }
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(6,8,16,0.25)", "rgba(6,8,16,0.85)"]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.demoPlayCenter}>
            <View style={styles.demoPlayRing}>
              <View style={styles.demoPlayInner}>
                <Play size={20} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
              </View>
            </View>
            <Text style={styles.demoCardTitle}>
              {exerciseData.demoTitle || "POWER UP"}
            </Text>
            <Text style={styles.demoCardSubtitle}>
              {exerciseData.demoSubtitle || "GEN-Z FIT APP DEMO"}
            </Text>
          </View>
        </View>

        {/* Execution steps */}
        <View style={styles.card}>
          <LinearGradient
            colors={SURFACE_WASH}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.cardHeader}>
            <View style={styles.iconChip}>
              <ListOrdered size={14} color={ACCENT} strokeWidth={2.4} />
            </View>
            <Text style={styles.sectionLabel}>EXECUTION STEPS</Text>
          </View>

          <View style={styles.segment}>
            {exerciseData.executionSteps.map((step, idx) => {
              const isSelected = idx === activeStepIndex;
              return (
                <TouchableOpacity
                  key={step.id}
                  activeOpacity={0.8}
                  style={[styles.segmentItem, isSelected && styles.segmentItemActive]}
                  onPress={() => handleStepSelect(idx)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[styles.segmentText, isSelected && styles.segmentTextActive]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                  >
                    {step.tabLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.stepBody}>
            <View style={styles.stepTitleRow}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>{currentStep.stepNumber}</Text>
              </View>
              <Text style={styles.stepTitle}>{currentStep.title}</Text>
            </View>
            <Text style={styles.stepDescription}>{currentStep.description}</Text>
            <View style={styles.coachCue}>
              <Radio size={14} color={ACCENT} strokeWidth={2.4} />
              <Text style={styles.coachCueText}>
                <Text style={styles.coachCueBold}>Coach cue · </Text>
                {currentStep.coachCue}
              </Text>
            </View>
          </View>
        </View>

        {/* Target areas */}
        <View style={[styles.card, styles.targetCard]}>
          <LinearGradient
            colors={SURFACE_WASH}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.targetThumb}>
            <Image
              source={require("../../../../assets/workout/aiWorkoutAthletePose.png")}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          </View>
          <View style={styles.targetInfo}>
            <Text style={styles.overline}>TARGET AREAS</Text>
            <Text style={styles.targetTitle} numberOfLines={1}>
              {exerciseData.targetAreasTitle || "Chest & Triceps"}
            </Text>
            <View style={styles.tagRow}>
              {exerciseData.targetTags.map((tag) => (
                <View key={tag} style={styles.pill}>
                  <Text style={styles.pillText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Meta stats */}
        <View style={styles.metaRow}>
          {[
            { key: "eq", Icon: Dumbbell, label: "EQUIPMENT", value: exerciseData.equipment || "Barbell" },
            { key: "df", Icon: Gauge, label: "LEVEL", value: exerciseData.difficulty || "Intm." },
            { key: "kc", Icon: Flame, label: "CALORIES", value: exerciseData.calories || "120 kcal" },
          ].map(({ key, Icon, label, value }) => (
            <View key={key} style={styles.metaTile}>
              <View style={styles.iconChip}>
                <Icon size={14} color={ACCENT} strokeWidth={2.4} />
              </View>
              <Text style={styles.metaValue} numberOfLines={1} adjustsFontSizeToFit>
                {value}
              </Text>
              <Text style={styles.metaLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Sets & reps */}
        <View style={styles.card}>
          <LinearGradient
            colors={SURFACE_WASH}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.cardHeaderSpread}>
            <View style={styles.cardHeader}>
              <View style={styles.iconChip}>
                <Sliders size={14} color={ACCENT} strokeWidth={2.4} />
              </View>
              <Text style={styles.sectionLabel}>SETS & REPS</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>PYRAMID</Text>
            </View>
          </View>

          <View style={styles.setsCounter}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.roundBtn}
              onPress={() => handleModifySets(-1)}
              accessibilityRole="button"
              accessibilityLabel="Remove a set"
            >
              <Minus size={16} color={ACCENT_SOFT} strokeWidth={2.6} />
            </TouchableOpacity>
            <View style={styles.setsValueWrap}>
              <Text style={styles.setsValue}>{totalSetsCount}</Text>
              <Text style={styles.setsUnit}>SETS</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.roundBtn}
              onPress={() => handleModifySets(1)}
              accessibilityRole="button"
              accessibilityLabel="Add a set"
            >
              <Plus size={16} color={ACCENT_SOFT} strokeWidth={2.6} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.setColumns,
              sets.length <= 3 && styles.setColumnsFit,
            ]}
          >
            {sets.map((item, index) => (
              <View
                key={item.setNumber}
                style={[styles.setTile, sets.length <= 3 && styles.setTileFlexible]}
              >
                <Text style={styles.setTileTitle}>SET {item.setNumber}</Text>

                <Text style={styles.setTileLabel}>REPS</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    activeOpacity={0.6}
                    style={styles.stepperBtn}
                    onPress={() => handleUpdateSet(index, "reps", -1)}
                    hitSlop={6}
                    accessibilityLabel={`Fewer reps, set ${item.setNumber}`}
                  >
                    <Minus size={11} color="#94A3B8" strokeWidth={2.6} />
                  </TouchableOpacity>
                  <EditableSetValue
                    value={item.reps}
                    label={`Reps for set ${item.setNumber}`}
                    onCommit={(value) => handleSetValueCommit(index, "reps", value)}
                  />
                  <TouchableOpacity
                    activeOpacity={0.6}
                    style={styles.stepperBtn}
                    onPress={() => handleUpdateSet(index, "reps", 1)}
                    hitSlop={6}
                    accessibilityLabel={`More reps, set ${item.setNumber}`}
                  >
                    <Plus size={11} color="#94A3B8" strokeWidth={2.6} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.setTileLabel}>KG</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    activeOpacity={0.6}
                    style={styles.stepperBtn}
                    onPress={() => handleUpdateSet(index, "weightKg", -1)}
                    hitSlop={6}
                    accessibilityLabel={`Less weight, set ${item.setNumber}`}
                  >
                    <Minus size={11} color="#94A3B8" strokeWidth={2.6} />
                  </TouchableOpacity>
                  <EditableSetValue
                    value={item.weightKg}
                    label={`Weight for set ${item.setNumber}`}
                    allowDecimal
                    onCommit={(value) => handleSetValueCommit(index, "weightKg", value)}
                  />
                  <TouchableOpacity
                    activeOpacity={0.6}
                    style={styles.stepperBtn}
                    onPress={() => handleUpdateSet(index, "weightKg", 1)}
                    hitSlop={6}
                    accessibilityLabel={`More weight, set ${item.setNumber}`}
                  >
                    <Plus size={11} color="#94A3B8" strokeWidth={2.6} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Rest period */}
        <View style={styles.card}>
          <LinearGradient
            colors={SURFACE_WASH}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.cardHeader}>
            <View style={styles.iconChip}>
              <Timer size={14} color={ACCENT} strokeWidth={2.4} />
            </View>
            <Text style={styles.sectionLabel}>REST PERIOD</Text>
          </View>

          <View style={styles.restRow}>
            <View style={styles.restInputBox}>
              <TextInput
                value={restSeconds}
                onChangeText={setRestSeconds}
                keyboardType="numeric"
                inputMode="numeric"
                showSoftInputOnFocus
                returnKeyType="done"
                selectTextOnFocus
                maxLength={3}
                style={styles.restTextInput}
                placeholderTextColor="#64748B"
                placeholder="75"
              />
              <Text style={styles.restUnit}>SEC</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.restSetBtn}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                  ).catch(() => {});
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Set rest period"
            >
              <LinearGradient
                colors={BUTTON_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View>
                <Check size={13} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={styles.restSetText}>SET</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#060810",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
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
    marginBottom: 14,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardHeaderSpread: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  overline: {
    ...typography.overline,
    color: "#7C8BA1",
  },
  pill: {
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
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 10,
    marginBottom: 12,
  },
  sectionLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  // Hero
  heroPosterCard: {
    width: "100%",
    height: 300,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    marginBottom: 16,
  },
  heroPosterImage: {
    width: "100%",
    height: "100%",
  },
  heroPosterContent: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 18,
    gap: 8,
  },
  heroFocusPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(6,8,16,0.6)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
  },
  heroFocusTag: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },
  heroExerciseTitle: {
    ...typography.metric,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 0.2,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },

  // Buttons
  primaryBtn: {
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
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
  primaryTrail: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginBottom: 14,
    backgroundColor: "rgba(56,189,248,0.08)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  secondaryBtnDone: {
    backgroundColor: "rgba(56,189,248,0.16)",
    borderColor: "rgba(56,189,248,0.6)",
  },
  secondaryBtnText: {
    ...typography.button,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    color: ACCENT_SOFT,
  },
  doneCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(125,211,252,0.6)",
  },
  doneCircleActive: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9",
  },

  // Demo
  demoThumbnailCard: {
    height: 176,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  demoPlayCenter: {
    alignItems: "center",
    gap: 4,
  },
  demoPlayRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.16)",
    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.45)",
    marginBottom: 8,
  },
  demoPlayInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0EA5E9",
  },
  demoCardTitle: {
    ...typography.cardTitle,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  demoCardSubtitle: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },

  // Steps
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
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
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
  stepBody: {
    gap: 10,
  },
  stepTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0EA5E9",
  },
  stepNumberText: {
    ...typography.badge,
    letterSpacing: 0.2,
    color: "#FFFFFF",
  },
  stepTitle: {
    ...typography.cardTitle,
    color: "#F8FAFC",
    flexShrink: 1,
  },
  stepDescription: {
    ...typography.body,
    color: "#A7B3C5",
  },
  coachCue: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(56,189,248,0.08)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.2)",
  },
  coachCueText: {
    ...typography.bodySmall,
    color: "#CBD5E1",
    flex: 1,
  },
  coachCueBold: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: ACCENT_SOFT,
  },

  // Target areas
  targetCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  targetThumb: {
    width: 64,
    height: 64,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#0B111B",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.2)",
  },
  targetInfo: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  targetTitle: {
    ...typography.cardTitle,
    color: "#F8FAFC",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },

  // Meta
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  metaTile: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
  },
  metaValue: {
    ...typography.cardTitle,
    fontSize: 14,
    lineHeight: 18,
    color: "#F8FAFC",
  },
  metaLabel: {
    ...typography.overline,
    color: "#7C8BA1",
  },

  // Sets
  setsCounter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    borderRadius: 18,
    backgroundColor: "rgba(6,8,16,0.5)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  setsValueWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  setsValue: {
    ...typography.metricLarge,
    color: "#F8FAFC",
  },
  setsUnit: {
    ...typography.metricUnit,
    color: "#7C8BA1",
  },
  setColumns: {
    gap: 8,
  },
  setColumnsFit: {
    flexGrow: 1,
    width: "100%",
  },
  setTile: {
    width: 104,
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 18,
    backgroundColor: "rgba(6,8,16,0.5)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  setTileFlexible: {
    flex: 1,
    width: undefined,
    minWidth: 0,
  },
  setTileTitle: {
    ...typography.badge,
    color: ACCENT_SOFT,
    marginBottom: 2,
  },
  setTileLabel: {
    ...typography.overline,
    color: "#64748B",
  },
  stepper: {
    alignSelf: "stretch",
    height: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  stepperBtn: {
    width: 18,
    height: 22,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  miniStepperInput: {
    ...typography.cardTitle,
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
    minWidth: 0,
    width: "100%",
    padding: 0,
    textAlign: "center",
    color: "#F8FAFC",
  },

  // Rest
  restRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  restInputBox: {
    flex: 1,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(6,8,16,0.5)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
  },
  restTextInput: {
    ...typography.cardTitle,
    flex: 1,
    minWidth: 0,
    width: "100%",
    padding: 0,
    color: "#F8FAFC",
  },
  restUnit: {
    ...typography.metricUnit,
    color: "#7C8BA1",
    marginLeft: 8,
  },
  restSetBtn: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  restSetText: {
    ...typography.button,
    letterSpacing: 1,
    color: "#FFFFFF",
  },
});
