import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { HORIZONTAL_PADDING } from "@/shared/utils/responsive";

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
      {/* Profile-card surface wash (docs/profile-card-design-language.md §4.1) */}
      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(56,189,248,0.12)",
          "rgba(139,92,246,0.07)",
          "rgba(255,255,255,0.02)",
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header: Glowing Dot + Title on Left, Link on Right */}
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
            View Nutrition <Text style={styles.headerLinkArrow}>›</Text>
          </Text>
        </Pressable>
      </View>

      <NutritionRingCard />
      <MacrosGrid />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    // Surface follows the profile-card design language; layout is unchanged.
    backgroundColor: "#111A25",
    borderRadius: 24,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 20,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 16,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
  headerRight: {
    height: 24,
    justifyContent: "center",
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.75,
  },
  headerLink: {
    color: "#3FDEC9",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
    includeFontPadding: false,
    textAlign: "right",
  },
  headerLinkArrow: {
    color: "#3FDEC9",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
  },
});
