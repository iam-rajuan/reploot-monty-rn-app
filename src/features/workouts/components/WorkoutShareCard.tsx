import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle2, Clock, Flame, Target, Trophy, Zap } from "lucide-react-native";
import React, { forwardRef } from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";

/** Card is laid out at 320×400 (4:5) and exported at 1080×1350. */
export const SHARE_CARD_WIDTH = 320;
export const SHARE_CARD_HEIGHT = 400;

export type ShareCardTheme = "midnight" | "ocean" | "aurora";

interface ThemeSpec {
  label: string;
  swatch: string;
  base: readonly [string, string, string];
  glowA: string;
  glowB: string;
  ring: readonly [string, string, string];
  accent: string;
  accentSoft: string;
}

export const SHARE_CARD_THEMES: Record<ShareCardTheme, ThemeSpec> = {
  midnight: {
    label: "Midnight",
    swatch: "#38BDF8",
    base: ["#13204A", "#0A1124", "#05070E"],
    glowA: "#38BDF8",
    glowB: "#6366F1",
    ring: ["#7DD3FC", "#38BDF8", "#6366F1"],
    accent: "#38BDF8",
    accentSoft: "#7DD3FC",
  },
  ocean: {
    label: "Ocean",
    swatch: "#22D3EE",
    base: ["#06343F", "#061C26", "#03090E"],
    glowA: "#22D3EE",
    glowB: "#0EA5E9",
    ring: ["#A5F3FC", "#22D3EE", "#0EA5E9"],
    accent: "#22D3EE",
    accentSoft: "#A5F3FC",
  },
  aurora: {
    label: "Aurora",
    swatch: "#A78BFA",
    base: ["#2A1650", "#140B2C", "#07050F"],
    glowA: "#A78BFA",
    glowB: "#38BDF8",
    ring: ["#C4B5FD", "#A78BFA", "#38BDF8"],
    accent: "#A78BFA",
    accentSoft: "#C4B5FD",
  },
};

export interface WorkoutShareCardProps {
  theme?: ShareCardTheme;
  workoutTitle: string;
  workoutSubtitle?: string;
  dateLabel: string;
  score: number;
  xpEarned: number;
  accuracy: number;
  completed: number;
  total: number;
  calories: number;
  duration: string;
  tierLabel?: string;
}

/** Gradient, two soft glows and faint diagonal lines shared by every card. */
export function ShareCardBackground({ theme }: { theme: ShareCardTheme }) {
  const t = SHARE_CARD_THEMES[theme];
  return (
    <>
      <LinearGradient
        colors={t.base}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg
        width={SHARE_CARD_WIDTH}
        height={SHARE_CARD_HEIGHT}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient id="glowA" cx="85%" cy="12%" r="55%">
            <Stop offset="0" stopColor={t.glowA} stopOpacity="0.42" />
            <Stop offset="1" stopColor={t.glowA} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="glowB" cx="5%" cy="92%" r="60%">
            <Stop offset="0" stopColor={t.glowB} stopOpacity="0.32" />
            <Stop offset="1" stopColor={t.glowB} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#glowA)" />
        <Rect width="100%" height="100%" fill="url(#glowB)" />
        {[0, 1, 2].map((i) => (
          <Line
            key={i}
            x1={150 + i * 70}
            y1={0}
            x2={-30 + i * 70}
            y2={SHARE_CARD_HEIGHT}
            stroke="#FFFFFF"
            strokeOpacity={0.035}
            strokeWidth={1}
          />
        ))}
      </Svg>
    </>
  );
}

/** REPLOOT wordmark + date pill. */
export function ShareCardTopBar({
  theme,
  dateLabel,
}: {
  theme: ShareCardTheme;
  dateLabel: string;
}) {
  const t = SHARE_CARD_THEMES[theme];
  return (
    <View style={styles.topRow}>
      <Text style={styles.brand}>
        REP<Text style={[styles.brand, { color: t.accent }]}>LOOT</Text>
      </Text>
      <View style={styles.datePill}>
        <Text style={styles.dateText}>{dateLabel}</Text>
      </View>
    </View>
  );
}

/** "Tracked with REPLOOT" footer. */
export function ShareCardFooter({ theme }: { theme: ShareCardTheme }) {
  const t = SHARE_CARD_THEMES[theme];
  return (
    <View style={styles.footer}>
      <View style={[styles.footerRule, { backgroundColor: t.accent }]} />
      <Text style={styles.footerText}>Tracked with REPLOOT</Text>
    </View>
  );
}

/** Root style for any 320×400 share card. */
export const shareCardBaseStyle = {
  width: SHARE_CARD_WIDTH,
  height: SHARE_CARD_HEIGHT,
  borderRadius: 28,
  overflow: "hidden" as const,
  padding: 22,
  justifyContent: "space-between" as const,
  backgroundColor: "#05070E",
};

const RING = 118;
const STROKE = 10;
const R = (RING - STROKE) / 2;
const C = 2 * Math.PI * R;

export const WorkoutShareCard = forwardRef<View, WorkoutShareCardProps>(
  (
    {
      theme = "midnight",
      workoutTitle,
      workoutSubtitle,
      dateLabel,
      score,
      xpEarned,
      accuracy,
      completed,
      total,
      calories,
      duration,
      tierLabel = "Elite athlete",
    },
    ref,
  ) => {
    const t = SHARE_CARD_THEMES[theme];
    const progress = Math.min(Math.max(score / 1000, 0.05), 0.97);
    const title = workoutTitle.replace(/\s*PROTOCOL\s*$/i, "").trim();

    const stats = [
      { key: "acc", Icon: Target, value: `${accuracy}%`, label: "ACCURACY" },
      { key: "ex", Icon: CheckCircle2, value: `${completed}/${total}`, label: "EXERCISES" },
      { key: "kcal", Icon: Flame, value: `${calories}`, label: "KCAL" },
      { key: "time", Icon: Clock, value: duration, label: "MINUTES" },
    ];

    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <ShareCardBackground theme={theme} />
        <ShareCardTopBar theme={theme} dateLabel={dateLabel} />

        {/* Title */}
        <View style={styles.titleBlock}>
          <View style={styles.kickerRow}>
            <View style={[styles.kickerDot, { backgroundColor: t.accent }]} />
            <Text style={[styles.kicker, { color: t.accentSoft }]}>WORKOUT COMPLETE</Text>
          </View>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
            {title}
          </Text>
          {workoutSubtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {workoutSubtitle}
            </Text>
          ) : null}
        </View>

        {/* Score */}
        <View style={styles.scoreRow}>
          <View style={styles.ringWrap}>
            <Svg width={RING} height={RING}>
              <Defs>
                <SvgGradient id="shareRing" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={t.ring[0]} />
                  <Stop offset="0.5" stopColor={t.ring[1]} />
                  <Stop offset="1" stopColor={t.ring[2]} />
                </SvgGradient>
              </Defs>
              <Circle
                cx={RING / 2}
                cy={RING / 2}
                r={R}
                stroke="rgba(255,255,255,0.10)"
                strokeWidth={STROKE}
                fill="rgba(5,7,14,0.35)"
              />
              <Circle
                cx={RING / 2}
                cy={RING / 2}
                r={R}
                stroke="url(#shareRing)"
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${C} ${C}`}
                strokeDashoffset={C * (1 - progress)}
                fill="none"
                transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
              />
            </Svg>
            <View style={styles.ringCenter}>
              <Text style={styles.scoreValue}>{score}</Text>
              <Text style={styles.scoreLabel}>SCORE</Text>
            </View>
          </View>

          <View style={styles.scoreSide}>
            <View style={[styles.xpPill, { backgroundColor: t.accent }]}>
              <Zap size={11} color="#05070E" fill="#05070E" />
              <Text style={styles.xpText}>+{xpEarned} XP</Text>
            </View>
            <View style={styles.tierRow}>
              <Trophy size={13} color={t.accentSoft} strokeWidth={2.4} />
              <Text style={styles.tierText}>{tierLabel}</Text>
            </View>
            <Text style={styles.sideNote}>
              Form held at{" "}
              <Text style={[styles.sideNoteStrong, { color: t.accentSoft }]}>
                {accuracy}%
              </Text>{" "}
              across every set.
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsStrip}>
          {stats.map(({ key, Icon, value, label }, i) => (
            <View
              key={key}
              style={[styles.statCell, i > 0 && styles.statDivider]}
            >
              <Icon size={13} color={t.accentSoft} strokeWidth={2.4} />
              <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                {value}
              </Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <ShareCardFooter theme={theme} />
      </View>
    );
  },
);

WorkoutShareCard.displayName = "WorkoutShareCard";

const styles = StyleSheet.create({
  card: {
    width: SHARE_CARD_WIDTH,
    height: SHARE_CARD_HEIGHT,
    borderRadius: 28,
    overflow: "hidden",
    padding: 22,
    justifyContent: "space-between",
    backgroundColor: "#05070E",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    ...typography.brandLogo,
    fontSize: 16,
    lineHeight: 20,
    color: "#FFFFFF",
  },
  datePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  dateText: {
    ...typography.badge,
    color: "#E2E8F0",
  },
  titleBlock: {
    gap: 2,
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
  title: {
    ...typography.metricLarge,
    letterSpacing: 0.2,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  subtitle: {
    ...typography.caption,
    color: "rgba(226,232,240,0.7)",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  ringWrap: {
    width: RING,
    height: RING,
  },
  ringCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreValue: {
    ...typography.metricLarge,
    color: "#FFFFFF",
  },
  scoreLabel: {
    ...typography.overline,
    color: "rgba(226,232,240,0.6)",
    marginTop: -2,
  },
  scoreSide: {
    flex: 1,
    gap: 8,
  },
  xpPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  xpText: {
    ...typography.badge,
    color: "#05070E",
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tierText: {
    ...typography.cardTitle,
    fontSize: 14,
    lineHeight: 18,
    color: "#FFFFFF",
  },
  sideNote: {
    ...typography.caption,
    color: "rgba(226,232,240,0.7)",
  },
  sideNoteStrong: {
    ...typography.caption,
    fontWeight: "700",
  },
  statsStrip: {
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  statCell: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 4,
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.08)",
  },
  statValue: {
    ...typography.cardTitle,
    fontSize: 16,
    lineHeight: 20,
    color: "#FFFFFF",
  },
  statLabel: {
    ...typography.microTag,
    color: "rgba(226,232,240,0.6)",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerRule: {
    width: 18,
    height: 2,
    borderRadius: 1,
  },
  footerText: {
    ...typography.caption,
    color: "rgba(226,232,240,0.6)",
  },
});
