import { Shield } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";

export function CurrentTierDisplay({ name, color, compact = false }: { name: string; color: string; compact?: boolean }) {
  return <View style={[styles.container, compact && styles.compact]}><View style={[styles.icon, { backgroundColor: `${color}18`, borderColor: `${color}45` }, compact && styles.compactIcon]}><Shield size={compact ? 14 : 18} color={color} /></View><View><Text style={styles.label}>CURRENT TIER</Text><Text style={[styles.value, { color }, compact && styles.compactValue]}>{name.toUpperCase()}</Text></View></View>;
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center" }, compact: { flex: 1 }, icon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, marginRight: 10 }, compactIcon: { width: 34, height: 34, borderRadius: 11, marginRight: 8 }, label: { color: "#64748B", fontSize: 9, fontWeight: "700", letterSpacing: 0.8 }, value: { fontSize: 20, lineHeight: 24, fontWeight: "800" }, compactValue: { fontSize: 14, lineHeight: 18 },
});
