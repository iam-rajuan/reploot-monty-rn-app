import React, { useId } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Stop } from "react-native-svg";

/**
 * The AI Coach mascot ("Classic Brown"): a natural, emoji-style monkey face
 * with warm brown fur, a peach heart-shaped face and glossy eyes.
 *
 * It is original vector artwork (not an emoji), so it looks identical on iOS,
 * Android and web and stays sharp at any size.
 *
 * - variant "idle":   the coach's identity (launcher, headers, avatars).
 * - variant "typing": eyes glance down and the tongue pokes out in
 *   concentration.
 *
 * Callers keep their own frame (background, border, radius); this component
 * only draws the mark inside a `size` × `size` box.
 */

export type CoachMascotVariant = "idle" | "typing";

export interface CoachMascotProps {
  /** Width and height of the mark in px. */
  size: number;
  variant?: CoachMascotVariant;
  style?: StyleProp<ViewStyle>;
}

const C = {
  furHi: "#B57A45",
  furMid: "#8A5A30",
  furLo: "#4E2E16",
  skinHi: "#F8DDBA",
  skinLo: "#DDAA78",
  innerEar: "#E3A47A",
  feature: "#3A2214",
  blush: "#F2A088",
  eyeHi: "#5B3A26",
  eyeLo: "#120A06",
  tongue: "#E86F7A",
} as const;

const EAR_R = 12.5;
const FACE_PATH =
  "M50 37 C45 30 27 29 26 45 C25.4 53 29 58 31 62 C32 75 41 83 50 83 C59 83 68 75 69 62 C71 58 74.6 53 74 45 C73 29 55 30 50 37Z";

export const CoachMascot = ({ size, variant = "idle", style }: CoachMascotProps) => {
  // Unique gradient ids per instance (SVG ids are document-global on web).
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const furId = `coach-fur-${id}`;
  const skinId = `coach-skin-${id}`;
  const eyeId = `coach-eye-${id}`;
  const fur = `url(#${furId})`;
  const eye = `url(#${eyeId})`;

  const typing = variant === "typing";
  const eyeY = typing ? 51 : 48;
  const eyeRy = typing ? 4.1 : 5.4;
  const glintY = typing ? eyeY - 1.2 : eyeY - 2;
  const earX = 33.5 - EAR_R * 0.25;
  const innerEarX = 33.5 - EAR_R * 0.35;

  return (
    <View
      style={[{ width: size, height: size }, style]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={furId} cx="38%" cy="30%" r="80%">
            <Stop offset="0" stopColor={C.furHi} />
            <Stop offset="0.55" stopColor={C.furMid} />
            <Stop offset="1" stopColor={C.furLo} />
          </RadialGradient>
          <RadialGradient id={skinId} cx="45%" cy="32%" r="75%">
            <Stop offset="0" stopColor={C.skinHi} />
            <Stop offset="1" stopColor={C.skinLo} />
          </RadialGradient>
          <RadialGradient id={eyeId} cx="40%" cy="35%" r="70%">
            <Stop offset="0" stopColor={C.eyeHi} />
            <Stop offset="1" stopColor={C.eyeLo} />
          </RadialGradient>
        </Defs>

        <G>
          {/* Ears */}
          <Circle cx={50 - earX} cy={51} r={EAR_R} fill={fur} />
          <Circle cx={50 + earX} cy={51} r={EAR_R} fill={fur} />
          <Circle cx={50 - innerEarX} cy={52} r={EAR_R * 0.58} fill={C.innerEar} />
          <Circle cx={50 + innerEarX} cy={52} r={EAR_R * 0.58} fill={C.innerEar} />

          {/* Head and hair tuft */}
          <Ellipse cx={50} cy={50} rx={33} ry={32} fill={fur} />
          <Path d="M42.5 21.5 C43 13.5 49 11.5 51 17.5 C53 11.5 60 12.5 58.5 21.5Z" fill={fur} />

          {/* Heart-shaped face and cheeks */}
          <Path d={FACE_PATH} fill={`url(#${skinId})`} />
          <Ellipse cx={31.5} cy={60} rx={5} ry={3} fill={C.blush} opacity={0.45} />
          <Ellipse cx={68.5} cy={60} rx={5} ry={3} fill={C.blush} opacity={0.45} />

          {/* Eyes with glints */}
          <Ellipse cx={40} cy={eyeY} rx={4.6} ry={eyeRy} fill={eye} />
          <Ellipse cx={60} cy={eyeY} rx={4.6} ry={eyeRy} fill={eye} />
          <Circle cx={41.7} cy={glintY} r={1.6} fill="#FFFFFF" />
          <Circle cx={61.7} cy={glintY} r={1.6} fill="#FFFFFF" />
          <Circle cx={38.6} cy={eyeY + 2} r={0.7} fill="#FFFFFF" opacity={0.6} />
          <Circle cx={58.6} cy={eyeY + 2} r={0.7} fill="#FFFFFF" opacity={0.6} />

          {/* Nose */}
          <Path
            d="M46.5 56.5 Q50 54.6 53.5 56.5"
            stroke={C.skinLo}
            strokeWidth={1.6}
            strokeLinecap="round"
            fill="none"
          />
          <Ellipse cx={46.6} cy={62} rx={1.7} ry={1.25} fill={C.feature} opacity={0.7} />
          <Ellipse cx={53.4} cy={62} rx={1.7} ry={1.25} fill={C.feature} opacity={0.7} />

          {/* Mouth */}
          {typing ? (
            <>
              <Path
                d="M43.5 71 Q50 74.5 56.5 71"
                stroke={C.feature}
                strokeWidth={2.2}
                strokeLinecap="round"
                fill="none"
              />
              <Ellipse cx={55} cy={73.2} rx={2.7} ry={2.1} fill={C.tongue} />
            </>
          ) : (
            <Path
              d="M39.5 69 Q50 77.5 60.5 69"
              stroke={C.feature}
              strokeWidth={2.4}
              strokeLinecap="round"
              fill="none"
            />
          )}
        </G>
      </Svg>
    </View>
  );
};
