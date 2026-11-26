import { PlanCard } from "@/features/profile/components/PlanCard";
import { QRCodeCard } from "@/features/profile/components/QRCodeCard";
import { TopProfileCard } from "@/features/profile/components/TopProfileCard";
import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import { useAppDispatch } from "@/store/hooks";
import { signOut } from "@/store/slices/authSlice";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronRight, LogOut, Receipt, Settings } from "lucide-react-native";
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
import { typography } from "@/theme/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

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
      <ScreenBackground />
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
          { paddingBottom: Math.max(insets.bottom + 110, 130) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.categoryBadge}>ACCOUNT</Text>
          <Text style={styles.mainTitle} numberOfLines={1} adjustsFontSizeToFit>
            MY PROFILE
          </Text>
        </View>
        <TopProfileCard />
        <QRCodeCard />
        <PlanCard />

        <Text style={styles.sectionTitle}>SETTINGS</Text>
        <View style={styles.listCard}>
          {[
            {
              key: "payments",
              label: "Payment history",
              hint: "Invoices and receipts",
              Icon: Receipt,
              path: "/profile/payment-history" as const,
            },
            {
              key: "settings",
              label: "Account settings",
              hint: "Email, password, privacy",
              Icon: Settings,
              path: "/profile/account-settings" as const,
            },
          ].map(({ key, label, hint, Icon, path }, i) => (
            <TouchableOpacity
              key={key}
              style={[styles.listItem, i > 0 && styles.listItemDivider]}
              activeOpacity={0.7}
              onPress={() => handleNavigate(path)}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <View style={styles.iconContainer}>
                <Icon size={16} color="#38BDF8" strokeWidth={2.2} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.listItemText}>{label}</Text>
                <Text style={styles.listItemHint}>{hint}</Text>
              </View>
              <ChevronRight size={16} color="#7DD3FC" strokeWidth={2.4} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, isLoggingOut && styles.logoutDisabled]}
          activeOpacity={0.75}
          onPress={handleLogout}
          disabled={isLoggingOut}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <LogOut size={16} color="#FB7185" strokeWidth={2.4} />
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
    backgroundColor: "#060810",
  },
  scrollView: {
    flex: 1,
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
  listCard: {
    backgroundColor: "#111A25",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  listItemDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.10)",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  listItemText: {
    ...typography.cardTitle,
    fontSize: 14,
    lineHeight: 18,
    color: "#F8FAFC",
  },
  listItemHint: {
    ...typography.caption,
    color: "#7C8BA1",
  },
  logoutButton: {
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
  logoutDisabled: {
    opacity: 0.6,
  },
});
