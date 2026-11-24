import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface EditProfileActionsProps {
  onSave?: () => void;
  onDelete?: () => void;
}

export const EditProfileActions = ({
  onSave,
  onDelete,
}: EditProfileActionsProps) => {
  const handleSave = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    if (onSave) {
      onSave();
    }
  };

  const handleDelete = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={styles.saveBtn}
        activeOpacity={0.8}
        onPress={handleSave}
      >
        <LinearGradient
          colors={["#08A8DB", "#25D7E8"]}
          style={styles.saveBtnGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        >
          <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteBtn}
        activeOpacity={0.8}
        onPress={handleDelete}
      >
        <Text style={styles.deleteBtnText}>DELETE ACCOUNT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    marginTop: 2,
    marginBottom: 20,
  },
  saveBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  saveBtnGradient: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 1.2,
  },
  deleteBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.35)",
    backgroundColor: "rgba(239, 68, 68, 0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtnText: {
    color: "#F87171",
    fontSize: 13,
    fontWeight: "800",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 1.2,
  },
});
