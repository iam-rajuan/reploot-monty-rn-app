import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";

export function CustomBottomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const handleTabPress = (
    route: (typeof state.routes)[number],
    isFocused: boolean,
  ) => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      if (Platform.OS !== "web") {
        try {
          Haptics.impactAsync(
            route.name === "action"
              ? Haptics.ImpactFeedbackStyle.Medium
              : Haptics.ImpactFeedbackStyle.Light
          );
        } catch {
          // ignore
        }
      }
      navigation.navigate(route.name);
    }
  };

  // Hide tab bar if active screen requests tabBarStyle: { display: "none" }
  const currentRoute = state.routes[state.index];
  const currentDescriptor = descriptors[currentRoute?.key];
  const tabBarStyle = currentDescriptor?.options?.tabBarStyle as any;
  if (tabBarStyle?.display === "none") {
    return null;
  }

  // Safe bottom padding for navigation gesture pill
  const bottomInset =
    Platform.OS === "web" ? 12 : Math.max(insets.bottom + 4, 16);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.rootWrapper, { paddingBottom: bottomInset }]}
    >
      {/* Background Tab Bar Surface */}
      <View style={styles.barSurface} pointerEvents="none">
        <LinearGradient
          colors={["#11172A", "#0B0E1B", "#060810"]}
          locations={[0, 0.45, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.barSurfaceGradient}
        />
        {/* Subtle Specular Ambient Top Beam */}
        <LinearGradient
          colors={["rgba(56, 189, 248, 0.12)", "transparent"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.6 }}
          style={styles.barTopAmbientLight}
        />
      </View>

      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          if (
            (options.tabBarItemStyle as any)?.display === "none" ||
            (options as any).href === null
          ) {
            return null;
          }

          const isFocused = state.index === index;
          const isCenterAction = route.name === "action";

          // 1. Center Action: Kinetic Workout Launcher
          if (isCenterAction) {
            return (
              <View key={route.key} style={styles.centerButtonOuterContainer}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Start Workout"
                  onPress={() => handleTabPress(route, isFocused)}
                  style={styles.centerButtonPressable}
                >
                  {({ pressed }) => (
                    <View
                      style={[
                        styles.centerButtonInner,
                        pressed && styles.centerButtonPressed,
                      ]}
                    >
                      {/* Outer Cyber Glow Ambient */}
                      <View style={styles.centerOuterAura} />

                      {/* Concentric Bezel Ring with metallic highlight */}
                      <View
                        style={[
                          styles.centerBezelRing,
                          isFocused && styles.centerBezelRingActive,
                        ]}
                      >
                        {/* Multi-Stop Linear Gradient Power Capsule */}
                        <LinearGradient
                          colors={["#4F46E5", "#0284C7", "#0EA5E9", "#2DD4BF"]}
                          locations={[0, 0.35, 0.7, 1]}
                          start={{ x: 0.1, y: 0.05 }}
                          end={{ x: 0.9, y: 0.95 }}
                          style={styles.centerGradientCircle}
                        >
                          <CenterDumbbellIcon />
                        </LinearGradient>
                      </View>
                    </View>
                  )}
                </Pressable>
              </View>
            );
          }

          // 2. Standard Tab Items: Home, Nutrition, Progress, Profile
          const activeColor = "#38BDF8";
          const inactiveColor = "#64748B";
          const tintColor = isFocused ? activeColor : inactiveColor;

          const renderIcon = () => {
            switch (route.name) {
              case "home":
                return <HomeTabIcon color={tintColor} isFocused={isFocused} />;
              case "nutrition":
                return (
                  <NutritionTabIcon color={tintColor} isFocused={isFocused} />
                );
              case "progress":
                return (
                  <ProgressTabIcon color={tintColor} isFocused={isFocused} />
                );
              case "profile":
                return (
                  <ProfileTabIcon color={tintColor} isFocused={isFocused} />
                );
              default:
                return <HomeTabIcon color={tintColor} isFocused={isFocused} />;
            }
          };

          const rawLabel =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name.charAt(0).toUpperCase() + route.name.slice(1);

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={String(rawLabel)}
              onPress={() => handleTabPress(route, isFocused)}
              style={styles.tabPressable}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.tabItem,
                    pressed && styles.tabItemPressed,
                  ]}
                >
                  <View style={styles.iconContainer}>
                    {renderIcon()}
                  </View>

                  <Text
                    style={[
                      styles.tabLabel,
                      { color: tintColor },
                      isFocused && styles.activeTabLabel,
                    ]}
                    numberOfLines={1}
                  >
                    {String(rawLabel).toUpperCase()}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ==========================================
// CRAFTED VECTOR ICONOGRAPHY (24x24 Optical Grid)
// ==========================================

/** 1. Home Icon: Architectural Kinetic Base */
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

/** 2. Nutrition Icon: Precision Chef Cutlery Pair */
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
          <>
            <Path
              d="M6 3V8C6 9.7 7.3 11 9 11C10.7 11 12 9.7 12 8V3H6Z"
              fill="rgba(56, 189, 248, 0.14)"
            />
            <Path
              d="M18 3C15.8 3 14.5 4.8 14.5 8V12H18V3Z"
              fill="rgba(56, 189, 248, 0.14)"
            />
          </>
        )}
        {/* Fork */}
        <Path
          d="M6 3V8C6 9.7 7.3 11 9 11C10.7 11 12 9.7 12 8V3"
          stroke={color}
          strokeWidth={isFocused ? 2.1 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M9 3V7"
          stroke={color}
          strokeWidth={isFocused ? 2.1 : 1.8}
          strokeLinecap="round"
        />
        <Path
          d="M9 11V21"
          stroke={color}
          strokeWidth={isFocused ? 2.1 : 1.8}
          strokeLinecap="round"
        />
        {/* Knife */}
        <Path
          d="M18 3C15.8 3 14.5 4.8 14.5 8V12H18V21"
          stroke={color}
          strokeWidth={isFocused ? 2.1 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

/** 3. Center Elevated Dumbbell: Titanium Isometric Silhouette */
function CenterDumbbellIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <G transform="rotate(-45 14 14)">
        {/* Steel Handle Bar */}
        <Rect x={12.5} y={3.8} width={3} height={20.4} rx={1.5} fill="#FFFFFF" />
        {/* Grip Accent Lines */}
        <Rect
          x={12.5}
          y={11.5}
          width={3}
          height={1.2}
          fill="rgba(2, 132, 199, 0.7)"
        />
        <Rect
          x={12.5}
          y={13.9}
          width={3}
          height={1.2}
          fill="rgba(2, 132, 199, 0.7)"
        />
        <Rect
          x={12.5}
          y={16.3}
          width={3}
          height={1.2}
          fill="rgba(2, 132, 199, 0.7)"
        />

        {/* Top Heavy Outer Plate */}
        <Rect x={7} y={6.5} width={14} height={3.6} rx={1.6} fill="#FFFFFF" />
        {/* Top Outer Plate Highlight */}
        <Rect
          x={8.5}
          y={7.1}
          width={11}
          height={0.9}
          rx={0.45}
          fill="rgba(255, 255, 255, 0.85)"
        />
        {/* Top Outer End Cap */}
        <Rect x={9} y={3.5} width={10} height={2.5} rx={1.2} fill="#FFFFFF" />

        {/* Bottom Heavy Outer Plate */}
        <Rect x={7} y={17.9} width={14} height={3.6} rx={1.6} fill="#FFFFFF" />
        {/* Bottom Outer Plate Highlight */}
        <Rect
          x={8.5}
          y={18.5}
          width={11}
          height={0.9}
          rx={0.45}
          fill="rgba(255, 255, 255, 0.85)"
        />
        {/* Bottom Outer End Cap */}
        <Rect x={9} y={22} width={10} height={2.5} rx={1.2} fill="#FFFFFF" />
      </G>
    </Svg>
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
  rootWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    zIndex: 100,
  },
  barSurface: {
    position: "absolute",
    top: 14,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#080B14",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1.2,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: "rgba(56, 189, 248, 0.18)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 20,
    overflow: "hidden",
  },
  barSurfaceGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  barTopAmbientLight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    height: 60,
    marginTop: 14,
  },
  tabPressable: {
    flex: 1,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  tabItem: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  tabItemPressed: {
    opacity: 0.75,
  },
  iconContainer: {
    width: 28,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconWrapper: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 9.5,
    lineHeight: 12,
    textAlign: "center",
    alignSelf: "center",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontWeight: "700",
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  activeTabLabel: {
    fontWeight: "800",
    color: "#38BDF8",
  },
  centerButtonOuterContainer: {
    flex: 1,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  centerButtonPressable: {
    top: -18,
    width: 66,
    height: 66,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  centerButtonInner: {
    width: 66,
    height: 66,
    alignItems: "center",
    justifyContent: "center",
  },
  centerButtonPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.92,
  },
  centerOuterAura: {
    position: "absolute",
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(2, 132, 199, 0.22)",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  centerBezelRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#070A12",
    borderWidth: 3.5,
    borderColor: "rgba(56, 189, 248, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 16,
  },
  centerBezelRingActive: {
    borderColor: "#38BDF8",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.85,
    shadowRadius: 18,
    elevation: 20,
  },
  centerGradientCircle: {
    width: 51,
    height: 51,
    borderRadius: 25.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
