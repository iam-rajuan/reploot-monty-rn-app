import * as Haptics from "expo-haptics";
import { Image, ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

const defaultArrowAsset = require("../../../../assets/figma/modalities/workout-card-arrow.svg");

export interface WorkoutModalityCardProps {
  title: string;
  subtitle: string;
  image: ImageSource | string | number;
  arrowImage?: ImageSource | string | number;
  arrowBottom?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const WorkoutModalityCard: React.FC<WorkoutModalityCardProps> = ({
  title,
  subtitle,
  image,
  arrowImage = defaultArrowAsset,
  onPress,
  style,
  testID,
}) => {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress?.();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.cardPressed,
        style,
      ]}
      testID={testID}
      onPress={handlePress}
      accessibilityLabel={`${title}: ${subtitle}`}
    >
      {/* Background Workout Image */}
      <Image
        source={image}
        style={styles.backgroundImage}
        contentFit="cover"
        transition={200}
      />

      {/* Cyber Gradient Overlay for Text Legibility */}
      <LinearGradient
        colors={[
          "rgba(5, 10, 20, 0.1)",
          "rgba(5, 10, 20, 0.52)",
          "rgba(7, 11, 21, 0.95)",
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.insetHighlight} pointerEvents="none" />

      {/* Bottom Content Row (Text on Left, Arrow Action on Right) */}
      <View style={styles.contentWrap} pointerEvents="none">
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        <View style={styles.arrowButtonWrapper}>
          <Image
            source={arrowImage}
            style={styles.arrowImage}
            contentFit="contain"
          />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    minHeight: 180,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#0A101D",
    borderWidth: 1,
    borderColor: "rgba(104, 123, 255, 0.3)",
    position: "relative",
    shadowColor: "#030611",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
    justifyContent: "flex-end",
  },
  cardPressed: {
    opacity: 0.94,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  insetHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: "rgba(188, 199, 255, 0.09)",
    borderRadius: 24,
  },
  contentWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: 18,
    zIndex: 2,
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    fontStyle: "italic",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    letterSpacing: -0.5,
    textTransform: "uppercase",
  },
  subtitle: {
    color: "#B6C0D6",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Platform.select({ android: "sans-serif", ios: "System" }),
    fontWeight: "400",
  },
  arrowButtonWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(130, 151, 255, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#39D7C4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    flexShrink: 0,
  },
  arrowImage: {
    width: 15,
    height: 15,
  },
});
