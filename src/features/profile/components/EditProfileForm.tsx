import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, Mail, Phone, User, type LucideIcon } from "lucide-react-native";
import React, { useState } from "react";
import { KeyboardTypeOptions, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, TextInput } from "@/shared/components/typography";
import { typography } from "@/theme/typography";

const ACCENT = "#38BDF8";
const ACCENT_SOFT = "#7DD3FC";
const SURFACE_WASH = [
  "rgba(56,189,248,0.12)",
  "rgba(139,92,246,0.06)",
  "rgba(255,255,255,0.02)",
] as const;

const GENDERS = ["Male", "Female", "Other"] as const;

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  Icon: LucideIcon;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "words";
  placeholder?: string;
}

function Field({ label, value, onChangeText, Icon, keyboardType, autoCapitalize, placeholder }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputBox, focused && styles.inputBoxFocused]}>
        <Icon size={16} color={focused ? ACCENT : "#64748B"} strokeWidth={2.2} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholder={placeholder}
          placeholderTextColor="#475569"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
}

export const EditProfileForm = () => {
  const [fullName, setFullName] = useState("Alex Rivers");
  const [email, setEmail] = useState("alex.rivers@reploot.ai");
  const [phone, setPhone] = useState("+1 (555) 092-8831");
  const [dob, setDob] = useState("05/12/1998");
  const [gender, setGender] = useState<(typeof GENDERS)[number]>("Male");

  const pickGender = (value: (typeof GENDERS)[number]) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setGender(value);
  };

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={SURFACE_WASH}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>

      <Field
        label="FULL NAME"
        value={fullName}
        onChangeText={setFullName}
        Icon={User}
        autoCapitalize="words"
      />
      <Field
        label="EMAIL"
        value={email}
        onChangeText={setEmail}
        Icon={Mail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Field
        label="PHONE"
        value={phone}
        onChangeText={setPhone}
        Icon={Phone}
        keyboardType="phone-pad"
      />
      <Field
        label="DATE OF BIRTH"
        value={dob}
        onChangeText={setDob}
        Icon={Calendar}
        keyboardType="numbers-and-punctuation"
        placeholder="MM/DD/YYYY"
      />

      <View style={styles.field}>
        <Text style={styles.label}>GENDER</Text>
        <View style={styles.segment}>
          {GENDERS.map((option) => {
            const active = option === gender;
            return (
              <TouchableOpacity
                key={option}
                activeOpacity={0.8}
                onPress={() => pickGender(option)}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
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
    gap: 14,
    marginBottom: 12,
    overflow: "hidden",
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: "#E5EEF8",
  },
  field: {
    gap: 6,
  },
  label: {
    ...typography.formLabel,
    color: "#7C8BA1",
  },
  inputBox: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(6,8,16,0.55)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
  },
  inputBoxFocused: {
    borderColor: "rgba(56,189,248,0.55)",
    backgroundColor: "rgba(56,189,248,0.06)",
  },
  input: {
    ...typography.input,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    padding: 0,
    color: "#F8FAFC",
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : {}),
  },
  segment: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 14,
    backgroundColor: "rgba(6,8,16,0.55)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
  },
  segmentItem: {
    flex: 1,
    height: 40,
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
    ...typography.subtitle,
    fontSize: 13,
    lineHeight: 18,
    color: "#7C8BA1",
  },
  segmentTextActive: {
    color: ACCENT_SOFT,
  },
});
