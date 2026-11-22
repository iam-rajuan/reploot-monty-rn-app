import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

export const AiCoachFloatingCard = () => {
  const router = useRouter();

  const handleAskCoach = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push("/coach");
  };

  return (
    <View style={styles.cardContainer}>
      {/* Background Gradient matching Figma: Deep Midnight Teal to Vibrant Electric Blue */}
      <LinearGradient
        colors={["#091728", "#102F5A", "#194C96", "#2168DE"]}
        locations={[0, 0.35, 0.72, 1.0]}
        start={{ x: 0, y: 0.2 }}
        end={{ x: 1, y: 0.8 }}
        style={[StyleSheet.absoluteFill, { borderRadius: 28 }]}
      />

      <View style={styles.content}>
        {/* Top Header Row: COACH ONLINE Pill on Left, Robot Icon on Right */}
        <View style={styles.topRow}>
          <View style={styles.onlinePill}>
            <View style={styles.onlineHalo}>
              <View style={styles.onlineDot} />
            </View>
            <Text style={styles.onlineText}>COACH ONLINE</Text>
          </View>

          <View style={styles.topRobotCircle}>
            <Image
              source={require("../../../../assets/coachOnline/coachOnline.png")}
              style={styles.topRobotIcon}
              contentFit="contain"
            />
          </View>
        </View>

        {/* Message Text with Highlighted Keywords */}
        <Text style={styles.messageText}>
          Need guidance? Your{" "}
          <Text style={styles.highlightTextCyan}>AI Coach</Text> is ready to{" "}
          <Text style={styles.highlightTextPurple}>optimize</Text> your session.
        </Text>

        {/* Card action; the persistent coach shortcut lives in the Home overlay. */}
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
              <ArrowRight size={16} color="#050811" strokeWidth={2.8} />
            </View>
          </Pressable>

        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 28,
    marginHorizontal: 20,
    marginBottom: 32,
    borderWidth: 1.2,
    borderColor: "rgba(56, 189, 248, 0.4)",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#1B4F92",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
  },
  content: {
    padding: 22,
    paddingTop: 20,
    paddingBottom: 22,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  onlinePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 32, 44, 0.85)",
    borderWidth: 1.2,
    borderColor: "#2EE5C5",
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#2EE5C5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  onlineHalo: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(46, 229, 197, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#2EE5C5",
  },
  onlineText: {
    color: "#2EE5C5",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    fontFamily: "JetBrainsMono_700Bold",
  },
  topRobotCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(46, 229, 197, 0.12)",
    borderWidth: 1.2,
    borderColor: "rgba(46, 229, 197, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  topRobotIcon: {
    width: 38,
    height: 38,
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "800",
    fontFamily: Platform.select({ android: "sans-serif-bold", ios: "System" }),
    marginBottom: 22,
    maxWidth: "80%",
  },
  highlightTextCyan: {
    color: "#2EE5C5",
    fontWeight: "900",
  },
  highlightTextPurple: {
    color: "#B490FF",
    fontWeight: "900",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  askButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    minHeight: 48,
    paddingHorizontal: 22,
    borderRadius: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  askButtonText: {
    color: "#050811",
    fontSize: 12.5,
    fontWeight: "900",
    letterSpacing: 1.1,
    fontFamily: "JetBrainsMono_700Bold",
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
});
