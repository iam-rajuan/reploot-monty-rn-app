import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import MaskedView from "@react-native-masked-view/masked-view";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  GripHorizontal,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Line as SvgLine } from "react-native-svg";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  assignWorkoutSchedule,
  getTodayDateKey,
  removeWorkoutSchedule,
  setActiveScheduleDate,
  setSelectedWorkoutCategory,
} from "@/store/slices/workoutSlice";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Helper to resolve regional week configuration (Sunday vs Monday start according to locale/region)
export function getRegionWeekConfig(): {
  daysOfWeek: string[];
  firstDayOfWeek: number; // 0 for Sunday, 1 for Monday
} {
  try {
    const locale =
      Intl.DateTimeFormat().resolvedOptions().locale || "en-US";
    const intlLocale = new (Intl as any).Locale(locale);
    let firstDay = 1; // Default to Monday (ISO)
    if (intlLocale.weekInfo && typeof intlLocale.weekInfo.firstDay === "number") {
      firstDay = intlLocale.weekInfo.firstDay === 7 ? 0 : intlLocale.weekInfo.firstDay;
    } else {
      // Regions where week starts on Sunday: US, CA, MX, JP, SA, IL, PH, BR, AU, NZ, SG, HK, TW, KR, IN, BD, etc.
      const sundayLocales = /-(US|CA|MX|JP|SA|IL|PH|BR|AU|NZ|SG|HK|TW|KR|IN|BD)$/i;
      if (sundayLocales.test(locale) || locale.toLowerCase().startsWith("en-us")) {
        firstDay = 0;
      }
    }

    if (firstDay === 0) {
      return {
        firstDayOfWeek: 0,
        daysOfWeek: ["SU", "MO", "TU", "WE", "TH", "FR", "SA"],
      };
    }
  } catch {}

  return {
    firstDayOfWeek: 1,
    daysOfWeek: ["MO", "TU", "WE", "TH", "FR", "SA", "SU"],
  };
}

const DAYS_OF_WEEK = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const MONTH_NAMES = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export interface WorkoutTemplate {
  id: string;
  name: string;
  tag: string;
  color: string;
  bgColor: string;
  borderColor: string;
  bgGrad: [string, string];
}

export const WORKOUT_SPLITS: WorkoutTemplate[] = [
  {
    id: "push",
    name: "Push Day",
    tag: "PUSH",
    color: "#38BDF8",
    bgColor: "rgba(56, 189, 248, 0.22)",
    borderColor: "#38BDF8",
    bgGrad: ["#0284C7", "#38BDF8"],
  },
  {
    id: "pull",
    name: "Pull Day",
    tag: "PULL",
    color: "#2DD4BF",
    bgColor: "rgba(45, 212, 191, 0.22)",
    borderColor: "#2DD4BF",
    bgGrad: ["#0F766E", "#2DD4BF"],
  },
  {
    id: "chest",
    name: "Chest Day",
    tag: "CHEST",
    color: "#38EDD8",
    bgColor: "rgba(56, 237, 216, 0.22)",
    borderColor: "#38EDD8",
    bgGrad: ["#0E7490", "#38EDD8"],
  },
  {
    id: "upper",
    name: "Upper Body",
    tag: "UPPER",
    color: "#C084FC",
    bgColor: "rgba(192, 132, 252, 0.22)",
    borderColor: "#C084FC",
    bgGrad: ["#7E22CE", "#C084FC"],
  },
  {
    id: "lower",
    name: "Lower Body",
    tag: "LOWER",
    color: "#FFB68C",
    bgColor: "rgba(255, 182, 140, 0.22)",
    borderColor: "#FFB68C",
    bgGrad: ["#C2410C", "#FFB68C"],
  },
  {
    id: "full",
    name: "Full Body",
    tag: "FULL",
    color: "#F43F5E",
    bgColor: "rgba(244, 63, 94, 0.22)",
    borderColor: "#F43F5E",
    bgGrad: ["#BE123C", "#F43F5E"],
  },
];

interface CalendarCell {
  date: number;
  currentMonth: boolean;
  type?: "completed" | "scheduled" | "today";
  label?: string;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  isCustom?: boolean;
}

// Helper to resolve workout category theme colors by label
function getCategoryColors(label?: string) {
  if (!label) return null;
  const normalized = label.trim().toLowerCase();
  const matchedSplit = WORKOUT_SPLITS.find(
    (s) =>
      s.name.toLowerCase() === normalized ||
      s.tag.toLowerCase() === normalized ||
      normalized.includes(s.name.toLowerCase()) ||
      normalized.includes(s.tag.toLowerCase()),
  );
  if (matchedSplit) {
    return {
      color: matchedSplit.color,
      bgColor: matchedSplit.bgColor,
      borderColor: matchedSplit.borderColor,
    };
  }
  if (normalized.includes("chest")) {
    return {
      color: "#38BDF8",
      bgColor: "rgba(56, 189, 248, 0.22)",
      borderColor: "#38BDF8",
    };
  }
  return null;
}

export function getSplitByLabel(label?: string): WorkoutTemplate {
  if (!label) return WORKOUT_SPLITS[0];
  const normalized = label.trim().toLowerCase();
  const matchedSplit = WORKOUT_SPLITS.find(
    (s) =>
      s.name.toLowerCase() === normalized ||
      s.tag.toLowerCase() === normalized ||
      normalized.includes(s.name.toLowerCase()) ||
      normalized.includes(s.tag.toLowerCase()),
  );
  if (matchedSplit) return matchedSplit;
  return {
    id: "custom",
    name: label,
    tag: label.slice(0, 4).toUpperCase(),
    color: "#38BDF8",
    bgColor: "rgba(56, 189, 248, 0.22)",
    borderColor: "#38BDF8",
    bgGrad: ["#0284C7", "#38BDF8"],
  };
}

function generateInitialCalendar(
  year: number,
  month: number,
  firstDayOfWeek: number = 1
): CalendarCell[] {
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset =
    firstDayOfWeek === 0
      ? firstDay
      : firstDay === 0
        ? 6
        : firstDay - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const data: CalendarCell[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    data.push({
      date: daysInPrevMonth - i,
      currentMonth: false,
    });
  }

  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === i;

    data.push({
      date: i,
      currentMonth: true,
      type: isToday ? "today" : undefined,
      label: "",
    });
  }

  const remainingCells = data.length % 7;
  const paddingEnd = remainingCells === 0 ? 0 : 7 - remainingCells;

  for (let i = 1; i <= paddingEnd; i++) {
    data.push({
      date: i,
      currentMonth: false,
    });
  }

  return data;
}

// Draggable Chip Component using Gesture.Pan() and Reanimated
function DraggableSplitChip({
  split,
  isActive,
  onPress,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  split: WorkoutTemplate;
  isActive: boolean;
  onPress: () => void;
  onDragStart: (split: WorkoutTemplate, startX: number, startY: number) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (split: WorkoutTemplate, endX: number, endY: number) => void;
}) {
  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .activateAfterLongPress(260)
      .onStart((e) => {
        "worklet";
        runOnJS(onDragStart)(split, e.absoluteX, e.absoluteY);
      })
      .onUpdate((e) => {
        "worklet";
        runOnJS(onDragMove)(e.absoluteX, e.absoluteY);
      })
      .onEnd((e) => {
        "worklet";
        runOnJS(onDragEnd)(split, e.absoluteX, e.absoluteY);
      })
      .onFinalize(() => {
        "worklet";
      });
  }, [split, onDragStart, onDragMove, onDragEnd]);

  return (
    <GestureDetector gesture={panGesture}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        style={[
          styles.splitBadge,
          { borderColor: split.color },
          isActive && styles.splitBadgeActive,
        ]}
      >
        <LinearGradient
          colors={
            isActive
              ? split.bgGrad
              : ["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.splitBadgeGrad}
        >
          <Dumbbell
            size={11}
            color={isActive ? "#FFFFFF" : split.color}
            style={{ marginRight: 5 }}
          />
          <Text
            numberOfLines={1}
            style={[
              styles.splitBadgeText,
              { color: isActive ? "#FFFFFF" : split.color },
            ]}
          >
            {split.name}
          </Text>
          {isActive && (
            <View style={styles.splitActiveCheck}>
              <Check size={9} color="#FFFFFF" />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </GestureDetector>
  );
}

// Draggable Calendar Grid Cell - Supports Tap to view/assign AND Pan to move scheduled days
interface DraggableCalendarCellProps {
  item: CalendarCell;
  isToday: boolean;
  isCompleted: boolean;
  isScheduled: boolean;
  isHovered: boolean;
  isCellDragging: boolean;
  cellBgColor: string;
  cellBorderColor: string;
  cellTextColor: string;
  dumbbellColor: string;
  onPress: (item: CalendarCell) => void;
  onDragStart: (item: CalendarCell, startX: number, startY: number) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (item: CalendarCell, endX: number, endY: number) => void;
}

const DraggableCalendarCell = React.memo(function DraggableCalendarCell({
  item,
  isToday,
  isCompleted,
  isScheduled,
  isHovered,
  isCellDragging,
  cellBgColor,
  cellBorderColor,
  cellTextColor,
  dumbbellColor,
  onPress,
  onDragStart,
  onDragMove,
  onDragEnd,
}: DraggableCalendarCellProps) {
  const hasWorkout = Boolean(
    item.currentMonth && (item.label || isCompleted || isScheduled)
  );

  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .enabled(hasWorkout)
      .activateAfterLongPress(260)
      .onStart((e) => {
        "worklet";
        runOnJS(onDragStart)(item, e.absoluteX, e.absoluteY);
      })
      .onUpdate((e) => {
        "worklet";
        runOnJS(onDragMove)(e.absoluteX, e.absoluteY);
      })
      .onEnd((e) => {
        "worklet";
        runOnJS(onDragEnd)(item, e.absoluteX, e.absoluteY);
      })
      .onFinalize(() => {
        "worklet";
      });
  }, [hasWorkout, item, onDragStart, onDragMove, onDragEnd]);

  const splitTag = useMemo(() => {
    if (!item.label) return "";
    const split = getSplitByLabel(item.label);
    return split?.tag || item.label.slice(0, 5).toUpperCase();
  }, [item.label]);

  if (!item.currentMonth) {
    return (
      <View style={styles.cellContainer}>
        <View style={styles.dateBoxInactive}>
          <Text style={styles.dateTextInactive}>
            {item.date}
          </Text>
        </View>
        <Text style={styles.labelTextPlaceholder}>{" "}</Text>
      </View>
    );
  }

  const isRestDay = !hasWorkout && !isToday;

  return (
    <View style={styles.cellContainer}>
      <GestureDetector gesture={panGesture}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onPress(item)}
          style={[
            { alignItems: "center" },
            isCellDragging && { opacity: 0.3 },
          ]}
        >
          {isToday ? (
            <LinearGradient
              colors={["#00f2fe", "#4facfe"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[
                styles.dateBox,
                styles.dateBoxToday,
                isHovered && styles.dateBoxHovered,
              ]}
            >
              <Text style={[styles.dateText, styles.dateTextToday]}>
                {item.date}
              </Text>
              {Boolean(item.label || isCompleted || isScheduled) && (
                <Image
                  source={require("../assets/dumble.svg")}
                  style={styles.todayDumbbellIcon}
                  contentFit="contain"
                />
              )}
            </LinearGradient>
          ) : isRestDay ? (
            <View
              style={[
                styles.dateBox,
                styles.dateBoxRest,
                isHovered && styles.dateBoxHovered,
              ]}
            >
              <Text style={styles.dateTextRest}>{item.date}</Text>
              <View style={styles.restDayDotMini} />
            </View>
          ) : (
            <View
              style={[
                styles.dateBox,
                {
                  backgroundColor: cellBgColor,
                  borderColor: cellBorderColor,
                  borderWidth: 1.5,
                },
                isHovered && styles.dateBoxHovered,
              ]}
            >
              <Text style={[styles.dateText, { color: cellTextColor }]}>
                {item.date}
              </Text>
              <Image
                source={require("../assets/dumble.svg")}
                style={{
                  width: 14,
                  height: 14,
                  marginTop: 3,
                  tintColor: dumbbellColor,
                }}
                contentFit="contain"
              />
            </View>
          )}

          <Text
            style={[
              styles.labelText,
              { color: isToday ? "#00f2fe" : cellTextColor },
            ]}
            numberOfLines={1}
          >
            {isToday ? "TODAY" : splitTag ? splitTag : " "}
          </Text>
        </TouchableOpacity>
      </GestureDetector>
    </View>
  );
});

export default function WorkoutCalendarScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const activeWorkoutCategory = useAppSelector(
    (state) => state.workout.selectedWorkoutCategory
  );
  const calendarSchedules = useAppSelector(
    (state) => state.workout.calendarSchedules || {},
  );
  const todayKey = getTodayDateKey();
  const activeScheduleDateKey = useAppSelector(
    (state) => state.workout.activeScheduleDateKey || todayKey,
  );
  const calendarGridRef = useRef<View>(null);

  // Regional week configuration (Sunday vs Monday start according to user's region/locale)
  const { daysOfWeek, firstDayOfWeek } = useMemo(
    () => getRegionWeekConfig(),
    [],
  );

  // Month navigation - defaults to current day according to user's local timezone/region
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth();

  // Active workout split selection (for tap-to-place)
  const [activeSelectedSplit, setActiveSelectedSplit] =
    useState<WorkoutTemplate | null>(null);

  // Modal Sheet for inspecting or modifying a specific date
  const [dateModalCell, setDateModalCell] = useState<CalendarCell | null>(null);

  // Drag State (JS state + Reanimated Shared Values)
  const [activeDragSplit, setActiveDragSplit] =
    useState<WorkoutTemplate | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);
  const [dragSourceDate, setDragSourceDate] = useState<number | null>(null);

  // Custom Cyber Conflict Alert Modal State
  const [conflictModalData, setConflictModalData] = useState<{
    sourceDate: number | null;
    targetDate: number;
    sourceSplit: WorkoutTemplate;
    targetSplitName: string;
  } | null>(null);

  const triggerHaptic = useCallback(
    (
      style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
    ) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(style).catch(() => {});
      }
    },
    [],
  );

  // Dynamic in-button status feedback when moving or assigning splits
  const [buttonFeedbackMessage, setButtonFeedbackMessage] = useState<string | null>(null);
  const [lastUndoAction, setLastUndoAction] = useState<(() => void) | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerButtonFeedback = useCallback((msg: string, undoFn?: () => void) => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setButtonFeedbackMessage(msg.toUpperCase());
    setLastUndoAction(() => (undoFn ? undoFn : null));
    feedbackTimerRef.current = setTimeout(() => {
      setButtonFeedbackMessage(null);
      setLastUndoAction(null);
    }, 2800);
  }, []);

  const handleUndo = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    if (lastUndoAction) {
      lastUndoAction();
    }
    setButtonFeedbackMessage(null);
    setLastUndoAction(null);
  }, [lastUndoAction, triggerHaptic]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  // Shared values for high-frequency 60 FPS animation
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const isGlobalDragging = useSharedValue(false);

  // Grid bounding box state in screen coordinates
  const [gridBounds, setGridBounds] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const handlePrevMonth = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);

  const handleUpdateSchedule = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setIsUpdatingSchedule(true);

    setTimeout(() => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
      }
      setIsUpdatingSchedule(false);
      // Navigate straight to the Home page after updating properly
      router.replace("/(tabs)/home");
    }, 1100);
  };

  const prevMonthIdx = currentMonthIdx === 0 ? 11 : currentMonthIdx - 1;
  const prevMonthName = MONTH_NAMES[prevMonthIdx];
  const nextMonthIdx = currentMonthIdx === 11 ? 0 : currentMonthIdx + 1;
  const nextMonthName = MONTH_NAMES[nextMonthIdx];

  // Base calendar data merged with custom scheduled items from Redux
  const calendarData = useMemo(() => {
    const base = generateInitialCalendar(
      currentYear,
      currentMonthIdx,
      firstDayOfWeek
    );
    return base.map((item) => {
      if (!item.currentMonth) return item;
      const key = `${currentYear}-${currentMonthIdx}-${item.date}`;
      const scheduled = calendarSchedules[key];
      if (scheduled) {
        return {
          ...item,
          type:
            item.type === "today"
              ? "today"
              : scheduled.type || "scheduled",
          label: scheduled.splitName,
          color: scheduled.color,
          bgColor: scheduled.bgColor,
          borderColor: scheduled.borderColor,
          isCustom: true,
        };
      }
      return item;
    });
  }, [currentYear, currentMonthIdx, calendarSchedules, firstDayOfWeek]);

  const applyWorkoutToDate = useCallback(
    (targetDate: number, split: WorkoutTemplate) => {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      const key = `${currentYear}-${currentMonthIdx}-${targetDate}`;
      const today = new Date();
      const isToday =
        today.getFullYear() === currentYear &&
        today.getMonth() === currentMonthIdx &&
        today.getDate() === targetDate;

      const pathKey = split.id === "full" ? "fullbody" : split.id;
      dispatch(
        assignWorkoutSchedule({
          dateKey: key,
          splitId: pathKey,
          type: isToday ? "today" : "scheduled",
        }),
      );
    },
    [currentYear, currentMonthIdx, triggerHaptic, dispatch],
  );

  const removeWorkoutFromDate = useCallback(
    (targetDate: number) => {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
      const key = `${currentYear}-${currentMonthIdx}-${targetDate}`;
      dispatch(removeWorkoutSchedule({ dateKey: key }));
    },
    [currentYear, currentMonthIdx, triggerHaptic, dispatch],
  );

  // Measure calendar grid on screen in window coordinates
  const measureCalendarGrid = useCallback(() => {
    calendarGridRef.current?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) {
        setGridBounds({ x, y, width, height });
      }
    });
  }, []);

  // Determine which calendar date is under touch coordinate
  const getDateFromCoords = useCallback(
    (touchX: number, touchY: number): number | null => {
      if (!gridBounds || gridBounds.width === 0 || gridBounds.height === 0) {
        return null;
      }
      const relX = touchX - gridBounds.x;
      const relY = touchY - gridBounds.y;

      if (
        relX < 0 ||
        relX > gridBounds.width ||
        relY < 0 ||
        relY > gridBounds.height
      ) {
        return null;
      }

      const colWidth = gridBounds.width / 7;
      const numRows = Math.ceil(calendarData.length / 7);
      const rowHeight = gridBounds.height / numRows;

      const col = Math.floor(relX / colWidth);
      const row = Math.floor(relY / rowHeight);

      if (col >= 0 && col < 7 && row >= 0 && row < numRows) {
        const idx = row * 7 + col;
        const cell = calendarData[idx];
        if (cell && cell.currentMonth) {
          return cell.date;
        }
      }
      return null;
    },
    [gridBounds, calendarData],
  );

  // Drag Gesture Callbacks - from top tray chips
  const handleDragStart = useCallback(
    (split: WorkoutTemplate, startX: number, startY: number) => {
      measureCalendarGrid();
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      setDragSourceDate(null);
      setActiveDragSplit(split);
      setIsDragging(true);

      dragX.value = startX;
      dragY.value = startY;
      isGlobalDragging.value = true;
    },
    [measureCalendarGrid, triggerHaptic, dragX, dragY, isGlobalDragging],
  );

  // Drag Gesture Callbacks - from existing calendar cells
  const handleCellDragStart = useCallback(
    (cell: CalendarCell, startX: number, startY: number) => {
      if (
        !cell.currentMonth ||
        (!cell.label && cell.type !== "completed" && cell.type !== "scheduled")
      ) {
        return;
      }
      measureCalendarGrid();
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

      const split = getSplitByLabel(cell.label);
      setDragSourceDate(cell.date);
      setActiveDragSplit(split);
      setIsDragging(true);

      dragX.value = startX;
      dragY.value = startY;
      isGlobalDragging.value = true;
    },
    [measureCalendarGrid, triggerHaptic, dragX, dragY, isGlobalDragging],
  );

  const handleDragMove = useCallback(
    (x: number, y: number) => {
      dragX.value = x;
      dragY.value = y;

      const target = getDateFromCoords(x, y);
      if (target !== hoveredDate) {
        setHoveredDate(target);
        if (target !== null) {
          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    },
    [dragX, dragY, getDateFromCoords, hoveredDate, triggerHaptic],
  );

  // Re-organize calendar cell drop handler
  const handleCellDragEnd = useCallback(
    (sourceCell: CalendarCell, endX: number, endY: number) => {
      const targetDate = getDateFromCoords(endX, endY);
      const sourceDate = sourceCell.date;
      const split = getSplitByLabel(sourceCell.label);

      setIsDragging(false);
      setActiveDragSplit(null);
      setHoveredDate(null);
      isGlobalDragging.value = false;
      setDragSourceDate(null);

      if (targetDate === null || targetDate === sourceDate) {
        return;
      }

      const targetKey = `${currentYear}-${currentMonthIdx}-${targetDate}`;
      const targetScheduled = calendarSchedules[targetKey];
      const targetCell = calendarData.find(
        (c) => c.currentMonth && c.date === targetDate,
      );
      const targetLabel = targetScheduled?.splitName || targetCell?.label;
      const targetHasWorkout = Boolean(targetLabel && targetLabel.trim().length > 0);

      if (targetHasWorkout) {
        // Trigger Cyber Confirmation Alert Popup
        triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
        setConflictModalData({
          sourceDate,
          targetDate,
          sourceSplit: split,
          targetSplitName: targetLabel || "Scheduled Routine",
        });
      } else {
        // Move directly to empty / rest day
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
        removeWorkoutFromDate(sourceDate);
        applyWorkoutToDate(targetDate, split);

        const undo = () => {
          removeWorkoutFromDate(targetDate);
          applyWorkoutToDate(sourceDate, split);
        };
        triggerButtonFeedback(`Moved ${split.name} to Day ${targetDate}`, undo);
      }
    },
    [
      getDateFromCoords,
      currentYear,
      currentMonthIdx,
      calendarSchedules,
      calendarData,
      triggerHaptic,
      removeWorkoutFromDate,
      applyWorkoutToDate,
      triggerButtonFeedback,
      isGlobalDragging,
    ],
  );

  // Tray chip drop handler
  const handleDragEnd = useCallback(
    (split: WorkoutTemplate, endX: number, endY: number) => {
      const targetDate = getDateFromCoords(endX, endY);

      setIsDragging(false);
      setActiveDragSplit(null);
      setHoveredDate(null);
      isGlobalDragging.value = false;
      setDragSourceDate(null);

      if (targetDate === null) return;

      const targetKey = `${currentYear}-${currentMonthIdx}-${targetDate}`;
      const targetScheduled = calendarSchedules[targetKey];
      const targetCell = calendarData.find(
        (c) => c.currentMonth && c.date === targetDate,
      );
      const targetLabel = targetScheduled?.splitName || targetCell?.label;
      const targetHasWorkout = Boolean(targetLabel && targetLabel.trim().length > 0);

      if (targetHasWorkout && targetLabel !== split.name) {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
        setConflictModalData({
          sourceDate: null,
          targetDate,
          sourceSplit: split,
          targetSplitName: targetLabel || "Scheduled Routine",
        });
      } else {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
        applyWorkoutToDate(targetDate, split);

        const undo = () => {
          removeWorkoutFromDate(targetDate);
        };
        triggerButtonFeedback(`Assigned ${split.name} to Day ${targetDate}`, undo);
      }
    },
    [
      getDateFromCoords,
      currentYear,
      currentMonthIdx,
      calendarSchedules,
      calendarData,
      triggerHaptic,
      applyWorkoutToDate,
      triggerButtonFeedback,
      isGlobalDragging,
    ],
  );

  const handleConfirmConflict = useCallback(() => {
    if (!conflictModalData) return;
    const { sourceDate, targetDate, sourceSplit, targetSplitName } = conflictModalData;

    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

    const prevTargetSplit = getSplitByLabel(targetSplitName);

    if (sourceDate !== null) {
      removeWorkoutFromDate(sourceDate);
    }
    applyWorkoutToDate(targetDate, sourceSplit);

    setConflictModalData(null);

    const undo = () => {
      if (prevTargetSplit) {
        applyWorkoutToDate(targetDate, prevTargetSplit);
      } else {
        removeWorkoutFromDate(targetDate);
      }
      if (sourceDate !== null) {
        applyWorkoutToDate(sourceDate, sourceSplit);
      }
    };

    triggerButtonFeedback(
      sourceDate !== null
        ? `Moved ${sourceSplit.name} to Day ${targetDate}`
        : `Replaced Day ${targetDate} with ${sourceSplit.name}`,
      undo,
    );
  }, [
    conflictModalData,
    triggerHaptic,
    removeWorkoutFromDate,
    applyWorkoutToDate,
    triggerButtonFeedback,
  ]);

  const handleCancelConflict = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setConflictModalData(null);
  }, [triggerHaptic]);

  // Floating follower badge animated style (butter-smooth with Reanimated)
  const floatingBadgeStyle = useAnimatedStyle(() => {
    return {
      opacity: isGlobalDragging.value ? 1 : 0,
      transform: [
        { translateX: dragX.value - 60 },
        { translateY: dragY.value - 24 },
        { scale: isGlobalDragging.value ? 1.08 : 0.8 },
      ],
    };
  });

  const handleCellPress = (item: CalendarCell) => {
    if (!item.currentMonth) return;

    const key = `${currentYear}-${currentMonthIdx}-${item.date}`;
    dispatch(setActiveScheduleDate(key));

    // If an active split is selected from tray, apply it right away
    if (activeSelectedSplit) {
      applyWorkoutToDate(item.date, activeSelectedSplit);
      return;
    }

    // Otherwise, open bottom selector sheet
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setDateModalCell(item);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />

      {/* Top Navigation Bar with Avatar & Actions */}
      <CustomHeader
        titleVariant="text"
        title=""
        showBackButton={true}
        showSearch={true}
        showNotifications={true}
        showAvatar={true}
        transparent={true}
        onPressBack={() =>
          router.canGoBack() ? router.back() : router.replace("/(tabs)/home")
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 60, 80) },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isDragging}
        onScroll={() => measureCalendarGrid()}
        scrollEventThrottle={16}
      >
        {/* Title Section with Micro Cyber Telemetry Badge */}
        <View style={styles.titleSection}>
          <View style={styles.titleBadgeRow}>
            <View style={styles.titleBadgeDot} />
            <Text style={styles.titleBadgeText}>TELEMETRY ARCHITECTURE</Text>
          </View>
          <View style={styles.maskedTitleWrapper}>
            <MaskedView
              style={styles.maskedTitleView}
              maskElement={
                <View style={styles.maskWrapper}>
                  <Text style={styles.mainTitle} numberOfLines={1}>
                    WORKOUT CALENDAR
                  </Text>
                </View>
              }
            >
              <LinearGradient
                colors={["#00f2fe", "#4facfe"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              />
            </MaskedView>
          </View>
        </View>

        {/* WORKOUT SPLITS TRAY: REANIMATED & GESTURE HANDLER DRAG & DROP */}
        <View style={styles.trayCard}>
          <View style={styles.trayHeaderRow}>
            <View style={styles.trayTitleCol}>
              <View style={styles.trayBadgeRow}>
                <GripHorizontal size={13} color="#38BDF8" />
                <Text style={styles.trayBadgeText}>
                  DRAG & DROP TO SCHEDULE
                </Text>
              </View>
              <Text style={styles.traySubText}>
                Drag onto a date, or tap a split to assign
              </Text>
            </View>

            {activeSelectedSplit && (
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  setActiveSelectedSplit(null);
                }}
                style={styles.clearActiveBtn}
                activeOpacity={0.7}
              >
                <X size={12} color="#94A3B8" />
                <Text style={styles.clearActiveText}>CLEAR</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Draggable split chips: Symmetrical 3x2 Grid */}
          <View style={styles.splitsGridContainer}>
            <View style={styles.splitsRow}>
              {WORKOUT_SPLITS.slice(0, 3).map((split) => {
                const isActive = activeSelectedSplit?.id === split.id;

                return (
                  <View key={split.id} style={styles.splitItemWrap}>
                    <DraggableSplitChip
                      split={split}
                      isActive={isActive}
                      onPress={() => {
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                        setActiveSelectedSplit((prev) =>
                          prev?.id === split.id ? null : split,
                        );
                      }}
                      onDragStart={handleDragStart}
                      onDragMove={handleDragMove}
                      onDragEnd={handleDragEnd}
                    />
                  </View>
                );
              })}
            </View>

            <View style={styles.splitsRow}>
              {WORKOUT_SPLITS.slice(3, 6).map((split) => {
                const isActive = activeSelectedSplit?.id === split.id;

                return (
                  <View key={split.id} style={styles.splitItemWrap}>
                    <DraggableSplitChip
                      split={split}
                      isActive={isActive}
                      onPress={() => {
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                        setActiveSelectedSplit((prev) =>
                          prev?.id === split.id ? null : split,
                        );
                      }}
                      onDragStart={handleDragStart}
                      onDragMove={handleDragMove}
                      onDragEnd={handleDragEnd}
                    />
                  </View>
                );
              })}
            </View>
          </View>

          {activeSelectedSplit && (
            <View style={styles.placementHintBanner}>
              <Plus size={12} color="#38BDF8" style={{ marginRight: 6 }} />
              <Text style={styles.placementHintText}>
                Active: Tap any calendar date to assign{" "}
                <Text
                  style={{
                    color: activeSelectedSplit.color,
                    fontWeight: "900",
                  }}
                >
                  {activeSelectedSplit.name}
                </Text>
              </Text>
            </View>
          )}
        </View>

        {/* Unified Cyberpunk Month Navigator */}
        <View style={styles.monthNavigatorCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePrevMonth}
            style={styles.monthNavArrowBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronLeft color="#94A3B8" size={15} />
            <Text style={styles.monthNavAdjacentText}>{prevMonthName}</Text>
          </TouchableOpacity>

          <View style={styles.monthNavCenterPill}>
            <Calendar size={13} color="#00f2fe" style={{ marginRight: 6 }} />
            <Text style={styles.monthNavTitle}>
              {`${MONTH_NAMES[currentMonthIdx]} ${currentYear}`}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleNextMonth}
            style={styles.monthNavArrowBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.monthNavAdjacentText}>{nextMonthName}</Text>
            <ChevronRight color="#94A3B8" size={15} />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid Container with Vibrant Gradient Border */}
        <LinearGradient
          colors={["#50357F", "#1D8B9B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.calendarGradientBorder}
        >
          <View style={styles.calendarInner}>
            {/* Days of Week Header - Precision Column Aligned */}
            <View style={styles.daysHeader}>
              {daysOfWeek.map((day) => (
                <View key={day} style={styles.dayHeaderCol}>
                  <Text style={styles.dayHeaderText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid Container measured in window */}
            <View
              ref={calendarGridRef}
              onLayout={measureCalendarGrid}
              style={styles.gridContainer}
            >
              {calendarData.map((item, index) => {
                const isCompleted = item.type === "completed";
                const isScheduled = item.type === "scheduled";
                const isToday = item.type === "today";
                const isHovered =
                  hoveredDate === item.date && item.currentMonth;
                const isCellDragging = dragSourceDate === item.date;

                // Dynamic colors for assigned or scheduled workout splits
                const categoryTheme = getCategoryColors(item.label);

                const cellBorderColor =
                  isHovered && activeDragSplit
                    ? activeDragSplit.color
                    : item.borderColor ||
                      categoryTheme?.borderColor ||
                      (isCompleted
                        ? "#1B6A56"
                        : isScheduled
                          ? "#4A4389"
                          : "rgba(255, 255, 255, 0.04)");

                const cellBgColor =
                  isHovered && activeDragSplit
                    ? activeDragSplit.bgColor
                    : item.bgColor ||
                      categoryTheme?.bgColor ||
                      (isCompleted
                        ? "#1C332D"
                        : isScheduled
                          ? "#2D2D48"
                          : "#25252D");

                const cellTextColor =
                  isHovered && activeDragSplit
                    ? activeDragSplit.color
                    : item.color ||
                      categoryTheme?.color ||
                      (isCompleted
                        ? "#2EE8B3"
                        : isScheduled
                          ? "#C5C0FF"
                          : "#FFFFFF");

                const dumbbellColor =
                  isHovered && activeDragSplit
                    ? activeDragSplit.color
                    : item.color || categoryTheme?.color || cellTextColor;

                return (
                  <DraggableCalendarCell
                    key={`${currentYear}-${currentMonthIdx}-${item.date}-${index}`}
                    item={item}
                    isToday={isToday}
                    isCompleted={isCompleted}
                    isScheduled={isScheduled}
                    isHovered={isHovered}
                    isCellDragging={isCellDragging}
                    cellBgColor={cellBgColor}
                    cellBorderColor={cellBorderColor}
                    cellTextColor={cellTextColor}
                    dumbbellColor={dumbbellColor}
                    onPress={handleCellPress}
                    onDragStart={handleCellDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleCellDragEnd}
                  />
                );
              })}
            </View>

            {/* HUD Calendar Legend */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={styles.legendTodayDot} />
                <Text style={[styles.legendText, { color: "#00f2fe" }]}>
                  Today
                </Text>
              </View>
              <View style={styles.legendItem}>
                <Image
                  source={require("../assets/dumble.svg")}
                  style={{ width: 12, height: 12, tintColor: "#38BDF8" }}
                  contentFit="contain"
                />
                <Text style={[styles.legendText, { color: "#94A3B8" }]}>
                  Scheduled
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.restDayDot} />
                <Text style={[styles.legendText, { color: "#64748B" }]}>
                  Rest
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Bottom Update Schedule Button with Dynamic In-Button Status Feedback */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.updateButtonContainer}
          disabled={isUpdatingSchedule}
          onPress={handleUpdateSchedule}
        >
          <LinearGradient
            colors={["#00f2fe", "#4facfe"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.updateButton}
          >
            {buttonFeedbackMessage ? (
              <>
                <View style={styles.feedbackPlaceholder} />
                <Text
                  style={[styles.updateButtonText, styles.updateButtonFeedbackText]}
                  numberOfLines={1}
                >
                  {buttonFeedbackMessage}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.65}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleUndo();
                  }}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.undoCrossBtn}
                >
                  <X color="#050811" size={17} strokeWidth={2.8} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <RefreshCw color="#050811" size={18} />
                <Text style={styles.updateButtonText}>UPDATE WORKOUT SCHEDULE</Text>
                <ArrowRight color="#050811" size={18} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* MINIMAL CYBER CONFIRMATION MODAL: SIMPLE, NEAT & CLEAN */}
      <Modal
        visible={!!conflictModalData}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelConflict}
      >
        <Pressable
          style={styles.alertBackdrop}
          onPress={handleCancelConflict}
        >
          <Pressable
            style={styles.alertCard}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <View style={styles.alertIconWrapper}>
              <AlertTriangle size={20} color="#F43F5E" />
            </View>

            {/* Clean Title */}
            <Text style={styles.alertTitle}>REPLACE ROUTINE?</Text>

            {/* Clear, Minimal Message */}
            <Text style={styles.alertDescription}>
              Replace{" "}
              <Text style={styles.alertDescTarget}>
                {conflictModalData?.targetSplitName}
              </Text>{" "}
              on Day {conflictModalData?.targetDate} with{" "}
              <Text style={styles.alertDescSource}>
                {conflictModalData?.sourceSplit.name}
              </Text>
              ?
            </Text>

            {/* Minimal Routine Swap Tag */}
            <View style={styles.alertSwapRow}>
              <Text style={styles.alertSwapTargetText} numberOfLines={1}>
                {conflictModalData?.targetSplitName}
              </Text>
              <ArrowRight
                size={12}
                color="#64748B"
                style={{ marginHorizontal: 8 }}
              />
              <Text
                style={[
                  styles.alertSwapSourceText,
                  { color: conflictModalData?.sourceSplit.color || "#00f2fe" },
                ]}
                numberOfLines={1}
              >
                {conflictModalData?.sourceSplit.name}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.alertActionsRow}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleCancelConflict}
                style={styles.alertCancelBtn}
              >
                <Text style={styles.alertCancelBtnText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleConfirmConflict}
                style={styles.alertConfirmBtn}
              >
                <LinearGradient
                  colors={["#F43F5E", "#BE123C"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.alertConfirmGrad}
                >
                  <Text style={styles.alertConfirmBtnText}>REPLACE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Aesthetic Centered Circular Loading Overlay */}
      {isUpdatingSchedule && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingCircleWrapper}>
              <ActivityIndicator size="large" color="#00f2fe" />
            </View>
            <Text style={styles.loadingTitle}>SYNCHRONIZING SCHEDULE...</Text>
            <Text style={styles.loadingSubtitle}>
              Updating routine telemetry & calendar cycles
            </Text>
          </View>
        </View>
      )}

      {/* Floating Drag Item Follower (Powered by Reanimated) */}
      {activeDragSplit && (
        <Animated.View
          pointerEvents="none"
          style={[styles.floatingDragBadge, floatingBadgeStyle]}
        >
          <LinearGradient
            colors={activeDragSplit.bgGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.floatingDragGrad}
          >
            <Dumbbell size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.floatingDragText}>{activeDragSplit.name}</Text>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Quick Select Modal Sheet when tapping a Date */}
      <Modal
        visible={!!dateModalCell}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDateModalCell(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setDateModalCell(null)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Top Cyan/Purple Gradient Accent Bar */}
            <LinearGradient
              colors={["#50357F", "#00f2fe", "#1D8B9B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalTopLine}
            />

            {/* Pull Handle */}
            <View style={styles.modalHandle} />

            {(() => {
              if (!dateModalCell) return null;
              const modalDateKey = `${currentYear}-${currentMonthIdx}-${dateModalCell.date}`;
              const scheduledEntry = calendarSchedules[modalDateKey];
              const activeRoutineLabel = scheduledEntry?.splitName || dateModalCell.label;
              const hasRoutine = Boolean(activeRoutineLabel);
              const routineMeta = activeRoutineLabel
                ? getSplitByLabel(activeRoutineLabel)
                : null;
              const isRoutineToday =
                scheduledEntry?.type === "today" || dateModalCell.type === "today";
              const isRoutineCompleted =
                scheduledEntry?.type === "completed" ||
                dateModalCell.type === "completed";

              return (
                <>
                  {/* Header Row */}
                  <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderInfo}>
                      <View style={styles.modalMicroTag}>
                        <View style={styles.modalCyanDot} />
                        <Text style={styles.modalMicroText}>
                          :: SCHEDULE INSPECTOR ::
                        </Text>
                      </View>
                      <Text style={styles.modalTitle}>
                        {`${MONTH_NAMES[currentMonthIdx]} ${dateModalCell.date}, ${currentYear}`}
                      </Text>

                      {hasRoutine ? (
                        <View
                          style={[
                            styles.modalStatusCapsule,
                            {
                              borderColor: routineMeta?.color || "#38BDF8",
                              backgroundColor:
                                routineMeta?.bgColor || "rgba(56, 189, 248, 0.15)",
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.modalStatusDot,
                              { backgroundColor: routineMeta?.color || "#38BDF8" },
                            ]}
                          />
                          <Text
                            style={[
                              styles.modalStatusText,
                              { color: routineMeta?.color || "#38BDF8" },
                            ]}
                          >
                            {activeRoutineLabel?.toUpperCase()} •{" "}
                            {isRoutineToday
                              ? "TODAY'S MISSION"
                              : isRoutineCompleted
                                ? "COMPLETED"
                                : "SCHEDULED"}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.modalRestCapsule}>
                          <View style={styles.modalRestDot} />
                          <Text style={styles.modalRestText}>
                            REST DAY • ACTIVE RECOVERY
                          </Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={() => setDateModalCell(null)}
                      style={styles.modalCloseBtn}
                      activeOpacity={0.7}
                    >
                      <X size={15} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>

                  {/* Split Selection Grid */}
                  <View style={styles.modalSectionRow}>
                    <Text style={styles.modalSectionLabel}>
                      ASSIGN OR CHANGE SPLIT
                    </Text>
                    <Text style={styles.modalSectionSub}>TAP TO SET</Text>
                  </View>

                  <View style={styles.modalGrid2}>
                    {WORKOUT_SPLITS.map((split) => {
                      const isCurrent = activeRoutineLabel === split.name;

                      return (
                        <TouchableOpacity
                          key={split.id}
                          activeOpacity={0.75}
                          onPress={() => {
                            applyWorkoutToDate(dateModalCell.date, split);
                            setDateModalCell(null);
                          }}
                          style={[
                            styles.modalSplitCard,
                            isCurrent
                              ? {
                                  borderColor: split.color,
                                  backgroundColor: split.bgColor,
                                  shadowColor: split.color,
                                  shadowOpacity: 0.25,
                                  shadowRadius: 6,
                                }
                              : {
                                  borderColor: "rgba(255, 255, 255, 0.08)",
                                },
                          ]}
                        >
                          <View
                            style={[
                              styles.modalSplitColorDot,
                              { backgroundColor: split.color },
                            ]}
                          />
                          <Text
                            style={[
                              styles.modalSplitCardName,
                              isCurrent && { color: "#FFFFFF", fontWeight: "900" },
                            ]}
                          >
                            {split.name}
                          </Text>
                          {isCurrent && (
                            <Check
                              size={13}
                              color={split.color}
                              strokeWidth={3}
                              style={styles.modalSplitCheck}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Actions Row */}
                  {hasRoutine ? (
                    <View style={styles.modalActionsRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                          const matchedSplit = WORKOUT_SPLITS.find(
                            (s) => s.name === activeRoutineLabel,
                          );
                          const pathKey = matchedSplit
                            ? matchedSplit.id === "full"
                              ? "fullbody"
                              : matchedSplit.id
                            : "push";
                          dispatch(setSelectedWorkoutCategory(pathKey));
                          setDateModalCell(null);
                          router.push({
                            pathname: "/workouts",
                            params: { pathId: pathKey },
                          });
                        }}
                        style={styles.modalOpenRoutineBtnWrapper}
                      >
                        <LinearGradient
                          colors={["#00f2fe", "#4facfe"]}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0.5 }}
                          style={styles.modalOpenRoutineBtn}
                        >
                          <Dumbbell size={15} color="#050811" />
                          <Text style={styles.modalOpenRoutineText}>
                            VIEW WORKOUT
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() => {
                          removeWorkoutFromDate(dateModalCell.date);
                          setDateModalCell(null);
                        }}
                        style={styles.modalClearBtn}
                      >
                        <Trash2 size={13} color="#F43F5E" />
                        <Text style={styles.modalClearText}>SET REST DAY</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.modalHelperText}>
                      Tap any split above to schedule a workout for this date.
                    </Text>
                  )}
                </>
              );
            })()}
          </Pressable>
        </Pressable>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070A11",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },

  /* Title Section */
  titleSection: {
    marginTop: 4,
    marginBottom: 16,
  },
  titleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  titleBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#00f2fe",
  },
  titleBadgeText: {
    color: "#00f2fe",
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  maskedTitleWrapper: {
    height: 48,
    width: "100%",
  },
  maskedTitleView: {
    flex: 1,
    width: "100%",
  },
  maskWrapper: {
    backgroundColor: "transparent",
    flex: 1,
    justifyContent: "center",
  },
  gradient: {
    flex: 1,
  },
  mainTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
    fontFamily: "monospace",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "monospace",
    fontWeight: "600",
    marginTop: 4,
  },

  /* Drag Tray Card */
  trayCard: {
    backgroundColor: "rgba(17, 20, 28, 0.95)",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 16,
  },
  trayHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  trayTitleCol: {
    flex: 1,
  },
  trayBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  trayBadgeText: {
    color: "#38BDF8",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 1,
  },
  traySubText: {
    color: "#64748B",
    fontSize: 10,
    fontFamily: "monospace",
  },
  clearActiveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  clearActiveText: {
    color: "#94A3B8",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  splitsGridContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  splitsRow: {
    flexDirection: "row",
    gap: 6,
  },
  splitItemWrap: {
    flex: 1,
  },
  splitBadge: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  splitBadgeActive: {
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  splitBadgeGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  splitBadgeText: {
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  splitActiveCheck: {
    marginLeft: 4,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  placementHintBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  placementHintText: {
    color: "#94A3B8",
    fontSize: 10,
    fontFamily: "monospace",
  },

  /* Unified Cyberpunk Month Navigator */
  monthNavigatorCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(17, 20, 28, 0.9)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 16,
  },
  monthNavArrowBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  monthNavAdjacentText: {
    color: "#94A3B8",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.5,
    marginHorizontal: 3,
  },
  monthNavCenterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "rgba(0, 242, 254, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(0, 242, 254, 0.22)",
  },
  monthNavTitle: {
    color: "#E2E8F0",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 1,
  },

  /* Calendar Card */
  calendarGradientBorder: {
    padding: 1.5,
    borderRadius: 24,
    marginBottom: 20,
  },
  calendarInner: {
    backgroundColor: "#11141C",
    borderRadius: 22.5,
    padding: 12,
    paddingTop: 16,
  },
  daysHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  dayHeaderCol: {
    width: "14.285%",
    alignItems: "center",
    justifyContent: "center",
  },
  dayHeaderText: {
    color: "#64748B",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  cellContainer: {
    width: "14.285%",
    alignItems: "center",
    marginBottom: 10,
  },
  dateBox: {
    width: 40,
    height: 46,
    borderRadius: 11,
    backgroundColor: "#25252D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 3,
  },
  dateBoxInactive: {
    width: 40,
    height: 46,
    borderRadius: 11,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 3,
  },
  dateBoxToday: {
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#00f2fe",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 4,
  },
  dateBoxHovered: {
    borderWidth: 2,
    transform: [{ scale: 1.15 }],
  },
  dateBoxRest: {
    backgroundColor: "rgba(255, 255, 255, 0.025)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "800",
  },
  dateTextInactive: {
    color: "#334155",
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  dateTextToday: {
    color: "#050811",
    fontWeight: "900",
    fontSize: 14,
    fontFamily: "monospace",
  },
  dateTextRest: {
    color: "#64748B",
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  restDayDotMini: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: "rgba(100, 116, 139, 0.45)",
    marginTop: 4,
  },
  todayDumbbellIcon: {
    width: 13,
    height: 13,
    marginTop: 3,
    tintColor: "#050811",
  },
  labelText: {
    fontSize: 8.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
    height: 12,
    marginTop: 1,
  },
  labelTextPlaceholder: {
    height: 12,
    marginTop: 1,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendTodayDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#00f2fe",
  },
  legendText: {
    fontSize: 10.5,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  restDayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#64748B",
  },

  /* Bottom CTA */
  updateButtonContainer: {
    borderRadius: 18,
    overflow: "hidden",
    elevation: 8,
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 18,
  },
  updateButtonText: {
    color: "#050811",
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0.8,
  },
  updateButtonFeedbackText: {
    fontSize: 12,
    letterSpacing: 0.5,
    flex: 1,
    marginHorizontal: 8,
  },
  feedbackPlaceholder: {
    width: 28,
    height: 28,
  },
  undoCrossBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(5, 8, 17, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Centered Circular Loading Overlay */
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(7, 10, 17, 0.82)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999999,
    elevation: 30,
  },
  loadingCard: {
    width: width * 0.78,
    maxWidth: 320,
    backgroundColor: "#11141C",
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(0, 242, 254, 0.35)",
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#00f2fe",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 20,
  },
  loadingCircleWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(0, 242, 254, 0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(0, 242, 254, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 6,
  },
  loadingSubtitle: {
    color: "#94A3B8",
    fontSize: 11,
    fontFamily: "monospace",
    textAlign: "center",
  },

  /* Floating Drag Preview */
  floatingDragBadge: {
    position: "absolute",
    zIndex: 99999,
    elevation: 20,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  floatingDragGrad: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  floatingDragText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  /* Modal Sheet */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(4, 7, 14, 0.82)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0D111A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 34,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
    overflow: "hidden",
    position: "relative",
  },
  modalTopLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  modalHeaderInfo: {
    flex: 1,
    paddingRight: 12,
  },
  modalMicroTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  modalCyanDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#00f2fe",
    shadowColor: "#00f2fe",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
  modalMicroText: {
    color: "#38BDF8",
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 1,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  modalStatusCapsule: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    marginTop: 7,
    gap: 6,
  },
  modalStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modalStatusText: {
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  modalRestCapsule: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 6,
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    marginTop: 7,
    gap: 6,
  },
  modalRestDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#64748B",
  },
  modalRestText: {
    color: "#94A3B8",
    fontSize: 9.5,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalSectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  modalSectionLabel: {
    color: "#94A3B8",
    fontSize: 10.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  modalSectionSub: {
    color: "#64748B",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  modalGrid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
    marginBottom: 14,
  },
  modalSplitCard: {
    flexBasis: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.035)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
  },
  modalSplitColorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 8,
  },
  modalSplitCardName: {
    color: "#CBD5E1",
    fontSize: 11.5,
    fontFamily: "monospace",
    fontWeight: "700",
    flex: 1,
  },
  modalSplitCheck: {
    marginLeft: 4,
  },
  modalActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  modalOpenRoutineBtnWrapper: {
    flex: 1.6,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalOpenRoutineBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 12,
  },
  modalOpenRoutineText: {
    color: "#050811",
    fontSize: 11.5,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  modalClearBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "rgba(244, 63, 94, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.25)",
  },
  modalClearText: {
    color: "#F43F5E",
    fontSize: 10.5,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  modalHelperText: {
    color: "#64748B",
    fontSize: 10,
    fontFamily: "monospace",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 2,
    lineHeight: 14,
  },

  /* Simple, Neat & Clean Conflict Alert Modal */
  alertBackdrop: {
    flex: 1,
    backgroundColor: "rgba(5, 8, 17, 0.82)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 999999,
  },
  alertCard: {
    width: Math.min(width * 0.84, 320),
    backgroundColor: "#11141C",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  alertIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(244, 63, 94, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  alertTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  alertDescription: {
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "monospace",
    textAlign: "center",
    marginBottom: 14,
  },
  alertDescTarget: {
    color: "#F43F5E",
    fontWeight: "800",
  },
  alertDescSource: {
    color: "#00f2fe",
    fontWeight: "800",
  },
  alertSwapRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  alertSwapTargetText: {
    color: "#94A3B8",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  alertSwapSourceText: {
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "800",
  },
  alertActionsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  alertCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertCancelBtnText: {
    color: "#94A3B8",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  alertConfirmBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  alertConfirmGrad: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  alertConfirmBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
