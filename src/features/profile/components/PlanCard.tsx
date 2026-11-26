import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { CalendarClock, ChevronRight, Crown } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";

const ACCENT = "#38BDF8";
const ACCENT_SOFT = "#7DD3FC";
const SURFACE_WASH = [
  "rgba(56,189,248,0.12)",
  "rgba(139,92,246,0.06)",
  "rgba(255,255,255,0.02)",
] as const;

export const PlanCard = () => {
  const router = useRouter();

  const handleManagePlan = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    router.push("/profile/manage-plan");
  };

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={SURFACE_WASH}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.titleRow}>
        <Text style={styles.kicker}>YOUR PLAN</Text>
        <View style={styles.activePill}>
          <View style={styles.activeDot} />
          <Text style={styles.activePillText}>ACTIVE</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.crown}>
          <LinearGradient
            colors={["#38BDF8", "#0EA5E9", "#0284C7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View>
            <Crown size={20} color="#FFFFFF" strokeWidth={2.2} />
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={styles.planName}>
            REPLOOT <Text style={styles.planNameAccent}>PREMIUM</Text>
          </Text>
          <View style={styles.renewRow}>
            <CalendarClock size={12} color="#7C8BA1" strokeWidth={2.2} />
            <Text style={styles.planDate}>Renews Dec 12, 2026</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.secondaryBtn}
        activeOpacity={0.75}
        onPress={handleManagePlan}
        accessibilityRole="button"
        accessibilityLabel="Manage plan"
      >
        <Text style={styles.secondaryBtnText}>MANAGE PLAN</Text>
        <ChevronRight size={14} color={ACCENT_SOFT} strokeWidth={2.6} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111A25",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    padding: 16,
    gap: 16,
    marginBottom: 22,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  crown: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  kicker: {
    ...typography.overline,
    color: "#7C8BA1",
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  activePillText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },
  planName: {
    ...typography.cardTitle,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0.5,
    color: "#F8FAFC",
  },
  planNameAccent: {
    ...typography.cardTitle,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0.5,
    color: ACCENT,
  },
  renewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  planDate: {
    ...typography.caption,
    color: "#94A3B8",
  },
  secondaryBtn: {
    height: 46,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(56,189,248,0.08)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  secondaryBtnText: {
    ...typography.button,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    color: ACCENT_SOFT,
  },
});
