import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { useProfileSetupStore } from "../store/profileSetupStore";
import { AgeSlider } from "./AgeSlider";
import { AvatarUploadSection } from "./AvatarUploadSection";
import { GenderSelectionRow } from "./GenderSelectionRow";
import { ProfileFormInputs } from "./ProfileFormInputs";
import { OnboardingButton } from "@/features/onboarding/components/OnboardingButton";
import { typography } from "@/theme/typography";

export function Step1LetsStart() {
  const { data, updateData, nextStep } = useProfileSetupStore();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>LET'S START</Text>
      </View>
      <AvatarUploadSection />
      <ProfileFormInputs />
      <GenderSelectionRow />
      <View style={styles.ageCard}>
        <View style={styles.ageInfo}>
          <Text style={styles.ageTitle} numberOfLines={1}>
            SELECT AGE
          </Text>
          <Text style={styles.ageSubtitle} numberOfLines={1}>
            Years of power
          </Text>
        </View>

        <AgeSlider value={data.age} onChange={(age) => updateData({ age })} />
      </View>
      <OnboardingButton
        text="CONTINUE"
        compact
        onPress={nextStep}
        subtext="BY PROCEEDING YOU AGREE TO OUR TERMS OF FORCE"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "stretch",
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 4,
  },
  hero: {
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 14,
  },
  title: {
    ...typography.pageTitle,
    color: "#22D3EE",
  },

  ageCard: {
    width: "100%",
    height: 76,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#2DD4BF",
    backgroundColor: "#12131C",
    paddingLeft: 18,
    paddingRight: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#2DD4BF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  ageInfo: {
    width: 100,
    flexShrink: 0,
    justifyContent: "center",
  },
  ageTitle: {
    color: "#FFFFFF",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  ageSubtitle: {
    color: "#22D3EE",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600",
    marginTop: 3,
  },
});
