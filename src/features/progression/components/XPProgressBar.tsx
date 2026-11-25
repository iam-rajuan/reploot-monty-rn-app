import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";

interface Props { currentXp: number; thresholdXp: number; lifetimeXp?: number; compact?: boolean; }

export function XPProgressBar({ currentXp, thresholdXp, lifetimeXp, compact = false }: Props) {
  const progress = thresholdXp > 0 ? Math.min((currentXp / thresholdXp) * 100, 100) : 0;
  return <View style={styles.container}>
    <View style={[styles.track, compact && styles.compactTrack]}>
      <LinearGradient colors={["#00F2FE", "#4FACFE", "#38EDD8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.fill, { width: `${progress}%` }]} />
    </View>
    <View style={styles.values}><Text style={styles.current}>{currentXp.toLocaleString()} <Text style={styles.muted}>/ {thresholdXp.toLocaleString()} XP</Text></Text>{lifetimeXp !== undefined && <Text style={styles.lifetime}>{lifetimeXp.toLocaleString()} LIFETIME XP</Text>}</View>
  </View>;
}

const styles = StyleSheet.create({
  container: { width: "100%" }, track: { height: 9, borderRadius: 6, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }, compactTrack: { height: 7 }, fill: { height: "100%", borderRadius: 6 },
  values: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 9 }, current: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" }, muted: { color: "#94A3B8", fontWeight: "700" }, lifetime: { color: "#64748B", fontSize: 9, fontWeight: "700", letterSpacing: 0.5 },
});
