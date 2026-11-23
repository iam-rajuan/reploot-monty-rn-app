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
    height: 106,
    backgroundColor: "rgba(24, 35, 55, 0.88)",
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: "rgba(152, 173, 255, 0.12)",
  },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  macroPercentPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  macroPercentText: {
    fontSize: 8,
    fontWeight: "800",
    fontFamily: "JetBrainsMono_700Bold",
  },
  macroLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.225,
    fontFamily: "JetBrainsMono_700Bold",
    marginBottom: 2,
  },
  macroValues: {
    marginBottom: 8,
  },
  macroCurrent: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
  },
  macroSlash: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "JetBrainsMono_700Bold",
  },
  macroProgressBar: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  macroProgressFill: {
    height: 6,
    borderRadius: 3,
  },
});
