import { Calendar } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export interface HomeGreetingProps {
  name: string;
}

export const HomeGreeting = ({ name }: HomeGreetingProps) => {
  const formattedDate = new Date()
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <View style={styles.container}>
      <Text style={styles.greetingSub}>GOOD MORNING, {name.toUpperCase()}</Text>

      {/* Single-line Title matching Figma request */}
      <View style={styles.titleWrapper}>
        <Text
          style={styles.titleLine}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          TRAIN TODAY
        </Text>
      </View>

      <View style={styles.dateContainer}>
        <Calendar size={10.5} color="#C8C4D8" />
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 30,
  },
  greetingSub: {
    color: "#C8C4D8",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700",
    letterSpacing: 2,
    fontFamily: "JetBrainsMono_700Bold",
    marginBottom: 7,
  },
  titleWrapper: {
    height: 52,
    justifyContent: "center",
    marginBottom: 7,
  },
  titleLine: {
    color: "#FFFFFF",
    fontSize: 44,
    lineHeight: 44,
    fontWeight: "900",
    letterSpacing: -1.76,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    textShadowColor: "rgba(95, 255, 215, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
    gap: 8,
  },
  dateText: {
    color: "#C8C4D8",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 1.2,
    fontFamily: "JetBrainsMono_700Bold",
  },
});
