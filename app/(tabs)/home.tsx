import { CoachLauncherOrb } from "@/features/ai-coach/components/CoachLauncherOrb";
import { WorkoutModalitiesSection } from "@/features/home";
import { AiCoachFloatingCard } from "@/features/home/components/AiCoachFloatingCard";
import { AiWorkoutCard } from "@/features/home/components/AiWorkoutCard";
import { HomeGreeting } from "@/features/home/components/HomeGreeting";
import { NutritionDashboardCard } from "@/features/home/components/NutritionDashboardCard";
import { WeeklyProgressCard } from "@/features/home/components/WeeklyProgressCard";
import { WorkoutHeader } from "@/features/workouts";
import { useAppSelector } from "@/store/hooks";
import { HORIZONTAL_PADDING } from "@/shared/utils/responsive";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

export default function HomeTabRoute() {
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();

  const userName = user?.fullName?.split(" ")[0] || "USER";

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScreenBackground />
      <WorkoutHeader transparent={true} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <HomeGreeting name={userName} />
        <WeeklyProgressCard />
        <View style={styles.sectionSpacing}>
          <WorkoutModalitiesSection />
        </View>
        <AiWorkoutCard />
        <NutritionDashboardCard />
        <AiCoachFloatingCard />
      </ScrollView>
      <Pressable
        style={styles.fabContainer}
        onPress={() => router.push("/coach?context=fitness")}
        accessibilityRole="button"
        accessibilityLabel="AI Coach"
      >
        {({ pressed }) => <CoachLauncherOrb pressed={pressed} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#060810",
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 120,
  },
  sectionSpacing: {
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 20,
  },
  fabContainer: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 50,
  },
});
