import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import { useRankingContext } from "@/hooks/queries/useProgress";
import { LeaderboardEntry, RankingContextId } from "@/shared/types/progress";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Clock3, Gamepad2, ShieldCheck } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LeaderboardList } from "./_components/LeaderboardList";
import { SearchInput } from "./_components/SearchInput";
import { StandingCard } from "./_components/StandingCard";
import { WorkoutTabs } from "./_components/WorkoutTabs";
import { typography } from "@/theme/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

export default function GlobalRankingsRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ context?: string }>();
  const insets = useSafeAreaInsets();
  const initialContext: RankingContextId =
    params.context === "home" ? "home" : "gym";
  const [activeTab, setActiveTab] = useState<RankingContextId>(initialContext);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useRankingContext(activeTab);
  const entries = data?.entries ?? [];
  const visibleEntries = entries.filter((entry) =>
    entry.fullName.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const currentUser = entries.find((entry) => entry.isCurrentUser);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab === "home" ? "home" : "gym");
    setSearch("");
  };

  const handleProfilePress = (entry: LeaderboardEntry) => {
    if (entry.isCurrentUser) router.push("/(tabs)/profile");
    else
      router.push({
        pathname: "/profile/athlete" as any,
        params: { userId: entry.userId, context: activeTab },
      });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenBackground />

      <CustomHeader
        titleVariant="text"
        title=""
        showBackButton={true}
        onPressBack={handleBack}
        showSearch={true}
        showNotifications={true}
        showAvatar={true}
        transparent={true}
      />

      <KeyboardAwareScrollView
        bottomOffset={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 40, 60) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <View style={styles.titleEyebrow}>
            <Gamepad2 size={14} color="#38EDD8" />
            <Text style={styles.titleEyebrowText}>CHALLENGE ARENA</Text>
            <View style={styles.mockPill}>
              <Text style={styles.mockPillText}>MOCK DATA</Text>
            </View>
          </View>
          <View style={styles.maskedTitleWrapper}>
            <View style={styles.maskedTitleView}>
              <View style={styles.maskWrapper}>
                <Text
                  style={[styles.mainTitle, { color: "#F6F8FF" }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  RANKINGS
                </Text>
              </View>
            </View>
          </View>
        </View>

        <WorkoutTabs activeTab={activeTab} setActiveTab={handleTabChange} />
        {data?.scoringStatus === "pending" ? (
          <View style={styles.pendingCard}>
            <View style={styles.pendingIcon}>
              <Clock3 size={24} color="#38EDD8" />
            </View>
            <Text style={styles.pendingKicker}>HOME CHALLENGE RANKING</Text>
            <Text style={styles.pendingTitle}>SCORING RULES IN REVIEW</Text>
            <Text style={styles.pendingBody}>
              This ranking space is ready for Home challenges. Results will stay
              separate from Gym rankings, and no comparison formula will be
              shown until the backend rule is approved.
            </Text>
            <View style={styles.pendingSafety}>
              <ShieldCheck size={14} color="#A7F3E8" />
              <Text style={styles.pendingSafetyText}>
                NO PLACEHOLDER CONVERSION APPLIED
              </Text>
            </View>
          </View>
        ) : (
          <>
            <StandingCard
              entry={currentUser}
              scoreUnit={data?.scoreUnit ?? "XP"}
            />
            <SearchInput value={search} onChangeText={setSearch} />
            {isLoading ? (
              <Text style={styles.loading}>SYNCING RANKING...</Text>
            ) : (
              <LeaderboardList
                entries={visibleEntries}
                scoreUnit={data?.scoreUnit ?? "XP"}
                showPodium={!search.trim()}
                onSelectEntry={handleProfilePress}
              />
            )}
          </>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090A10",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  titleSection: {
    marginTop: 2,
    marginBottom: 18,
  },
  titleEyebrow: { flexDirection: "row", alignItems: "center", marginBottom: 7 },
  titleEyebrowText: {
    color: "#38EDD8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginLeft: 7,
  },
  mockPill: {
    marginLeft: "auto",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    backgroundColor: "rgba(15,23,42,0.6)",
  },
  mockPillText: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  maskedTitleWrapper: {
    height: 40,
    width: "100%",
  },
  maskedTitleView: {
    flex: 1,
    width: "100%",
  },
  maskWrapper: {
    backgroundColor: "transparent",
    flex: 1,
    justifyContent: "center",
  },
  gradient: {
    flex: 1,
  },
  mainTitle: {
    ...typography.pageTitle,
    color: "#FFFFFF",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: 4,
  },
  pendingCard: {
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.24)",
    backgroundColor: "rgba(11,17,30,0.78)",
    paddingHorizontal: 22,
    paddingVertical: 30,
    marginBottom: 20,
  },
  pendingIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,237,216,0.1)",
    borderWidth: 1,
    borderColor: "rgba(56,237,216,0.22)",
    marginBottom: 18,
  },
  pendingKicker: {
    color: "#38EDD8",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 7,
  },
  pendingTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  pendingBody: {
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
  },
  pendingSafety: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "rgba(56,237,216,0.08)",
  },
  pendingSafetyText: {
    color: "#A7F3E8",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginLeft: 6,
  },
  loading: {
    color: "#94A3B8",
    textAlign: "center",
    padding: 24,
  },
});
