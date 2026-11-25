import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WorkoutExerciseItem } from "../data/workoutPathDetailData";
import { typography } from "@/theme/typography";

const ACCENT = "#38BDF8";
const ACCENT_SOFT = "#7DD3FC";
const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;

const formatClock = (total: number) => {
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

export interface AiWorkoutCameraRecordScreenProps {
  currentExercise: WorkoutExerciseItem;
  exerciseIndex: number;
  totalExercises: number;
  onCompleteRecord: () => void;
  onBack?: () => void;
}

export const AiWorkoutCameraRecordScreen: React.FC<
  AiWorkoutCameraRecordScreenProps
> = ({
  currentExercise,
  exerciseIndex,
  totalExercises,
  onCompleteRecord,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("front");
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const matchReps = currentExercise.subtitle?.match(/(\d+)\s*(?:Reps|reps)/);
  const targetReps = matchReps ? parseInt(matchReps[1], 10) : 10;
  const [reps, setReps] = useState<number>(0);
  const [accuracy] = useState<number>(96);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission().catch(() => {});
    }
  }, [permission]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRecordSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const repTimer = setInterval(() => {
      setReps((prev) => {
        if (prev < targetReps) {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
              () => {},
            );
          }
          return prev + 1;
        }
        return prev;
      });
    }, 2800);
    return () => clearInterval(repTimer);
  }, [targetReps]);

  const toggleFacing = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setFacing((curr) => (curr === "front" ? "back" : "front"));
  };

  const handleManualIncrement = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setReps((prev) => Math.min(prev + 1, targetReps + 5));
  };

  const handleFinishRecording = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }
    onCompleteRecord();
  };

  const cleanExerciseTitle = currentExercise.title.replace(/\n/g, " ");

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        mode="picture"
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={["rgba(6,8,16,0.7)", "rgba(6,8,16,0)", "rgba(6,8,16,0)", "rgba(6,8,16,0.94)"]}
          locations={[0, 0.16, 0.6, 0.86]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Top bar */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top + 8, 24) }]}>
        <View style={styles.headerSide}>
          {onBack ? (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.iconCircleBtn}
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Back to routine"
            >
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE · {formatClock(recordSeconds)}</Text>
        </View>

        <View style={[styles.headerSide, styles.headerSideRight]}>
          {permission?.granted ? (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.iconCircleBtn}
              onPress={toggleFacing}
              accessibilityRole="button"
              accessibilityLabel="Flip camera"
            >
              <RefreshCw size={17} color={ACCENT_SOFT} strokeWidth={2.4} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Framing guides */}
      <View style={styles.frameArea} pointerEvents="none">
        <View style={[styles.cornerGuide, styles.cornerTL]} />
        <View style={[styles.cornerGuide, styles.cornerTR]} />
        <View style={[styles.cornerGuide, styles.cornerBL]} />
        <View style={[styles.cornerGuide, styles.cornerBR]} />
      </View>

      {/* Bottom panel */}
      <View
        style={[
          styles.bottomOverlayContainer,
          { paddingBottom: Math.max(insets.bottom + 10, 20) },
        ]}
      >
        <View style={styles.exerciseHead}>
          <Text style={styles.exerciseTag}>
            EXERCISE {exerciseIndex + 1} OF {totalExercises}
          </Text>
          <Text
            style={styles.exerciseTitleText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {cleanExerciseTitle}
          </Text>
          <View style={styles.exerciseSteps}>
            {Array.from({ length: totalExercises }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.exerciseStep,
                  i < exerciseIndex && styles.exerciseStepDone,
                  i === exerciseIndex && styles.exerciseStepActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.telemetryRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.telemetryCard}
            onPress={handleManualIncrement}
            accessibilityRole="button"
            accessibilityLabel="Tap to register rep"
          >
            <View style={styles.cardTop}>
              <View style={styles.iconChip}>
                <Activity size={11} color={ACCENT} strokeWidth={2.6} />
              </View>
              <Text style={styles.cardMiniLabel}>REPS</Text>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.bigValue}>{reps}</Text>
              <Text style={styles.valueUnit}>/ {targetReps}</Text>
            </View>
            <View style={styles.repTrack}>
              <View
                style={[
                  styles.repFill,
                  { width: `${Math.min(100, (reps / Math.max(1, targetReps)) * 100)}%` },
                ]}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.telemetryCard}>
            <View style={styles.cardTop}>
              <View style={styles.iconChip}>
                <ShieldCheck size={11} color={ACCENT} strokeWidth={2.6} />
              </View>
              <Text style={styles.cardMiniLabel}>FORM</Text>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.bigValue}>{accuracy}</Text>
              <Text style={styles.valueUnit}>%</Text>
            </View>
            <View style={styles.formPill}>
              <View style={styles.formDot} />
              <Text style={styles.formPillText}>OPTIMAL</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.primaryBtn}
          onPress={handleFinishRecording}
          accessibilityRole="button"
          accessibilityLabel="Finish set and view exercise statistics"
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
          <Text style={styles.primaryBtnText}>VIEW EXERCISE STATS</Text>
          <View style={styles.primaryTrail}>
            <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.6} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#060810",
  },
  topHeader: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  headerSide: {
    width: 42,
  },
  headerSideRight: {
    alignItems: "flex-end",
  },
  iconCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(6,8,16,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(6,8,16,0.6)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#F87171",
  },
  liveText: {
    ...typography.badge,
    color: "#F1F5F9",
    fontVariant: ["tabular-nums"],
  },

  // Framing guides
  frameArea: {
    position: "absolute",
    top: "12%",
    bottom: "37%",
    left: 24,
    right: 24,
  },
  cornerGuide: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "rgba(125,211,252,0.85)",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },

  // Bottom panel
  bottomOverlayContainer: {
    marginTop: "auto",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  exerciseHead: {
    gap: 2,
    marginBottom: 10,
  },
  exerciseTag: {
    ...typography.overline,
    color: ACCENT_SOFT,
  },
  exerciseTitleText: {
    ...typography.metric,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0.2,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  exerciseSteps: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  exerciseStep: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(148,163,184,0.22)",
  },
  exerciseStepDone: {
    backgroundColor: "rgba(56,189,248,0.55)",
  },
  exerciseStepActive: {
    backgroundColor: ACCENT,
  },

  telemetryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  telemetryCard: {
    flex: 1,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(17,26,37,0.86)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.2)",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconChip: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.12)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
  },
  cardMiniLabel: {
    ...typography.overline,
    color: "#94A3B8",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  bigValue: {
    ...typography.metric,
    fontSize: 28,
    lineHeight: 32,
    color: "#F8FAFC",
  },
  valueUnit: {
    ...typography.metricUnit,
    fontSize: 14,
    lineHeight: 18,
    color: "#64748B",
  },
  repTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: "rgba(148,163,184,0.16)",
  },
  repFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  formPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.12)",
  },
  formDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  formPillText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },

  primaryBtn: {
    height: 50,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
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
});
