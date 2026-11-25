import * as Haptics from "expo-haptics";
import { Image, ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight } from "lucide-react-native";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";

export interface WorkoutModalityCardProps {
  title: string;
  subtitle: string;
  image: ImageSource | string | number;
  /** Small tag in the top-left corner, e.g. "FULL GYM". */
  tag?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Photo card for a workout modality (gym / home). Visuals sit on an inner
 * View: Pressable style functions are dropped on native in this app
 * (NativeWind interop).
 */
export const WorkoutModalityCard: React.FC<WorkoutModalityCardProps> = ({
  title,
  subtitle,
  image,
  tag,
  onPress,
  style,
  testID,
}) => {
  const [pressed, setPressed] = useState(false);

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress?.();
  };

  return (
    <Pressable
      style={style}
      testID={testID}
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${subtitle}`}
    >
      <View style={[styles.card, pressed && styles.cardPressed]}>
        <Image
          source={image}
          style={styles.backgroundImage}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={["rgba(5, 10, 20, 0.05)", "rgba(5, 10, 20, 0.5)", "#070B15"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.insetHighlight} pointerEvents="none" />

        {tag ? (
          <View style={styles.tag} pointerEvents="none">
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ) : null}

        <View style={styles.content} pointerEvents="none">
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          </View>

          <View style={[styles.arrowButton, pressed && styles.arrowButtonPressed]}>
            <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.4} />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const CARD_HEIGHT = 220;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#0A101D",
    borderWidth: 1,
    borderColor: "rgba(104, 123, 255, 0.32)",
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
  },
  insetHighlight: {
    position: "absolute",
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
    borderWidth: 1,
    borderColor: "rgba(188, 199, 255, 0.09)",
    borderRadius: 23,
  },
  tag: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(7, 11, 21, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  tagText: {
    ...typography.badge,
    color: "#E2E8F0",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    padding: 20,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    ...typography.metric,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  subtitle: {
    ...typography.body,
    color: "#B6C0D6",
  },
  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.16)",
    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.45)",
  },
  arrowButtonPressed: {
    backgroundColor: "rgba(56,189,248,0.32)",
  },
});
