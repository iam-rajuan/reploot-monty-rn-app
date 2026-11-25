import React, { useEffect } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { CoachEmoji } from "./CoachEmoji";

/**
 * "The coach is typing" row: the 🐒 coach (see CoachEmoji) swings gently in its
 * avatar frame while three dots ripple in the reply bubble.
 *
 * Callers pass their existing avatar-frame and bubble styles so the row lines
 * up exactly with real assistant messages. Motion is skipped when the OS
 * "Reduce Motion" setting is on; the row still reads as "typing".
 */

const DOT_COUNT = 3;
const DOT_STAGGER_MS = 160;
const DOT_RISE_MS = 340;
const DOT_REST_MS = 300;
const SWING_MS = 560;
const SWING_DEG = 9;

interface CoachTypingIndicatorProps {
  avatarStyle: StyleProp<ViewStyle>;
  bubbleStyle: StyleProp<ViewStyle>;
  rowStyle?: StyleProp<ViewStyle>;
  dotColor?: string;
}

const TypingDot = ({
  progress,
  color,
}: {
  progress: SharedValue<number>;
  color: string;
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + progress.value * 0.65,
    transform: [{ translateY: -3 * progress.value }],
  }));
  return <Animated.View style={[styles.dot, { backgroundColor: color }, animatedStyle]} />;
};

export const CoachTypingIndicator = ({
  avatarStyle,
  bubbleStyle,
  rowStyle,
  dotColor = "#35E5D0",
}: CoachTypingIndicatorProps) => {
  const reduceMotion = useReducedMotion();
  const swing = useSharedValue(0);
  const dot0 = useSharedValue(0.5);
  const dot1 = useSharedValue(0.5);
  const dot2 = useSharedValue(0.5);
  const dots = [dot0, dot1, dot2];

  useEffect(() => {
    if (reduceMotion) return;
    const ease = Easing.inOut(Easing.sin);

    // Pendulum swing: -1 ↔ 1, mapped to ±SWING_DEG below.
    swing.value = withSequence(
      withTiming(-1, { duration: SWING_MS / 2, easing: ease }),
      withRepeat(
        withSequence(
          withTiming(1, { duration: SWING_MS, easing: ease }),
          withTiming(-1, { duration: SWING_MS, easing: ease }),
        ),
        -1,
      ),
    );

    // Each dot has the same cycle length, so the stagger stays constant.
    dots.forEach((dot, index) => {
      dot.value = 0;
      dot.value = withDelay(
        index * DOT_STAGGER_MS,
        withRepeat(
          withSequence(
            withTiming(1, { duration: DOT_RISE_MS, easing: ease }),
            withTiming(0, { duration: DOT_RISE_MS, easing: ease }),
            withTiming(0, { duration: DOT_REST_MS }),
          ),
          -1,
        ),
      );
    });

    return () => {
      cancelAnimation(swing);
      dots.forEach((dot) => cancelAnimation(dot));
    };
    // Shared values are stable for the component's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${swing.value * SWING_DEG}deg` },
      { translateY: -Math.abs(swing.value) * 1.2 },
    ],
  }));

  return (
    <View
      style={rowStyle}
      accessible
      accessibilityRole="text"
      accessibilityLabel="AI Coach is typing"
      accessibilityLiveRegion="polite"
    >
      <View style={avatarStyle}>
        <Animated.View style={[styles.mascot, mascotStyle]}>
          <CoachEmoji size="sm" />
        </Animated.View>
      </View>
      <View style={bubbleStyle}>
        {Array.from({ length: DOT_COUNT }, (_, index) => (
          <TypingDot key={index} progress={dots[index]} color={dotColor} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mascot: {
    // Pivot near the feet so the monkey sways like it is hopping in place.
    transformOrigin: "50% 80%",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
