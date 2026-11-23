import { Sparkles } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function CurrentLevelDisplay({ level, compact = false }: { level: number; compact?: boolean }) {
  return <View style={[styles.container, compact && styles.compact]}><View style={[styles.icon, compact && styles.compactIcon]}><Sparkles size={compact ? 14 : 18} color="#38BDF8" /></View><View><Text style={styles.label}>CURRENT LEVEL</Text><Text style={[styles.value, compact && styles.compactValue]}>LEVEL {level}</Text></View></View>;
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center" }, compact: { flex: 1 }, icon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(56,189,248,0.12)", borderWidth: 1, borderColor: "rgba(56,189,248,0.24)", marginRight: 10 }, compactIcon: { width: 34, height: 34, borderRadius: 11, marginRight: 8 }, label: { color: "#64748B", fontSize: 8, fontWeight: "900", fontFamily: "monospace", letterSpacing: 0.8 }, value: { color: "#FFFFFF", fontSize: 19, lineHeight: 24, fontWeight: "900", fontFamily: "monospace" }, compactValue: { fontSize: 14, lineHeight: 18 },
});
