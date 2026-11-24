import { EditProfileActions } from "@/features/profile/components/EditProfileActions";
import { EditProfileBanner } from "@/features/profile/components/EditProfileBanner";
import { EditProfileForm } from "@/features/profile/components/EditProfileForm";
import { EditProfileSecurityBox } from "@/features/profile/components/EditProfileSecurityBox";
import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditProfileRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  const handleSave = () => {
    setToastMessage("ATHLETE PROFILE SYNCHRONIZED");
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <CustomHeader
        titleVariant="text"
        title=""
        showBackButton={true}
        onPressBack={handleBack}
        showSearch={true}
        showNotifications={true}
        showAvatar={true}
        transparent={true}
      />

      <KeyboardAwareScrollView
        style={styles.keyboardView}
        bottomOffset={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 80, 100) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.titleSection}>
          <Text style={styles.eyebrow}>ATHLETE PROFILE</Text>
          <Text style={styles.mainTitle}>EDIT PROFILE</Text>
        </View>

        <EditProfileBanner />
        <EditProfileForm />
        <EditProfileSecurityBox />
        <EditProfileActions onSave={handleSave} />
      </KeyboardAwareScrollView>

      {toastMessage && (
        <View style={styles.savedToast}>
          <Check size={16} color="#25D7E8" style={{ marginRight: 8 }} />
          <Text style={styles.savedToastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070A11",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    flexGrow: 1,
  },
  titleSection: {
    marginTop: 2,
    marginBottom: 18,
  },
  eyebrow: {
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 1.4,
    marginBottom: 3,
  },
  mainTitle: {
    color: "#F6F8FF",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    letterSpacing: -0.6,
    textTransform: "uppercase",
  },
  savedToast: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#101A29",
    borderWidth: 1,
    borderColor: "rgba(37, 215, 232, 0.32)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    zIndex: 9999,
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  savedToastText: {
    color: "#8CECF4",
    fontSize: 12,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "900",
    letterSpacing: 0.6,
  },
});
