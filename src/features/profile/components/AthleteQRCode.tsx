import React from "react";
import { StyleSheet } from "react-native";
import QRCodeStyled from "react-native-qrcode-styled";

// Sky diagonal gradient. Every stop is bright enough to keep strong contrast
// against the dark #070B14 plate, so the code stays easy to scan.
const QR_GRADIENT = {
  type: "linear" as const,
  options: {
    colors: ["#7DD3FC", "#38BDF8", "#0EA5E9"],
    locations: [0, 0.5, 1],
    start: [0, 0] as [number, number],
    end: [1, 1] as [number, number],
  },
};

/** Rounded-dot QR with soft corner eyes, used on the card and the share image. */
export const AthleteQRCode = ({ value, size }: { value: string; size: number }) => (
  <QRCodeStyled
    data={value}
    size={size - 32}
    padding={16}
    style={styles.qrCode}
    // "L" keeps the grid small (bigger dots) — fine for an on-screen code with no logo overlay.
    errorCorrectionLevel="L"
    pieceBorderRadius="50%"
    gradient={QR_GRADIENT}
    outerEyesOptions={{
      topLeft: { borderRadius: ["40%", "40%", 0, "40%"] },
      topRight: { borderRadius: ["40%", "40%", "40%"] },
      bottomLeft: { borderRadius: ["40%", 0, "40%", "40%"] },
    }}
    innerEyesOptions={{ borderRadius: "50%", scale: 1 }}
  />
);

const styles = StyleSheet.create({
  qrCode: {
    backgroundColor: "#070B14",
    borderRadius: 20,
    overflow: "hidden",
  },
});
