import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Check } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";

const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;

interface EditProfileActionsProps {
  onSave?: () => void;
  onCancel?: () => void;
}

/** Save is the one primary action; account deletion lives in Account settings. */
export const EditProfileActions = ({ onSave, onCancel }: EditProfileActionsProps) => {
  const handleSave = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    onSave?.();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.primaryBtn}
        activeOpacity={0.85}
        onPress={handleSave}
        accessibilityRole="button"
        accessibilityLabel="Save changes"
      >
        <LinearGradient
          colors={BUTTON_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={SHEEN}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.primarySheen}
          pointerEvents="none"
        />
        <View>
          <Check size={16} color="#FFFFFF" strokeWidth={2.8} />
        </View>
        <Text style={styles.primaryBtnText}>SAVE CHANGES</Text>
      </TouchableOpacity>

      {onCancel ? (
        <TouchableOpacity
          style={styles.ghostBtn}
          activeOpacity={0.7}
          onPress={onCancel}
          accessibilityRole="button"
        >
          <Text style={styles.ghostBtnText}>CANCEL</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
    marginBottom: 20,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#38BDF8",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
      },
      web: { boxShadow: "0 8px 22px rgba(56,189,248,0.28)" } as any,
      default: {},
    }),
  },
  primarySheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  primaryBtnText: {
    ...typography.button,
    letterSpacing: 1,
    color: "#FFFFFF",
  },
  ghostBtn: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostBtnText: {
    ...typography.buttonSmall,
    letterSpacing: 1,
    color: "#94A3B8",
  },
});
