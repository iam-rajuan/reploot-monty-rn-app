import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import * as Haptics from "expo-haptics";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowRight,
  Camera as CameraIcon,
  Check,
  ListChecks,
  MoveHorizontal,
  PackageOpen,
  ScanLine,
  Sun,
  User,
  type LucideIcon,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/shared/components/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

export interface GetReadyRequirement {
  id: string;
  label: string;
}

export interface GetReadyScreenProps {
  onReady?: () => void;
  onBack?: () => void;
  exerciseTitle?: string;
  title?: string;
  description?: string;
}

const DEFAULT_REQUIREMENTS: GetReadyRequirement[] = [
  { id: "dist", label: "2–3 m away" },
  { id: "visible", label: "Body in view" },
  { id: "light", label: "Good lighting" },
  { id: "clear", label: "Clear space" },
];

const REQUIREMENT_ICONS: Record<string, LucideIcon> = {
  dist: MoveHorizontal,
  visible: User,
  light: Sun,
  clear: PackageOpen,
};

export const GetReadyScreen: React.FC<GetReadyScreenProps> = ({
  onReady,
  onBack,
  exerciseTitle,
  title = "GET READY",
  description = "Fit your whole body inside the frame.",
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Camera permissions & facing
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("front");

  useEffect(() => {
    if (!permission) {
      requestPermission().catch(() => {});
    } else if (!permission.granted && permission.canAskAgain) {
      requestPermission().catch(() => {});
    }
  }, [permission]);

  const toggleFacing = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setFacing((current) => (current === "front" ? "back" : "front"));
  };

  // Requirements checklist state (all checked by default or togglable)
  const [checkedIds, setCheckedIds] = useState<string[]>(
    DEFAULT_REQUIREMENTS.map((r) => r.id),
  );

  const toggleRequirement = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const allCovered = checkedIds.length === DEFAULT_REQUIREMENTS.length;

  const handleReadyPress = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }
    onReady?.();
  };

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

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <StatusBar style="light" />

      <CustomHeader
        transparent={true}
        showBackButton
        onPressBack={handleBack}
      />

      {/* Fixed one-screen layout: the camera takes all remaining space. */}
      <View
        style={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 12, 20) },
        ]}
      >
        <View style={styles.titleSection}>
          <Text style={styles.categoryBadge} numberOfLines={1}>
            {exerciseTitle
              ? exerciseTitle.replace(/\s*\(.*?\)\s*/g, " ").trim().toUpperCase()
              : "CAMERA SETUP"}
          </Text>
          <Text style={styles.mainTitle} numberOfLines={1} adjustsFontSizeToFit>
            {title}
          </Text>
          {description ? (
            <Text style={styles.subtitle} numberOfLines={1}>{description}</Text>
          ) : null}
        </View>

        {/* Camera frame */}
        <View style={styles.cameraBox}>
          {permission?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing={facing}
              mode="picture"
            />
          ) : (
            <Image
              source={require("../../../../assets/workout/getReadyDetection.png")}
              style={styles.cameraBackdrop}
              contentFit="cover"
            />
          )}

          <LinearGradient
            colors={["rgba(6,8,16,0.55)", "rgba(6,8,16,0)", "rgba(6,8,16,0.7)"]}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          <View style={[styles.cornerGuide, styles.cornerTL]} pointerEvents="none" />
          <View style={[styles.cornerGuide, styles.cornerTR]} pointerEvents="none" />
          <View style={[styles.cornerGuide, styles.cornerBL]} pointerEvents="none" />
          <View style={[styles.cornerGuide, styles.cornerBR]} pointerEvents="none" />

          {permission?.granted ? (
            <View style={styles.framePill} pointerEvents="none">
              <View style={styles.liveDot} />
              <Text style={styles.framePillText}>FRAME YOUR BODY</Text>
            </View>
          ) : null}

          {permission?.granted ? (
            <View style={styles.scanHint} pointerEvents="none">
              <ScanLine size={14} color={ACCENT_SOFT} strokeWidth={2.4} />
              <Text style={styles.scanHintText}>Step back until head and feet fit</Text>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.enableCameraBtn}
              onPress={() => requestPermission()}
              accessibilityRole="button"
              accessibilityLabel="Enable camera"
            >
              <LinearGradient
                colors={BUTTON_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View>
                <CameraIcon size={14} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <Text style={styles.enableCameraText}>ENABLE CAMERA</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Checklist */}
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
                <ListChecks size={12} color={ACCENT} strokeWidth={2.4} />
              </View>
              <Text style={styles.sectionLabel}>QUICK CHECK</Text>
            </View>
            <View style={[styles.pill, allCovered && styles.pillDone]}>
              <Text style={[styles.pillText, allCovered && styles.pillTextDone]}>
                {checkedIds.length}/{DEFAULT_REQUIREMENTS.length} READY
              </Text>
            </View>
          </View>

          <View style={styles.requirementsList}>
            {DEFAULT_REQUIREMENTS.map((item) => {
              const isChecked = checkedIds.includes(item.id);
              const Icon = REQUIREMENT_ICONS[item.id] || Check;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.75}
                  style={[
                    styles.requirementItem,
                    isChecked && styles.requirementItemOn,
                  ]}
                  onPress={() => toggleRequirement(item.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isChecked }}
                  accessibilityLabel={item.label}
                >
                  <Icon
                    size={14}
                    color={isChecked ? ACCENT : "#64748B"}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      !isChecked && styles.requirementTextOff,
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                  <View
                    style={[styles.checkCircle, isChecked && styles.checkCircleChecked]}
                  >
                    {isChecked ? (
                      <Check size={10} color="#FFFFFF" strokeWidth={3.4} />
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Ready */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.readyButton}
          onPress={handleReadyPress}
          accessibilityRole="button"
          accessibilityLabel="I'm Ready, start countdown"
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
            style={styles.readySheen}
            pointerEvents="none"
          />
          <Text style={styles.readyButtonText}>I'M READY</Text>
          <View style={styles.readyTrail}>
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
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 2,
  },
  titleSection: {
    marginBottom: 10,
    gap: 2,
  },
  categoryBadge: {
    ...typography.overline,
    color: ACCENT_SOFT,
  },
  mainTitle: {
    ...typography.pageTitle,
    color: "#F6F8FF",
  },
  subtitle: {
    ...typography.bodySmall,
    color: "#94A3B8",
  },

  // Camera
  cameraBox: {
    flex: 1,
    minHeight: 280,
    width: "100%",
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#0B111B",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
    marginBottom: 10,
    alignItems: "center",
  },
  cameraBackdrop: {
    ...StyleSheet.absoluteFill,
    opacity: 0.8,
  },
  cornerGuide: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: ACCENT,
  },
  cornerTL: {
    top: 16,
    left: 16,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 16,
    right: 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 16,
    left: 16,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 16,
    right: 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  framePill: {
    position: "absolute",
    top: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(6,8,16,0.7)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
  framePillText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },
  scanHint: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(6,8,16,0.7)",
  },
  scanHintText: {
    ...typography.caption,
    color: "#E2E8F0",
  },
  enableCameraBtn: {
    position: "absolute",
    bottom: 22,
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 14,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  enableCameraText: {
    ...typography.buttonSmall,
    letterSpacing: 1,
    color: "#FFFFFF",
  },

  // Checklist card
  card: {
    backgroundColor: "#111A25",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    padding: 10,
    gap: 8,
    marginBottom: 10,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconChip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  sectionLabel: {
    ...typography.overline,
    color: "#E5EEF8",
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.10)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.22)",
  },
  pillDone: {
    backgroundColor: "rgba(56,189,248,0.12)",
    borderColor: "rgba(56,189,248,0.35)",
  },
  pillText: {
    ...typography.badge,
    color: "#94A3B8",
  },
  pillTextDone: {
    color: ACCENT_SOFT,
  },
  requirementsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 6,
  },
  requirementItem: {
    width: "49%",
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: "rgba(6,8,16,0.45)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  requirementItemOn: {
    borderColor: "rgba(56,189,248,0.28)",
  },
  requirementText: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
    minWidth: 0,
    color: "#F1F5F9",
  },
  requirementTextOff: {
    color: "#64748B",
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(148,163,184,0.35)",
  },
  checkCircleChecked: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9",
  },

  // Ready button
  readyButton: {
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
  readySheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  readyButtonText: {
    ...typography.button,
    letterSpacing: 1,
    color: "#FFFFFF",
  },
  readyTrail: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
