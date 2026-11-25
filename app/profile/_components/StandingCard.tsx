import { LeaderboardEntry } from "@/shared/types/progress";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Crosshair, Sparkles } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";

export function StandingCard({
  entry,
  scoreUnit,
}: {
  entry?: LeaderboardEntry;
  scoreUnit: string;
}) {
  return (
    <LinearGradient
      colors={[
        "rgba(68,234,195,0.15)",
        "rgba(79,172,254,0.08)",
        "rgba(18,22,36,0.92)",
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.eyebrowRow}>
        <View style={styles.liveDot} />
        <Text style={styles.eyebrow}>YOUR POSITION</Text>
        <Sparkles size={14} color="#38EDD8" />
      </View>
      {entry ? (
        <View style={styles.content}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: entry.avatarUrl }} style={styles.avatar} />
            <View style={styles.youBadge}>
              <Text style={styles.youText}>YOU</Text>
            </View>
          </View>
          <View style={styles.identity}>
            <Text style={styles.name} numberOfLines={1}>
              {entry.fullName}
            </Text>
            <Text style={styles.score}>
              {entry.score.toLocaleString()} {scoreUnit}
            </Text>
          </View>
          <View style={styles.rankBlock}>
            <Text style={styles.rankLabel}>RANK</Text>
            <Text style={styles.rank}>#{entry.rank}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.unrankedRow}>
          <View style={styles.crosshair}>
            <Crosshair size={22} color="#38EDD8" />
          </View>
          <View style={styles.identity}>
            <Text style={styles.name}>NOT RANKED YET</Text>
            <Text style={styles.unrankedCopy}>
              Complete an eligible challenge to enter.
            </Text>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(56,237,216,0.24)",
    padding: 16,
    marginBottom: 18,
    overflow: "hidden",
  },
  eyebrowRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#38EDD8",
    marginRight: 7,
  },
  eyebrow: {
    flex: 1,
    color: "#A7F3E8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  content: { flexDirection: "row", alignItems: "center" },
  avatarWrap: { position: "relative", marginRight: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(56,237,216,0.55)",
    backgroundColor: "#161B26",
  },
  youBadge: {
    position: "absolute",
    right: -5,
    bottom: -5,
    borderRadius: 7,
    backgroundColor: "#38EDD8",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: "#111827",
  },
  youText: {
    color: "#061018",
    fontSize: 9,
    fontWeight: "700",
  },
  identity: { flex: 1, minWidth: 0 },
  name: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
  },
  score: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },
  rankBlock: { alignItems: "flex-end", paddingLeft: 10 },
  rankLabel: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  rank: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "800",
  },
  unrankedRow: { flexDirection: "row", alignItems: "center" },
  crosshair: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,237,216,0.1)",
    marginRight: 12,
  },
  unrankedCopy: {
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
});

export default StandingCard;
