import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";
import { MacroBox } from "./MacroBox";

const iconStyle = { width: 20, height: 20 } as const;

export const MacrosGrid = () => {
  return (
    <View style={styles.macrosGrid}>
      {/* 1. PROTEIN */}
      <MacroBox
        icon={<Image source={require("../../../../assets/figma/nutrition/nutrition-protein.svg")} style={iconStyle} contentFit="contain" />}
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
        icon={<Image source={require("../../../../assets/figma/nutrition/nutrition-carbs.svg")} style={iconStyle} contentFit="contain" />}
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
        icon={<Image source={require("../../../../assets/figma/nutrition/nutrition-fats.svg")} style={iconStyle} contentFit="contain" />}
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
        icon={<Image source={require("../../../../assets/figma/nutrition/nutrition-hydration.svg")} style={iconStyle} contentFit="contain" />}
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
