import { CurrentLevelDisplay, CurrentTierDisplay, MOCK_PROGRESSION_RULES, useProgressionSnapshot, useProgressionStore, XPProgressBar } from "@/features/progression";
import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Award, FlaskConical, Zap } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { typography } from "@/theme/typography";

export default function LevelUpRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const progression = useProgressionSnapshot();
  const earnXp = useProgressionStore((state) => state.earnXp);

  return <View style={styles.screen}>
    <StatusBar style="light" />
    <CustomHeader title="" titleVariant="text" showBackButton onPressBack={() => router.back()} transparent />
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
      <View style={styles.kickerRow}><Award size={15} color="#38EDD8" /><Text style={styles.kicker}>FITNESS PROGRESSION</Text></View>
      <Text style={styles.title}>LEVEL UP</Text>

      <LinearGradient colors={["rgba(56,237,216,0.14)", "rgba(79,172,254,0.08)", "rgba(15,23,42,0.9)"]} style={styles.heroCard}>
        <View style={styles.metrics}><CurrentLevelDisplay level={progression.currentLevel} /><CurrentTierDisplay name={progression.tier.displayName} color={progression.tier.color} /></View>
        <XPProgressBar currentXp={progression.levelXp} thresholdXp={progression.levelThreshold} lifetimeXp={progression.lifetimeXp} />
        <View style={styles.detailRow}><Text style={styles.detailLabel}>NEXT LEVEL</Text><Text style={styles.detailValue}>{progression.xpRemainingInLevel.toLocaleString()} XP REMAINING</Text></View>
      </LinearGradient>

      <View style={styles.rulesCard}><View style={styles.rulesHeader}><FlaskConical size={17} color="#A7F3E8" /><Text style={styles.rulesTitle}>MOCK CONFIGURATION</Text></View><Text style={styles.rulesBody}>XP thresholds and tier names are development values and can be replaced when product rules are approved.</Text><Text style={styles.rulesVersion}>{MOCK_PROGRESSION_RULES.version.toUpperCase()}</Text></View>

      {__DEV__ && <Pressable style={styles.devButton} onPress={() => earnXp(750)}><Zap size={16} color="#071018" fill="#071018" /><Text style={styles.devButtonText}>ADD 750 MOCK XP</Text></Pressable>}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#090A10" }, content: { paddingHorizontal: 20, paddingTop: 8 }, kickerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 }, kicker: { color: "#38EDD8", fontSize: 10, fontWeight: "700", letterSpacing: 1.2, marginLeft: 7 },
  title: { ...typography.pageTitle, color: "#FFFFFF" }, subtitle: { color: "#94A3B8", fontSize: 12, lineHeight: 19, marginTop: 7, marginBottom: 24 },
  heroCard: { borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "rgba(56,237,216,0.22)", marginBottom: 18 }, metrics: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 }, detailRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 17, paddingTop: 15, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" },
  detailLabel: { color: "#64748B", fontSize: 9, fontWeight: "700", letterSpacing: 0.8 }, detailValue: { color: "#38EDD8", fontSize: 9, fontWeight: "700" },
  rulesCard: { borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(15,23,42,0.65)", marginBottom: 18 }, rulesHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 }, rulesTitle: { color: "#A7F3E8", fontSize: 11, fontWeight: "700", letterSpacing: 1, marginLeft: 8 }, rulesBody: { color: "#94A3B8", fontSize: 11, lineHeight: 18 }, rulesVersion: { color: "#64748B", fontSize: 9, fontWeight: "700", marginTop: 10 },
  devButton: { height: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#38EDD8", gap: 8 }, devButtonText: { color: "#071018", fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
});
