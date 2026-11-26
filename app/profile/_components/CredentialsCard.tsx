import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { KeyRound, Lock, Mail, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, TextInput } from "@/shared/components/typography";
import { typography } from "@/theme/typography";

const ACCENT = "#38BDF8";
const ACCENT_SOFT = "#7DD3FC";
const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;

interface CredentialsCardProps {
  onPasswordUpdated?: () => void;
  email?: string;
}

export function CredentialsCard({
  onPasswordUpdated,
  email = "alex.rivers@reploot.app",
}: CredentialsCardProps = {}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const tooShort = next.length > 0 && next.length < 8;
  const mismatch = confirm.length > 0 && confirm !== next;
  const canSave = current.length > 0 && next.length >= 8 && confirm === next;

  const triggerHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const openModal = () => {
    triggerHaptic();
    setCurrent("");
    setNext("");
    setConfirm("");
    setModalVisible(true);
  };

  const save = () => {
    if (!canSave) return;
    triggerHaptic();
    setModalVisible(false);
    onPasswordUpdated?.();
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconChip}>
          <Mail size={16} color={ACCENT} strokeWidth={2.2} />
        </View>
        <View style={styles.rowCopy}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value} numberOfLines={1}>
            {email}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.iconChip}>
          <Lock size={16} color={ACCENT} strokeWidth={2.2} />
        </View>
        <View style={styles.rowCopy}>
          <Text style={styles.label}>Password</Text>
          <Text style={styles.value}>••••••••••</Text>
        </View>
        <TouchableOpacity
          style={styles.changeChip}
          activeOpacity={0.75}
          onPress={openModal}
          accessibilityRole="button"
          accessibilityLabel="Change password"
        >
          <Text style={styles.changeChipText}>CHANGE</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.iconChip}>
                  <KeyRound size={15} color={ACCENT} strokeWidth={2.4} />
                </View>
                <Text style={styles.modalTitle}>Change password</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={16} color="#94A3B8" strokeWidth={2.6} />
              </TouchableOpacity>
            </View>

            <View style={styles.fields}>
              {[
                { key: "cur", label: "Current password", value: current, set: setCurrent },
                { key: "new", label: "New password", value: next, set: setNext },
                { key: "con", label: "Confirm new password", value: confirm, set: setConfirm },
              ].map((field) => (
                <View key={field.key} style={styles.field}>
                  <Text style={styles.fieldLabel}>{field.label.toUpperCase()}</Text>
                  <View style={styles.inputBox}>
                    <Lock size={14} color="#64748B" strokeWidth={2.2} />
                    <TextInput
                      value={field.value}
                      onChangeText={field.set}
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#475569"
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              ))}
              <Text style={[styles.hint, (tooShort || mismatch) && styles.hintError]}>
                {tooShort
                  ? "Use at least 8 characters."
                  : mismatch
                    ? "Passwords don't match."
                    : "At least 8 characters."}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.primaryBtn, !canSave && styles.primaryBtnDisabled]}
              onPress={save}
              disabled={!canSave}
              accessibilityRole="button"
              accessibilityLabel="Save new password"
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
              <Text style={styles.primaryBtnText}>UPDATE PASSWORD</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.ghostBtn}
              onPress={() => setModalVisible(false)}
              accessibilityRole="button"
            >
              <Text style={styles.ghostBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111A25",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    paddingHorizontal: 14,
    marginBottom: 22,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  label: {
    ...typography.caption,
    color: "#7C8BA1",
  },
  value: {
    ...typography.cardTitle,
    fontSize: 14,
    lineHeight: 18,
    color: "#F8FAFC",
  },
  changeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  changeChipText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(148,163,184,0.10)",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(2,4,10,0.78)",
  },
  modal: {
    padding: 18,
    gap: 14,
    borderRadius: 26,
    backgroundColor: "#0D1420",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalTitle: {
    ...typography.cardTitle,
    color: "#F8FAFC",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  fields: {
    gap: 10,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    ...typography.formLabel,
    color: "#7C8BA1",
  },
  inputBox: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(6,8,16,0.6)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  input: {
    ...typography.input,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    padding: 0,
    color: "#F8FAFC",
  },
  hint: {
    ...typography.caption,
    color: "#64748B",
  },
  hintError: {
    color: "#FCA5A5",
  },
  primaryBtn: {
    height: 50,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.45,
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
  ghostBtn: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -6,
  },
  ghostBtnText: {
    ...typography.buttonSmall,
    letterSpacing: 1,
    color: "#94A3B8",
  },
});

export default CredentialsCard;
