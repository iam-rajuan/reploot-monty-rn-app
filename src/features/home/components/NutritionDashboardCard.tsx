import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { MacrosGrid } from "./MacrosGrid";
import { NutritionRingCard } from "./NutritionRingCard";

// Figma-exact arrow SVG matching #44EAC3 neon cyan path
const NutritionArrow = () => (
  <Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
    <Path
      d="M12.175 9H0V7H12.175L6.575 1.4L8 0L16 8L8 16L6.575 14.6L12.175 9V9"
      fill="#44EAC3"
    />
  </Svg>
);

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
          "rgba(60, 99, 186, 0.28)",
          "rgba(60, 99, 186, 0.06)",
          "transparent",
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.15, y: 0.55 }}
      />
      <View pointerEvents="none" style={styles.bottomAmbientGlow} />

      {/* Header: Glowing Dot + Title on Left, Link on Right (strictly single-line) */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.cyanHalo}>
            <View style={styles.cyanDot} />
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Today's Nutrition
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.headerRight,
            pressed && styles.pressed,
          ]}
          onPress={handleViewNutrition}
          accessibilityRole="button"
          accessibilityLabel="View Nutrition Details"
          hitSlop={8}
        >
          <Text style={styles.headerLink} numberOfLines={1}>
            View Nutrition
          </Text>
          <NutritionArrow />
        </Pressable>
      </View>

      <NutritionRingCard />
      <MacrosGrid />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#101827",
    borderRadius: 32,
    marginHorizontal: 20,
    marginBottom: 24,
    paddingTop: 21,
    paddingHorizontal: 17,
    paddingBottom: 17,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(105, 130, 255, 0.25)",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  bottomAmbientGlow: {
    position: "absolute",
    width: 144,
    height: 144,
    borderRadius: 72,
    left: -40,
    bottom: -40,
    backgroundColor: "rgba(41, 101, 130, 0.13)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 8,
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
    color: "#F0F4FF",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    fontFamily: Platform.select({ android: "sans-serif-medium", ios: "System" }),
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.75,
  },
  headerLink: {
    color: "#3FDEC9",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
    fontFamily: "JetBrainsMono_700Bold",
    includeFontPadding: false,
  },
});
