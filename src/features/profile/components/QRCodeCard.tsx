import { ShareImageSheet } from "@/features/workouts/components/ShareImageSheet";
import { useProgressionSnapshot } from "@/features/progression";
import { useXPProgress } from "@/hooks/queries/useProgress";
import { BrandLogo } from "@/shared/components/branding";
import { Text } from "@/shared/components/typography";
import { useAppSelector } from "@/store/hooks";
import { typography } from "@/theme/typography";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Share2 } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { AthletePassShareCard } from "./AthletePassShareCard";
import { AthleteQRCode } from "./AthleteQRCode";

const ACCENT = "#38BDF8";
const ACCENT_SOFT = "#7DD3FC";
const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;
const SURFACE_WASH = [
  "rgba(56,189,248,0.12)",
  "rgba(139,92,246,0.06)",
  "rgba(255,255,255,0.02)",
] as const;

export const QRCodeCard = () => {
  const { width } = useWindowDimensions();
  const qrSize = width <= 430 ? 196 : 216;
  const user = useAppSelector((state) => state.auth.user);
  const { data: xp } = useXPProgress();
  const progression = useProgressionSnapshot();
  const [shareOpen, setShareOpen] = useState(false);

  const name = user?.fullName || "Athlete";
  const athleteId = "KX-8821";
  const athleteUrl = `https://reploot.app/athlete/alex-rivers?id=${athleteId}`;
  const dateLabel = new Date()
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();

  const handleShare = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setShareOpen(true);
  };

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={SURFACE_WASH}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <BrandLogo size="sm" />
          <View style={styles.headerDivider} />
          <Text style={styles.cardTitle}>ATHLETE PASS</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>ACTIVE</Text>
        </View>
      </View>

      <View style={styles.qrContainer}>
        <View style={styles.qrPlate}>
          <AthleteQRCode value={athleteUrl} size={qrSize} />
        </View>
        <View style={styles.passDetailsRow}>
          <Text style={styles.passIdText}>#{athleteId}</Text>
          <View style={styles.passDot} />
          <Text style={styles.passScanNotice}>Scan to connect</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleShare}
        activeOpacity={0.85}
        style={styles.primaryBtn}
        accessibilityRole="button"
        accessibilityLabel="Share athlete pass"
      >
        <LinearGradient
          colors={BUTTON_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={SHEEN}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.primarySheen}
          pointerEvents="none"
        />
        <View>
          <Share2 size={15} color="#FFFFFF" strokeWidth={2.4} />
        </View>
        <Text style={styles.primaryBtnText}>SHARE ATHLETE PASS</Text>
      </TouchableOpacity>

      <ShareImageSheet
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Your athlete pass"
        shareText={`Train with me on REPLOOT — ${name} · #${athleteId}\n${athleteUrl}`}
        filename="reploot-athlete-pass"
        renderCard={(ref, theme) => (
          <AthletePassShareCard
            ref={ref}
            theme={theme}
            dateLabel={dateLabel}
            name={name}
            athleteId={athleteId}
            url={athleteUrl}
            level={xp?.currentLevel}
            tier={progression.tier.displayName}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111A25",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    padding: 16,
    gap: 16,
    marginBottom: 14,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(148,163,184,0.3)",
  },
  cardTitle: {
    ...typography.overline,
    color: "#CBD5E1",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  statusText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },
  qrContainer: {
    alignItems: "center",
    gap: 12,
  },
  qrPlate: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
    overflow: "hidden",
    backgroundColor: "#070B14",
  },
  passDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  passIdText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },
  passDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(148,163,184,0.5)",
  },
  passScanNotice: {
    ...typography.caption,
    color: "#94A3B8",
  },
  primaryBtn: {
    height: 50,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primarySheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  primaryBtnText: {
    ...typography.button,
    letterSpacing: 1,
    color: "#FFFFFF",
  },
});
