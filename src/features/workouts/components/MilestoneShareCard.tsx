import { Image } from "expo-image";
import { Clock, Flame, Sparkles, Target } from "lucide-react-native";
import React, { forwardRef } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";
import {
  SHARE_CARD_THEMES,
  ShareCardBackground,
  ShareCardFooter,
  ShareCardTheme,
  ShareCardTopBar,
  shareCardBaseStyle,
} from "./WorkoutShareCard";

export interface MilestoneShareCardProps {
  theme?: ShareCardTheme;
  dateLabel: string;
  /** e.g. 127 */
  total: number;
  /** e.g. "WORKOUTS" */
  unit?: string;
  headline?: string;
  stats: { time: string; calories: string; xp: string; accuracy: string };
  periodLabel?: string;
}

/** Medal box: ring diameter + breathing room. */
const MEDAL = 104;
const RING_R = 44;
/** Glow canvas, larger than the box and centred on it. */
const GLOW = 150;

/** 4:5 achievement poster: 3D trophy, big total and the period's stats. */
export const MilestoneShareCard = forwardRef<View, MilestoneShareCardProps>(
  (
    {
      theme = "midnight",
      dateLabel,
      total,
      unit = "WORKOUTS",
      headline = "MILESTONE UNLOCKED",
      stats,
      periodLabel = "THIS MONTH",
    },
    ref,
  ) => {
    const t = SHARE_CARD_THEMES[theme];
    const items = [
      { key: "time", Icon: Clock, value: stats.time, label: "TIME" },
      { key: "kcal", Icon: Flame, value: stats.calories, label: "KCAL" },
      { key: "xp", Icon: Sparkles, value: stats.xp, label: "XP" },
      { key: "acc", Icon: Target, value: stats.accuracy, label: "FORM" },
    ];

    return (
      <View ref={ref} collapsable={false} style={shareCardBaseStyle}>
        <ShareCardBackground theme={theme} />
        <ShareCardTopBar theme={theme} dateLabel={dateLabel} />

        <View style={styles.hero}>
          <View style={styles.medalWrap}>
            <Svg width={GLOW} height={GLOW} style={styles.glow} pointerEvents="none">
              <Defs>
                <RadialGradient id="medalGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={t.glowA} stopOpacity="0.55" />
                  <Stop offset="0.6" stopColor={t.glowA} stopOpacity="0.12" />
                  <Stop offset="1" stopColor={t.glowA} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx={GLOW / 2} cy={GLOW / 2} r={GLOW / 2} fill="url(#medalGlow)" />
              <Circle
                cx={GLOW / 2}
                cy={GLOW / 2}
                r={RING_R}
                fill="rgba(5,7,14,0.35)"
                stroke={t.accentSoft}
                strokeOpacity={0.5}
                strokeWidth={2}
              />
            </Svg>
            <Image
              source={require("../../../../assets/badges/trophy.png")}
              style={styles.trophy}
              contentFit="contain"
            />
          </View>

          <View style={styles.kickerRow}>
            <View style={[styles.kickerDot, { backgroundColor: t.accent }]} />
            <Text style={[styles.kicker, { color: t.accentSoft }]}>{headline}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.total}>{total}</Text>
            <Text style={[styles.unit, { color: t.accentSoft }]}>{unit}</Text>
          </View>
          <Text style={styles.caption}>Completed and counting.</Text>
        </View>

        <View style={styles.strip}>
          <Text style={styles.stripLabel}>{periodLabel}</Text>
          <View style={styles.stripRow}>
            {items.map(({ key, Icon, value, label }, i) => (
              <View key={key} style={[styles.cell, i > 0 && styles.cellDivider]}>
                <Icon size={12} color={t.accentSoft} strokeWidth={2.4} />
                <Text style={styles.cellValue} numberOfLines={1} adjustsFontSizeToFit>
                  {value}
                </Text>
                <Text style={styles.cellLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <ShareCardFooter theme={theme} />
      </View>
    );
  },
);

MilestoneShareCard.displayName = "MilestoneShareCard";

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
  },
  medalWrap: {
    width: MEDAL,
    height: MEDAL,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  glow: {
    position: "absolute",
    top: (MEDAL - GLOW) / 2,
    left: (MEDAL - GLOW) / 2,
  },
  trophy: {
    width: 62,
    height: 62,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  kicker: {
    ...typography.overline,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  total: {
    ...typography.metricHero,
    color: "#FFFFFF",
  },
  unit: {
    ...typography.cardTitle,
    letterSpacing: 1,
  },
  caption: {
    ...typography.caption,
    color: "rgba(226,232,240,0.65)",
    marginTop: -2,
  },
  strip: {
    gap: 8,
    paddingTop: 10,
    paddingBottom: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  stripLabel: {
    ...typography.microTag,
    letterSpacing: 1,
    color: "rgba(226,232,240,0.55)",
    textAlign: "center",
  },
  stripRow: {
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 4,
  },
  cellDivider: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.08)",
  },
  cellValue: {
    ...typography.cardTitle,
    fontSize: 14,
    lineHeight: 18,
    color: "#FFFFFF",
  },
  cellLabel: {
    ...typography.microTag,
    color: "rgba(226,232,240,0.6)",
  },
});
