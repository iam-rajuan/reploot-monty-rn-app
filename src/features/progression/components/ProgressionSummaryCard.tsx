import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { useProgressionSnapshot } from "../progressionStore";
import { CurrentLevelDisplay } from "./CurrentLevelDisplay";
import { CurrentTierDisplay } from "./CurrentTierDisplay";
import { XPProgressBar } from "./XPProgressBar";

export function ProgressionSummaryCard({ onPress, compact = false }: { onPress?: () => void; compact?: boolean }) {
  const progression = useProgressionSnapshot();
  return <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.card, compact && styles.compactCard, pressed && styles.pressed]}>
    <View style={styles.header}><Text style={styles.title}>FITNESS PROGRESSION</Text>{onPress && <ChevronRight size={18} color="#38BDF8" />}</View>
    <View style={styles.metrics}><CurrentLevelDisplay level={progression.currentLevel} compact /><View style={styles.divider} /><CurrentTierDisplay name={progression.tier.displayName} color={progression.tier.color} compact /></View>
    <XPProgressBar currentXp={progression.levelXp} thresholdXp={progression.levelThreshold} lifetimeXp={progression.lifetimeXp} compact={compact} />
    <Text style={styles.remaining}>{progression.isMaxProgression ? "MAXIMUM CONFIGURED PROGRESSION" : `${progression.xpRemainingInLevel.toLocaleString()} XP TO NEXT LEVEL`}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { width: "100%", borderRadius: 22, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: "rgba(56,189,248,0.2)", backgroundColor: "rgba(15,23,42,0.68)" }, compactCard: { padding: 16 }, pressed: { opacity: 0.78 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }, title: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", letterSpacing: 1 }, metrics: { flexDirection: "row", alignItems: "center", marginBottom: 17 }, divider: { width: 1, height: 34, backgroundColor: "rgba(255,255,255,0.08)", marginHorizontal: 10 }, remaining: { color: "#38EDD8", fontSize: 9, fontWeight: "700", letterSpacing: 0.8, textAlign: "right", marginTop: 7 },
});
