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
  arrowBottom = 96,
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
      style={[styles.cardContainer, style]}
      testID={testID}
      onPress={handlePress}
      accessibilityLabel={`${title}: ${subtitle}`}
    >
      {/* Background Workout Image */}
      <Image
        source={image}
        style={styles.backgroundImage}
        contentFit="fill"
        transition={200}
      />

      {/* Cyber Gradient Overlay for Text Legibility */}
      <LinearGradient
        colors={[
          "rgba(0, 0, 0, 0)",
          "rgba(0, 0, 0, 0.4)",
          "#000000",
        ]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Bottom Content Row (Text and Opposite Arrow Button) */}
      <View style={styles.textContainer} pointerEvents="none">
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      <View style={[styles.arrowButtonWrapper, { bottom: arrowBottom }]} pointerEvents="none">
        <Image
          source={arrowImage}
          style={styles.arrowImage}
          contentFit="contain"
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    height: 240,
    minHeight: 240,
    maxHeight: 240,
    flexShrink: 0,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "transparent",
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 8,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: "-12.81%",
    width: "125.63%",
    height: "100%",
  },
  pressableOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
  },
  cardPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  textContainer: {
    position: "absolute",
    top: 162,
    left: 24,
    width: 294,
    gap: 4,
    zIndex: 2,
  },
  arrowButtonWrapper: {
    position: "absolute",
    right: 15,
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5FFFD7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 2,
  },
  arrowImage: {
    width: 16,
    height: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 30,
    fontWeight: "900",
    fontStyle: "italic",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    letterSpacing: -0.75,
    textTransform: "uppercase",
  },
  subtitle: {
    color: "#C8C4D8",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Platform.select({ android: "sans-serif", ios: "System" }),
    fontWeight: "400",
  },
});
