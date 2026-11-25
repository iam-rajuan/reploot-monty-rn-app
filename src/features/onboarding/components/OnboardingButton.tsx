import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight } from "lucide-react-native";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/shared/components/typography";

export interface OnboardingButtonProps {
  isFinalSlide?: boolean;
  onPress: () => void;
  text?: string;
  disabled?: boolean;
  subtext?: string;
  compact?: boolean;
}

export function OnboardingButton({
  isFinalSlide = false,
  onPress,
  text,
  disabled = false,
  subtext,
  compact = false,
}: OnboardingButtonProps) {
  const displayText = text ?? (isFinalSlide ? "GET STARTED" : "NEXT");

  const handlePress = () => {
    if (disabled) return;
    requestAnimationFrame(() => {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // ignore
      }
    });
    onPress();
  };

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        accessibilityRole="button"
        disabled={disabled}
        activeOpacity={0.8}
        onPress={handlePress}
        style={[
          styles.buttonWrapper,
          compact && styles.buttonWrapperCompact,
          disabled && styles.buttonDisabled,
        ]}
      >
        <LinearGradient
          colors={
            disabled
              ? ["rgba(53, 104, 160, 0.4)", "rgba(105, 166, 227, 0.4)"]
              : isFinalSlide
                ? ["#0284C7", "#0EA5E9", "#38BDF8"]
                : ["#3568A0", "#4B85C4", "#69A6E3"]
          }
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[
            styles.buttonGradient,
            compact && styles.buttonGradientCompact,
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              compact && styles.buttonTextCompact,
              disabled && styles.buttonTextDisabled,
            ]}
          >
            {displayText}
          </Text>
          <ArrowRight
            size={compact ? 17 : 19}
            color={disabled ? "rgba(255, 255, 255, 0.4)" : "#FFFFFF"}
            strokeWidth={2.4}
            style={styles.arrowIcon}
          />
        </LinearGradient>
      </TouchableOpacity>

      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    position: "relative",
    marginTop: 4,
    marginBottom: 4,
  },
  buttonWrapper: {
    width: "100%",
    height: 60,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 2,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonWrapperCompact: {
    height: 52,
    borderRadius: 16,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  buttonGradient: {
    width: "100%",
    height: 60,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  buttonGradientCompact: {
    height: 52,
    borderRadius: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  buttonTextDisabled: {
    color: "rgba(255, 255, 255, 0.5)",
  },
  buttonTextCompact: {
    fontSize: 14,
    letterSpacing: 1.2,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  subtext: {
    color: "#64748B",
    fontSize: 10,
    letterSpacing: 1.2,
    textAlign: "center",
    marginTop: 8,
  },
});
