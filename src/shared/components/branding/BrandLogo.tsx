import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";

/** Brand sky blue used for the second half of the wordmark ("LOOT"). */
export const BRAND_ACCENT = "#38BDF8";

export interface BrandLogoProps {
  /** The text to display. Defaults to "REPLOOT" */
  text?: string;
  /** Size tier: "sm" (18), "md" (20, headers), "lg" (24), "hero" (32), "display" (48, splash) */
  size?: "sm" | "md" | "lg" | "hero" | "display";
  /** Colour of the first half ("REP"). Defaults to white. */
  color?: string;
  /** Colour of the second half ("LOOT"). Defaults to brand sky blue. */
  accentColor?: string;
  /** How many leading letters use `color`; the rest use `accentColor`. */
  splitAt?: number;
  /** Optional athletic kinetic forward slant (-7deg) */
  skew?: boolean;
  /** Additional container styling */
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Two-tone REPLOOT wordmark: white "REP" + sky-blue "LOOT". */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  text = "REPLOOT",
  size = "md",
  color = "#FFFFFF",
  accentColor = BRAND_ACCENT,
  splitAt = 3,
  skew = false,
  style,
  testID = "brand-logo",
}) => {
  const upper = text.toUpperCase();
  const head = upper.slice(0, splitAt);
  const tail = upper.slice(splitAt);

  const sizeStyle =
    size === "display"
      ? styles.displaySize
      : size === "hero"
        ? styles.heroSize
        : size === "lg"
          ? styles.lgSize
          : size === "sm"
            ? styles.smSize
            : styles.mdSize;

  return (
    <View
      style={[styles.container, skew && styles.skewed, style]}
      testID={testID}
      accessibilityRole="header"
      accessibilityLabel={text}
    >
      <Text style={[styles.baseText, sizeStyle, { color }]}>
        {head}
        <Text style={[styles.baseText, sizeStyle, { color: accentColor }]}>{tail}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  skewed: {
    transform: [{ skewX: "-7deg" }],
  },
  baseText: {
    ...typography.brandLogo,
    includeFontPadding: false,
  },
  smSize: {
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 1.2,
  },
  mdSize: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 1.5,
  },
  lgSize: {
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 1.8,
  },
  heroSize: {
    ...typography.brandLogoHero,
    includeFontPadding: false,
  },
  displaySize: {
    ...typography.brandLogoHero,
    fontSize: 48,
    lineHeight: 54,
    letterSpacing: 3,
    includeFontPadding: false,
  },
});
