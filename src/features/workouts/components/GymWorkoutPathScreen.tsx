import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  ArrowRight,
  BicepsFlexed,
  Dumbbell,
  Footprints,
  LibraryBig,
  PersonStanding,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/shared/components/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Line, Path } from "react-native-svg";
import {
  DynamicWorkoutPathDetail,
  WORKOUT_PATH_DETAILS_MAP,
} from "../data/workoutPathDetailData";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedWorkoutCategory } from "@/store/slices/workoutSlice";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { GenericWorkoutDetailScreen } from "./GenericWorkoutDetailScreen";
import { WorkoutLibraryScreen } from "./WorkoutLibraryScreen";
import { typography } from "@/theme/typography";

const { width } = Dimensions.get("window");

export type WorkoutPathId =
  "push" | "pull" | "chest" | "upper" | "lower" | "fullbody" | "library";

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
  icon: React.ReactNode;
}

const CARD_ACCENT = "#25D7E8";
const CARD_ACCENT_SOFT = "#8CECF4";
const CARD_ACCENT_BACKGROUND = "rgba(37, 215, 232, 0.11)";
const CARD_ACCENT_BORDER = "rgba(37, 215, 232, 0.28)";

const GymPushIcon = () => (
  <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="10" r="2" stroke={CARD_ACCENT} strokeWidth="1.7" />
    <Path
      d="M12 12.5v7M9 21l3-1.5 3 1.5M9.8 13.5 7 9V5.5M14.2 13.5 17 9V5.5"
      stroke={CARD_ACCENT}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="3" y1="4" x2="21" y2="4" stroke={CARD_ACCENT} strokeWidth="1.7" />
    <Line
      x1="5"
      y1="2.5"
      x2="5"
      y2="5.5"
      stroke={CARD_ACCENT}
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <Line
      x1="19"
      y1="2.5"
      x2="19"
      y2="5.5"
      stroke={CARD_ACCENT}
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </Svg>
);

const GymPullIcon = () => (
  <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4h16M5 4l4 5M19 4l-4 5M9 9l1.5 2M15 9l-1.5 2"
      stroke={CARD_ACCENT}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="13" r="2" stroke={CARD_ACCENT} strokeWidth="1.7" />
    <Path
      d="M12 15.5V21M8.5 21h7"
      stroke={CARD_ACCENT}
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </Svg>
);

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
      (state.workout?.selectedWorkoutCategory as WorkoutPathId) || "push",
  );

  const initialPath =
    (params.pathId as WorkoutPathId) || (params.split as WorkoutPathId) || null;

  const [activePath, setActivePath] = useState<WorkoutPathId | null>(
    initialPath,
  );
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
      (params.pathId as WorkoutPathId) ||
      (params.split as WorkoutPathId) ||
      null;
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
      tagColor: CARD_ACCENT_SOFT,
      tagBg: CARD_ACCENT_BACKGROUND,
      arrowColor: CARD_ACCENT,
      iconBg: CARD_ACCENT_BACKGROUND,
      iconBorder: CARD_ACCENT_BORDER,
      icon: <GymPushIcon />,
    },
    {
      id: "pull",
      title: "PULL DAY",
      subtitle: "Back, Biceps & Rear Delts focus",
      tag: "+50 XP",
      tagColor: CARD_ACCENT_SOFT,
      tagBg: CARD_ACCENT_BACKGROUND,
      arrowColor: CARD_ACCENT,
      iconBg: CARD_ACCENT_BACKGROUND,
      iconBorder: CARD_ACCENT_BORDER,
      icon: <GymPullIcon />,
    },
    {
      id: "chest",
      title: "CHEST DAY",
      subtitle: "Pectoral hypertrophy & density",
      tag: "+55 XP",
      tagColor: CARD_ACCENT_SOFT,
      tagBg: CARD_ACCENT_BACKGROUND,
      arrowColor: CARD_ACCENT,
      iconBg: CARD_ACCENT_BACKGROUND,
      iconBorder: CARD_ACCENT_BORDER,
      icon: <Dumbbell size={21} strokeWidth={1.9} color={CARD_ACCENT} />,
    },
    {
      id: "upper",
      title: "UPPER BODY",
      subtitle: "Chest, Back, Arms & Delts",
      tag: "+60 XP",
      tagColor: CARD_ACCENT_SOFT,
      tagBg: CARD_ACCENT_BACKGROUND,
      arrowColor: CARD_ACCENT,
      iconBg: CARD_ACCENT_BACKGROUND,
      iconBorder: CARD_ACCENT_BORDER,
      icon: <BicepsFlexed size={21} strokeWidth={1.9} color={CARD_ACCENT} />,
    },
    {
      id: "lower",
      title: "LOWER BODY",
      subtitle: "Quads, Glutes, Calves & Hams",
      tag: "+60 XP",
      tagColor: CARD_ACCENT_SOFT,
      tagBg: CARD_ACCENT_BACKGROUND,
      arrowColor: CARD_ACCENT,
      iconBg: CARD_ACCENT_BACKGROUND,
      iconBorder: CARD_ACCENT_BORDER,
      icon: <Footprints size={21} strokeWidth={1.9} color={CARD_ACCENT} />,
    },
    {
      id: "fullbody",
      title: "FULL BODY",
      subtitle: "Total compound power & endurance",
      tag: "+75 XP",
      tagColor: CARD_ACCENT_SOFT,
      tagBg: CARD_ACCENT_BACKGROUND,
      arrowColor: CARD_ACCENT,
      iconBg: CARD_ACCENT_BACKGROUND,
      iconBorder: CARD_ACCENT_BORDER,
      icon: <PersonStanding size={21} strokeWidth={1.9} color={CARD_ACCENT} />,
    },
    {
      id: "library",
      title: "LIBRARY",
      subtitle: "Browse all gym routine programs",
      tag: "EXPLORE",
      tagColor: CARD_ACCENT_SOFT,
      tagBg: CARD_ACCENT_BACKGROUND,
      arrowColor: CARD_ACCENT,
      iconBg: CARD_ACCENT_BACKGROUND,
      iconBorder: CARD_ACCENT_BORDER,
      icon: <LibraryBig size={21} strokeWidth={1.9} color={CARD_ACCENT} />,
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

        {/* 2-Column Workout Path Cards Grid matching screenshot */}
        <View style={styles.cardsGrid}>
          {PATH_CARDS.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.card, item.id === "library" && styles.libraryCard]}
              onPress={() => handleCardPress(item.id)}
            >
              {/* Restrained accent tint keeps every focus recognisable without visual noise. */}
              <LinearGradient
                colors={[
                  "rgba(37, 215, 232, 0)",
                  "rgba(37, 215, 232, 0)",
                  "rgba(37, 215, 232, 0.025)",
                  "rgba(37, 215, 232, 0.09)",
                ]}
                locations={[0, 0.34, 0.64, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
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
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  mainTitle: {
    ...typography.pageTitle,
    color: "#F6F8FF",
    textShadowColor: "rgba(37, 215, 232, 0.12)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    marginTop: 4,
  },

  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  card: {
    width: (width - 54) / 2,
    height: 184,
    backgroundColor: "#111827",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(86, 130, 166, 0.22)",
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
  libraryCard: {
    width: "100%",
  },
  cardGradient: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
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
    fontWeight: "700",
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
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  cardSubtitle: {
    color: "#91A0B9",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "500",
  },
});
