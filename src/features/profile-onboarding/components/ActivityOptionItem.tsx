import { ActivityLevel } from "@/shared/types/user";
import { Check } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";

export interface ActivityOptionItemProps {
  id: ActivityLevel;
  title: string;
  subtitle: string;
  isSelected: boolean;
  onSelect: (id: ActivityLevel) => void;
}

export const ActivityOptionItem = React.memo(
  ({ id, title, subtitle, isSelected, onSelect }: ActivityOptionItemProps) => {
    return (
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        unstable_pressDelay={0}
        hitSlop={6}
        onPress={() => onSelect(id)}
        style={styles.activityPressable}
      >
        <View
          style={[
            styles.activityOptionRow,
            isSelected
              ? styles.activityOptionSelected
              : styles.activityOptionUnselected,
          ]}
        >
          <View style={styles.activityInfo}>
            <Text
              style={[
                styles.activityTitle,
                isSelected && styles.activityTitleActive,
              ]}
            >
              {title}
            </Text>
            <Text style={styles.activitySubtitle}>{subtitle}</Text>
          </View>

          {/* Radio Indicator */}
          <View
            style={[
              styles.radioCircle,
              isSelected
                ? styles.radioCircleSelected
                : styles.radioCircleUnselected,
            ]}
          >
            {isSelected ? (
              <Check size={11} color="#071A18" strokeWidth={3.5} />
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  activityPressable: {
    width: "100%",
  },
  activityOptionRow: {
    width: "100%",
    minHeight: 54,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  activityOptionUnselected: {
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.08)",
    backgroundColor: "#111319",
  },
  activityOptionSelected: {
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.38)",
    backgroundColor: "rgba(45, 212, 191, 0.08)",
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    color: "#B8C2D1",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 3,
    includeFontPadding: false,
  },
  activityTitleActive: {
    color: "#FFFFFF",
  },
  activitySubtitle: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "400",
    includeFontPadding: false,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 14,
  },
  radioCircleUnselected: {
    borderWidth: 1.5,
    borderColor: "#52617A",
    backgroundColor: "transparent",
  },
  radioCircleSelected: {
    borderWidth: 0,
    backgroundColor: "#5EEAD4",
  },
});
