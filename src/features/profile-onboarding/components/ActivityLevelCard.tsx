import { ActivityLevel } from "@/shared/types/user";
import { Zap } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { ActivityOptionItem } from "./ActivityOptionItem";

const ACTIVITY_OPTIONS: {
  id: ActivityLevel;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "beginner",
    title: "Beginner",
    subtitle: "0-1 workouts / week",
  },
  {
    id: "moderately_active",
    title: "Moderately Active",
    subtitle: "2-4 workouts / week",
  },
  {
    id: "very_active",
    title: "Very Active",
    subtitle: "5+ workouts / week",
  },
];

interface ActivityLevelCardProps {
  activityLevel: ActivityLevel;
  onSelectActivity: (level: ActivityLevel) => void;
}

export function ActivityLevelCard({
  activityLevel,
  onSelectActivity,
}: ActivityLevelCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleGroup}>
          <View style={styles.iconBox}>
            <Zap size={14} color="#5EEAD4" fill="#5EEAD4" />
          </View>
          <Text style={styles.headerTitle}>ACTIVITY LEVEL</Text>
        </View>
      </View>

      <View style={styles.activityList}>
        {ACTIVITY_OPTIONS.map((opt) => (
          <ActivityOptionItem
            key={opt.id}
            id={opt.id}
            title={opt.title}
            subtitle={opt.subtitle}
            isSelected={activityLevel === opt.id}
            onSelect={onSelectActivity}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
    backgroundColor: "#171920",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "rgba(45, 212, 191, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    includeFontPadding: false,
  },
  activityList: {
    gap: 7,
    marginBottom: 4,
  },
});
