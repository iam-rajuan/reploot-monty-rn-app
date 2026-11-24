import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Dumbbell, House } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface WorkoutTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function WorkoutTabs({ activeTab, setActiveTab }: WorkoutTabsProps) {
  const selectTab = (tab: string) => {
    if (tab === activeTab) return;
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => undefined);
    }
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <RankingTab
        label="GYM"
        active={activeTab === "gym"}
        icon={
          <Dumbbell
            size={16}
            color={activeTab === "gym" ? "#061018" : "#94A3B8"}
          />
        }
        onPress={() => selectTab("gym")}
      />
      <RankingTab
        label="HOME"
        active={activeTab === "home"}
        icon={
          <House
            size={16}
            color={activeTab === "home" ? "#061018" : "#94A3B8"}
          />
        }
        onPress={() => selectTab("home")}
      />
    </View>
  );
}

function RankingTab({
  label,
  active,
  icon,
  onPress,
}: {
  label: string;
  active: boolean;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={styles.tab}
    >
      {active && (
        <LinearGradient
          colors={["#38EDD8", "#4FACFE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {icon}
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 52,
    padding: 4,
    marginBottom: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(8,13,24,0.82)",
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    overflow: "hidden",
  },
  label: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "900",
    fontFamily: "monospace",
    letterSpacing: 1.3,
  },
  activeLabel: { color: "#061018" },
});

export default WorkoutTabs;
