import { useAppSelector } from "@/store/hooks";
import * as Haptics from "expo-haptics";
import { Image, ImageSource } from "expo-image";
import { Check, Play, RefreshCw, Trash2 } from "lucide-react-native";
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
  onPress,
  onReplace,
  onDelete,
  style,
  testID,
}) => {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress?.();
  };

  const handleReplace = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    onReplace?.();
  };

  const handleDelete = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    onDelete?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.exerciseCard,
        isCompleted && styles.exerciseCardCompleted,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${isCompleted ? "Completed" : subtitle}`}
      testID={testID}
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
          <View style={styles.exerciseMetaCol}>
            {targetMuscle ? (
              <View style={styles.targetMuscleRow}>
                <View style={styles.targetMuscleTag}>
                  <Text style={styles.targetMuscleText} numberOfLines={1}>
                    {targetMuscle.toUpperCase()}
                  </Text>
                </View>
              </View>
            ) : null}
            <Text style={styles.exerciseSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons: Replace, Delete & Play/Checkmark */}
      <View style={styles.actionsContainer}>
        {onReplace ? (
          <Pressable
            onPress={handleReplace}
            style={({ pressed }) => [
              styles.actionIconBtn,
              styles.replaceBtn,
              pressed && styles.actionIconBtnPressed,
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Replace ${title}`}
          >
            <RefreshCw size={13} color="#38BDF8" strokeWidth={2.4} />
          </Pressable>
        ) : null}

        {onDelete ? (
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [
              styles.actionIconBtn,
              styles.deleteBtn,
              pressed && styles.actionIconBtnPressed,
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${title}`}
          >
            <Trash2 size={13} color="#F43F5E" strokeWidth={2.4} />
          </Pressable>
        ) : null}

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
  const reduxCompletedIds = useAppSelector(
    (state) => state.workout?.completedExerciseIds || []
  );
  const completedIds = propCompletedIds ?? reduxCompletedIds;

  return (
    <View style={[styles.exerciseList, style]}>
      {exercises.map((exercise) => {
        const isCompleted = completedIds.includes(exercise.id);
        return (
          <PushDayExerciseCard
            key={exercise.id}
            exercise={exercise}
            isCompleted={isCompleted}
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
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161821",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
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
    backgroundColor: "rgba(8, 10, 16, 0.78)",
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  indexBadgeCompleted: {
    backgroundColor: "rgba(10, 30, 35, 0.88)",
    borderColor: "rgba(56, 237, 216, 0.4)",
  },
  indexBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
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
    marginLeft: 12,
    marginRight: 6,
    justifyContent: "center",
  },
  exerciseTitle: {
    color: "#FFFFFF",
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  exerciseTitleCompleted: {
    color: "#CBD5E1",
  },
  exerciseMetaCol: {
    marginTop: 4,
  },
  targetMuscleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  targetMuscleTag: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderWidth: 0.8,
    borderColor: "rgba(56, 189, 248, 0.3)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  targetMuscleText: {
    color: "#38BDF8",
    fontSize: 9,
    fontWeight: "800",
    fontFamily: "monospace",
    letterSpacing: 0.6,
  },
  exerciseSubtitle: {
    color: "#94A3B8",
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "600",
    fontFamily: "monospace",
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
    fontSize: 10,
    fontWeight: "800",
    fontFamily: "monospace",
    letterSpacing: 0.8,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconBtnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },
  replaceBtn: {
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
  },
  deleteBtn: {
    backgroundColor: "rgba(244, 63, 94, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.25)",
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
  playIcon: {
    marginLeft: 2,
  },
  completedCheckCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "#38EDD8",
    backgroundColor: "rgba(56, 237, 216, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
});
