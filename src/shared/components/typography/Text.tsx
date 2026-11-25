/**
 * Drop-in replacements for React Native's `Text` and `TextInput`.
 *
 * Reploot uses only Montserrat for primary page titles and Inter for all
 * other user-visible text. No additional text font families may be
 * introduced in current or future features.
 *
 * Always import `Text` / `TextInput` from "@/shared/components/typography",
 * never from "react-native" (`npm run lint:typography` checks this).
 *
 * What these primitives guarantee:
 * - Text with no font settings renders in Inter Regular, not the system font.
 * - `fontWeight` is mapped to a loaded Inter face (or Montserrat inside a page
 *   title) and then removed, so no platform ever synthesizes a fake bold.
 * - Any `fontFamily` that is not a registered Inter/Montserrat face is
 *   ignored (with a dev warning), so a third font can never appear.
 * - Italic is not part of the type system and is removed for the same reason.
 * - Nested `<Text>` keeps its parent's family, so a highlighted word inside a
 *   page title stays in Montserrat.
 * - Text still scales with the OS accessibility setting, capped so it does
 *   not break fixed-size controls. Pass `maxFontSizeMultiplier` to change it.
 */
import React, { createContext, useContext } from "react";
import {
  Text as RNText,
  TextInput as RNTextInput,
  StyleSheet,
  type StyleProp,
  type TextStyle,
} from "react-native";
import {
  getApprovedFamily,
  resolveFontFamily,
  type FontFamilyName,
} from "@/theme/fonts";

/** Default cap for OS text scaling on body text. */
export const DEFAULT_MAX_FONT_SIZE_MULTIPLIER = 1.3;
/** Montserrat titles are already large, so they scale less. */
const TITLE_MAX_FONT_SIZE_MULTIPLIER = 1.2;

const FontFamilyContext = createContext<FontFamilyName | null>(null);

const warned = new Set<string>();
const warnOnce = (message: string) => {
  if (!__DEV__ || warned.has(message)) return;
  warned.add(message);
  console.warn(`[typography] ${message}`);
};

interface ResolvedFont {
  style: TextStyle;
  family: FontFamilyName;
}

/**
 * Returns the style with `fontFamily` set to a loaded face, and with
 * `fontWeight` and `fontStyle` removed.
 * `inherited` is the parent's family for nested text, or null at the root.
 */
const resolveFontStyle = (
  style: StyleProp<TextStyle>,
  inherited: FontFamilyName | null,
): ResolvedFont => {
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const { fontFamily, fontWeight, fontStyle, ...rest } = flat;

  if (fontStyle && fontStyle !== "normal") {
    warnOnce(`fontStyle "${fontStyle}" is not part of the type system and was ignored.`);
  }

  const approved = getApprovedFamily(fontFamily);
  if (fontFamily != null && approved == null) {
    warnOnce(
      `fontFamily "${String(fontFamily)}" is not allowed. Use a role from typography.ts; text falls back to Inter.`,
    );
  }

  const family: FontFamilyName = approved ?? inherited ?? "inter";

  // Nested text without its own font settings inherits the parent's face.
  if (inherited != null && approved == null && fontWeight == null) {
    return { style: rest, family };
  }

  return {
    style: {
      ...rest,
      fontFamily: resolveFontFamily(family, fontWeight, approved ? (fontFamily as string) : undefined),
    },
    family,
  };
};

export type TextProps = React.ComponentPropsWithRef<typeof RNText>;

export function Text({ style, maxFontSizeMultiplier, ...props }: TextProps) {
  const inherited = useContext(FontFamilyContext);
  const { style: resolved, family } = resolveFontStyle(style, inherited);
  const multiplier =
    maxFontSizeMultiplier ??
    (family === "montserrat" ? TITLE_MAX_FONT_SIZE_MULTIPLIER : DEFAULT_MAX_FONT_SIZE_MULTIPLIER);

  const element = <RNText {...props} style={resolved} maxFontSizeMultiplier={multiplier} />;
  if (family === inherited) return element;
  return <FontFamilyContext.Provider value={family}>{element}</FontFamilyContext.Provider>;
}

/** Instance type, so `useRef<Text>(null)` keeps working. */
export type Text = RNText;

export type TextInputProps = React.ComponentPropsWithRef<typeof RNTextInput>;

export function TextInput({ style, maxFontSizeMultiplier, ...props }: TextInputProps) {
  const { style: resolved } = resolveFontStyle(style, null);
  return (
    <RNTextInput
      {...props}
      style={resolved}
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? DEFAULT_MAX_FONT_SIZE_MULTIPLIER}
    />
  );
}

/** Instance type, so `useRef<TextInput>(null)` keeps working. */
export type TextInput = RNTextInput;
