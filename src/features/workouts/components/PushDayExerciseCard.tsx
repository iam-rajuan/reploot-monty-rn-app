import { useAppSelector } from "@/store/hooks";
import * as Haptics from "expo-haptics";
import { Image, ImageSource } from "expo-image";
import { Check, Play, RefreshCw, Trash2 } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { PushDayExercise } from "../data/pushDayData";
import { WorkoutExerciseItem } from "../data/workoutPathDetailData";

export interface PushDayExerciseCardProps {
  exercise?: PushDayExercise | WorkoutExerciseItem;
  index?: string;
  title?: string;
  subtitle?: string;
  targetMuscle?: string;
  image?: ImageSource | number | string;
  isCompleted?: boolean;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onPress?: () => void;
  onReplace?: () => void;
  onDelete?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const PushDayExerciseCard: React.FC<PushDayExerciseCardProps> = ({
  exercise,
  index = exercise?.index,
  title = exercise?.title,
  subtitle = exercise?.subtitle,
  targetMuscle = (exercise as WorkoutExerciseItem)?.targetMuscle,
  image = exercise?.image,
  isCompleted = false,
  isOpen,
  onOpen,
  onClose,
  onPress,
  onReplace,
  onDelete,
  style,
  testID,
}) => {
  const hasActions = Boolean(onReplace || onDelete);
  const actionDrawerWidth = (onReplace ? 68 : 0) + (onDelete ? 68 : 0) + 8;

  const translateX = useRef(new Animated.Value(0)).current;
  const isLocallyOpenRef = useRef(false);

  const closeRow = (callback?: () => void) => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start(() => {
      isLocallyOpenRef.current = false;
      onClose?.();
      callback?.();
    });
  };

  const openRow = () => {
    Animated.spring(translateX, {
      toValue: -actionDrawerWidth,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start(() => {
      isLocallyOpenRef.current = true;
      onOpen?.();
    });
  };

  // Sync external open state if provided by parent list
  useEffect(() => {
    if (isOpen === false && isLocallyOpenRef.current) {
      closeRow();
    } else if (isOpen === true && !isLocallyOpenRef.current) {
      openRow();
    }
  }, [isOpen]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => isLocallyOpenRef.current,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!hasActions) return false;
        // Only claim gesture if motion is decisively horizontal and past threshold
        return (
          Math.abs(gestureState.dx) > 10 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.4
        );
      },
      onPanResponderGrant: () => {
        translateX.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        if (!hasActions) return;
        const currentOffset = isLocallyOpenRef.current
          ? -actionDrawerWidth
          : 0;
        let newX = currentOffset + gestureState.dx;
        // Prevent swiping right beyond 0
        if (newX > 0) newX = 0;
        // Limit left over-drag
        if (newX < -actionDrawerWidth - 24) {
          newX = -actionDrawerWidth - 24;
        }
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!hasActions) return;

        // If currently open and user tapped without dragging, close it
        if (isLocallyOpenRef.current && Math.abs(gestureState.dx) < 6) {
          closeRow();
          return;
        }

        // Swipe left threshold or fast flick
        if (
          gestureState.dx < -36 ||
          gestureState.vx < -0.35 ||
          (isLocallyOpenRef.current && gestureState.dx < 20)
        ) {
          openRow();
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
              () => {}
            );
          }
        } else {
          closeRow();
        }
      },
      onPanResponderTerminate: () => {
        closeRow();
      },
    })
  ).current;

  const handleCardPress = () => {
    if (isLocallyOpenRef.current) {
      closeRow();
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress?.();
  };

  const handleReplacePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    closeRow(() => {
      onReplace?.();
    });
  };

  const handleDeletePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    closeRow(() => {
      onDelete?.();
    });
  };

  return (
    <View style={[styles.cardWrapper, style]} testID={testID}>
      {/* Revealed Swipe Action Buttons (Hidden behind card until swiped left) */}
      {hasActions && (
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

      {/* Front Exercise Card: Slides left on swipe */}
      <Animated.View
        {...(hasActions ? panResponder.panHandlers : {})}
        style={[
          styles.animatedCardContainer,
          { transform: [{ translateX }] },
        ]}
      >
        <Pressable
          onPress={handleCardPress}
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
      </Animated.View>
    </View>
  );
};

export interface PushDayExerciseListProps {
  exercises: (PushDayExercise | WorkoutExerciseItem)[];
  completedExerciseIds?: string[];
  onExercisePress?: (exercise: PushDayExercise | WorkoutExerciseItem) => void;
  onReplaceExercise?: (exerciseId: string) => void;
  onDeleteExercise?: (exerciseId: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const PushDayExerciseList: React.FC<PushDayExerciseListProps> = ({
  exercises,
  completedExerciseIds: propCompletedIds,
  onExercisePress,
  onReplaceExercise,
  onDeleteExercise,
  style,
}) => {
  const [swipedExerciseId, setSwipedExerciseId] = React.useState<string | null>(
    null
  );

  const reduxCompletedIds = useAppSelector(
    (state) => state.workout?.completedExerciseIds || []
  );
  const completedIds = propCompletedIds ?? reduxCompletedIds;

  return (
    <View style={[styles.exerciseList, style]}>
      {exercises.map((exercise) => {
        const isCompleted = completedIds.includes(exercise.id);
        const isOpen = swipedExerciseId === exercise.id;

        return (
          <PushDayExerciseCard
            key={exercise.id}
            exercise={exercise}
            isCompleted={isCompleted}
            isOpen={isOpen}
            onOpen={() => setSwipedExerciseId(exercise.id)}
            onClose={() =>
              setSwipedExerciseId((prev) =>
                prev === exercise.id ? null : prev
              )
            }
            onPress={() => onExercisePress?.(exercise)}
            onReplace={
              onReplaceExercise
                ? () => onReplaceExercise(exercise.id)
                : undefined
            }
            onDelete={
              onDeleteExercise
                ? () => onDeleteExercise(exercise.id)
                : undefined
            }
          />
        );
      })}
    </View>
  );
};

// Reusable aliases
export const WorkoutExerciseCard = PushDayExerciseCard;
export const WorkoutExerciseList = PushDayExerciseList;

const styles = StyleSheet.create({
  exerciseList: {
    gap: 12,
  },
  cardWrapper: {
    position: "relative",
    width: "100%",
  },
  revealedActionsBackground: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
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
    fontWeight: "800",
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
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  exerciseTitleCompleted: {
    color: "#CBD5E1",
  },
  exerciseSubtitle: {
    color: "#8E95A5",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    marginTop: 4,
  },
  completedStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
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
