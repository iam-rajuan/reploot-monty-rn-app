import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { CoachMascot } from "./CoachMascot";

/**
 * Floating AI Coach launcher artwork: a gradient orb with a soft violet glow,
 * a glossy highlight, the 🐵 mascot and an "online" status dot.
 *
 * It fills a fixed 100 × 100 footprint (the same box the previous bitmap
 * used), so swapping it in does not move the floating button. The parent
 * Pressable owns the press behavior; pass `pressed` for visual feedback.
 */

const FOOTPRINT = 100;
const ORB = 60;

export const CoachLauncherOrb = ({ pressed = false }: { pressed?: boolean }) => (
  <View style={styles.footprint} pointerEvents="none">
    <View style={styles.haloOuter} />
    <View style={styles.haloInner} />
    <View style={[styles.orbShadow, pressed && styles.pressed]}>
      <LinearGradient
        colors={["#6D5BF7", "#4F8CF6", "#2DD4BF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.orb}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.30)", "rgba(255,255,255,0)"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.6 }}
          style={styles.gloss}
        />
        <CoachMascot size={42} tone="light" />
      </LinearGradient>
      <View style={styles.onlineDot} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  footprint: {
    width: FOOTPRINT,
    height: FOOTPRINT,
    alignItems: "center",
    justifyContent: "center",
  },
  haloOuter: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(124, 92, 246, 0.10)",
  },
  haloInner: {
    position: "absolute",
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "rgba(109, 91, 247, 0.16)",
  },
  orbShadow: {
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    ...Platform.select({
      ios: {
        shadowColor: "#7C5CF6",
        shadowOpacity: 0.55,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 10 },
      default: {
        boxShadow: "0px 8px 22px rgba(124, 92, 246, 0.55)",
      },
    }),
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
  orb: {
    flex: 1,
    borderRadius: ORB / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.24)",
    overflow: "hidden",
  },
  gloss: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  onlineDot: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#2DD4BF",
    borderWidth: 2.5,
    borderColor: "#0B1220",
  },
});
