import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ChevronRight, FileText, Info, Shield } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";

const ACCENT = "#38BDF8";
const ACCENT_SOFT = "#7DD3FC";

const LINKS = [
  {
    key: "privacy",
    title: "Privacy policy",
    subtitle: "How we handle your data",
    Icon: Shield,
    route: "/profile/privacy-policy",
  },
  {
    key: "terms",
    title: "Terms of service",
    subtitle: "Your agreement with REPLOOT",
    Icon: FileText,
    route: "/profile/terms",
  },
  {
    key: "about",
    title: "About REPLOOT",
    subtitle: "Team, version and release notes",
    Icon: Info,
    route: "/profile/about",
  },
] as const;

export function LinksCard() {
  const router = useRouter();

  const handlePress = (route: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push(route as any);
  };

  return (
    <View style={styles.card}>
      {LINKS.map(({ key, title, subtitle, Icon, route }, i) => (
        <TouchableOpacity
          key={key}
          style={[styles.row, i > 0 && styles.rowDivider]}
          activeOpacity={0.7}
          onPress={() => handlePress(route)}
          accessibilityRole="button"
          accessibilityLabel={title}
        >
          <View style={styles.iconChip}>
            <Icon size={16} color={ACCENT} strokeWidth={2.2} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
          <ChevronRight size={16} color={ACCENT_SOFT} strokeWidth={2.4} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111A25",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    paddingHorizontal: 14,
    marginBottom: 22,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.10)",
  },
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  title: {
    ...typography.cardTitle,
    fontSize: 14,
    lineHeight: 18,
    color: "#F8FAFC",
  },
  subtitle: {
    ...typography.caption,
    color: "#7C8BA1",
  },
});

export default LinksCard;
