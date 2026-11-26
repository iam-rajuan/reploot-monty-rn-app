import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomActions } from "./_components/BottomActions";
import { CredentialsCard } from "./_components/CredentialsCard";
import { LinksCard } from "./_components/LinksCard";
import { typography } from "@/theme/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

export default function AccountSettingsRoute() {
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

  const handlePasswordUpdated = () => {
    setToastMessage("Password updated");
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  return (
    <View style={styles.container}>
      <ScreenBackground />
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
        bottomOffset={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 40, 60) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.categoryBadge}>PROFILE</Text>
          <Text style={styles.mainTitle} numberOfLines={1} adjustsFontSizeToFit>
            ACCOUNT SETTINGS
          </Text>
        </View>

        <Text style={styles.sectionTitle}>SIGN-IN</Text>
        <CredentialsCard onPasswordUpdated={handlePasswordUpdated} />

        <Text style={styles.sectionTitle}>LEGAL & INFO</Text>
        <LinksCard />

        <BottomActions />
      </KeyboardAwareScrollView>

      {toastMessage ? (
        <View style={[styles.toast, { bottom: Math.max(insets.bottom + 16, 28) }]}>
          <View style={styles.toastIcon}>
            <Check size={12} color="#FFFFFF" strokeWidth={3.2} />
          </View>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060810",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  titleSection: {
    marginTop: 4,
    marginBottom: 18,
    gap: 4,
  },
  categoryBadge: {
    ...typography.overline,
    fontSize: 11,
    lineHeight: 16,
    color: "#7DD3FC",
  },
  mainTitle: {
    ...typography.pageTitle,
    color: "#F6F8FF",
  },
  sectionTitle: {
    ...typography.overline,
    color: "#7C8BA1",
    marginBottom: 10,
    marginLeft: 4,
  },
  toast: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    zIndex: 50,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  toastIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0EA5E9",
  },
  toastText: {
    ...typography.subtitle,
    fontSize: 13,
    lineHeight: 18,
    color: "#E2E8F0",
  },
});
