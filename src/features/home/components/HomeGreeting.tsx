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
    marginTop: 12,
    marginBottom: 18,
  },
  greetingSub: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    letterSpacing: 1.5,
    fontFamily: "JetBrainsMono_700Bold",
    marginBottom: 4,
  },
  titleWrapper: {
    height: 42,
    justifyContent: "center",
    marginBottom: 6,
  },
  titleLine: {
    color: "#F6F8FF",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.8,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    textShadowColor: "rgba(120, 145, 255, 0.22)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 6,
  },
  dateText: {
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: "JetBrainsMono_700Bold",
  },
});
