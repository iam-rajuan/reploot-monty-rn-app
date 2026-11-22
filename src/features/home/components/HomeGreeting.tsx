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
        <Calendar size={13} color="#8E94B8" />
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  greetingSub: {
    color: "#8E94B8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    fontFamily: "JetBrainsMono_700Bold",
    marginBottom: 6,
  },
  titleWrapper: {
    marginBottom: 6,
    marginTop: 2,
  },
  titleLine: {
    color: "#FFFFFF",
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "900",
    letterSpacing: 0.8,
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    textShadowColor: "rgba(0, 242, 254, 0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  dateText: {
    color: "#8E94B8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    fontFamily: "JetBrainsMono_700Bold",
  },
});
