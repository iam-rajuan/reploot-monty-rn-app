import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { QrCode, Share2, Sparkles } from "lucide-react-native";
import QRCodeStyled from "react-native-qrcode-styled";
import React, { useState } from "react";
import {
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const QR_GRADIENT = {
  type: "radial" as const,
  options: {
    colors: ["#FF7BC6", "#8B5CF6"],
    locations: [0, 1],
    center: [0.5, 0.5] as [number, number],
    radius: [1, 1] as [number, number],
  },
};

const CustomEyesQRCode = ({ value, size }: { value: string; size: number }) => {
  return (
    <QRCodeStyled
      data={value}
      size={size - 40}
      padding={20}
      style={styles.qrCode}
      errorCorrectionLevel="M"
      pieceBorderRadius="50%"
      gradient={QR_GRADIENT}
      outerEyesOptions={{
        topLeft: {
          borderRadius: ["40%", "40%", 0, "40%"],
        },
        topRight: {
          borderRadius: ["40%", "40%", "40%"],
        },
        bottomLeft: {
          borderRadius: ["40%", 0, "40%", "40%"],
        },
      }}
      innerEyesOptions={{
        borderRadius: "50%",
        scale: 0.85,
      }}
    />
  );
};

export const QRCodeCard = () => {
  const [copied, setCopied] = useState(false);
  const { width } = useWindowDimensions();
  const qrSize = width <= 430 ? 200 : 220;
  const athleteId = "KX-8821";
  const athleteUrl = `https://reploot.app/athlete/alex-rivers?id=${athleteId}`;

  const handleShare = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }

    try {
      await Share.share({
        title: "REPLOOT Athlete Pass",
        message: `REPLOOT Athlete Pass: Alex Rivers [ID: ${athleteId}]\nScan or visit: ${athleteUrl}`,
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
          <View style={styles.qrPlate}>
            <CustomEyesQRCode value={athleteUrl} size={qrSize} />
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
    backgroundColor: "#111A25",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.18)",
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
    borderRadius: 36,
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
    padding: 0,
    backgroundColor: "transparent",
  },
  qrPlate: {
    position: "relative",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.22)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#070B14",
  },
  qrCode: {
    backgroundColor: "#070B14",
    borderRadius: 20,
    overflow: "hidden",
  },
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
