import { Droplet, Egg, Wheat } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { MacroBox } from "./MacroBox";

// Exact vector meat icon for Fats from Figma Home Dashboard
const FatsMeatIcon = ({ size = 20, color = "#EF4444" }: { size?: number; color?: string }) => (
  <Svg width={size} height={(size * 17) / 16} viewBox="0 0 16 17" fill="none">
    <Path
      d="M4.69 15.04 C5.30 15.25, 6.02 15.39, 6.86 15.46 L6.86 17.00 L4.69 17.00 L4.69 15.04 M9.34 17.00 L11.51 17.00 L11.51 15.03 C10.86 15.24, 10.14 15.38, 9.34 15.45 L9.34 17.00 M7.99 0.00 C7.00 0.00, 6.21 1.03, 6.21 2.31 C6.21 3.58, 7.00 4.61, 7.99 4.61 C8.97 4.61, 9.77 3.58, 9.77 2.31 C9.77 1.03, 8.97 0.00, 7.99 0.00 M16.00 10.36 C16.00 7.11, 13.53 4.36, 10.16 3.51 C10.06 3.80, 9.91 4.07, 9.73 4.31 C9.28 4.89, 8.65 5.22, 7.99 5.22 C7.33 5.22, 6.69 4.89, 6.24 4.31 C6.06 4.07, 5.91 3.80, 5.81 3.52 C2.46 4.37, 0.00 7.12, 0.00 10.36 L1.18 10.36 C1.18 9.52, 1.38 8.70, 1.76 7.96 C1.68 8.33, 1.64 8.70, 1.64 9.08 C1.64 12.29, 2.76 14.90, 8.00 14.90 C13.57 14.90, 14.36 12.29, 14.36 9.07 C14.36 8.70, 14.32 8.33, 14.24 7.96 C14.62 8.70, 14.82 9.52, 14.82 10.36 L16.00 10.36"
      fill={color}
    />
  </Svg>
);

export const MacrosGrid = () => {
  return (
    <View style={styles.macrosGrid}>
      {/* 1. PROTEIN */}
      <MacroBox
        icon={<Egg size={22} color="#A78BFA" strokeWidth={2.4} />}
        percent="80%"
        label="PROTEIN"
        labelColor="#8E94B8"
        current="145g"
        currentColor="#A78BFA"
        target="180g"
        color="#A78BFA"
        pillBgColor="rgba(46, 229, 197, 0.12)"
        pillBorderColor="rgba(46, 229, 197, 0.4)"
        pillTextColor="#2EE5C5"
      />

      {/* 2. CARBS */}
      <MacroBox
        icon={<Wheat size={22} color="#FB923C" strokeWidth={2.4} />}
        percent="84%"
        label="CARBS"
        labelColor="#FB923C"
        current="210g"
        currentColor="#FFFFFF"
        target="250g"
        color="#FB923C"
        pillBgColor="rgba(148, 163, 184, 0.12)"
        pillBorderColor="rgba(148, 163, 184, 0.35)"
        pillTextColor="#CBD5E1"
      />

      {/* 3. FATS */}
      <MacroBox
        icon={<FatsMeatIcon size={20} color="#EF4444" />}
        percent="74%"
        label="FATS"
        labelColor="#8E94B8"
        current="52g"
        currentColor="#EF4444"
        target="70g"
        color="#EF4444"
        pillBgColor="rgba(255, 255, 255, 0.08)"
        pillBorderColor="rgba(255, 255, 255, 0.2)"
        pillTextColor="#CBD5E1"
      />

      {/* 4. HYDRATION */}
      <MacroBox
        icon={<Droplet size={22} color="#38BDF8" strokeWidth={2.4} />}
        percent="70%"
        label="HYDRATION"
        labelColor="#8E94B8"
        current="2.1L"
        currentColor="#38BDF8"
        target="3.0L"
        color="#38BDF8"
        pillBgColor="rgba(56, 189, 248, 0.12)"
        pillBorderColor="rgba(56, 189, 248, 0.4)"
        pillTextColor="#38BDF8"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  macrosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
});
