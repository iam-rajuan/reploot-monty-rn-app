import { CustomHeader } from "@/shared/components/navigation/CustomHeader";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check, Sparkles } from "lucide-react-native";
import React, { useState } from "react";
import {
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

const ACCENT_SOFT = "#7DD3FC";
const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const SHEEN = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] as const;
const SURFACE_WASH = [
  "rgba(56,189,248,0.12)",
  "rgba(139,92,246,0.06)",
  "rgba(255,255,255,0.02)",
] as const;

export default function ManagePlanRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  const handleCycleChange = (cycle: "monthly" | "annual") => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setBillingCycle(cycle);
  };

  const handleSelectPlan = (planId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setSelectedPlan(planId);
    const planName =
      planId === "elite" ? "Apex Athlete" : planId === "free" ? "Rookie" : "REPLOOT Pro";
    setToastMessage(`You're now on ${planName}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const plans = [
    {
      id: "free",
      name: "Rookie",
      tag: null as string | null,
      price: "$0",
      period: "forever",
      description: "The essentials to start training.",
      features: [
        "Workout logging",
        "Daily missions",
        "Global rankings",
        "Basic progress stats",
      ],
    },
    {
      id: "pro",
      name: "REPLOOT Pro",
      tag: "MOST POPULAR",
      price: billingCycle === "monthly" ? "$9.99" : "$7.49",
      period: billingCycle === "monthly" ? "/month" : "/mo · $89 billed yearly",
      description: "Smart coaching and real-time form tracking.",
      features: [
        "Unlimited coaching",
        "Real-time form tracking",
        "Form correction with video",
        "Priority leaderboard events",
        "Cloud backup for routines",
      ],
    },
    {
      id: "elite",
      name: "Apex Athlete",
      tag: "ELITE",
      price: billingCycle === "monthly" ? "$19.99" : "$14.99",
      period: billingCycle === "monthly" ? "/month" : "/mo · $179 billed yearly",
      description: "Everything in Pro, plus a personal human coach.",
      features: [
        "Everything in Pro",
        "1-on-1 human coach",
        "Custom macro & nutrition plan",
        "Verified Apex profile badge",
        "Early access to new features",
      ],
    },
  ];
  const planRank: Record<string, number> = { free: 0, pro: 1, elite: 2 };

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
          { paddingBottom: Math.max(insets.bottom + 28, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.categoryBadge}>MEMBERSHIP</Text>
          <Text style={styles.mainTitle} numberOfLines={1} adjustsFontSizeToFit>
            MANAGE PLAN
          </Text>
        </View>

        <View style={styles.segment}>
          {(["monthly", "annual"] as const).map((cycle) => {
            const active = billingCycle === cycle;
            return (
              <TouchableOpacity
                key={cycle}
                activeOpacity={0.8}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
                onPress={() => handleCycleChange(cycle)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {cycle.toUpperCase()}
                </Text>
                {cycle === "annual" ? (
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>−25%</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.plansList}>
          {plans.map((plan) => {
            const isCurrent = selectedPlan === plan.id;
            const isUpgrade = planRank[plan.id] > planRank[selectedPlan];
            return (
              <View key={plan.id} style={[styles.planCard, isCurrent && styles.planCardCurrent]}>
                {isCurrent ? (
                  <LinearGradient
                    colors={SURFACE_WASH}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />
                ) : null}

                <View style={styles.planHeaderRow}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {isCurrent ? (
                    <View style={[styles.pill, styles.pillCurrent]}>
                      <Check size={10} color="#FFFFFF" strokeWidth={3.2} />
                      <Text style={[styles.pillText, styles.pillTextCurrent]}>CURRENT</Text>
                    </View>
                  ) : plan.tag ? (
                    <View style={styles.pill}>
                      <Sparkles size={10} color={ACCENT_SOFT} strokeWidth={2.4} />
                      <Text style={styles.pillText}>{plan.tag}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>{plan.price}</Text>
                  <Text style={styles.periodText}>{plan.period}</Text>
                </View>
                <Text style={styles.descriptionText}>{plan.description}</Text>

                <View style={styles.cardDivider} />

                <View style={styles.featuresList}>
                  {plan.features.map((feature) => (
                    <View key={feature} style={styles.featureItem}>
                      <View style={[styles.checkCircle, isCurrent && styles.checkCircleOn]}>
                        <Check
                          size={10}
                          color={isCurrent ? "#FFFFFF" : ACCENT_SOFT}
                          strokeWidth={3.2}
                        />
                      </View>
                      <Text style={styles.featureLabel}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {isCurrent ? (
                  <View style={styles.currentBtn}>
                    <Text style={styles.currentBtnText}>YOUR CURRENT PLAN</Text>
                  </View>
                ) : isUpgrade ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.primaryBtn}
                    onPress={() => handleSelectPlan(plan.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Upgrade to ${plan.name}`}
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
                    <Text style={styles.primaryBtnText}>UPGRADE TO {plan.name.toUpperCase()}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.secondaryBtn}
                    onPress={() => handleSelectPlan(plan.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Switch to ${plan.name}`}
                  >
                    <Text style={styles.secondaryBtnText}>SWITCH TO {plan.name.toUpperCase()}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.footnote}>
          Cancel anytime. Changes apply from your next billing date.
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
    marginBottom: 16,
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
  segment: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "rgba(17,26,37,0.8)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.14)",
  },
  segmentItem: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  segmentItemActive: {
    backgroundColor: "rgba(56,189,248,0.16)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.4)",
  },
  segmentText: {
    ...typography.badge,
    color: "#7C8BA1",
  },
  segmentTextActive: {
    color: ACCENT_SOFT,
  },
  saveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    backgroundColor: "#0EA5E9",
  },
  saveBadgeText: {
    ...typography.badge,
    letterSpacing: 0.3,
    color: "#FFFFFF",
  },
  plansList: {
    gap: 12,
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: "#111A25",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.14)",
    padding: 18,
    overflow: "hidden",
  },
  planCardCurrent: {
    borderColor: "rgba(56,189,248,0.55)",
  },
  planHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  planName: {
    ...typography.cardTitle,
    fontSize: 18,
    lineHeight: 22,
    color: "#F8FAFC",
    flexShrink: 1,
  },
  pill: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  pillCurrent: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9",
  },
  pillText: {
    ...typography.badge,
    color: ACCENT_SOFT,
  },
  pillTextCurrent: {
    color: "#FFFFFF",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: 6,
  },
  priceText: {
    ...typography.metricLarge,
    color: "#F8FAFC",
  },
  periodText: {
    ...typography.caption,
    color: "#7C8BA1",
  },
  descriptionText: {
    ...typography.bodySmall,
    color: "#94A3B8",
    marginTop: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(148,163,184,0.10)",
    marginVertical: 14,
  },
  featuresList: {
    gap: 10,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
  },
  checkCircleOn: {
    backgroundColor: "#0EA5E9",
  },
  featureLabel: {
    ...typography.subtitle,
    fontSize: 13,
    lineHeight: 18,
    color: "#E2E8F0",
    flex: 1,
  },
  currentBtn: {
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.06)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
  },
  currentBtnText: {
    ...typography.buttonSmall,
    letterSpacing: 1,
    color: "#7C8BA1",
  },
  primaryBtn: {
    height: 50,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
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
  secondaryBtn: {
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.08)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  secondaryBtnText: {
    ...typography.button,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    color: ACCENT_SOFT,
  },
  footnote: {
    ...typography.caption,
    color: "#64748B",
    textAlign: "center",
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
