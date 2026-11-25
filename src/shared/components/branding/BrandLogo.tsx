import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";

export interface BrandLogoProps {
  /** The text to display. Defaults to "REPLOOT" */
  text?: string;
  /** Size tier: "sm" (18px), "md" (20px, default for headers), "lg" (24px), "hero" (32px) */
  size?: "sm" | "md" | "lg" | "hero";
  /** Single unified color. Defaults to pure crisp white "#FFFFFF" */
  color?: string;
  /** Optional athletic kinetic forward slant (-7deg) */
  skew?: boolean;
  /** Additional container styling */
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  text = "REPLOOT",
  size = "md",
  color = "#FFFFFF",
  skew = false,
  style,
  testID = "brand-logo",
}) => {
  const upper = text.toUpperCase();

  const sizeStyle =
    size === "hero"
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
      <Text style={[styles.baseText, sizeStyle, { color }]}>{upper}</Text>
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
});
