import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowRight, MessageCircle } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { CoachMascot } from "@/features/ai-coach/components/CoachMascot";
import { HORIZONTAL_PADDING } from "@/shared/utils/responsive";
import { typography } from "@/theme/typography";

/**
 * Home "Coach online" card, in the same visual language as the Nutrition tab
 * and the Today's Nutrition card: profile-card surface, soft status pill,
 * mascot in a round frame and the shared gradient primary button.
 */

const SURFACE_WASH = [
  "rgba(45,212,191,0.12)",
  "rgba(56,189,248,0.08)",
  "rgba(139,92,246,0.06)",
] as const;
const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;

export const AiCoachFloatingCard = () => {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);

  const handleAskCoach = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push("/coach?context=fitness");
  };

  return (
    <View style={styles.card}>
      <LinearGradient
        pointerEvents="none"
        colors={SURFACE_WASH}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Status + mascot */}
      <View style={styles.topRow}>
        <View style={styles.statusPill}>
          <View style={styles.statusHalo}>
            <View style={styles.statusDot} />
          </View>
          <Text style={styles.statusText}>COACH ONLINE</Text>
        </View>

        <View>
          <View style={styles.mascotCircle}>
            <CoachMascot size={32} />
          </View>
          <View style={styles.mascotDot} />
        </View>
      </View>

      {/* Message */}
      <Text style={styles.message}>
        Need guidance? Your <Text style={styles.highlightTeal}>AI Coach</Text> is
        ready to <Text style={styles.highlightSky}>optimize</Text> your session.
      </Text>

      {/* Action. Visuals sit on an inner view: Pressable style functions are
          dropped on native in this app (NativeWind interop). */}
      <Pressable
        onPress={handleAskCoach}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        accessibilityRole="button"
        accessibilityLabel="Ask AI Coach"
      >
        <View style={[styles.buttonShadow, pressed && styles.buttonPressed]}>
          <LinearGradient
            colors={BUTTON_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <LinearGradient
              pointerEvents="none"
              colors={SHEEN}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.buttonSheen}
            />
            <MessageCircle size={17} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.buttonText} numberOfLines={1}>
              ASK AI COACH
            </Text>
            <View style={styles.buttonTrail}>
              <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.6} />
            </View>
          </LinearGradient>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111A25",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.22)",
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 24,
    padding: 18,
    gap: 16,
    overflow: "hidden",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(45,212,191,0.08)",
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.35)",
  },
  statusHalo: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(45,212,191,0.25)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2DD4BF",
  },
  statusText: {
    ...typography.badge,
    color: "#2DD4BF",
  },
  mascotCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  mascotDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2DD4BF",
    borderWidth: 2,
    borderColor: "#111A25",
  },
  message: {
    ...typography.cardTitle,
    fontSize: 18,
    lineHeight: 26,
    color: "#F8FAFC",
    maxWidth: "92%",
  },
  highlightTeal: {
    color: "#2DD4BF",
  },
  highlightSky: {
    color: "#7DD3FC",
  },
  buttonShadow: {
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
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.97 }],
  },
  button: {
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
  buttonSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  buttonText: {
    ...typography.button,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  buttonTrail: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
