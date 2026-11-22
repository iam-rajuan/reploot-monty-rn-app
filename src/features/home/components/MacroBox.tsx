import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export interface MacroBoxProps {
  icon: React.ReactNode;
  percent: string;
  label: string;
  labelColor?: string;
  current: string;
  currentColor?: string;
  target: string;
  color: string;
  pillBgColor: string;
  pillBorderColor: string;
  pillTextColor?: string;
}

export const MacroBox = ({
  icon,
  percent,
  label,
  labelColor = "#8E94B8",
  current,
  currentColor,
  target,
  color,
  pillBgColor,
  pillBorderColor,
  pillTextColor = "#FFFFFF",
}: MacroBoxProps) => {
  return (
    <View style={styles.macroBox}>
      {/* Top Header: Icon on Left, Percent Badge on Right */}
      <View style={styles.macroHeader}>
        {icon}
        <View
          style={[
            styles.macroPercentPill,
            {
              backgroundColor: pillBgColor,
              borderColor: pillBorderColor,
            },
          ]}
        >
          <Text style={[styles.macroPercentText, { color: pillTextColor }]}>
            {percent}
          </Text>
        </View>
      </View>

      {/* Label */}
      <Text style={[styles.macroLabel, { color: labelColor }]}>{label}</Text>

      {/* Values: current / target */}
      <Text style={styles.macroValues}>
        <Text
          style={[
            styles.macroCurrent,
            { color: currentColor || color },
          ]}
        >
          {current}
        </Text>{" "}
        <Text style={styles.macroSlash}>/ {target}</Text>
      </Text>

      {/* Track & Fill Progress Bar */}
      <View style={styles.macroProgressBar}>
        <View
          style={[
            styles.macroProgressFill,
            { width: percent as any, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  macroBox: {
    width: "48%",
    backgroundColor: "#131826",
    borderRadius: 18,
    padding: 14,
    paddingTop: 15,
    paddingBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  macroPercentPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  macroPercentText: {
    fontSize: 10,
    fontWeight: "800",
    fontFamily: "JetBrainsMono_700Bold",
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    fontFamily: "JetBrainsMono_700Bold",
    marginBottom: 5,
  },
  macroValues: {
    marginBottom: 12,
  },
  macroCurrent: {
    fontSize: 16,
    fontWeight: "900",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
  },
  macroSlash: {
    color: "#CBD5E1",
    fontSize: 12.5,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
  },
  macroProgressBar: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  macroProgressFill: {
    height: 6,
    borderRadius: 3,
  },
});
