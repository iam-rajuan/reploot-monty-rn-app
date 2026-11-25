import { PlanCard } from "@/features/profile/components/PlanCard";
import { QRCodeCard } from "@/features/profile/components/QRCodeCard";
import { TopProfileCard } from "@/features/profile/components/TopProfileCard";
import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import { useAppDispatch } from "@/store/hooks";
import { signOut } from "@/store/slices/authSlice";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronRight, LogOut } from "lucide-react-native";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Text } from "@/shared/components/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Line as SvgLine } from "react-native-svg";
import { typography } from "@/theme/typography";

export default function ProfileTabRoute() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width <= 430;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleNavigate = (
    path: "/profile/payment-history" | "/profile/account-settings",
  ) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push(path);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    try {
      await dispatch(signOut()).unwrap();
      setIsLoggingOut(false);
      router.replace("/(auth)/sign-in");
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <CustomHeader
        titleVariant="logo"
        showBackButton={false}
        showSearch={true}
        showNotifications={true}
        showAvatar={true}
        transparent={true}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isCompact && styles.scrollContentCompact,
          { paddingBottom: Math.max(insets.bottom + 110, 130) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section with Masked Gradient Title & Description */}
        <View
          style={[styles.titleSection, isCompact && styles.titleSectionCompact]}
        >
          <View style={styles.maskedTitleWrapper}>
            <View style={styles.maskedTitleView}>
              <View style={styles.maskWrapper}>
                <Text
                  style={[
                    styles.mainTitle,
                    isCompact && styles.mainTitleCompact,
                  , { color: "#F6F8FF" }]}
                  numberOfLines={1}
                >
                  MY PROFILE
                </Text>
              </View>
            </View>
          </View>
        </View>
        <TopProfileCard />
        <QRCodeCard />
        <PlanCard />

        {/* Account Protocols Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ACCOUNT PROTOCOLS</Text>
          <View style={styles.sectionLine} />
        </View>

        {/* List Buttons */}
        <TouchableOpacity
          style={styles.listItem}
          activeOpacity={0.75}
          onPress={() => handleNavigate("/profile/payment-history")}
        >
          <View style={styles.iconContainer}>
            <Image
              source={require("../../assets/paymentHistory.png")}
              style={styles.itemIcon}
              contentFit="contain"
            />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.listItemText}>PAYMENT HISTORY</Text>
          </View>
          <View style={styles.chevronWrapper}>
            <ChevronRight size={18} color="#38BDF8" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.listItem}
          activeOpacity={0.75}
          onPress={() => handleNavigate("/profile/account-settings")}
        >
          <View style={styles.iconContainer}>
            <Image
              source={require("../../assets/accountSetting.png")}
              style={styles.itemIcon}
              contentFit="contain"
            />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.listItemText}>ACCOUNT SETTINGS</Text>
          </View>
          <View style={styles.chevronWrapper}>
            <ChevronRight size={18} color="#38BDF8" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutButton, isLoggingOut && styles.logoutDisabled]}
          activeOpacity={0.75}
          onPress={handleLogout}
          disabled={isLoggingOut}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <View style={styles.logoutIconContainer}>
            <LogOut size={18} color="#FB7185" strokeWidth={2.2} />
          </View>
          <Text style={styles.logoutText}>
            {isLoggingOut ? "LOGGING OUT..." : "LOG OUT"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#090A10",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  scrollContentCompact: {
    paddingHorizontal: 14,
  },
  titleSection: {
    marginTop: 4,
    marginBottom: 20,
  },
  titleSectionCompact: {
    marginBottom: 14,
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
  // Compact layouts keep the standard page-title role for consistency.
  mainTitleCompact: {},
  subtitle: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginRight: 14,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.18)",
    minHeight: 60,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  listItemPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
    borderColor: "rgba(56, 189, 248, 0.35)",
    backgroundColor: "rgba(56, 189, 248, 0.05)",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemIcon: {
    width: 22,
    height: 22,
  },
  itemContent: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },
  listItemText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  chevronWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButton: {
    minHeight: 52,
    marginTop: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(251, 113, 133, 0.28)",
    backgroundColor: "rgba(251, 113, 133, 0.07)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 14,
  },
  logoutIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "rgba(251, 113, 133, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#FB7185",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  logoutDisabled: {
    opacity: 0.6,
  },
});
