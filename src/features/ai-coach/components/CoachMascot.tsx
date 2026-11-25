import React, { useId } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from "react-native-svg";

/**
 * The AI Coach mascot: a custom geometric monkey mark in Reploot's palette.
 *
 * It is vector artwork (not an emoji), so it looks identical on iOS, Android
 * and web and stays sharp at any size.
 *
 * - variant "idle":   the coach's identity (avatars, headers, launcher).
 * - variant "typing": eyes glance down at the keyboard; pair it with motion
 *   (see CoachTypingIndicator) while the coach is writing a reply.
 * - tone "brand": gradient head for dark surfaces (default).
 * - tone "light": white head for use on top of a gradient (launcher orb).
 *
 * Callers keep their own frame (background, border, radius); this component
 * only draws the mark inside a `size` × `size` box.
 */

export type CoachMascotVariant = "idle" | "typing";
export type CoachMascotTone = "brand" | "light";

export interface CoachMascotProps {
  /** Width and height of the mark in px. */
  size: number;
  variant?: CoachMascotVariant;
  tone?: CoachMascotTone;
  style?: StyleProp<ViewStyle>;
}

const PALETTE = {
  brand: {
    headFrom: "#38BDF8",
    headTo: "#6D5BF7",
    face: "#E6F7FF",
    innerEar: "#BDEBFF",
    feature: "#0B1220",
  },
  light: {
    headFrom: "#FFFFFF",
    headTo: "#E0E7FF",
    face: "#CFFAFE",
    innerEar: "#A5F3FC",
    feature: "#1E1B4B",
  },
} as const;

export const CoachMascot = ({
  size,
  variant = "idle",
  tone = "brand",
  style,
}: CoachMascotProps) => {
  // Unique gradient id per instance (SVG ids are document-global on web).
  const gradientId = `coach-head-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const c = PALETTE[tone];
  const head = `url(#${gradientId})`;
  // Pupils drop slightly while typing, as if looking at the keyboard.
  const pupilY = variant === "typing" ? 31.6 : 30.2;

  return (
    <View
      style={[{ width: size, height: size }, style]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={c.headFrom} />
            <Stop offset="1" stopColor={c.headTo} />
          </LinearGradient>
        </Defs>

        {/* Ears */}
        <Circle cx={10.5} cy={32} r={8.5} fill={head} />
        <Circle cx={53.5} cy={32} r={8.5} fill={head} />
        <Circle cx={10.5} cy={32} r={4.6} fill={c.innerEar} />
        <Circle cx={53.5} cy={32} r={4.6} fill={c.innerEar} />

        {/* Head with a small hair tuft */}
        <Circle cx={32} cy={33} r={21} fill={head} />
        <Path d="M27 14.5 C28.5 9.5 33 8.8 34.5 12.5 C36 10.2 39.4 11 39 14.8 Z" fill={head} />

        {/* Face mask: two eye lobes and a muzzle */}
        <Circle cx={25} cy={30.5} r={8.6} fill={c.face} />
        <Circle cx={39} cy={30.5} r={8.6} fill={c.face} />
        <Ellipse cx={32} cy={42} rx={13.5} ry={9.8} fill={c.face} />

        {/* Eyes */}
        <Circle cx={25.6} cy={pupilY} r={2.9} fill={c.feature} />
        <Circle cx={38.4} cy={pupilY} r={2.9} fill={c.feature} />
        <Circle cx={26.6} cy={pupilY - 1} r={0.95} fill="#FFFFFF" />
        <Circle cx={39.4} cy={pupilY - 1} r={0.95} fill="#FFFFFF" />

        {/* Nostrils and smile */}
        <Ellipse cx={29.8} cy={39} rx={1.2} ry={0.9} fill={c.feature} opacity={0.7} />
        <Ellipse cx={34.2} cy={39} rx={1.2} ry={0.9} fill={c.feature} opacity={0.7} />
        <Path
          d="M26.5 44 Q32 48.6 37.5 44"
          stroke={c.feature}
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
};
