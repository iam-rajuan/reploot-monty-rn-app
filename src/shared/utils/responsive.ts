import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Base guidelines based on standard mobile viewport (375x812)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;
export const isSmallDevice = SCREEN_WIDTH <= 360;
export const isTablet = SCREEN_WIDTH >= 600;

/**
 * Scales a dimension horizontally relative to standard screen width
 */
export const scale = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scales a dimension vertically relative to standard screen height
 */
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Moderate scale that balances rigid pixel sizing and scaling factor (default factor 0.5)
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return Math.round(size + (scale(size) - size) * factor);
};

/**
 * Clamps font size within a safe range to ensure responsiveness
 * and prevent text clipping on varying device densities.
 */
export const clampFontSize = (size: number, minScale: number = 0.85, maxScale: number = 1.15): number => {
  const scaled = moderateScale(size);
  const min = Math.round(size * minScale);
  const max = Math.round(size * maxScale);
  return Math.max(min, Math.min(scaled, max));
};

/**
 * Standard horizontal screen padding based on device width
 */
export const HORIZONTAL_PADDING = isSmallDevice ? 16 : 20;
