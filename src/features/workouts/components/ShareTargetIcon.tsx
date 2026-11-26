import { LinearGradient } from "expo-linear-gradient";
import { Ellipsis } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

export type ShareTarget = "instagram" | "whatsapp" | "messenger" | "facebook" | "more";

export const SHARE_TARGET_LABELS: Record<ShareTarget, string> = {
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  messenger: "Messenger",
  facebook: "Facebook",
  more: "More",
};

const SIZE = 52;

/** Brand-coloured round icon for a share destination. */
export function ShareTargetIcon({ target }: { target: ShareTarget }) {
  switch (target) {
    case "instagram":
      return (
        <View style={styles.circle}>
          <LinearGradient
            colors={["#FEDA75", "#FA7E1E", "#D62976", "#962FBF", "#4F5BD5"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Svg width={26} height={26} viewBox="0 0 24 24">
            <Rect x={3} y={3} width={18} height={18} rx={5.5} stroke="#FFFFFF" strokeWidth={2} fill="none" />
            <Circle cx={12} cy={12} r={4.2} stroke="#FFFFFF" strokeWidth={2} fill="none" />
            <Circle cx={17.3} cy={6.7} r={1.25} fill="#FFFFFF" />
          </Svg>
        </View>
      );
    case "whatsapp":
      return (
        <View style={[styles.circle, { backgroundColor: "#25D366" }]}>
          <Svg width={28} height={28} viewBox="0 0 24 24">
            <Path
              d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"
              stroke="#FFFFFF"
              strokeWidth={1.8}
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M9 8.5c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .5-.1.6l-.5.6c.6 1.2 1.6 2.1 2.8 2.7l.6-.5c.2-.2.4-.2.6-.1l1.5.6c.3.1.4.3.4.5v.5c0 .3 0 .6-.5.8-.6.3-1.4.4-2 .2-2.6-.8-4.6-2.8-5.4-5.4-.2-.6-.1-1.4.2-2z"
              fill="#FFFFFF"
            />
          </Svg>
        </View>
      );
    case "messenger":
      return (
        <View style={styles.circle}>
          <LinearGradient
            colors={["#00B2FF", "#006AFF", "#A033FF", "#FF5C87"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Svg width={28} height={28} viewBox="0 0 24 24">
            <Path
              d="M12 3C6.9 3 3 6.7 3 11.4c0 2.5 1.1 4.6 2.8 6.1V21l2.9-1.6c1 .3 2.1.4 3.3.4 5.1 0 9-3.7 9-8.4S17.1 3 12 3z"
              fill="#FFFFFF"
            />
            <Path
              d="M6.8 13.9l2.9-4.6c.4-.6 1.3-.8 1.9-.3l2.3 1.7c.2.2.5.2.7 0l3.1-2.4c.4-.3.9.2.6.6l-2.9 4.6c-.4.6-1.3.8-1.9.3l-2.3-1.7c-.2-.2-.5-.2-.7 0l-3.1 2.4c-.4.3-.9-.2-.6-.6z"
              fill="#2C6BFF"
            />
          </Svg>
        </View>
      );
    case "facebook":
      return (
        <View style={[styles.circle, { backgroundColor: "#1877F2" }]}>
          <Svg width={28} height={28} viewBox="0 0 24 24">
            <Path
              d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8.1v3h2.5V21h2.9z"
              fill="#FFFFFF"
            />
          </Svg>
        </View>
      );
    default:
      return (
        <View style={[styles.circle, styles.more]}>
          <Ellipsis size={22} color="#E2E8F0" strokeWidth={2.4} />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  more: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.25)",
  },
});
