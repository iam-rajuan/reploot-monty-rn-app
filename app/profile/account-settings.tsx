import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Line as SvgLine } from "react-native-svg";
import { BottomActions } from "./_components/BottomActions";
import { CredentialsCard } from "./_components/CredentialsCard";
import { LinksCard } from "./_components/LinksCard";
import { typography } from "@/theme/typography";

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
    setToastMessage("SECURITY CREDENTIALS UPDATED");
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
        bottomOffset={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 40, 60) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section with Masked Gradient Title & Description */}
        <View style={styles.titleSection}>
          <View style={styles.maskedTitleWrapper}>
            <View style={styles.maskedTitleView}>
              <View style={styles.maskWrapper}>
                <Text
                  style={[styles.mainTitle, { color: "#F6F8FF" }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  ACCOUNT SETTINGS
                </Text>
              </View>
            </View>
          </View>
        </View>

        <CredentialsCard onPasswordUpdated={handlePasswordUpdated} />
        <LinksCard />
        <BottomActions />
      </KeyboardAwareScrollView>

      {/* Floating Cyber HUD Toast */}
      {toastMessage && (
        <View style={styles.savedToast}>
          <Check size={16} color="#00f2fe" style={{ marginRight: 8 }} />
          <Text style={styles.savedToastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090A10",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  titleSection: {
    marginTop: 4,
    marginBottom: 20,
  },
  maskedTitleWrapper: {
    height: 48,
    width: "100%",
  },
  maskedTitleView: {
    flex: 1,
    width: "100%",
  },
  maskWrapper: {
    backgroundColor: "transparent",
    flex: 1,
    justifyContent: "center",
  },
  gradient: {
    flex: 1,
  },
  mainTitle: {
    ...typography.pageTitle,
    color: "#FFFFFF",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  savedToast: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(7, 10, 17, 0.95)",
    borderWidth: 1.5,
    borderColor: "#00f2fe",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    zIndex: 9999,
    elevation: 12,
    shadowColor: "#00f2fe",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  savedToastText: {
    color: "#00f2fe",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
});
