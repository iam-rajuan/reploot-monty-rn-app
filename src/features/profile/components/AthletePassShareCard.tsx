import React, { forwardRef } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";
import {
  SHARE_CARD_THEMES,
  ShareCardBackground,
  ShareCardFooter,
  ShareCardTheme,
  ShareCardTopBar,
  shareCardBaseStyle,
} from "@/features/workouts/components/WorkoutShareCard";
import { AthleteQRCode } from "./AthleteQRCode";

export interface AthletePassShareCardProps {
  theme?: ShareCardTheme;
  dateLabel: string;
  name: string;
  athleteId: string;
  url: string;
  level?: number | string;
  tier?: string;
}

/** 4:5 shareable athlete pass: name, level, scannable QR and ID. */
export const AthletePassShareCard = forwardRef<View, AthletePassShareCardProps>(
  ({ theme = "midnight", dateLabel, name, athleteId, url, level, tier }, ref) => {
    const t = SHARE_CARD_THEMES[theme];
    return (
      <View ref={ref} collapsable={false} style={shareCardBaseStyle}>
        <ShareCardBackground theme={theme} />
        <ShareCardTopBar theme={theme} dateLabel={dateLabel} />

        <View style={styles.identity}>
          <View style={styles.kickerRow}>
            <View style={[styles.kickerDot, { backgroundColor: t.accent }]} />
            <Text style={[styles.kicker, { color: t.accentSoft }]}>ATHLETE PASS</Text>
          </View>
          <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
            {name}
          </Text>
          {level || tier ? (
            <Text style={styles.meta} numberOfLines={1}>
              {[level ? `Level ${level}` : null, tier].filter(Boolean).join(" · ")}
            </Text>
          ) : null}
        </View>

        <View style={styles.qrRow}>
          <View style={[styles.qrPlate, { borderColor: `${t.accent}55` }]}>
            <AthleteQRCode value={url} size={150} />
          </View>
          <View style={styles.qrInfo}>
            <Text style={styles.infoLabel}>ATHLETE ID</Text>
            <Text style={[styles.infoValue, { color: t.accentSoft }]}>#{athleteId}</Text>
            <View style={styles.infoRule} />
            <Text style={styles.infoHint}>Scan to connect and train together.</Text>
          </View>
        </View>

        <ShareCardFooter theme={theme} />
      </View>
    );
  },
);

AthletePassShareCard.displayName = "AthletePassShareCard";

const styles = StyleSheet.create({
  identity: {
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
  name: {
    ...typography.metricLarge,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  meta: {
    ...typography.caption,
    color: "rgba(226,232,240,0.7)",
  },
  qrRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  qrPlate: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: "#070B14",
  },
  qrInfo: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    ...typography.microTag,
    letterSpacing: 1,
    color: "rgba(226,232,240,0.55)",
  },
  infoValue: {
    ...typography.cardTitle,
    letterSpacing: 0.5,
  },
  infoRule: {
    height: 1,
    marginVertical: 8,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  infoHint: {
    ...typography.caption,
    color: "rgba(226,232,240,0.7)",
  },
});
