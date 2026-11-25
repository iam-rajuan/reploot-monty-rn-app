import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  ZoomIn,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { Text } from "@/shared/components/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";
import { typography } from "@/theme/typography";

const ACCENT = "#38BDF8";
const ACCENT_SOFT = "#7DD3FC";
const TOTAL_SECONDS = 3;

const RING_SIZE = 236;
const STROKE = 10;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Soft 1px-stepped halo behind the ring (same technique as the level badge).
const HALO_LAYERS = Array.from({ length: 10 }, (_, i) => i);

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface CountdownScreenProps {
  onCountdownComplete?: () => void;
  onCancel?: () => void;
}

export const CountdownScreen: React.FC<CountdownScreenProps> = ({
  onCountdownComplete,
  onCancel,
}) => {
  const insets = useSafeAreaInsets();
  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_SECONDS);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    // One continuous sweep of the ring across the whole countdown.
    progress.value = withTiming(1, {
      duration: TOTAL_SECONDS * 1000,
      easing: Easing.linear,
    });

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [progress]);

  // When countdown reaches 0, trigger onCountdownComplete safely outside of render/updater
  useEffect(() => {
    if (secondsLeft === 0) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => {},
        );
      }
      const timeout = setTimeout(() => {
        onCountdownComplete?.();
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [secondsLeft, onCountdownComplete]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const isGo = secondsLeft === 0;
  const step = TOTAL_SECONDS - secondsLeft; // 0,1,2,3

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <StatusBar style="light" />

      <CustomHeader transparent={true} showBackButton={false} />

      <View style={styles.centerContainer}>
        <View style={styles.tagPill}>
          <View style={styles.liveDot} />
          <Text style={styles.tagText}>INITIALIZING PROTOCOL</Text>
        </View>

        <View style={styles.ringWrap}>
          {HALO_LAYERS.map((i) => (
            <View
              key={i}
              pointerEvents="none"
              style={[
                styles.haloLayer,
                {
                  width: RING_SIZE + 8 + i * 6,
                  height: RING_SIZE + 8 + i * 6,
                  borderRadius: (RING_SIZE + 8 + i * 6) / 2,
                },
              ]}
            />
          ))}

          <View style={styles.ringInner} />

          <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
            <Defs>
              <SvgGradient id="countdownRing" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#7DD3FC" />
                <Stop offset="0.5" stopColor="#38BDF8" />
                <Stop offset="1" stopColor="#6366F1" />
              </SvgGradient>
            </Defs>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke="rgba(148,163,184,0.14)"
              strokeWidth={STROKE}
              fill="none"
            />
            <AnimatedCircle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke="url(#countdownRing)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              animatedProps={ringProps}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>

          <Animated.View
            key={secondsLeft}
            entering={Platform.OS === "web" ? undefined : ZoomIn.duration(260)}
            style={styles.numberBox}
          >
            <Text style={[styles.countdownNumber, isGo && styles.goText]}>
              {isGo ? "GO" : secondsLeft}
            </Text>
            <Text style={styles.numberCaption}>
              {isGo ? "LET'S MOVE" : "SECONDS"}
            </Text>
          </Animated.View>
        </View>

        <View style={styles.stepsRow}>
          {Array.from({ length: TOTAL_SECONDS }, (_, i) => (
            <View
              key={i}
              style={[styles.stepBar, i < Math.min(TOTAL_SECONDS, step + 1) && styles.stepBarActive]}
            />
          ))}
        </View>

        <Animated.View
          entering={Platform.OS === "web" ? undefined : FadeIn.delay(200)}
          style={styles.hintWrap}
        >
          <Text style={styles.hintText}>Get in position · full body in frame</Text>
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 32) }]}>
        <Text style={styles.footerText}>PREPARE FOR MAXIMUM INTENSITY</Text>
        {onCancel ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onCancel}
            style={styles.cancelBtn}
            accessibilityRole="button"
            accessibilityLabel="Cancel workout"
            hitSlop={8}
          >
            <X size={14} color="#94A3B8" strokeWidth={2.6} />
            <Text style={styles.cancelText}>CANCEL</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#060810",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
    marginBottom: 44,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
  tagText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  haloLayer: {
    position: "absolute",
    backgroundColor: "rgba(56,189,248,0.018)",
  },
  ringInner: {
    position: "absolute",
    width: RING_SIZE - STROKE * 2 - 14,
    height: RING_SIZE - STROKE * 2 - 14,
    borderRadius: (RING_SIZE - STROKE * 2 - 14) / 2,
    backgroundColor: "#0D1522",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.16)",
  },
  numberBox: {
    alignItems: "center",
  },
  countdownNumber: {
    ...typography.countdown,
    color: "#F8FAFC",
    textAlign: "center",
    textShadowColor: "rgba(56,189,248,0.7)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  goText: {
    color: ACCENT_SOFT,
  },
  numberCaption: {
    ...typography.overline,
    color: "#7C8BA1",
    marginTop: -4,
  },
  stepsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 44,
  },
  stepBar: {
    width: 32,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(148,163,184,0.18)",
  },
  stepBarActive: {
    backgroundColor: ACCENT,
  },
  hintWrap: {
    marginTop: 18,
  },
  hintText: {
    ...typography.bodySmall,
    color: "#94A3B8",
  },
  footer: {
    alignItems: "center",
    gap: 14,
  },
  footerText: {
    ...typography.overline,
    color: "#64748B",
  },
  cancelBtn: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
  },
  cancelText: {
    ...typography.buttonSmall,
    letterSpacing: 1,
    color: "#94A3B8",
  },
});
