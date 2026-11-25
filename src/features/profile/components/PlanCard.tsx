import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/shared/components/typography";

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
        colors={[
          "rgba(56,189,248,0.12)",
          "rgba(139,92,246,0.07)",
          "rgba(255,255,255,0.02)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.cardHeader, { justifyContent: "space-between" }]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../../../assets/check.svg")}
            style={{ width: 16, height: 16 }}
            contentFit="contain"
          />
          <Text style={[styles.cardTitle, { marginLeft: 8 }]}>PLAN</Text>
        </View>
        <View style={styles.activePill}>
          <Text style={styles.activePillText}>ACTIVE</Text>
        </View>
      </View>

      <View style={styles.planContent}>
        <Text style={styles.planName}>REPLOOT PREMIUM</Text>
        <Text style={styles.planDate}>Renewal: Dec 12, 2026</Text>
      </View>

      <TouchableOpacity
        style={styles.buttonWrapper}
        activeOpacity={0.8}
        onPress={handleManagePlan}
      >
        <LinearGradient
          colors={["#0284C7", "#0EA5E9", "#38BDF8"]}
          style={styles.btnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.btnText}>MANAGE PLAN</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111A25",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.18)",
    padding: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginLeft: 8,
  },
  activePill: {
    backgroundColor: "rgba(45, 212, 191, 0.15)",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.35)",
    paddingVertical: 4,
    borderRadius: 12,
  },
  activePillText: {
    color: "#2DD4BF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  planContent: {
    marginBottom: 20,
  },
  planName: {
    color: "#38BDF8",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  planDate: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
  },
  buttonWrapper: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  btnGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
});
