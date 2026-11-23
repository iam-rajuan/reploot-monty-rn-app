import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, QrCode, Share2, Sparkles } from "lucide-react-native";
import React, { useState } from "react";
import {
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

export const QRCodeCard = () => {
  const [copied, setCopied] = useState(false);
  const athleteId = "KX-8821";
  const athleteUrl = `https://kinetqx.app/athlete/alex-rivers?id=${athleteId}`;

  const handleShare = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }

    try {
      await Share.share({
        title: "REPLOOTAthlete Pass",
        message: `REPLOOTAthlete Pass: Alex Rivers [ID: ${athleteId}]\nScan or visit: ${athleteUrl}`,
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerTitleRow}>
          <View style={styles.iconBadge}>
            <QrCode size={15} color="#38BDF8" />
          </View>
          <Text style={styles.cardTitle}>ATHLETE PASS QR</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>ACTIVE</Text>
        </View>
      </View>

      {/* Cyber Scannable QR HUD Frame */}
      <View style={styles.qrContainer}>
        {/* Outer Cyber Glow Border with Corner Accents */}
        <View style={styles.qrFrameOuter}>
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(201,193,255,0.16)", "rgba(16,20,29,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.cornerBracket, styles.topLeftBracket]} />
          <View style={[styles.cornerBracket, styles.topRightBracket]} />
          <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
          <View style={[styles.cornerBracket, styles.bottomRightBracket]} />
          <View pointerEvents="none" style={[styles.scanNode, styles.scanNodeTopLeft]} />
          <View pointerEvents="none" style={[styles.scanNode, styles.scanNodeTopRight]} />
          <View pointerEvents="none" style={[styles.scanNode, styles.scanNodeBottomLeft]} />

          <View style={styles.qrPlate}>
            <QRCode
              value={athleteUrl}
              size={152}
              color="#D8D2FF"
              backgroundColor="#090C12"
              quietZone={10}
              ecl="H"
            />
            <View pointerEvents="none" style={styles.qrCenterMark}>
              <ChevronRight size={19} color="#45E7C6" strokeWidth={3} />
            </View>
          </View>
        </View>

        {/* Telemetry Label */}
        <View style={styles.passDetailsRow}>
          <Text style={styles.passIdText}>ID: #{athleteId}</Text>
          <Text style={styles.passDivider}>•</Text>
          <Text style={styles.passScanNotice}>SCAN TO CONNECT</Text>
        </View>
      </View>

      {/* Share / Action Button */}
      <TouchableOpacity
        onPress={handleShare}
        activeOpacity={0.8}
        style={styles.buttonWrapper}
      >
        <LinearGradient
          colors={["#0284C7", "#0EA5E9", "#38BDF8"]}
          style={styles.btnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {copied ? (
            <View style={styles.btnContentRow}>
              <Sparkles size={16} color="#FFFFFF" />
              <Text style={styles.btnText}>PASS LINK SHARED</Text>
            </View>
          ) : (
            <View style={styles.btnContentRow}>
              <Share2 size={16} color="#FFFFFF" />
              <Text style={styles.btnText}>SHARE ATHLETE PASS QR</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(45, 212, 191, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2DD4BF",
    marginRight: 5,
  },
  statusText: {
    color: "#2DD4BF",
    fontSize: 10,
    fontWeight: "800",
    fontFamily: "monospace",
    letterSpacing: 0.8,
  },
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  qrFrameOuter: {
    position: "relative",
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#090C12",
    borderWidth: 1,
    borderColor: "rgba(201,193,255,0.60)",
    shadowColor: "#8B7DFF",
    shadowOpacity: 0.26,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  cornerBracket: {
    position: "absolute",
    width: 17,
    height: 17,
    borderColor: "#45E7C6",
  },
  topLeftBracket: {
    top: 5,
    left: 5,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopLeftRadius: 6,
  },
  topRightBracket: {
    top: 5,
    right: 5,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderTopRightRadius: 6,
  },
  bottomLeftBracket: {
    bottom: 5,
    left: 5,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderBottomLeftRadius: 6,
  },
  bottomRightBracket: {
    bottom: 5,
    right: 5,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomRightRadius: 6,
  },
  qrPlate: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10141D",
    borderWidth: 2,
    borderColor: "rgba(201,193,255,0.90)",
    shadowColor: "#C9C1FF",
    shadowOpacity: 0.26,
    shadowRadius: 12,
    elevation: 4,
  },
  qrCenterMark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121821",
    borderWidth: 2,
    borderColor: "#45E7C6",
    shadowColor: "#45E7C6",
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 5,
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  scanNode: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 2,
    backgroundColor: "#45E7C6",
    shadowColor: "#45E7C6",
    shadowOpacity: 0.8,
    shadowRadius: 7,
    elevation: 5,
  },
  scanNodeTopLeft: { top: 10, left: 34 },
  scanNodeTopRight: { top: 34, right: 10 },
  scanNodeBottomLeft: { bottom: 31, left: 10 },
  passDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  passIdText: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "800",
    fontFamily: "monospace",
    letterSpacing: 0.8,
  },
  passDivider: {
    color: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 8,
  },
  passScanNotice: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "monospace",
    letterSpacing: 0.5,
  },
  buttonWrapper: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  btnGradient: {
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  btnContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    fontFamily: "monospace",
    letterSpacing: 1.2,
  },
});
