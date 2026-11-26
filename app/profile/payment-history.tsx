import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  CalendarClock,
  Check,
  CreditCard,
  Download,
  Receipt,
  Smartphone,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/shared/components/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { typography } from "@/theme/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

interface Transaction {
  id: string;
  title: string;
  invoiceId: string;
  price: string;
  date: string;
  method: string;
  isApplePay: boolean;
  status: "COMPLETED" | "PENDING";
}

const ACCENT = "#38BDF8";
const ACCENT_SOFT = "#7DD3FC";
const SURFACE_WASH = [
  "rgba(56,189,248,0.12)",
  "rgba(139,92,246,0.06)",
  "rgba(255,255,255,0.02)",
] as const;

/** "REPLOOT PREMIUM MONTHLY" -> "Premium monthly" (brand name is implied). */
const displayTitle = (title: string) => {
  const t = title.replace(/^REPLOOT\s+/i, "").toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};
/** "APPLE PAY" -> "Apple Pay", "MASTERCARD ****9281" -> "Card •••• 9281". */
const displayMethod = (method: string) => {
  const last4 = method.match(/(\d{4})\s*$/)?.[1];
  if (last4) return `Card •••• ${last4}`;
  return method.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};
const shortDate = (date: string) => date.replace(/,\s*\d{4}$/, "");
const toNumber = (price: string) => parseFloat(price.replace(/[^0-9.]/g, "")) || 0;

const TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    title: "REPLOOT PREMIUM MONTHLY",
    invoiceId: "INV-2026-0792",
    price: "$9.99",
    date: "July 20, 2026",
    method: "APPLE PAY",
    isApplePay: true,
    status: "COMPLETED",
  },
  {
    id: "tx-2",
    title: "REPLOOT PREMIUM MONTHLY",
    invoiceId: "INV-2026-0641",
    price: "$9.99",
    date: "June 20, 2026",
    method: "APPLE PAY",
    isApplePay: true,
    status: "COMPLETED",
  },
  {
    id: "tx-3",
    title: "BIOMETRIC PRO UPGRADE",
    invoiceId: "INV-2026-0518",
    price: "$29.00",
    date: "May 15, 2026",
    method: "MASTERCARD ****9281",
    isApplePay: false,
    status: "COMPLETED",
  },
  {
    id: "tx-4",
    title: "REPLOOT PREMIUM MONTHLY",
    invoiceId: "INV-2026-0390",
    price: "$9.99",
    date: "April 20, 2026",
    method: "APPLE PAY",
    isApplePay: true,
    status: "COMPLETED",
  },
];

export default function PaymentHistoryRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalPaid = TRANSACTIONS.reduce((sum, tx) => sum + toNumber(tx.price), 0);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  const handleActionHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const handleDownloadInvoice = (id: string) => {
    handleActionHaptic();
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      const tx = TRANSACTIONS.find((item) => item.id === id);
      setToastMessage(`Invoice ${tx?.invoiceId ?? ""} saved`);
      setTimeout(() => {
        setToastMessage(null);
      }, 2500);
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <StatusBar style="light" />

      <CustomHeader
        titleVariant="text"
        title=""
        showBackButton={true}
        onPressBack={handleBack}
        showSearch={true}
        showNotifications={true}
        showAvatar={true}
        transparent={true}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 40, 60) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.categoryBadge}>BILLING</Text>
          <Text style={styles.mainTitle} numberOfLines={1} adjustsFontSizeToFit>
            PAYMENT HISTORY
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.card}>
          <LinearGradient
            colors={SURFACE_WASH}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.kicker}>TOTAL PAID · 2026</Text>
              <Text style={styles.totalValue}>${totalPaid.toFixed(2)}</Text>
            </View>
            <View style={styles.countPill}>
              <Receipt size={11} color={ACCENT_SOFT} strokeWidth={2.4} />
              <Text style={styles.countPillText}>{TRANSACTIONS.length} PAYMENTS</Text>
            </View>
          </View>
          <View style={styles.nextCharge}>
            <View style={styles.iconChip}>
              <CalendarClock size={14} color={ACCENT} strokeWidth={2.4} />
            </View>
            <View style={styles.nextCopy}>
              <Text style={styles.nextLabel}>Next charge</Text>
              <Text style={styles.nextValue}>Aug 20, 2026 · Premium monthly</Text>
            </View>
            <Text style={styles.nextPrice}>$9.99</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>RECENT PAYMENTS</Text>

        <View style={styles.listCard}>
          {TRANSACTIONS.map((tx, i) => {
            const saving = downloadingId === tx.id;
            return (
              <View key={tx.id} style={[styles.txRow, i > 0 && styles.txDivider]}>
                <View style={styles.methodIcon}>
                  {tx.isApplePay ? (
                    <Smartphone size={16} color={ACCENT} strokeWidth={2.2} />
                  ) : (
                    <CreditCard size={16} color={ACCENT} strokeWidth={2.2} />
                  )}
                </View>

                <View style={styles.txInfo}>
                  <Text style={styles.txTitle} numberOfLines={2}>
                    {displayTitle(tx.title)}
                  </Text>
                  <Text style={styles.txMeta} numberOfLines={1}>
                    {shortDate(tx.date)} · {displayMethod(tx.method)}
                  </Text>
                </View>

                <View style={styles.txRight}>
                  <Text style={styles.txPrice}>{tx.price}</Text>
                  <View style={styles.paidRow}>
                    <Check size={10} color={ACCENT_SOFT} strokeWidth={3.2} />
                    <Text style={styles.paidText}>
                      {tx.status === "COMPLETED" ? "Paid" : "Pending"}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.invoiceBtn, saving && styles.invoiceBtnBusy]}
                  onPress={() => handleDownloadInvoice(tx.id)}
                  disabled={saving}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={`Download invoice ${tx.invoiceId}`}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={ACCENT_SOFT} />
                  ) : (
                    <Download size={14} color={ACCENT_SOFT} strokeWidth={2.4} />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <Text style={styles.footnote}>
          Invoices are saved as PDF. Billing questions? Contact support from Account settings.
        </Text>
      </ScrollView>

      {toastMessage ? (
        <View style={[styles.toast, { bottom: Math.max(insets.bottom + 16, 28) }]}>
          <View style={styles.toastIcon}>
            <Check size={12} color="#FFFFFF" strokeWidth={3.2} />
          </View>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060810",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  titleSection: {
    marginTop: 4,
    marginBottom: 18,
    gap: 4,
  },
  categoryBadge: {
    ...typography.overline,
    fontSize: 11,
    lineHeight: 16,
    color: ACCENT_SOFT,
  },
  mainTitle: {
    ...typography.pageTitle,
    color: "#F6F8FF",
  },
  card: {
    backgroundColor: "#111A25",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    padding: 16,
    gap: 16,
    marginBottom: 22,
    overflow: "hidden",
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  kicker: {
    ...typography.overline,
    color: ACCENT_SOFT,
  },
  totalValue: {
    ...typography.metricLarge,
    color: "#F8FAFC",
  },
  countPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
  },
  countPillText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },
  nextCharge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(6,8,16,0.45)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  iconChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  nextCopy: {
    flex: 1,
    minWidth: 0,
  },
  nextLabel: {
    ...typography.caption,
    color: "#7C8BA1",
  },
  nextValue: {
    ...typography.subtitle,
    fontSize: 13,
    lineHeight: 18,
    color: "#E2E8F0",
  },
  nextPrice: {
    ...typography.cardTitle,
    fontSize: 14,
    lineHeight: 18,
    color: ACCENT_SOFT,
  },
  sectionTitle: {
    ...typography.overline,
    color: "#7C8BA1",
    marginBottom: 10,
    marginLeft: 4,
  },
  listCard: {
    backgroundColor: "#111A25",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.18)",
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  txDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.10)",
  },
  methodIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  txInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  txTitle: {
    ...typography.cardTitle,
    fontSize: 14,
    lineHeight: 18,
    color: "#F8FAFC",
  },
  txMeta: {
    ...typography.caption,
    color: "#7C8BA1",
  },
  txRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  txPrice: {
    ...typography.cardTitle,
    fontSize: 14,
    lineHeight: 18,
    color: "#F8FAFC",
    fontVariant: ["tabular-nums"],
  },
  paidRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  paidText: {
    ...typography.caption,
    color: ACCENT_SOFT,
  },
  invoiceBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.08)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  invoiceBtnBusy: {
    opacity: 0.7,
  },
  footnote: {
    ...typography.caption,
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  toast: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    zIndex: 50,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  toastIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0EA5E9",
  },
  toastText: {
    ...typography.subtitle,
    fontSize: 13,
    lineHeight: 18,
    color: "#E2E8F0",
  },
});
