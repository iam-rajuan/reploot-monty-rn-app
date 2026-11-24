import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import {
  Activity,
  ArrowRight,
  ChevronRight,
  Dumbbell,
  Flame,
  LayoutGrid,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Line as SvgLine } from "react-native-svg";
import {
  DynamicWorkoutPathDetail,
  WORKOUT_PATH_DETAILS_MAP,
} from "../data/workoutPathDetailData";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedWorkoutCategory } from "@/store/slices/workoutSlice";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { GenericWorkoutDetailScreen } from "./GenericWorkoutDetailScreen";
import { WorkoutLibraryScreen } from "./WorkoutLibraryScreen";

const { width } = Dimensions.get("window");

export type WorkoutPathId =
  | "push"
  | "pull"
  | "chest"
  | "upper"
  | "lower"
  | "fullbody"
  | "library";

interface GymPathCardConfig {
  id: WorkoutPathId;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  arrowColor: string;
  iconBg: string;
  iconBorder: string;
  glowAura: string;
  icon: React.ReactNode;
}

export interface GymWorkoutPathScreenProps {
  onSelectPath?: (pathId: WorkoutPathId) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const GymWorkoutPathScreen: React.FC<GymWorkoutPathScreenProps> = ({
  onSelectPath,
  onBack,
  showBackButton = true,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{
    pathId?: string;
    split?: string;
    source?: string;
  }>();
  const reduxSelectedCategory = useAppSelector(
    (state) =>
      (state.workout?.selectedWorkoutCategory as WorkoutPathId) || "push"
  );

  const initialPath =
    (params.pathId as WorkoutPathId) ||
    (params.split as WorkoutPathId) ||
    null;

  const [activePath, setActivePath] = useState<WorkoutPathId | null>(initialPath);
  const lastParamRef = React.useRef<WorkoutPathId | null>(initialPath);

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/home");
    }
  };

  React.useEffect(() => {
    const target =
      (params.pathId as WorkoutPathId) || (params.split as WorkoutPathId) || null;
    if (target && target !== lastParamRef.current) {
      lastParamRef.current = target;
      setActivePath(target);
      dispatch(setSelectedWorkoutCategory(target));
    }
  }, [params.pathId, params.split, dispatch]);

  const handleDetailBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    // If opened via route params (e.g. from Calendar, Today's Missions, or Search), navigate back
    if (params.pathId || params.split) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/home");
      }
    } else {
      // If opened in-place from the gym path cards, return to the cards list
      setActivePath(null);
    }
  };

  React.useEffect(() => {
    try {
      navigation.setOptions({
        tabBarStyle: activePath ? { display: "none" } : undefined,
      });
    } catch {
      // ignore
    }
  }, [activePath, navigation]);

  const handleCardPress = (pathId: WorkoutPathId) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setActivePath(pathId);
    dispatch(setSelectedWorkoutCategory(pathId));

    if (onSelectPath) {
      onSelectPath(pathId);
    }
  };

  // If user selected Workout Library, open library screen
  if (activePath === "library") {
    return <WorkoutLibraryScreen onBack={() => setActivePath(null)} />;
  }

  // Dynamic Workout Handler: Use single common screen for Push, Pull, Chest, Upper, Lower, Full Body
  if (
    activePath &&
    (WORKOUT_PATH_DETAILS_MAP[activePath] || activePath === "chest")
  ) {
    return (
      <GenericWorkoutDetailScreen
        pathId={activePath}
        showFullExerciseLibrary={params.source !== "mission"}
        onBack={handleDetailBack}
      />
    );
  }

  const PATH_CARDS: GymPathCardConfig[] = [
    {
      id: "push",
      title: "PUSH DAY",
      subtitle: "Chest, Shoulders & Triceps focus",
      tag: "+50 XP",
      tagColor: "#C5C0FF",
      tagBg: "rgba(129, 140, 248, 0.15)",
      arrowColor: "#818CF8",
      iconBg: "rgba(108, 92, 255, 0.18)",
      iconBorder: "rgba(129, 140, 248, 0.35)",
      glowAura: "rgba(129, 140, 248, 0.12)",
      icon: <Zap size={20} color="#C5C0FF" />,
    },
    {
      id: "pull",
      title: "PULL DAY",
      subtitle: "Back, Biceps & Rear Delts focus",
      tag: "+50 XP",
      tagColor: "#38EDD8",
      tagBg: "rgba(56, 237, 216, 0.12)",
      arrowColor: "#38EDD8",
      iconBg: "rgba(56, 237, 216, 0.16)",
      iconBorder: "rgba(56, 237, 216, 0.35)",
      glowAura: "rgba(56, 237, 216, 0.12)",
      icon: <User size={20} color="#38EDD8" />,
    },
    {
      id: "chest",
      title: "CHEST DAY",
      subtitle: "Pectoral hypertrophy & density",
      tag: "+55 XP",
      tagColor: "#38EDD8",
      tagBg: "rgba(56, 237, 216, 0.12)",
      arrowColor: "#38EDD8",
      iconBg: "rgba(56, 237, 216, 0.16)",
      iconBorder: "rgba(56, 237, 216, 0.35)",
      glowAura: "rgba(56, 237, 216, 0.12)",
      icon: <Dumbbell size={20} color="#38EDD8" />,
    },
    {
      id: "upper",
      title: "UPPER BODY",
      subtitle: "Chest, Back, Arms & Delts",
      tag: "+60 XP",
      tagColor: "#C5C0FF",
      tagBg: "rgba(129, 140, 248, 0.15)",
      arrowColor: "#818CF8",
      iconBg: "rgba(108, 92, 255, 0.18)",
      iconBorder: "rgba(129, 140, 248, 0.35)",
      glowAura: "rgba(129, 140, 248, 0.12)",
      icon: <Dumbbell size={20} color="#C5C0FF" />,
    },
    {
      id: "lower",
      title: "LOWER BODY",
      subtitle: "Quads, Glutes, Calves & Hams",
      tag: "+60 XP",
      tagColor: "#38EDD8",
      tagBg: "rgba(56, 237, 216, 0.12)",
      arrowColor: "#38EDD8",
      iconBg: "rgba(56, 237, 216, 0.16)",
      iconBorder: "rgba(56, 237, 216, 0.35)",
      glowAura: "rgba(56, 237, 216, 0.12)",
      icon: <Activity size={20} color="#38EDD8" />,
    },
    {
      id: "fullbody",
      title: "FULL BODY",
      subtitle: "Total compound power & endurance",
      tag: "+75 XP",
      tagColor: "#C5C0FF",
      tagBg: "rgba(129, 140, 248, 0.15)",
      arrowColor: "#818CF8",
      iconBg: "rgba(108, 92, 255, 0.18)",
      iconBorder: "rgba(129, 140, 248, 0.35)",
      glowAura: "rgba(129, 140, 248, 0.12)",
      icon: <Flame size={20} color="#C5C0FF" />,
    },
    {
      id: "library",
      title: "LIBRARY",
      subtitle: "Browse all gym routine programs",
      tag: "EXPLORE",
      tagColor: "#38EDD8",
      tagBg: "rgba(56, 237, 216, 0.12)",
      arrowColor: "#38EDD8",
      iconBg: "rgba(56, 237, 216, 0.16)",
      iconBorder: "rgba(56, 237, 216, 0.35)",
      glowAura: "rgba(56, 237, 216, 0.12)",
      icon: <LayoutGrid size={20} color="#38EDD8" />,
    },
  ];

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <CustomHeader
        transparent={true}
        showBackButton={showBackButton}
        onPressBack={handleBack}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom + 100, 120),
          },
        ]}
      >
        {/* Keep the same clear, display-led hierarchy used on the Home tab. */}
        <View style={styles.titleSection}>
          <Text style={styles.categoryBadge}>GYM WORKOUT</Text>
          <Text style={styles.mainTitle} numberOfLines={1} adjustsFontSizeToFit>
            CHOOSE YOUR PATH
          </Text>
          <Text style={styles.subtitle}>
            Pick a focus and build today&apos;s session around it.
          </Text>
        </View>

        <Pressable
          style={styles.rankingLink}
          onPress={() =>
            router.push({
              pathname: "/profile/global-rankings" as any,
              params: { context: "gym" },
            })
          }
        >
          <View style={styles.rankingIcon}>
            <TrendingUp size={18} color="#54E6CF" />
          </View>
          <View style={styles.rankingCopy}>
            <Text style={styles.rankingLinkTitle}>GYM CHALLENGE RANKING</Text>
            <Text style={styles.rankingLinkBody}>
              See your position and challenge scores
            </Text>
          </View>
          <ChevronRight size={18} color="#8E9AB4" />
        </Pressable>

        {/* 2-Column Workout Path Cards Grid matching screenshot */}
        <View style={styles.cardsGrid}>
          {PATH_CARDS.map((item) => (
            <Pressable
              key={item.id}
              style={styles.card}
              onPress={() => handleCardPress(item.id)}
            >
              {/* Restrained accent tint keeps every focus recognisable without visual noise. */}
              <View
                style={[styles.glowAura, { backgroundColor: item.glowAura }]}
                pointerEvents="none"
              />

              {/* Card Top Row: Icon Badge + XP Pill */}
              <View style={styles.cardTopRow}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: item.iconBg,
                      borderColor: item.iconBorder,
                    },
                  ]}
                >
                  {item.icon}
                </View>

                <View style={[styles.tagPill, { backgroundColor: item.tagBg }]}>
                  <Text style={[styles.tagText, { color: item.tagColor }]}>
                    {item.tag}
                  </Text>
                </View>
              </View>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <ArrowRight size={17} color={item.arrowColor} />
              </View>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#070A11",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  titleSection: {
    marginBottom: 22,
    marginTop: 8,
  },
  categoryBadge: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    letterSpacing: 1.5,
    fontFamily: "JetBrainsMono_700Bold",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  mainTitle: {
    color: "#F6F8FF",
    fontSize: 33,
    lineHeight: 40,
    fontWeight: "900",
    fontFamily: Platform.select({ android: "sans-serif-black", ios: "System" }),
    letterSpacing: -0.8,
    textAlign: "left",
    textTransform: "uppercase",
    textShadowColor: "rgba(120, 145, 255, 0.2)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "JetBrainsMono_500Medium",
    fontWeight: "500",
    marginTop: 4,
  },

  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  rankingLink: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(84, 230, 207, 0.22)",
    backgroundColor: "#0B2025",
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 20,
  },
  rankingIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(84, 230, 207, 0.11)",
    borderWidth: 1,
    borderColor: "rgba(84, 230, 207, 0.2)",
  },
  rankingCopy: { flex: 1, marginLeft: 11 },
  rankingLinkTitle: {
    color: "#F4F7FF",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    fontFamily: "JetBrainsMono_700Bold",
    letterSpacing: 0.7,
  },
  rankingLinkBody: {
    color: "#8E9AB4",
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "JetBrainsMono_500Medium",
    marginTop: 2,
  },
  card: {
    width: (width - 54) / 2,
    height: 184,
    backgroundColor: "#111827",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(122, 146, 199, 0.19)",
    padding: 14,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  glowAura: {
    position: "absolute",
    bottom: -38,
    right: -38,
    width: 118,
    height: 118,
    borderRadius: 50,
    opacity: 0.5,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 9,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 5,
  },
  cardTitle: {
    color: "#F6F8FF",
    fontSize: 13,
    fontFamily: "JetBrainsMono_700Bold",
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  cardSubtitle: {
    color: "#91A0B9",
    fontSize: 10,
    lineHeight: 15,
    fontFamily: "JetBrainsMono_500Medium",
    fontWeight: "500",
  },
});
