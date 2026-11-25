import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";

export interface BrandLogoProps {
  /** The text to display. Defaults to "REPLOT" */
  text?: string;
  /** Size tier: "sm" (18px), "md" (20px, default for headers), "lg" (24px), "hero" (32px) */
  size?: "sm" | "md" | "lg" | "hero";
  /** Visual color style:
   * - "dual": Titanium White for "REP" + Electric Cyan for "LOT"/"LOOT" (Signature athletic look)
   * - "monochrome": Clean 100% white
   * - "cyan": Vibrant 100% electric cyan
   */
  variant?: "dual" | "monochrome" | "cyan";
  /** Optional athletic kinetic forward slant (-7deg) */
  skew?: boolean;
  /** Whether to show the subtle trailing energy dot */
  showDot?: boolean;
  /** Additional container styling */
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  text = "REPLOT",
  size = "md",
  variant = "dual",
  skew = false,
  showDot = false,
  style,
  testID = "brand-logo",
}) => {
  // Split into REP + rest (LOT or LOOT)
  const upper = text.toUpperCase();
  const hasRepPrefix = upper.startsWith("REP");
  const prefix = hasRepPrefix ? "REP" : upper;
  const suffix = hasRepPrefix ? upper.slice(3) : "";

  const sizeStyle =
    size === "hero"
      ? styles.heroSize
      : size === "lg"
        ? styles.lgSize
        : size === "sm"
          ? styles.smSize
          : styles.mdSize;

  const prefixColor =
    variant === "cyan" ? "#00F2FE" : "#FFFFFF";

  const suffixColor =
    variant === "monochrome"
      ? "#FFFFFF"
      : "#00F2FE";

  return (
    <View
      style={[
        styles.container,
        skew && styles.skewed,
        style,
      ]}
      testID={testID}
      accessibilityRole="header"
      accessibilityLabel={text}
    >
      <View style={styles.textRow}>
        <Text
          style={[
            styles.baseText,
            sizeStyle,
            { color: prefixColor },
          ]}
        >
          {prefix}
        </Text>
        {Boolean(suffix) && (
          <Text
            style={[
              styles.baseText,
              sizeStyle,
              { color: suffixColor },
            ]}
          >
            {suffix}
          </Text>
        )}
        {showDot && (
          <View
            style={[
              styles.energyDot,
              size === "hero" ? styles.energyDotHero : styles.energyDotStandard,
            ]}
          />
        )}
      </View>
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
  textRow: {
    flexDirection: "row",
    alignItems: "center",
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
  energyDot: {
    backgroundColor: "#00F2FE",
    borderRadius: 4,
    shadowColor: "#00F2FE",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 5,
    elevation: 3,
  },
  energyDotStandard: {
    width: 4,
    height: 4,
    marginLeft: 4,
    marginBottom: 6,
  },
  energyDotHero: {
    width: 6,
    height: 6,
    marginLeft: 6,
    marginBottom: 10,
  },
});
