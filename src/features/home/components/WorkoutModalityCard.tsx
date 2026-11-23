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
          "rgba(5, 10, 20, 0.05)",
          "rgba(5, 10, 20, 0.46)",
          "#070B15",
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.insetHighlight} pointerEvents="none" />

      {/* Prominent Circular Action Button */}
      <View
        style={[
          styles.arrowButtonWrapper,
          arrowBottom !== undefined
            ? { bottom: arrowBottom }
            : { top: "50%", marginTop: -24 },
        ]}
        pointerEvents="none"
      >
        <Image
          source={arrowImage}
          style={styles.arrowImage}
          contentFit="contain"
        />
      </View>

      {/* Robust In-Flow Content Container */}
      <View style={styles.cardContent} pointerEvents="none">
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    height: 240,
    minHeight: 240,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#0A101D",
    borderWidth: 1,
    borderColor: "rgba(104, 123, 255, 0.3)",
    position: "relative",
    shadowColor: "#030611",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 6,
  },
  cardPressed: {
    opacity: 0.92,
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
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
    borderWidth: 1,
    borderColor: "rgba(188, 199, 255, 0.09)",
    borderRadius: 31,
  },
  cardContent: {
    height: 240,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 24,
    zIndex: 2,
  },
  textContainer: {
    paddingRight: 56,
    gap: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    fontStyle: "italic",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    letterSpacing: -0.75,
    textTransform: "uppercase",
  },
  subtitle: {
    color: "#B6C0D6",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Platform.select({ android: "sans-serif", ios: "System" }),
    fontWeight: "400",
  },
  arrowButtonWrapper: {
    position: "absolute",
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(130, 151, 255, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#39D7C4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 3,
  },
  arrowImage: {
    width: 18,
    height: 18,
  },
});
