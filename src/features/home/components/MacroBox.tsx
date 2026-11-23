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
      <Text style={[styles.macroLabel, { color: labelColor }]} numberOfLines={1}>
        {label}
      </Text>

      {/* Values: current / target */}
      <Text style={styles.macroValues} numberOfLines={1}>
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
    width: "48.2%",
    minHeight: 96,
    backgroundColor: "rgba(24, 35, 55, 0.88)",
    borderRadius: 16,
    padding: 11,
    borderWidth: 1,
    borderColor: "rgba(152, 173, 255, 0.12)",
    justifyContent: "space-between",
  },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  macroPercentPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  macroPercentText: {
    fontSize: 8.5,
    fontWeight: "800",
    fontFamily: "JetBrainsMono_700Bold",
  },
  macroLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.3,
    fontFamily: "JetBrainsMono_700Bold",
    marginBottom: 2,
  },
  macroValues: {
    marginBottom: 6,
  },
  macroCurrent: {
    fontSize: 13,
    fontWeight: "800",
    fontFamily: "JetBrainsMono_700Bold",
  },
  macroSlash: {
    color: "#94A3B8",
    fontSize: 10.5,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
  },
  macroProgressBar: {
    height: 5,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  macroProgressFill: {
    height: 5,
    borderRadius: 3,
  },
});
