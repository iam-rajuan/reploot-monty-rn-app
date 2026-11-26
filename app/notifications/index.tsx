import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import * as Haptics from "expo-haptics";
import {
  Award,
  BellOff,
  CheckCheck,
  CreditCard,
  Droplet,
  Dumbbell,
  Utensils,
  type LucideIcon,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { typography } from "@/theme/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

const ACCENT = "#38BDF8";
const ACCENT_SOFT = "#7DD3FC";

type NotificationType = "workout" | "meal" | "achievement" | "water" | "subscription";

interface NotificationItem {
  id: number;
  section: "Today" | "Yesterday" | "Earlier";
  type: NotificationType;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

const INITIAL: NotificationItem[] = [
  {
    id: 1,
    section: "Today",
    type: "workout",
    title: "Workout reminder",
    desc: "Today's workout is ready. Start when you are.",
    time: "2m",
    unread: true,
  },
  {
    id: 2,
    section: "Today",
    type: "meal",
    title: "Protein check-in",
    desc: "You're 40g away from your 180g protein target.",
    time: "1h",
    unread: true,
  },
  {
    id: 3,
    section: "Yesterday",
    type: "achievement",
    title: "Achievement unlocked",
    desc: "7-day workout streak — keep it going!",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 4,
    section: "Yesterday",
    type: "water",
    title: "Hydration goal",
    desc: "Drink 500 ml more to reach today's goal.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 5,
    section: "Earlier",
    type: "subscription",
    title: "Plan renews soon",
    desc: "REPLOOT Pro renews in 3 days.",
    time: "2d",
    unread: false,
  },
];

const ICONS: Record<NotificationType, LucideIcon> = {
  workout: Dumbbell,
  meal: Utensils,
  achievement: Award,
  water: Droplet,
  subscription: CreditCard,
};

const SECTIONS: NotificationItem["section"][] = ["Today", "Yesterday", "Earlier"];

export default function NotificationsRoute() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState(INITIAL);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = items.filter((n) => n.unread).length;
  const visible = useMemo(
    () => (filter === "unread" ? items.filter((n) => n.unread) : items),
    [filter, items],
  );

  const haptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const markRead = (id: number) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const markAllRead = () => {
    if (!unreadCount) return;
    haptic();
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <View style={styles.container}>
      <ScreenBackground />

      <CustomHeader
        title=""
        titleVariant="text"
        showBackButton={true}
        showSearch={false}
        showNotifications={false}
        showAvatar={true}
        transparent={true}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 24, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <View style={styles.titleTop}>
            <Text style={styles.categoryBadge}>INBOX</Text>
            {unreadCount > 0 ? (
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{unreadCount} NEW</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.mainTitle} numberOfLines={1} adjustsFontSizeToFit>
            NOTIFICATIONS
          </Text>
        </View>

        <View style={styles.toolbar}>
          <View style={styles.segment}>
            {(["all", "unread"] as const).map((key) => {
              const active = filter === key;
              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.8}
                  onPress={() => {
                    haptic();
                    setFilter(key);
                  }}
                  style={[styles.segmentItem, active && styles.segmentItemActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {key === "all" ? "ALL" : `UNREAD${unreadCount ? ` · ${unreadCount}` : ""}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={markAllRead}
            disabled={!unreadCount}
            style={[styles.markAll, !unreadCount && styles.markAllDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Mark all as read"
          >
            <CheckCheck size={14} color={unreadCount ? ACCENT_SOFT : "#475569"} strokeWidth={2.4} />
            <Text style={[styles.markAllText, !unreadCount && styles.markAllTextDisabled]}>
              Mark all read
            </Text>
          </TouchableOpacity>
        </View>

        {visible.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <BellOff size={22} color={ACCENT} strokeWidth={2.2} />
            </View>
            <Text style={styles.emptyTitle}>You're all caught up</Text>
            <Text style={styles.emptyText}>New reminders and achievements will show up here.</Text>
          </View>
        ) : (
          SECTIONS.map((section) => {
            const rows = visible.filter((n) => n.section === section);
            if (!rows.length) return null;
            return (
              <View key={section} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.toUpperCase()}</Text>
                <View style={styles.card}>
                  {rows.map((item, i) => {
                    const Icon = ICONS[item.type];
                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.75}
                        onPress={() => markRead(item.id)}
                        style={[
                          styles.row,
                          i > 0 && styles.rowDivider,
                          item.unread && styles.rowUnread,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.unread ? "Unread. " : ""}${item.title}. ${item.desc}`}
                      >
                        <View style={[styles.iconChip, item.unread && styles.iconChipUnread]}>
                          <Icon
                            size={17}
                            color={item.unread ? ACCENT : "#94A3B8"}
                            strokeWidth={2.2}
                          />
                        </View>
                        <View style={styles.rowCopy}>
                          <View style={styles.rowTop}>
                            <Text
                              style={[styles.rowTitle, !item.unread && styles.rowTitleRead]}
                              numberOfLines={1}
                            >
                              {item.title}
                            </Text>
                            <Text style={styles.rowTime}>{item.time}</Text>
                          </View>
                          <Text style={styles.rowDesc} numberOfLines={2}>
                            {item.desc}
                          </Text>
                        </View>
                        {item.unread ? <View style={styles.unreadDot} /> : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060810",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  titleSection: {
    marginTop: 4,
    marginBottom: 16,
    gap: 4,
  },
  titleTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryBadge: {
    ...typography.overline,
    fontSize: 11,
    lineHeight: 16,
    color: ACCENT_SOFT,
  },
  countPill: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 999,
    backgroundColor: "#0EA5E9",
  },
  countPillText: {
    ...typography.badge,
    color: "#FFFFFF",
  },
  mainTitle: {
    ...typography.pageTitle,
    color: "#F6F8FF",
  },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 18,
  },
  segment: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 14,
    backgroundColor: "rgba(17,26,37,0.8)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.14)",
  },
  segmentItem: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentItemActive: {
    backgroundColor: "rgba(56,189,248,0.16)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.4)",
  },
  segmentText: {
    ...typography.badge,
    color: "#7C8BA1",
  },
  segmentTextActive: {
    color: ACCENT_SOFT,
  },
  markAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
  },
  markAllDisabled: {
    opacity: 0.6,
  },
  markAllText: {
    ...typography.buttonSmall,
    color: ACCENT_SOFT,
  },
  markAllTextDisabled: {
    color: "#475569",
  },

  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    ...typography.overline,
    color: "#7C8BA1",
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#111A25",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.10)",
  },
  rowUnread: {
    backgroundColor: "rgba(56,189,248,0.06)",
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(148,163,184,0.08)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
  },
  iconChipUnread: {
    backgroundColor: "rgba(56,189,248,0.12)",
    borderColor: "rgba(56,189,248,0.3)",
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rowTitle: {
    ...typography.cardTitle,
    fontSize: 14,
    lineHeight: 18,
    color: "#F8FAFC",
    flexShrink: 1,
  },
  rowTitleRead: {
    color: "#CBD5E1",
  },
  rowTime: {
    ...typography.caption,
    color: "#64748B",
  },
  rowDesc: {
    ...typography.bodySmall,
    color: "#94A3B8",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },

  empty: {
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
    marginBottom: 6,
  },
  emptyTitle: {
    ...typography.cardTitle,
    color: "#F8FAFC",
  },
  emptyText: {
    ...typography.bodySmall,
    color: "#94A3B8",
    textAlign: "center",
  },
});
