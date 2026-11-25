import { useAppSelector } from "@/store/hooks";
import * as Haptics from "expo-haptics";
import { Image, ImageSource } from "expo-image";
import {
  Check,
  Play,
  RefreshCw,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DraggableFlatList, {
  ScaleDecorator,
  useNestableScrollContainerContext,
  type RenderItemParams,
} from "react-native-draggable-flatlist";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  Platform,
  Pressable,
  type LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Text } from "@/shared/components/typography";
import { PushDayExercise } from "../data/pushDayData";
import { WorkoutExerciseItem } from "../data/workoutPathDetailData";

const ITEM_GAP = 12;
const SECTION_DIVIDER_HEIGHT = 48;
const SECTION_CROSSING_OFFSET = SECTION_DIVIDER_HEIGHT - ITEM_GAP;
const FALLBACK_CARD_HEIGHT = 92;
const REGULAR_SECTION_ID = "__regular-exercises-section__";

type ExerciseListEntry =
  | PushDayExercise
  | WorkoutExerciseItem
  | { id: typeof REGULAR_SECTION_ID; type: "section" };

const REGULAR_SECTION_ENTRY = {
  id: REGULAR_SECTION_ID,
  type: "section",
} as const;

const isSectionEntry = (
  entry: ExerciseListEntry,
): entry is typeof REGULAR_SECTION_ENTRY => entry.id === REGULAR_SECTION_ID;

interface SectionBoundaryDecoratorProps {
  index: number;
  animationValues: any;
  children: React.ReactNode;
}

const SectionBoundaryDecorator = ({
  index,
  animationValues,
  children,
}: SectionBoundaryDecoratorProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    if (!animationValues) {
      return { transform: [{ translateY: 0 }] };
    }

    const activeIndex = animationValues.activeIndexAnim.value;
    const destinationIndex = animationValues.spacerIndexAnim.value;
    let boundaryOffset = 0;

    if (index === 7 && activeIndex >= 9 && destinationIndex <= 7) {
      boundaryOffset = SECTION_CROSSING_OFFSET;
    } else if (index === 9 && activeIndex <= 7 && destinationIndex >= 9) {
      boundaryOffset = -SECTION_CROSSING_OFFSET;
    }

    return {
      // Keep this directly coupled to the drag position. Starting a new timing
      // animation for every spacer update makes the boundary trail the finger.
      transform: [{ translateY: boundaryOffset }],
    };
  }, [animationValues, index]);

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

const StationarySectionHeader = ({
  animationValues,
}: {
  animationValues: any;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    if (!animationValues) return { transform: [{ translateY: 0 }] };

    const activeIndex = animationValues.activeIndexAnim.value;
    const destinationIndex = animationValues.spacerIndexAnim.value;
    let counterOffset = 0;

    if (activeIndex <= 7 && destinationIndex >= 9) {
      counterOffset = animationValues.activeCellSize.value;
    } else if (activeIndex >= 9 && destinationIndex <= 7) {
      counterOffset = -animationValues.activeCellSize.value;
    }

    return {
      // This spacer is invisible, so a spring only adds UI-thread work and
      // delays the visible cards from reaching their destination.
      transform: [{ translateY: counterOffset }],
    };
  }, [animationValues]);

  return <Animated.View style={[styles.sectionSpacer, animatedStyle]} />;
};

export interface PushDayExerciseCardProps {
  exercise?: PushDayExercise | WorkoutExerciseItem;
  index?: string;
  title?: string;
  subtitle?: string;
  targetMuscle?: string;
  image?: ImageSource | number | string;
  isCompleted?: boolean;
  onSwipeStart?: () => void;
  onSwipeOpen?: (closeActiveRow: () => void) => void;
  onSwipeClose?: () => void;
  onPress?: () => void;
  onReplace?: () => void;
  onDelete?: () => void;
  onLongPress?: () => void;
  isDragging?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const PushDayExerciseCard: React.FC<PushDayExerciseCardProps> =
  React.memo(
    ({
      exercise,
      index = exercise?.index,
      title = exercise?.title,
      subtitle = exercise?.subtitle,
      targetMuscle = (exercise as WorkoutExerciseItem)?.targetMuscle,
      image = exercise?.image,
      isCompleted = false,
      onSwipeStart,
      onSwipeOpen,
      onSwipeClose,
      onPress,
      onReplace,
      onDelete,
      onLongPress,
      isDragging = false,
      style,
      testID,
    }) => {
      const hasActions = Boolean(onReplace || onDelete);
      const nestableContext = useNestableScrollContainerContext();
      const scrollableRef = nestableContext?.scrollableRef;
      const xpReward = exercise?.xp ?? "+40 XP";
      const actionDrawerWidth = (onReplace ? 68 : 0) + (onDelete ? 68 : 0) + 8;

      const swipeableRef = useRef<SwipeableMethods | null>(null);
      const isOpenRef = useRef(false);

      const closeRow = (callback?: () => void) => {
        swipeableRef.current?.close();
        callback?.();
      };

      const handleCardPress = () => {
        if (isOpenRef.current) {
          closeRow();
          return;
        }
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {},
          );
        }
        onPress?.();
      };

      const handleReplacePress = () => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
            () => {},
          );
        }
        closeRow(() => {
          onReplace?.();
        });
      };

      const handleDeletePress = () => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
            () => {},
          );
        }
        closeRow(() => {
          onDelete?.();
        });
      };

      const cardContent = (
        <View style={styles.animatedCardContainer}>
          <Pressable
            onPress={handleCardPress}
            onLongPress={onLongPress}
            delayLongPress={350}
            style={[
              styles.exerciseCard,
              isCompleted && styles.exerciseCardCompleted,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${title}, ${isCompleted ? "Completed" : subtitle}`}
          >
            {/* Exercise Thumbnail */}
            <View style={styles.thumbnailWrapper}>
              {image && (
                <Image
                  source={image}
                  style={[
                    styles.thumbnailImage,
                    isCompleted && styles.thumbnailImageCompleted,
                  ]}
                  contentFit="cover"
                />
              )}
              {index ? (
                <View
                  style={[
                    styles.indexBadge,
                    isCompleted && styles.indexBadgeCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.indexBadgeText,
                      isCompleted && styles.indexBadgeTextCompleted,
                    ]}
                  >
                    {index}
                  </Text>
                </View>
              ) : null}

              {isCompleted && (
                <View style={styles.thumbnailCheckBadge}>
                  <Check size={11} color="#38EDD8" strokeWidth={3.5} />
                </View>
              )}
            </View>

            {/* Title & Sets/Reps */}
            <View style={styles.exerciseTextContainer}>
              <Text
                style={[
                  styles.exerciseTitle,
                  isCompleted && styles.exerciseTitleCompleted,
                ]}
                numberOfLines={2}
              >
                {title}
              </Text>

              <View style={styles.exerciseMetaRow}>
                {isCompleted ? (
                  <View style={styles.completedStatusRow}>
                    <View style={styles.completedDot} />
                    <Text style={styles.completedStatusText}>COMPLETED</Text>
                  </View>
                ) : (
                  <Text style={styles.exerciseSubtitle} numberOfLines={1}>
                    {subtitle}
                  </Text>
                )}
                <View style={styles.xpReward}>
                  <Zap size={11} color="#79F0DD" strokeWidth={2.5} />
                  <Text style={styles.xpRewardText}>{xpReward}</Text>
                </View>
              </View>
            </View>

            {/* Resting State Action Indicator (Play Button or Completed Checkmark) */}
            <View style={styles.restingActionContainer}>
              {isCompleted ? (
                <View style={styles.completedCheckCircle}>
                  <Check size={16} color="#38EDD8" strokeWidth={3.2} />
                </View>
              ) : (
                <View style={styles.playButton}>
                  <Play
                    size={13}
                    color="rgba(255, 255, 255, 0.85)"
                    fill="rgba(255, 255, 255, 0.85)"
                    style={styles.playIcon}
                  />
                </View>
              )}
            </View>
          </Pressable>
        </View>
      );

      if (!hasActions) {
        return (
          <View style={[styles.cardWrapper, style]} testID={testID}>
            {cardContent}
          </View>
        );
      }

      return (
        <ReanimatedSwipeable
          ref={swipeableRef}
          enabled={hasActions && !isDragging}
          simultaneousWithExternalGesture={scrollableRef}
          friction={1.5}
          rightThreshold={actionDrawerWidth * 0.32}
          dragOffsetFromRightEdge={8}
          overshootRight={false}
          containerStyle={[styles.cardWrapper, style]}
          renderRightActions={() => (
            <View
              style={[
                styles.revealedActionsBackground,
                { width: actionDrawerWidth },
              ]}
            >
              {onReplace ? (
                <Pressable
                  onPress={handleReplacePress}
                  style={({ pressed }) => [
                    styles.actionItemCol,
                    pressed && styles.actionItemColPressed,
                  ]}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Replace ${title}`}
                >
                  <View style={styles.replaceCircleBtn}>
                    <RefreshCw size={18} color="#FFFFFF" strokeWidth={2.4} />
                  </View>
                  <Text style={styles.replaceActionLabel}>Replace</Text>
                </Pressable>
              ) : null}

              {onDelete ? (
                <Pressable
                  onPress={handleDeletePress}
                  style={({ pressed }) => [
                    styles.actionItemCol,
                    pressed && styles.actionItemColPressed,
                  ]}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${title}`}
                >
                  <View style={styles.deleteCircleBtn}>
                    <Trash2 size={18} color="#FFFFFF" strokeWidth={2.4} />
                  </View>
                  <Text style={styles.deleteActionLabel}>Delete</Text>
                </Pressable>
              ) : null}
            </View>
          )}
          onSwipeableOpenStartDrag={(direction) => {
            if (direction === "left") onSwipeStart?.();
          }}
          onSwipeableWillOpen={(direction) => {
            if (direction !== "left") return;
            isOpenRef.current = true;
            // Reset the previously active row instantly so this new swipe can
            // take over without waiting for another row's close animation.
            onSwipeOpen?.(() => swipeableRef.current?.reset());
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {},
              );
            }
          }}
          onSwipeableWillClose={() => {
            isOpenRef.current = false;
            onSwipeClose?.();
          }}
          testID={testID}
        >
          {cardContent}
        </ReanimatedSwipeable>
      );
    },
  );

export interface PushDayExerciseListProps {
  exercises: (PushDayExercise | WorkoutExerciseItem)[];
  completedExerciseIds?: string[];
  showRecommendationSections?: boolean;
  onExercisePress?: (exercise: PushDayExercise | WorkoutExerciseItem) => void;
  onReplaceExercise?: (exerciseId: string) => void;
  onDeleteExercise?: (exerciseId: string) => void;
  onReorderExercises?: (orderedExerciseIds: string[]) => void;
  /** @deprecated Drag state remains on the UI thread to avoid screen re-renders. */
  onDragStateChange?: (isDragging: boolean) => void;
  style?: StyleProp<ViewStyle>;
  ListHeaderComponent?: React.ReactElement | null;
  ListFooterComponent?: React.ReactElement | null;
}

export const PushDayExerciseList: React.FC<PushDayExerciseListProps> = ({
  exercises,
  completedExerciseIds: propCompletedIds,
  showRecommendationSections = false,
  onExercisePress,
  onReplaceExercise,
  onDeleteExercise,
  onReorderExercises,
  onDragStateChange,
  style,
  ListHeaderComponent,
  ListFooterComponent,
}) => {
  const activeSwipeCloserRef = useRef<(() => void) | null>(null);
  const isDraggingRef = useRef(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [cardHeight, setCardHeight] = useState(FALLBACK_CARD_HEIGHT);
  const [displayExercises, setDisplayExercises] = useState(exercises);
  const [dragAnimationValues, setDragAnimationValues] = useState<any>(null);

  useEffect(() => {
    if (!isDraggingRef.current) {
      setDisplayExercises(exercises);
    }
  }, [exercises]);

  const handleCardLayout = useCallback((event: LayoutChangeEvent) => {
    const measuredHeight = event.nativeEvent.layout.height;
    if (measuredHeight > 0) {
      setCardHeight((currentHeight) =>
        Math.abs(currentHeight - measuredHeight) > 0.5
          ? measuredHeight
          : currentHeight,
      );
    }
  }, []);

  const reduxCompletedIds = useAppSelector(
    (state) => state.workout?.completedExerciseIds || [],
  );
  const completedIds = propCompletedIds ?? reduxCompletedIds;
  const completedIdSet = useMemo(() => new Set(completedIds), [completedIds]);

  const aiRecommended = useMemo(
    () =>
      showRecommendationSections
        ? displayExercises.slice(0, 8)
        : displayExercises.filter(
            (exercise, index) =>
              (exercise as WorkoutExerciseItem).isAiRecommended ?? index < 8,
          ),
    [displayExercises, showRecommendationSections],
  );

  const regularExercises = useMemo(
    () =>
      showRecommendationSections
        ? displayExercises.slice(8)
        : displayExercises.filter(
            (exercise, index) =>
              !((exercise as WorkoutExerciseItem).isAiRecommended ?? index < 8),
          ),
    [displayExercises, showRecommendationSections],
  );

  const listEntries = useMemo<ExerciseListEntry[]>(
    () =>
      showRecommendationSections && displayExercises.length > 8
        ? [
            ...displayExercises.slice(0, 8),
            REGULAR_SECTION_ENTRY,
            ...displayExercises.slice(8),
          ]
        : displayExercises,
    [displayExercises, showRecommendationSections],
  );

  const regularHeaderTop = useMemo(() => {
    if (!headerHeight || !aiRecommended.length) return 0;
    const cardsHeight = aiRecommended.length * cardHeight;
    const gapsHeight = Math.max(0, aiRecommended.length - 1) * ITEM_GAP;
    return headerHeight + cardsHeight + gapsHeight;
  }, [aiRecommended.length, cardHeight, headerHeight]);

  useAnimatedReaction(
    () => {
      if (
        !dragAnimationValues ||
        !showRecommendationSections ||
        regularHeaderTop <= 0
      ) {
        return -1;
      }

      const activeIndex = dragAnimationValues.activeIndexAnim.value;
      if (activeIndex < 0) return -1;

      const cardCenter =
        dragAnimationValues.hoverOffset.value +
        dragAnimationValues.activeCellSize.value / 2;
      const dividerEnd = regularHeaderTop + SECTION_DIVIDER_HEIGHT;

      if (cardCenter < regularHeaderTop || cardCenter > dividerEnd) return -1;

      return cardCenter < regularHeaderTop + SECTION_DIVIDER_HEIGHT / 2 ? 7 : 9;
    },
    (snapIndex) => {
      if (snapIndex < 0 || !dragAnimationValues) return;

      dragAnimationValues.spacerIndexAnim.value = snapIndex;
      dragAnimationValues.placeholderOffset.value =
        snapIndex === 9
          ? regularHeaderTop + SECTION_DIVIDER_HEIGHT
          : regularHeaderTop - cardHeight;
    },
    [
      cardHeight,
      dragAnimationValues,
      regularHeaderTop,
      showRecommendationSections,
    ],
  );

  const renderItem = useCallback(
    ({
      item,
      drag,
      isActive,
      getIndex,
    }: RenderItemParams<ExerciseListEntry>) => {
      const index = getIndex() ?? 0;

      if (isSectionEntry(item)) {
        return (
          <StationarySectionHeader animationValues={dragAnimationValues} />
        );
      }

      const displayIndex = index > 8 ? index : index + 1;

      const card = (
        <ScaleDecorator activeScale={1.015}>
          <PushDayExerciseCard
            exercise={item}
            index={String(displayIndex).padStart(2, "0")}
            isCompleted={completedIdSet.has(item.id)}
            style={isActive ? styles.draggingCard : undefined}
            isDragging={isActive}
            onSwipeStart={() => activeSwipeCloserRef.current?.()}
            onSwipeOpen={(closeRow) => {
              activeSwipeCloserRef.current = closeRow;
            }}
            onSwipeClose={() => {
              activeSwipeCloserRef.current = null;
            }}
            onPress={() => onExercisePress?.(item)}
            onLongPress={() => {
              activeSwipeCloserRef.current?.();
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
                  () => {},
                );
              }
              drag();
            }}
            onReplace={
              onReplaceExercise ? () => onReplaceExercise(item.id) : undefined
            }
            onDelete={
              onDeleteExercise ? () => onDeleteExercise(item.id) : undefined
            }
          />
        </ScaleDecorator>
      );

      return (
        <View onLayout={index === 0 ? handleCardLayout : undefined}>
          {index === 7 || index === 9 ? (
            <SectionBoundaryDecorator
              index={index}
              animationValues={dragAnimationValues}
            >
              {card}
            </SectionBoundaryDecorator>
          ) : (
            card
          )}
        </View>
      );
    },
    [
      completedIdSet,
      onExercisePress,
      onReplaceExercise,
      onDeleteExercise,
      handleCardLayout,
      dragAnimationValues,
    ],
  );

  return (
    <DraggableFlatList
      data={listEntries}
      keyExtractor={(entry) => entry.id}
      activationDistance={0}
      dragItemOverflow={true}
      autoscrollThreshold={85}
      autoscrollSpeed={85}
      animationConfig={{
        damping: 24,
        stiffness: 360,
        mass: 0.5,
      }}
      onAnimValInit={(values) => {
        setDragAnimationValues((current: any) => current ?? values);
      }}
      initialNumToRender={10}
      maxToRenderPerBatch={8}
      updateCellsBatchingPeriod={16}
      windowSize={7}
      removeClippedSubviews={Platform.OS === "android"}
      contentContainerStyle={[styles.exerciseList, style]}
      ItemSeparatorComponent={(props: any) => {
        if (props.leadingItem?.id === REGULAR_SECTION_ID) return null;
        return <View style={styles.itemSeparator} />;
      }}
      ListHeaderComponent={
        <View
          style={{ position: "relative" }}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && Math.abs(h - headerHeight) > 1) {
              setHeaderHeight(h);
            }
          }}
        >
          {ListHeaderComponent}
          {showRecommendationSections && aiRecommended.length > 0 ? (
            <View style={styles.recommendationHeader}>
              <View style={styles.recommendationHeaderLead}>
                <View style={styles.recommendationIcon}>
                  <Sparkles size={13} color="#07131B" strokeWidth={2.8} />
                </View>
                <Text style={styles.recommendationTitle}>AI RECOMMENDED</Text>
              </View>
              <Text style={styles.recommendationCount}>
                {aiRecommended.length} PICKS
              </Text>
            </View>
          ) : null}

          {showRecommendationSections && regularHeaderTop > 0 ? (
            <View
              style={[
                styles.regularHeader,
                {
                  position: "absolute",
                  top: regularHeaderTop,
                  left: 0,
                  right: 0,
                  zIndex: 100,
                  elevation: 10,
                },
              ]}
              pointerEvents="none"
            >
              <Text style={styles.regularTitle}>REGULAR EXERCISES</Text>
              <View style={styles.regularRule} />
              <Text style={styles.recommendationCount}>
                {regularExercises.length} MORE
              </Text>
            </View>
          ) : null}
        </View>
      }
      ListFooterComponent={ListFooterComponent}
      onDragBegin={() => {
        isDraggingRef.current = true;
        activeSwipeCloserRef.current?.();
      }}
      onDragEnd={({ data }) => {
        const orderedExercises = data.filter(
          (entry): entry is PushDayExercise | WorkoutExerciseItem =>
            !isSectionEntry(entry),
        );
        setDisplayExercises(orderedExercises);
        isDraggingRef.current = false;
        requestAnimationFrame(() => {
          onReorderExercises?.(orderedExercises.map((exercise) => exercise.id));
        });
      }}
      renderItem={renderItem}
    />
  );
};

// Reusable aliases
export const WorkoutExerciseCard = PushDayExerciseCard;
export const WorkoutExerciseList = PushDayExerciseList;

const styles = StyleSheet.create({
  exerciseList: {
    width: "100%",
  },
  itemSeparator: {
    height: ITEM_GAP,
  },
  recommendationHeader: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  recommendationHeaderLead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recommendationIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#42E8D1",
  },
  recommendationTitle: {
    color: "#42E8D1",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.15,
  },
  recommendationCount: {
    color: "#718096",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  regularHeader: {
    height: SECTION_DIVIDER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionSpacer: {
    height: SECTION_CROSSING_OFFSET,
  },
  regularTitle: {
    color: "#CBD5E1",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  regularRule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(148, 163, 184, 0.28)",
  },
  cardWrapper: {
    position: "relative",
    width: "100%",
  },
  revealedActionsBackground: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: 6,
    gap: 10,
    zIndex: 1,
  },
  actionItemCol: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
  },
  actionItemColPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.94 }],
  },
  replaceCircleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#222736",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  replaceActionLabel: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 5,
    letterSpacing: 0.2,
  },
  deleteCircleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EF4444",
    borderWidth: 1,
    borderColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteActionLabel: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 5,
    letterSpacing: 0.2,
  },
  animatedCardContainer: {
    width: "100%",
    zIndex: 2,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111624",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 20,
    padding: 14,
  },
  exerciseCardCompleted: {
    borderColor: "rgba(56, 237, 216, 0.4)",
    backgroundColor: "rgba(14, 25, 36, 0.95)",
  },
  thumbnailWrapper: {
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#0F121A",
    position: "relative",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailImageCompleted: {
    opacity: 0.85,
  },
  indexBadge: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  indexBadgeCompleted: {
    backgroundColor: "rgba(10, 30, 35, 0.88)",
    borderColor: "rgba(56, 237, 216, 0.4)",
  },
  indexBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  indexBadgeTextCompleted: {
    color: "#38EDD8",
  },
  thumbnailCheckBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(10, 26, 30, 0.95)",
    borderWidth: 1.2,
    borderColor: "#38EDD8",
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseTextContainer: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
    justifyContent: "center",
  },
  exerciseTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  exerciseTitleCompleted: {
    color: "#CBD5E1",
  },
  exerciseSubtitle: {
    flex: 1,
    color: "#8E95A5",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "500",
    marginTop: 4,
  },
  exerciseMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 5,
  },
  xpReward: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 21,
    paddingHorizontal: 7,
    borderRadius: 6,
    backgroundColor: "rgba(45, 212, 191, 0.12)",
  },
  xpRewardText: {
    color: "#8AF4E2",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  completedStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  completedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#38EDD8",
  },
  completedStatusText: {
    color: "#38EDD8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  restingActionContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 4,
  },
  draggingCard: {
    opacity: 0.95,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    marginLeft: 2,
  },
  completedCheckCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#38EDD8",
    backgroundColor: "rgba(56, 237, 216, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
