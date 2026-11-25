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
  ScrollView,
  TouchableOpacity,
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
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

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

const CARD_ACCENT = "#38BDF8";
const CARD_ACCENT_SOFT = "#7DD3FC";
const CARD_ACCENT_BACKGROUND = "rgba(56, 189, 248, 0.10)";
const CARD_ACCENT_BORDER = "rgba(56, 189, 248, 0.25)";
const SURFACE_WASH = [
  "rgba(56,189,248,0.12)",
  "rgba(139,92,246,0.06)",
  "rgba(255,255,255,0.02)",
] as const;

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
      <ScreenBackground />
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
          {PATH_CARDS.map((item) => {
            const isLibrary = item.id === "library";
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}: ${item.subtitle}`}
                style={[styles.card, isLibrary && styles.libraryCard]}
                onPress={() => handleCardPress(item.id)}
              >
                <LinearGradient
                  colors={SURFACE_WASH}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />

                {isLibrary ? (
                  <View style={styles.libraryRow}>
                    <View style={styles.iconBox}>{item.icon}</View>
                    <View style={styles.libraryCopy}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardSubtitle} numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                    </View>
                    <View style={styles.arrowCircle}>
                      <ArrowRight size={15} color={CARD_ACCENT_SOFT} strokeWidth={2.5} />
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={styles.cardTopRow}>
                      <View style={styles.iconBox}>{item.icon}</View>
                      <View style={styles.tagPill}>
                        <Text style={styles.tagText}>{item.tag}</Text>
                      </View>
                    </View>
                    <View style={styles.cardBottom}>
                      <View style={styles.titleRow}>
                        <Text
                          style={styles.cardTitle}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.85}
                        >
                          {item.title}
                        </Text>
                        <View style={styles.arrowCircle}>
                          <ArrowRight size={13} color={CARD_ACCENT_SOFT} strokeWidth={2.5} />
                        </View>
                      </View>
                      <Text style={styles.cardSubtitle} numberOfLines={2}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#060810",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  titleSection: {
    marginTop: 4,
    marginBottom: 20,
    gap: 4,
  },
  categoryBadge: {
    ...typography.overline,
    fontSize: 11,
    lineHeight: 16,
    color: CARD_ACCENT_SOFT,
  },
  mainTitle: {
    ...typography.pageTitle,
    color: "#F6F8FF",
  },
  subtitle: {
    ...typography.body,
    color: "#94A3B8",
  },

  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  card: {
    width: (width - 54) / 2,
    height: 164,
    backgroundColor: "#111A25",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    padding: 14,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  libraryCard: {
    width: "100%",
    height: "auto",
    paddingVertical: 14,
  },
  libraryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  libraryCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: CARD_ACCENT_BACKGROUND,
    borderColor: CARD_ACCENT_BORDER,
  },
  tagPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: CARD_ACCENT_BACKGROUND,
    borderWidth: 1,
    borderColor: CARD_ACCENT_BORDER,
  },
  tagText: {
    ...typography.badge,
    color: CARD_ACCENT_SOFT,
  },
  cardBottom: {
    gap: 5,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
  },
  cardTitle: {
    ...typography.cardTitle,
    fontSize: 13,
    lineHeight: 18,
    color: "#F8FAFC",
    letterSpacing: 0.1,
    textTransform: "uppercase",
    flexShrink: 1,
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD_ACCENT_BACKGROUND,
  },
  cardSubtitle: {
    ...typography.caption,
    color: "#8B9AB0",
  },
});
