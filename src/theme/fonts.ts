/**
 * REPLOOT FONT REGISTRY — single source of truth for every text font face.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ Reploot uses only Montserrat for primary page titles and Inter for all   │
 * │ other user-visible text. No additional text font families may be         │
 * │ introduced in current or future features.                                │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Rules
 * - Montserrat is reserved for the primary title that identifies a screen
 *   (`typography.pageTitle*` roles). Never use it for section or card titles.
 * - Inter is used for everything else, including numbers and metrics.
 * - Only the faces listed below are bundled and loaded. Each face is a real,
 *   static font file, so no weight is ever synthesized. To use a new weight,
 *   add its file here first; never point `fontFamily` at an unloaded face.
 * - Screens and components must not write raw `fontFamily` strings. Use the
 *   semantic roles in `typography.ts` (or `AppText`). For one-off weights,
 *   set `fontWeight` only; the shared `Text` primitive maps it to the matching
 *   loaded Inter face.
 * - Icon fonts that only draw icons are exempt. They must never style text.
 */
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { Inter_800ExtraBold } from "@expo-google-fonts/inter/800ExtraBold";
import { Montserrat_800ExtraBold } from "@expo-google-fonts/montserrat/800ExtraBold";
import type { TextStyle } from "react-native";

/** Loaded weights per family. These keys are the only valid weights. */
export const fontFamilies = {
  inter: {
    400: "Inter_400Regular",
    500: "Inter_500Medium",
    600: "Inter_600SemiBold",
    700: "Inter_700Bold",
    800: "Inter_800ExtraBold",
  },
  montserrat: {
    800: "Montserrat_800ExtraBold",
  },
} as const;

export type FontFamilyName = keyof typeof fontFamilies;

/** Font map passed to `useFonts` at the app root. Keys must match `fontFamilies`. */
export const fontAssets = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Montserrat_800ExtraBold,
} as const;

const montserratFaces = new Set<string>(Object.values(fontFamilies.montserrat));
const interFaces = new Set<string>(Object.values(fontFamilies.inter));

/** Returns the family a registered face belongs to, or null for any other string. */
export const getApprovedFamily = (fontFamily: unknown): FontFamilyName | null => {
  if (typeof fontFamily !== "string") return null;
  if (montserratFaces.has(fontFamily)) return "montserrat";
  if (interFaces.has(fontFamily)) return "inter";
  return null;
};

const NAMED_WEIGHTS: Record<string, number> = {
  ultralight: 400,
  thin: 400,
  light: 400,
  normal: 400,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  condensedBold: 700,
  condensed: 400,
  heavy: 800,
  black: 800,
};

const toNumericWeight = (weight: TextStyle["fontWeight"]): number | null => {
  if (weight == null) return null;
  if (typeof weight === "number") return weight;
  const parsed = Number(weight);
  if (!Number.isNaN(parsed)) return parsed;
  return NAMED_WEIGHTS[weight] ?? null;
};

/**
 * Maps a requested weight to the closest loaded face of the given family.
 * A weight between two loaded faces resolves to the lighter one, and anything
 * above the heaviest loaded face resolves to that face, never a synthetic one.
 */
export const resolveFontFamily = (
  family: FontFamilyName,
  weight?: TextStyle["fontWeight"],
  fallbackFace?: string,
): string => {
  const faces = fontFamilies[family] as Record<number, string>;
  const available = Object.keys(faces)
    .map(Number)
    .sort((a, b) => a - b);
  const requested = toNumericWeight(weight);

  if (requested == null) {
    if (fallbackFace && getApprovedFamily(fallbackFace) === family) return fallbackFace;
    return faces[available.includes(400) ? 400 : available[0]];
  }

  let match = available[0];
  for (const candidate of available) {
    if (candidate <= requested) match = candidate;
  }
  return faces[match];
};
