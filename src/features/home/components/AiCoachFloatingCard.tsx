import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { CoachMascot } from "@/features/ai-coach/components/CoachMascot";
import { HORIZONTAL_PADDING } from "@/shared/utils/responsive";

export const AiCoachFloatingCard = () => {
  const router = useRouter();

  const handleAskCoach = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push("/coach?context=fitness");
  };

  return (
    <View style={styles.cardContainer}>
      {/* Background Gradient matching Figma */}
      <LinearGradient
        colors={["#0C1C32", "#12345A", "#1C5393", "#2B79CC"]}
        locations={[0, 0.36, 0.72, 1.0]}
        start={{ x: 0, y: 0.2 }}
        end={{ x: 1, y: 0.8 }}
        style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
      />

      <View style={styles.content}>
        {/* Top Header Row: COACH ONLINE Pill on Left, Coach Mascot on Right */}
        <View style={styles.topRow}>
          <View style={styles.onlinePill}>
            <View style={styles.onlineHalo}>
              <View style={styles.onlineDot} />
            </View>
            <Text style={styles.onlineText}>COACH ONLINE</Text>
          </View>

          <View style={styles.topRobotCircle}>
            <CoachMascot size={28} />
          </View>
        </View>

        {/* Message Text with Highlighted Keywords */}
        <Text style={styles.messageText}>
          Need guidance? Your{" "}
          <Text style={styles.highlightTextCyan}>AI Coach</Text> is ready to{" "}
          <Text style={styles.highlightTextPurple}>optimize</Text> your session.
        </Text>

        {/* Card action */}
        <View style={styles.bottomRow}>
          <Pressable
            onPress={handleAskCoach}
            accessibilityRole="button"
            accessibilityLabel="Ask AI Coach"
            style={({ pressed }) => [pressed && styles.buttonPressed]}
          >
            <View style={styles.askButton}>
              <Text style={styles.askButtonText} numberOfLines={1}>
                ASK AI COACH
              </Text>
              <ArrowRight size={15} color="#050811" strokeWidth={2.8} />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 24,
    borderWidth: 1.2,
    borderColor: "rgba(93, 168, 255, 0.3)",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#153C71",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  content: {
    padding: 18,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  onlinePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 32, 44, 0.85)",
    borderWidth: 1.2,
    borderColor: "rgba(63, 222, 201, 0.72)",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 7,
    shadowColor: "#3FDEC9",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  onlineHalo: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(46, 229, 197, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2EE5C5",
  },
  onlineText: {
    color: "#3FDEC9",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  topRobotCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(63, 222, 201, 0.1)",
    borderWidth: 1.2,
    borderColor: "rgba(63, 222, 201, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    marginBottom: 18,
    maxWidth: "85%",
  },
  highlightTextCyan: {
    color: "#3FDEC9",
    fontWeight: "800",
  },
  highlightTextPurple: {
    color: "#A7B8FF",
    fontWeight: "800",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  askButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  askButtonText: {
    color: "#050811",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
});
