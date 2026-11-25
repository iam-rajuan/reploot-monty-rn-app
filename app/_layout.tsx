import React, { useEffect } from "react";
import { AppProviders } from "@/providers/AppProviders";
import { colors } from "@/theme/colors";
import { fontAssets } from "@/theme/fonts";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "../global.css";

import { useProtectedRoute } from "@/hooks/useProtectedRoute";

LogBox.ignoreAllLogs(true);

// Keep the native splash screen up until the typography fonts are ready, so
// text never renders in a fallback font first (see src/theme/fonts.ts).
SplashScreen.preventAutoHideAsync().catch(() => {});

function AuthGuard() {
  useProtectedRoute();
  return null;
}

export default function RootLayout() {
  // Reploot uses only Montserrat for primary page titles and Inter for all
  // other user-visible text. Every face used by the type system loads here.
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    if (fontError) {
      // Never fail silently: a missing face would break the two-font policy.
      console.error("[typography] Failed to load Inter/Montserrat fonts", fontError);
    }
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <KeyboardProvider>
      <AppProviders>
        <AuthGuard />
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colors.background.primary,
            },
            animation: "slide_from_right",
            animationDuration: 220,
            freezeOnBlur: true,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="dev" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(profile-setup)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="coach/index" />
          <Stack.Screen name="workouts/index" />
          <Stack.Screen name="workouts/pull" />
          <Stack.Screen name="workouts/push" />
          <Stack.Screen name="workouts/chest" />
          <Stack.Screen name="workouts/upper" />
          <Stack.Screen name="workouts/details" />
          <Stack.Screen name="workouts/ai-session" />
          <Stack.Screen name="notifications/index" />
          <Stack.Screen name="search/index" />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="weekly-progress" />
          <Stack.Screen name="workout-calendar" />
          <Stack.Screen name="settings" />
          <Stack.Screen
            name="modals/index"
            options={{
              presentation: "modal",
            }}
          />
        </Stack>
      </AppProviders>
    </KeyboardProvider>
  );
}
