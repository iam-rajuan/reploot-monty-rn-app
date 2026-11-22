import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
          "rgba(32, 68, 117, 0.82)",
          "rgba(32, 68, 117, 0.2)",
          "transparent",
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.15, y: 0.55 }}
      />
      <View pointerEvents="none" style={styles.bottomAmbientGlow} />

      {/* Header: Glowing Dot + Title on Left, Link on Right (single-line guaranteed) */}
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
        >
          <Text style={styles.headerLink} numberOfLines={1}>
            View Nutrition
          </Text>
          <Image
            source={require("../../../../assets/figma/nutrition/nutrition-arrow.svg")}
            style={styles.headerArrow}
            contentFit="contain"
          />
        </Pressable>
      </View>

      <NutritionRingCard />
      <MacrosGrid />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#14141C",
    borderRadius: 32,
    marginHorizontal: 20,
    marginBottom: 24,
    paddingTop: 21,
    paddingHorizontal: 17,
    paddingBottom: 17,
    position: "relative",
    borderWidth: 1,
    borderColor: "#225291",
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
    backgroundColor: "rgba(25, 37, 53, 0.72)",
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
    color: "#E3E1E9",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    fontFamily: Platform.select({ android: "sans-serif", ios: "System" }),
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
    flexWrap: "nowrap",
  },
  pressed: {
    opacity: 0.75,
  },
  headerLink: {
    color: "#44EAC3",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
    fontFamily: "JetBrainsMono_700Bold",
  },
  headerArrow: {
    width: 16,
    height: 16,
  },
});
