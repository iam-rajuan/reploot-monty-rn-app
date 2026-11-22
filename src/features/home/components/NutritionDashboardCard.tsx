import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { MacrosGrid } from "./MacrosGrid";
import { NutritionRingCard } from "./NutritionRingCard";

export const NutritionDashboardCard = () => {
  const router = useRouter();

  const handleViewNutrition = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push("/nutrition");
  };

  return (
    <View style={styles.cardContainer}>
      {/* Top-Right Glowing Flare Gradient matching Figma */}
      <LinearGradient
        colors={[
          "rgba(37, 99, 235, 0.3)",
          "rgba(30, 64, 175, 0.12)",
          "transparent",
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.15, y: 0.55 }}
      />

      {/* Header: Glowing Dot + Title on Left, Link on Right */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.cyanHalo}>
            <View style={styles.cyanDot} />
          </View>
          <Text style={styles.headerTitle}>Today's Nutrition</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.headerRight,
            pressed && styles.pressed,
          ]}
          onPress={handleViewNutrition}
          accessibilityRole="button"
          accessibilityLabel="View Nutrition Details"
        >
          <Text style={styles.headerLink}>View Nutrition</Text>
          <ArrowRight size={16} color="#2EE5C5" strokeWidth={2.5} />
        </Pressable>
      </View>

      <NutritionRingCard />
      <MacrosGrid />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#111422",
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 28,
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 20,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    overflow: "hidden",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cyanHalo: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(46, 229, 197, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  cyanDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#2EE5C5",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16.5,
    fontWeight: "800",
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  pressed: {
    opacity: 0.75,
  },
  headerLink: {
    color: "#2EE5C5",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
    fontFamily: "JetBrainsMono_700Bold",
  },
});
