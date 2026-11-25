import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Line } from "react-native-svg";

/**
 * The app-wide page background (the Home screen look).
 *
 * Every screen renders <ScreenBackground /> as the first child of its root
 * view, so this file is the single place to change the background of the
 * whole app. Edit the values below and every page updates.
 */

/** Solid base color, also used for root views behind the gradient layers. */
export const SCREEN_BACKGROUND_COLOR = "#060810";

const BASE_GRADIENT = {
  colors: ["#121A35", "#0C1429", "#080D1A", "#060810"],
  locations: [0, 0.26, 0.62, 1],
} as const;
const TOP_GLOW = ["rgba(91, 124, 255, 0.13)", "rgba(91, 124, 255, 0)"] as const;
const BOTTOM_TINT = ["rgba(25, 179, 184, 0)", "rgba(25, 179, 184, 0.045)"] as const;
const DIAGONAL_LINES = [
  { x1: 420, y1: -20, x2: -40, y2: 440, stroke: "rgba(147, 164, 255, 0.045)" },
  { x1: 460, y1: 260, x2: -40, y2: 760, stroke: "rgba(78, 143, 255, 0.035)" },
  { x1: 480, y1: 560, x2: -40, y2: 1080, stroke: "rgba(48, 211, 195, 0.03)" },
] as const;

export const ScreenBackground = () => (
  <View style={styles.fill} pointerEvents="none">
    <LinearGradient
      colors={BASE_GRADIENT.colors}
      locations={BASE_GRADIENT.locations}
      start={{ x: 0.9, y: 0 }}
      end={{ x: 0.18, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
    <LinearGradient
      colors={TOP_GLOW}
      start={{ x: 1, y: 0 }}
      end={{ x: 0.24, y: 0.42 }}
      style={StyleSheet.absoluteFill}
    />
    <LinearGradient
      colors={BOTTOM_TINT}
      start={{ x: 0.35, y: 0.48 }}
      end={{ x: 0, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
    <Svg style={styles.lines} pointerEvents="none">
      {DIAGONAL_LINES.map((line) => (
        <Line key={line.y1} {...line} strokeWidth={1} />
      ))}
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
    backgroundColor: SCREEN_BACKGROUND_COLOR,
  },
  lines: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },
});
