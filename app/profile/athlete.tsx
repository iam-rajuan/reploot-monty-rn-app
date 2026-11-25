import { useRankingContext } from "@/hooks/queries/useProgress";
import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RankedAthleteRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId, context } = useLocalSearchParams<{ userId?: string; context?: string }>();
  const rankingContext = context === "home" ? "home" : "gym";
  const { data } = useRankingContext(rankingContext);
  const athlete = data?.entries.find((entry) => entry.userId === userId);

  return <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
    <StatusBar style="light" />
    <CustomHeader title="ATHLETE PROFILE" titleVariant="text" showBackButton onPressBack={() => router.back()} transparent />
    <View style={styles.content}>
      {athlete ? <>
        <Image source={{ uri: athlete.avatarUrl }} style={styles.avatar} />
        <Text style={styles.name}>{athlete.fullName}</Text>
        <Text style={styles.context}>{data?.title.toUpperCase()}</Text>
        <View style={styles.stats}><View><Text style={styles.label}>RANK</Text><Text style={styles.value}>#{athlete.rank}</Text></View><View><Text style={styles.label}>CHALLENGE SCORE</Text><Text style={styles.value}>{athlete.score.toLocaleString()} {data?.scoreUnit}</Text></View></View>
        <Text style={styles.note}>Development profile data</Text>
      </> : <Text style={styles.missing}>ATHLETE NOT FOUND</Text>}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#090A10" }, content: { flex: 1, alignItems: "center", padding: 24, paddingTop: 56 },
  avatar: { width: 104, height: 104, borderRadius: 32, backgroundColor: "#161B26", marginBottom: 18 }, name: { color: "#FFFFFF", fontSize: 24, fontWeight: "800" },
  context: { color: "#38EDD8", fontSize: 11, fontWeight: "700", marginTop: 8 }, stats: { width: "100%", flexDirection: "row", justifyContent: "space-between", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)", padding: 20, marginTop: 32 },
  label: { color: "#94A3B8", fontSize: 10, fontWeight: "700", marginBottom: 5 }, value: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" }, note: { color: "#64748B", fontSize: 10, marginTop: 16 }, missing: { color: "#94A3B8" },
});
