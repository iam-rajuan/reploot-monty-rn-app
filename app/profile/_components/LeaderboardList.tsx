import { LeaderboardEntry } from "@/shared/types/progress";
import { Image } from "expo-image";
import { Crown, Medal } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  entries: LeaderboardEntry[];
  scoreUnit: string;
  showPodium?: boolean;
  onSelectEntry: (entry: LeaderboardEntry) => void;
}

export function LeaderboardList({
  entries,
  scoreUnit,
  showPodium = true,
  onSelectEntry,
}: Props) {
  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Medal size={28} color="#64748B" />
        <Text style={styles.emptyTitle}>NO RANKING DATA</Text>
        <Text style={styles.emptyBody}>
          Rankings will appear here when eligible challenge results are
          available.
        </Text>
      </View>
    );
  }

  const podium = showPodium ? entries.slice(0, 3) : [];
  const remaining = showPodium ? entries.slice(3) : entries;

  return (
    <View style={styles.container}>
      {podium.length > 0 && (
        <Podium
          entries={podium}
          scoreUnit={scoreUnit}
          onPress={onSelectEntry}
        />
      )}
      {remaining.length > 0 && (
        <View style={styles.boardSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {showPodium ? "LEADERBOARD" : "SEARCH RESULTS"}
            </Text>
            <Text style={styles.sectionMeta}>RANK • PLAYER • SCORE</Text>
          </View>
          <View style={styles.listCard}>
            {remaining.map((entry, index) => (
              <TouchableOpacity
                key={entry.userId}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`View ${entry.fullName}'s profile`}
                onPress={() => onSelectEntry(entry)}
                style={[
                  styles.row,
                  index < remaining.length - 1 && styles.rowDivider,
                  entry.isCurrentUser && styles.currentRow,
                ]}
              >
                <Text
                  style={[
                    styles.rowRank,
                    entry.isCurrentUser && styles.accentText,
                  ]}
                >
                  {entry.rank}
                </Text>
                <Image
                  source={{ uri: entry.avatarUrl }}
                  style={[
                    styles.rowAvatar,
                    entry.isCurrentUser && styles.currentAvatar,
                  ]}
                />
                <View style={styles.rowIdentity}>
                  <View style={styles.rowNameLine}>
                    <Text style={styles.rowName} numberOfLines={1}>
                      {entry.fullName}
                    </Text>
                    {entry.isCurrentUser && <Text style={styles.you}>YOU</Text>}
                  </View>
                </View>
                <View style={styles.rowScore}>
                  <Text
                    style={[
                      styles.rowScoreValue,
                      entry.isCurrentUser && styles.accentText,
                    ]}
                  >
                    {entry.score.toLocaleString()}
                  </Text>
                  <Text style={styles.rowScoreUnit}>{scoreUnit}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function Podium({
  entries,
  scoreUnit,
  onPress,
}: {
  entries: LeaderboardEntry[];
  scoreUnit: string;
  onPress: (entry: LeaderboardEntry) => void;
}) {
  const ordered =
    entries.length >= 3 ? [entries[1], entries[0], entries[2]] : entries;
  return (
    <View style={styles.podiumSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>TOP PLAYERS</Text>
        <Text style={styles.sectionMeta}>CURRENT CHALLENGE</Text>
      </View>
      <View style={styles.podiumCard}>
        {ordered.map((entry, index) => {
          const isWinner = entry.rank === 1;
          return (
            <TouchableOpacity
              key={entry.userId}
              activeOpacity={0.78}
              onPress={() => onPress(entry)}
              style={[styles.podiumPlayer, isWinner && styles.winnerPlayer]}
            >
              <View
                style={[
                  styles.podiumAvatarWrap,
                  isWinner && styles.winnerAvatarWrap,
                ]}
              >
                {isWinner && (
                  <View style={styles.crown}>
                    <Crown size={16} color="#FFD166" fill="#FFD166" />
                  </View>
                )}
                <Image
                  source={{ uri: entry.avatarUrl }}
                  style={[styles.podiumAvatar, isWinner && styles.winnerAvatar]}
                />
                <View
                  style={[styles.podiumRank, isWinner && styles.winnerRank]}
                >
                  <Text
                    style={[
                      styles.podiumRankText,
                      isWinner && styles.winnerRankText,
                    ]}
                  >
                    {entry.rank}
                  </Text>
                </View>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {entry.fullName}
              </Text>
              <Text
                style={[styles.podiumScore, isWinner && styles.winnerScore]}
              >
                {entry.score.toLocaleString()}
              </Text>
              <Text style={styles.podiumUnit}>{scoreUnit}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", paddingBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    fontFamily: "monospace",
    letterSpacing: 1.1,
  },
  sectionMeta: {
    color: "#64748B",
    fontSize: 8,
    fontWeight: "800",
    fontFamily: "monospace",
    letterSpacing: 0.6,
  },
  podiumSection: { marginBottom: 20 },
  podiumCard: {
    minHeight: 190,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(11,17,30,0.76)",
    paddingHorizontal: 8,
    paddingTop: 24,
    paddingBottom: 18,
    overflow: "hidden",
  },
  podiumPlayer: {
    flex: 1,
    maxWidth: 106,
    alignItems: "center",
    paddingTop: 22,
  },
  winnerPlayer: {
    alignSelf: "stretch",
    paddingTop: 0,
    justifyContent: "flex-start",
  },
  podiumAvatarWrap: { position: "relative", marginBottom: 9 },
  winnerAvatarWrap: { marginTop: 0 },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#A7B0C0",
    backgroundColor: "#161B26",
  },
  winnerAvatar: {
    width: 66,
    height: 66,
    borderRadius: 22,
    borderColor: "#FFD166",
  },
  crown: { position: "absolute", top: -20, left: 25, zIndex: 2 },
  podiumRank: {
    position: "absolute",
    bottom: -5,
    alignSelf: "center",
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D5D9E2",
    borderWidth: 2,
    borderColor: "#111827",
  },
  winnerRank: { backgroundColor: "#FFD166" },
  podiumRankText: {
    color: "#111827",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: "monospace",
  },
  winnerRankText: { color: "#392600" },
  podiumName: {
    width: "94%",
    color: "#E5E7EB",
    fontSize: 10,
    fontWeight: "800",
    fontFamily: "monospace",
    textAlign: "center",
    marginTop: 3,
  },
  podiumScore: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "900",
    fontFamily: "monospace",
    marginTop: 5,
  },
  winnerScore: { color: "#FFD166" },
  podiumUnit: {
    color: "#64748B",
    fontSize: 7,
    fontWeight: "800",
    fontFamily: "monospace",
    marginTop: 1,
  },
  boardSection: { width: "100%" },
  listCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(11,17,30,0.76)",
    overflow: "hidden",
  },
  row: {
    width: "100%",
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  currentRow: {
    backgroundColor: "rgba(56,189,248,0.1)",
    borderLeftWidth: 3,
    borderLeftColor: "#38BDF8",
    paddingLeft: 9,
  },
  rowRank: {
    width: 30,
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "900",
    fontFamily: "monospace",
    textAlign: "center",
    marginRight: 9,
  },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#161B26",
    marginRight: 11,
  },
  currentAvatar: { borderWidth: 1, borderColor: "#38BDF8" },
  rowIdentity: { flex: 1, minWidth: 0 },
  rowNameLine: { flexDirection: "row", alignItems: "center" },
  rowName: {
    flexShrink: 1,
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "800",
    fontFamily: "monospace",
  },
  you: {
    color: "#38BDF8",
    fontSize: 7,
    fontWeight: "900",
    fontFamily: "monospace",
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: "rgba(56,189,248,0.16)",
  },
  rowScore: { minWidth: 62, alignItems: "flex-end", marginLeft: 6 },
  rowScoreValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    fontFamily: "monospace",
  },
  rowScoreUnit: {
    color: "#64748B",
    fontSize: 8,
    fontWeight: "800",
    fontFamily: "monospace",
    marginTop: 1,
  },
  accentText: { color: "#38EDD8" },
  empty: {
    width: "100%",
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    marginBottom: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(11,17,30,0.76)",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    fontFamily: "monospace",
    letterSpacing: 1,
    marginTop: 12,
  },
  emptyBody: {
    maxWidth: 250,
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    fontFamily: "monospace",
    marginTop: 7,
  },
});

export default LeaderboardList;
