import { Image } from "expo-image";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { Text } from "@/shared/components/typography";

/**
 * The AI Coach's in-chat identity: the 🐒 monkey.
 *
 * - iPhone: the system 🐒 emoji, which iOS draws as Apple's monkey (the one
 *   people know from WhatsApp).
 * - Android and web: Apple's artwork can't be bundled and Google's 🐒 looks
 *   quite different, so we show a bundled 3D monkey that is close to Apple's
 *   style (Microsoft Fluent Emoji, MIT license; see
 *   assets/coach/LICENSE-fluent-emoji.txt).
 */

const MONKEY = require("../../../../assets/coach/monkey-3d.png");

const SIZES = {
  sm: { box: 22, fontSize: 18, lineHeight: 22 },
  md: { box: 26, fontSize: 22, lineHeight: 26 },
  lg: { box: 36, fontSize: 32, lineHeight: 38 },
} as const;

export type CoachEmojiSize = keyof typeof SIZES;

export const CoachEmoji = ({ size = "sm" }: { size?: CoachEmojiSize }) => {
  const s = SIZES[size];

  if (Platform.OS === "ios") {
    return (
      <Text
        style={[styles.emoji, { fontSize: s.fontSize, lineHeight: s.lineHeight }]}
        allowFontScaling={false}
        accessible={false}
        importantForAccessibility="no"
      >
        🐒
      </Text>
    );
  }

  return (
    <Image
      source={MONKEY}
      style={{ width: s.box, height: s.box }}
      contentFit="contain"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
};

const styles = StyleSheet.create({
  emoji: {
    textAlign: "center",
  },
});
