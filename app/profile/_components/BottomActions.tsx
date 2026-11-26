import { useAppDispatch } from "@/store/hooks";
import { signOut } from "@/store/slices/authSlice";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { LogOut, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";

export function BottomActions() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const doLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await dispatch(signOut()).unwrap();
      router.replace("/(auth)/sign-in");
    } catch {
      setIsLoggingOut(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    if (Platform.OS === "web") {
      doLogout();
      return;
    }
    Alert.alert("Log out?", "You can sign back in any time.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: doLogout },
    ]);
  };

  const handleDeleteAccount = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
    Alert.alert(
      "Delete account?",
      "This permanently deletes your workouts, streaks and progress. It can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete permanently", style: "destructive", onPress: () => {} },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.logoutBtn, isLoggingOut && styles.disabled]}
        activeOpacity={0.75}
        onPress={handleLogout}
        disabled={isLoggingOut}
        accessibilityRole="button"
        accessibilityLabel="Log out"
      >
        <LogOut size={16} color="#FB7185" strokeWidth={2.4} />
        <Text style={styles.logoutText}>{isLoggingOut ? "LOGGING OUT..." : "LOG OUT"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteBtn}
        activeOpacity={0.7}
        onPress={handleDeleteAccount}
        accessibilityRole="button"
        accessibilityLabel="Delete account"
      >
        <Trash2 size={14} color="#94A3B8" strokeWidth={2.2} />
        <Text style={styles.deleteText}>Delete account</Text>
      </TouchableOpacity>

      <Text style={styles.footerVersion}>REPLOOT · v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    alignItems: "stretch",
  },
  logoutBtn: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(251,113,133,0.28)",
    backgroundColor: "rgba(251,113,133,0.07)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    ...typography.buttonSmall,
    letterSpacing: 1,
    color: "#FB7185",
  },
  disabled: {
    opacity: 0.6,
  },
  deleteBtn: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  deleteText: {
    ...typography.subtitle,
    fontSize: 13,
    lineHeight: 18,
    color: "#94A3B8",
    textDecorationLine: "underline",
  },
  footerVersion: {
    ...typography.caption,
    color: "#475569",
    textAlign: "center",
    marginTop: 6,
  },
});

export default BottomActions;
