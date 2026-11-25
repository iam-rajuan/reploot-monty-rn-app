import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewRef,
} from "react-native-keyboard-controller";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileHeader } from "./components/ProfileHeader";
import { Step1LetsStart } from "./components/Step1LetsStart";
import { Step2YourBody } from "./components/Step2YourBody";
import { Step3YourGoal } from "./components/Step3YourGoal";
import { Step4YourStyle } from "./components/Step4YourStyle";
import { Step5YourCoach } from "./components/Step5YourCoach";
import { useProfileSetupStore } from "./store/profileSetupStore";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

export function ProfileOnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentStep, prevStep } = useProfileSetupStore();
  const scrollRef = useRef<KeyboardAwareScrollViewRef>(null);
  const prevStepRef = useRef(currentStep);
  const isForward = currentStep >= prevStepRef.current;

  useEffect(() => {
    prevStepRef.current = currentStep;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentStep]);

  const handleBack = () => {
    if (currentStep > 1) {
      prevStep();
    } else {
      router.replace("/(auth)/sign-in");
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScreenBackground />
      <View style={{ paddingTop: Math.max(insets.top + 6, 16) }}>
        <ProfileHeader
          currentStep={currentStep}
          totalSteps={5}
          onBack={handleBack}
          showBack={currentStep > 1}
        />
      </View>
      <KeyboardAwareScrollView
        ref={scrollRef}
        bottomOffset={16}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <Animated.View
          key={currentStep}
          entering={
            isForward ? FadeInRight.duration(140) : FadeInLeft.duration(140)
          }
          style={styles.stepAnimatedWrapper}
        >
          {currentStep === 1 && <Step1LetsStart />}
          {currentStep === 2 && <Step2YourBody />}
          {currentStep === 3 && <Step3YourGoal />}
          {currentStep === 4 && <Step4YourStyle />}
          {currentStep === 5 && <Step5YourCoach />}
        </Animated.View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#090A10",
  },
  glowOrb: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 190,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    width: "100%",
  },
  stepAnimatedWrapper: {
    width: "100%",
    alignSelf: "stretch",
    alignItems: "center",
  },
});
