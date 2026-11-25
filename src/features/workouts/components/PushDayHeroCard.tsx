import { Image, ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Clock, Flame, Zap } from "lucide-react-native";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";
import { PUSH_DAY_DATA } from "../data/pushDayData";

export interface PushDayHeroCardProps {
  image?: ImageSource | number | string;
  xpText?: string;
  durationText?: string;
  caloriesText?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const PushDayHeroCard: React.FC<PushDayHeroCardProps> = ({
  image = PUSH_DAY_DATA.heroImage,
  xpText = PUSH_DAY_DATA.xpText,
  durationText = PUSH_DAY_DATA.durationText,
  caloriesText = PUSH_DAY_DATA.caloriesText,
  style,
  testID,
}) => {
  return (
    <View
      style={[styles.heroCardContainer, style]}
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={`Push Day routine, ${durationText}, ${caloriesText}, reward ${xpText}`}
    >
      <Image
        source={image}
        style={styles.heroImage}
        contentFit="cover"
        priority="high"
      />
      <LinearGradient
        colors={["rgba(6,8,16,0.35)", "rgba(6,8,16,0)", "rgba(6,8,16,0.75)"]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {xpText && (
        <View style={styles.xpBadge}>
          <Zap size={12} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.xpBadgeText}>{xpText}</Text>
        </View>
      )}
      <View style={styles.heroBottomBadgesRow}>
        {durationText && (
          <View style={styles.statPill}>
            <Clock size={13} color="#7DD3FC" strokeWidth={2.4} />
            <Text style={styles.statPillText}>{durationText}</Text>
          </View>
        )}
        {caloriesText && (
          <View style={styles.statPill}>
            <Flame size={13} color="#7DD3FC" strokeWidth={2.4} />
            <Text style={styles.statPillText}>{caloriesText}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCardContainer: {
    width: "100%",
    aspectRatio: 1.6,
    position: "relative",
    marginBottom: 22,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  xpBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#0EA5E9",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    zIndex: 2,
  },
  xpBadgeText: {
    ...typography.badge,
    color: "#FFFFFF",
  },
  heroBottomBadgesRow: {
    position: "absolute",
    bottom: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 2,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(6,8,16,0.72)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
  },
  statPillText: {
    ...typography.badge,
    color: "#F1F5F9",
  },
});
