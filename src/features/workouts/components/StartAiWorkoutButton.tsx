import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles } from "lucide-react-native";
import React from "react";
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface StartAiWorkoutButtonProps {
  onPress?: () => void;
  title?: string;
  disabled?: boolean;
  inline?: boolean;
  dragActive?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const StartAiWorkoutButton: React.FC<StartAiWorkoutButtonProps> = ({
  onPress,
  title = "START AI WORKOUT",
  disabled = false,
  inline = false,
  dragActive = false,
  style,
  testID,
}) => {
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    onPress?.();
  };

  if (inline) {
    return (
      <View style={[styles.inlineWrapper, style]} testID={testID}>
        <Pressable
          onPress={handlePress}
          disabled={disabled}
          style={[styles.ctaWrapper, disabled && styles.ctaDisabled]}
          accessibilityRole="button"
          accessibilityLabel={title}
        >
          <LinearGradient
            colors={["#00f2fe", "#4facfe"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.ctaGradient}
          >
            <Sparkles size={18} color="#050811" fill="#050811" />
            <Text style={styles.ctaText}>{title}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.bottomBarContainer,
        { paddingBottom: Math.max(insets.bottom, 24) + 6 },
        style,
      ]}
      pointerEvents={dragActive ? "none" : "box-none"}
      testID={testID}
    >
      {/* Background Gradient Fade */}
      <LinearGradient
        colors={["transparent", "rgba(7, 10, 17, 0.85)", "#070A11"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Action Button */}
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={[styles.ctaWrapper, disabled && styles.ctaDisabled]}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <LinearGradient
          colors={["#00f2fe", "#4facfe"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.ctaGradient}
        >
          <Sparkles size={18} color="#050811" fill="#050811" />
          <Text style={styles.ctaText}>{title}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    zIndex: 50,
  },
  inlineWrapper: {
    width: "100%",
    marginTop: 6,
    marginBottom: 20,
  },
  ctaWrapper: {
    borderRadius: 26,
    overflow: "hidden",
    elevation: 8,
    height: 52,
    minHeight: 52,
    flexShrink: 0,
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaGradient: {
    height: 52,
    minHeight: 52,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaText: {
    color: "#050811",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.2,
    fontFamily: "JetBrainsMono_700Bold",
    textTransform: "uppercase",
  },
});
