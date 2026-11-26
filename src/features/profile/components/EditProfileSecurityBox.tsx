import { ShieldCheck } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";

export const EditProfileSecurityBox = () => (
  <View style={styles.box}>
    <ShieldCheck size={16} color="#38BDF8" strokeWidth={2.2} />
    <Text style={styles.text}>Your personal details are encrypted and never shared.</Text>
  </View>
);

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "rgba(56,189,248,0.07)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.2)",
    marginBottom: 18,
  },
  text: {
    ...typography.caption,
    flex: 1,
    color: "#A7B3C5",
  },
});
