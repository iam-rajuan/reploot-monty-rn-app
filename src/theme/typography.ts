import type { TextStyle } from "react-native";
import { fontFamilies } from "./fonts";

/**
 * REPLOOT TYPOGRAPHY SYSTEM
 *
 * Reploot uses only Montserrat for primary page titles and Inter for all
 * other user-visible text. No additional text font families may be
 * introduced in current or future features.
 *
 * How to use it
 * - Pick the role that matches the element's purpose, not its look.
 *   `<AppText variant="cardTitle">`, or `...typography.cardTitle` in a style.
 * - Elements with the same role must look the same on every screen. Change
 *   only color, alignment and spacing per screen, never size, weight,
 *   tracking or case.
 * - `pageTitle*` roles (Montserrat) are only for the one title that
 *   identifies the whole screen. Section and card headings use Inter roles.
 * - If a new design needs a new kind of text, add a role here with Inter
 *   (or Montserrat for a page title). Never add another font.
 *
 * Type scale (px): 9 · 10 · 11 · 12 · 13 · 14 · 16 · 18 · 20 · 22 · 24 · 28 · 32 · 40 · 48
 * New sizes should come from this scale.
 *
 * Loaded weights: Inter 400 / 500 / 600 / 700 / 800, Montserrat 800.
 *
 * Alignment: roles do not set `textAlign`, so text follows its layout's
 * start edge. Center a title only where the layout itself is centered (for
 * example, onboarding hero slides).
 */

const inter = fontFamilies.inter;
const montserrat = fontFamilies.montserrat;

export const typography = {
  // ── Primary page titles (Montserrat) ───────────────────────────────────────
  /** The main title of a standard screen ("NUTRITION", "YOUR WORKOUTS"). */
  pageTitle: {
    fontFamily: montserrat[800],
    fontWeight: "800",
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0,
    textTransform: "uppercase",
    // Signature soft indigo glow on every page title.
    textShadowColor: "rgba(165,180,252,0.75)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  /** Page title on full-bleed hero screens (auth, onboarding). */
  pageTitleHero: {
    fontFamily: montserrat[800],
    fontWeight: "800",
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: 0,
    textTransform: "uppercase",
    // Signature soft indigo glow on every page title.
    textShadowColor: "rgba(165,180,252,0.75)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  /** Page title shown inside a compact top app bar (chat, camera, header bar). */
  pageTitleCompact: {
    fontFamily: montserrat[800],
    fontWeight: "800",
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    // Signature soft indigo glow on every page title.
    textShadowColor: "rgba(165,180,252,0.75)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  /** Brand identity wordmark for the app logo ("REPLOT" / "REPLOOT"). */
  brandLogo: {
    fontFamily: montserrat[800],
    fontWeight: "800",
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  /** Hero brand identity wordmark for splash, auth, and onboarding hero screens. */
  brandLogoHero: {
    fontFamily: montserrat[800],
    fontWeight: "800",
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },

  // ── Structural headings (Inter) ───────────────────────────────────────────
  /** Heading that groups content inside a screen ("TODAY'S MISSIONS"). */
  sectionTitle: {
    fontFamily: inter[700],
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  /** Title of a card, list row or modal block. */
  cardTitle: {
    fontFamily: inter[700],
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
  },
  /** Supporting line directly under a title. */
  subtitle: {
    fontFamily: inter[500],
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },

  // ── Body (Inter) ───────────────────────────────────────────────────────────
  bodyLarge: {
    fontFamily: inter[400],
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  body: {
    fontFamily: inter[400],
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0,
  },
  bodySmall: {
    fontFamily: inter[400],
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0,
  },

  // ── Interactive (Inter) ────────────────────────────────────────────────────
  /** Primary and secondary button labels. */
  button: {
    fontFamily: inter[700],
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  /** Large, full-width primary calls to action. */
  buttonLarge: {
    fontFamily: inter[700],
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  /** Compact buttons, text links and pill actions. */
  buttonSmall: {
    fontFamily: inter[700],
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  /** Bottom tab bar and segmented navigation labels. */
  navLabel: {
    fontFamily: inter[600],
    fontWeight: "600",
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.4,
  },

  // ── Forms (Inter) ──────────────────────────────────────────────────────────
  formLabel: {
    fontFamily: inter[600],
    fontWeight: "600",
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  /** Typed value and placeholder inside text inputs. */
  input: {
    fontFamily: inter[500],
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
  },

  // ── Meta (Inter) ───────────────────────────────────────────────────────────
  /** Helper text, timestamps, validation and secondary metadata. */
  caption: {
    fontFamily: inter[500],
    fontWeight: "500",
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  /** Small uppercase kicker above a heading, or a stat label ("CALORIES"). */
  overline: {
    fontFamily: inter[700],
    fontWeight: "700",
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  /** Badges, chips and status pills. */
  badge: {
    fontFamily: inter[700],
    fontWeight: "700",
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  // ── Metrics (Inter, tabular-feeling heavy numerals) ────────────────────────
  /** Hero number on a screen (rep counter, countdown, total XP). */
  metricHero: {
    fontFamily: inter[800],
    fontWeight: "800",
    fontSize: 48,
    lineHeight: 54,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  /** Primary number inside a card (calories, weight, streak). */
  metricLarge: {
    fontFamily: inter[800],
    fontWeight: "800",
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
    fontVariant: ["tabular-nums"],
  },
  /** Secondary numbers in stat rows and grids. */
  metric: {
    fontFamily: inter[700],
    fontWeight: "700",
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
    fontVariant: ["tabular-nums"],
  },
  /** Unit that follows a metric ("KG", "KCAL", "%"). */
  metricUnit: {
    fontFamily: inter[600],
    fontWeight: "600",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/** Roles that render in Montserrat. Use them only for primary page titles. */
export const pageTitleVariants = ["pageTitle", "pageTitleHero", "pageTitleCompact"] as const;
