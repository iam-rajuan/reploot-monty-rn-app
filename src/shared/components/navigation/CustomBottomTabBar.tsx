import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  Image,
} from "react-native";
import { Text } from "@/shared/components/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Svg, { Path, Circle } from "react-native-svg";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { typography } from "@/theme/typography";

const ACCENT = "#38BDF8";
const INACTIVE = "#6B7A90";

/** Floating island geometry. */
const BAR_HEIGHT = 58;
const SIDE_GAP = 14;
/** Centre button: dumbbell disc + "notch" ring cut into the island. */
/** Centre button: a round orb that sits mostly inside the island. */
const ORB = 54;
/** How far the orb rises above the island's top edge. */
const LIFT = 10;

/**
 * Floating "island" tab bar: a detached glass pill; the active tab's icon sits
 * in a soft sky pill, and a round 3D-dumbbell workout orb rises slightly
 * from the centre.
 */
export function CustomBottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return !(
      (options.tabBarItemStyle as any)?.display === "none" ||
      (options as any).href === null
    );
  });
  const activeKey = state.routes[state.index]?.key;

  const handleTabPress = (route: (typeof state.routes)[number], isFocused: boolean) => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(
          route.name === "action"
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light,
        ).catch(() => {});
      }
      navigation.navigate(route.name);
    }
  };

  // Hide tab bar if active screen requests tabBarStyle: { display: "none" }
  const currentDescriptor = descriptors[state.routes[state.index]?.key];
  const tabBarStyle = currentDescriptor?.options?.tabBarStyle as any;
  if (tabBarStyle?.display === "none") return null;

  const bottomGap = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 10) + 6;

  return (
    <View pointerEvents="box-none" style={[styles.root, { paddingBottom: bottomGap }]}>
      {/* Fade so content dissolves under the floating island */}
      <LinearGradient
        colors={["rgba(6,8,16,0)", "rgba(6,8,16,0.85)"]}
        style={[styles.underFade, { height: BAR_HEIGHT + bottomGap + 24 }]}
        pointerEvents="none"
      />

      <View style={styles.island}>
        {/* Glass surface */}
        <View style={styles.surface} pointerEvents="none">
          <LinearGradient
            colors={["#162236", "#0C1322", "#090D18"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0)"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.5 }}
            style={styles.surfaceSheen}
          />
        </View>

        <View style={styles.row}>
          {visibleRoutes.map((route) => {
            const { options } = descriptors[route.key];
            const isFocused = route.key === activeKey;

            if (route.name === "action") {
              return (
                <View key={route.key} style={styles.centerSlot}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Start workout"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    onPress={() => handleTabPress(route, isFocused)}
                    hitSlop={6}
                    style={styles.centerPressable}
                  >
                    {({ pressed }) => (
                      <View style={[styles.orbShadow, pressed && styles.centerPressed]}>
                        {/* Gradient ring */}
                        <View style={[styles.orbRing, isFocused && styles.orbRingActive]}>
                          {/* Dark glass core */}
                          <LinearGradient
                            colors={["#1E2F4D", "#0D1526", "#070B14"]}
                            start={{ x: 0.3, y: 0 }}
                            end={{ x: 0.7, y: 1 }}
                            style={styles.orbCore}
                          >
                            <LinearGradient
                              colors={["rgba(186,230,253,0.28)", "rgba(186,230,253,0)"]}
                              start={{ x: 0.5, y: 0 }}
                              end={{ x: 0.5, y: 0.55 }}
                              style={styles.centerSheen}
                            />
                            <CenterDumbbellIcon />
                          </LinearGradient>
                        </View>
                      </View>
                    )}
                  </Pressable>
                </View>
              );
            }

            const tintColor = isFocused ? ACCENT : INACTIVE;
            const rawLabel =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                  ? options.title
                  : route.name.charAt(0).toUpperCase() + route.name.slice(1);

            const icon =
              route.name === "nutrition" ? (
                <NutritionTabIcon color={tintColor} isFocused={isFocused} />
              ) : route.name === "progress" ? (
                <ProgressTabIcon color={tintColor} isFocused={isFocused} />
              ) : route.name === "profile" ? (
                <ProfileTabIcon color={tintColor} isFocused={isFocused} />
              ) : (
                <HomeTabIcon color={tintColor} isFocused={isFocused} />
              );

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={String(rawLabel)}
                onPress={() => handleTabPress(route, isFocused)}
                style={styles.tab}
              >
                {({ pressed }) => (
                  <View style={[styles.tabInner, pressed && styles.tabPressed]}>
                    {icon}
                    <Text
                      style={[styles.label, isFocused && styles.labelActive]}
                      numberOfLines={1}
                    >
                      {String(rawLabel)}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ==========================================
// CRAFTED VECTOR ICONOGRAPHY (24x24 Optical Grid)
// ==========================================

/** 1. Home Icon: Architectural Reploot Base */
function HomeTabIcon({
  color,
  isFocused,
}: {
  color: string;
  isFocused: boolean;
}) {
  return (
    <View style={styles.iconWrapper}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        {isFocused && (
          <Path
            d="M3 9.5L12 2.5L21 9.5V20C21 20.6 20.6 21 20 21H15V14.5C15 14.2 14.8 14 14.5 14H9.5C9.2 14 9 14.2 9 14.5V21H4C3.4 21 3 20.6 3 20V9.5Z"
            fill="rgba(56, 189, 248, 0.14)"
          />
        )}
        <Path
          d="M3 9.5L12 2.5L21 9.5V20C21 20.6 20.6 21 20 21H15V14.5C15 14.2 14.8 14 14.5 14H9.5C9.2 14 9 14.2 9 14.5V21H4C3.4 21 3 20.6 3 20V9.5Z"
          stroke={color}
          strokeWidth={isFocused ? 2.1 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M17.5 5.5V3H15.5V4"
          stroke={color}
          strokeWidth={isFocused ? 1.8 : 1.5}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

/** 2. Nutrition Icon: Stylized Apple with Leaf */
function NutritionTabIcon({
  color,
  isFocused,
}: {
  color: string;
  isFocused: boolean;
}) {
  return (
    <View style={styles.iconWrapper}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        {isFocused && (
          <Path
            d="M12 7.5C10.5 5.8 7.2 5.8 5.2 7.8C3.2 9.8 3.2 13.5 5.2 16.5C7.2 19.5 9.5 21 12 21C14.5 21 16.8 19.5 18.8 16.5C20.8 13.5 20.8 9.8 18.8 7.8C16.8 5.8 13.5 5.8 12 7.5Z"
            fill="rgba(56, 189, 248, 0.14)"
          />
        )}
        {/* Apple Silhouette */}
        <Path
          d="M12 7.5C10.5 5.8 7.2 5.8 5.2 7.8C3.2 9.8 3.2 13.5 5.2 16.5C7.2 19.5 9.5 21 12 21C14.5 21 16.8 19.5 18.8 16.5C20.8 13.5 20.8 9.8 18.8 7.8C16.8 5.8 13.5 5.8 12 7.5Z"
          stroke={color}
          strokeWidth={isFocused ? 2.1 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Apple Stem */}
        <Path
          d="M12 7V3.8C12 3.8 11.5 2.5 10.5 2.5"
          stroke={color}
          strokeWidth={isFocused ? 2 : 1.7}
          strokeLinecap="round"
        />
        {/* Dynamic Nutrition Leaf */}
        <Path
          d="M12.5 4C14.8 3.5 17.5 4.5 18 7C15.5 7.2 13 6 12.5 4Z"
          stroke={color}
          strokeWidth={isFocused ? 1.8 : 1.5}
          fill={isFocused ? color : "rgba(100, 116, 139, 0.3)"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

/** 3. Center Elevated Dumbbell: Photorealistic Raytraced 3D Hex Dumbbell (Left-to-Right orientation) */
function CenterDumbbellIcon() {
  return (
    <View style={styles.centerDumbbellContainer}>
      <Image
        source={require("../../../../assets/dumbbell_3d.png")}
        style={styles.dumbbell3dImage}
        resizeMode="contain"
      />
    </View>
  );
}

/** 4. Progress Icon: Athletic Telemetry Spline with XP Apex */
function ProgressTabIcon({
  color,
  isFocused,
}: {
  color: string;
  isFocused: boolean;
}) {
  return (
    <View style={styles.iconWrapper}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        {isFocused && (
          <Path
            d="M3 18L8.5 11.5L13.5 15.5L21 6V18H3Z"
            fill="rgba(56, 189, 248, 0.14)"
          />
        )}
        <Path
          d="M3 18L8.5 11.5L13.5 15.5L21 6"
          stroke={color}
          strokeWidth={isFocused ? 2.3 : 1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Nodes */}
        <Circle cx={3} cy={18} r={1.6} fill={color} />
        <Circle cx={8.5} cy={11.5} r={1.6} fill={color} />
        <Circle cx={13.5} cy={15.5} r={1.6} fill={color} />
        <Circle
          cx={21}
          cy={6}
          r={isFocused ? 2.4 : 2}
          fill={isFocused ? "#38BDF8" : color}
        />
      </Svg>
    </View>
  );
}

/** 5. Profile Icon: Biometric Athlete Pass Silhouette */
function ProfileTabIcon({
  color,
  isFocused,
}: {
  color: string;
  isFocused: boolean;
}) {
  return (
    <View style={styles.iconWrapper}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        {isFocused && (
          <>
            <Circle cx={12} cy={8} r={4} fill="rgba(56, 189, 248, 0.14)" />
            <Path
              d="M4.5 20.5C4.5 16.8 7.8 15 12 15C16.2 15 19.5 16.8 19.5 20.5H4.5Z"
              fill="rgba(56, 189, 248, 0.14)"
            />
          </>
        )}
        <Circle
          cx={12}
          cy={8}
          r={4}
          stroke={color}
          strokeWidth={isFocused ? 2.1 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M4.5 20.5C4.5 16.8 7.8 15 12 15C16.2 15 19.5 16.8 19.5 20.5"
          stroke={color}
          strokeWidth={isFocused ? 2.1 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {isFocused && (
          <Path
            d="M10.5 15L12 16.8L13.5 15"
            stroke="#38BDF8"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </Svg>
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SIDE_GAP,
    zIndex: 100,
  },
  underFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  island: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 18,
      },
      android: { elevation: 16 },
      default: { boxShadow: "0 12px 30px rgba(0,0,0,0.55)" } as any,
    }),
  },
  surface: {
    ...StyleSheet.absoluteFill,
    borderRadius: BAR_HEIGHT / 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(125,211,252,0.18)",
  },
  surfaceSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    height: "100%",
  },
  // Icon + label as one block, centred horizontally and vertically in the bar.
  tabInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },
  iconWrapper: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...typography.navLabel,
    color: INACTIVE,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  labelActive: {
    color: ACCENT,
  },

  // Centre workout button
  centerSlot: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  centerPressable: {
    position: "absolute",
    top: (BAR_HEIGHT - ORB) / 2 - LIFT,
    width: ORB,
    height: ORB,
    zIndex: 10,
  },
  orbShadow: {
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
      default: { boxShadow: "0 5px 16px rgba(56,189,248,0.4)" } as any,
    }),
  },
  // Single clean sky ring (the multi-colour gradient ring read muddy).
  orbRing: {
    flex: 1,
    borderRadius: ORB / 2,
    borderWidth: 2,
    borderColor: "rgba(56,189,248,0.6)",
    overflow: "hidden",
  },
  orbRingActive: {
    borderColor: "#7DD3FC",
  },
  orbCore: {
    flex: 1,
    borderRadius: ORB / 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  centerPressed: {
    transform: [{ scale: 0.93 }],
  },
  centerSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  centerDumbbellContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dumbbell3dImage: {
    width: 40,
    height: 40,
  },
});
