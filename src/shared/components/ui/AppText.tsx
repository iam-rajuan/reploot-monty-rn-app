import React from "react";
import type { TextStyle } from "react-native";
import { Text, type TextProps } from "@/shared/components/typography";
import { typography, TypographyVariant } from "@/theme/typography";
import { colors } from "@/theme/colors";

/**
 * Semantic text component.
 *
 * Reploot uses only Montserrat for primary page titles and Inter for all
 * other user-visible text. No additional text font families may be
 * introduced in current or future features.
 *
 * The default variant is `body` (Inter). Montserrat is only used when you
 * explicitly ask for a `pageTitle*` variant.
 */

export type TextColor =
  | "primary"
  | "secondary"
  | "muted"
  | "accent"
  | "mint"
  | "purple"
  | "inverse";

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: TextColor;
  className?: string;
}

const colorMap: Record<TextColor, string> = {
  primary: colors.text.primary,
  secondary: colors.text.secondary,
  muted: colors.text.muted,
  accent: colors.text.accent,
  mint: colors.text.mint,
  purple: colors.text.purple,
  inverse: colors.text.inverse,
};

export const AppText: React.FC<AppTextProps> = ({
  children,
  variant = "body",
  color = "primary",
  style,
  ...props
}) => {
  const baseStyle: TextStyle = {
    ...typography[variant],
    color: colorMap[color],
  };

  return (
    <Text style={[baseStyle, style]} {...props}>
      {children}
    </Text>
  );
};
