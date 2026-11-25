import { ShieldCheck } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";

export const EditProfileSecurityBox = () => {
  return (
    <View style={styles.securityBox}>
      <View style={styles.iconContainer}>
        <ShieldCheck size={21} color="#25D7E8" strokeWidth={1.9} />
      </View>
      <View style={styles.securityTextContent}>
        <Text style={styles.securityTitle}>PROFILE PROTECTED</Text>
        <Text style={styles.securityDesc}>
          Personal and biometric data is encrypted.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  securityBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0E1826",
    borderWidth: 1,
    borderColor: "rgba(86, 130, 166, 0.24)",
    borderRadius: 15,
    padding: 13,
    marginBottom: 18,
    marginTop: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    borderRadius: 12,
    backgroundColor: "rgba(37, 215, 232, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(37, 215, 232, 0.22)",
  },
  securityTextContent: {
    flex: 1,
  },
  securityTitle: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  securityDesc: {
    color: "#8E9AB4",
    fontSize: 10,
    lineHeight: 15,
  },
});
