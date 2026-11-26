import { CoachEmoji } from "@/features/ai-coach/components/CoachEmoji";
import { CoachTypingIndicator } from "@/features/ai-coach/components/CoachTypingIndicator";
import {
  useChatStore,
  type AssistantContext,
  type ConversationRecord,
} from "@/features/ai-coach/chatStore";
import { mockChatService } from "@/services/ai/coach/mockChatService";
import type { ChatMessage } from "@/services/ai/coach/types";
import { useNutritionPlanStore } from "@/stores/nutritionPlanStore";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import {
  Apple,
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  Check,
  Dumbbell,
  HeartPulse,
  History,
  MessageCircle,
  Pencil,
  PiggyBank,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, TextInput } from "@/shared/components/typography";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { typography } from "@/theme/typography";
import { ScreenBackground } from "@/shared/components/layout/ScreenBackground";

const suggestions: Record<AssistantContext, string[]> = {
  fitness: ["Plan my workout", "Help with recovery", "Improve my training"],
  nutrition: [
    "Adjust my meal plan",
    "Suggest a higher-protein dinner",
    "Make meals more budget-friendly",
  ],
};
const SUGGESTION_ICONS: Record<AssistantContext, LucideIcon[]> = {
  fitness: [Dumbbell, HeartPulse, TrendingUp],
  nutrition: [Apple, Sparkles, PiggyBank],
};

const ACCENT = "#38BDF8";
const ACCENT_SOFT = "#7DD3FC";
const BUTTON_GRADIENT = ["#38BDF8", "#0EA5E9", "#0284C7"] as const;
const USER_BUBBLE = ["#0EA5E9", "#0284C7"] as const;

const messageTime = (value: string) =>
  new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
const historyDate = (value: string) =>
  new Date(value).toDateString() === new Date().toDateString()
    ? "Today"
    : new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

export default function CoachRoute() {
  const { context: contextParam } = useLocalSearchParams<{
    context?: string;
  }>();
  const context: AssistantContext =
    contextParam === "nutrition" ? "nutrition" : "fitness";
  const insets = useSafeAreaInsets();
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );
  const ensureConversation = useChatStore((state) => state.ensureConversation);
  const createConversation = useChatStore((state) => state.createConversation);
  const selectConversation = useChatStore((state) => state.selectConversation);
  const addMessage = useChatStore((state) => state.addMessage);
  const renameConversation = useChatStore((state) => state.renameConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const approvePlanAdjustment = useNutritionPlanStore(
    (state) => state.approvePlanAdjustment,
  );
  const [input, setInput] = useState("");
  const [historyVisible, setHistoryVisible] = useState(false);
  const [renameTarget, setRenameTarget] = useState<ConversationRecord | null>(
    null,
  );
  const [renameValue, setRenameValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [nearBottom, setNearBottom] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    ensureConversation(context);
  }, [context, ensureConversation]);
  const activeConversation = useMemo(
    () =>
      conversations.find((item) => item.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  );
  useEffect(() => {
    if (!nearBottom) return;
    const timeout = setTimeout(
      () => scrollRef.current?.scrollToEnd({ animated: true }),
      80,
    );
    return () => clearTimeout(timeout);
  }, [activeConversation?.messages.length, isSending, nearBottom]);

  const newChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    createConversation(context);
    setHistoryVisible(false);
    setInput("");
  };
  const send = async (requested?: string) => {
    const content = (requested ?? input).trim();
    if (!content || isSending || !activeConversation) return;
    const conversationId = activeConversation.id;
    setInput("");
    setNearBottom(true);
    setIsSending(true);
    addMessage(conversationId, {
      id: `message-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    });
    try {
      addMessage(
        conversationId,
        await mockChatService.sendMessage(activeConversation.context, content),
      );
    } catch {
      addMessage(conversationId, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I couldn’t respond just now. Please retry your message.",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsSending(false);
    }
  };
  const confirmDelete = (item: ConversationRecord) =>
    Alert.alert(
      "Delete conversation?",
      `Delete “${item.title}”? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteConversation(item.id);
            setHistoryVisible(false);
          },
        },
      ],
    );
  const canSend = !!input.trim() && !isSending;

  const confirmProposal = (message: ChatMessage) => {
    if (!message.proposedChange || !activeConversation) return;
    approvePlanAdjustment(message.proposedChange.summary);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    addMessage(activeConversation.id, {
      id: `confirmation-${Date.now()}`,
      role: "assistant",
      timestamp: new Date().toISOString(),
      content:
        "Your suggested plan adjustment is confirmed. Return to Nutrition to review the updated plan context.",
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenBackground />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.roundBtn}
        >
          <ArrowLeft color="#F8FAFC" size={19} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.identity}>
          <View style={styles.identityAvatar}>
            {/* Clipped circle on its own view so Android draws it round. */}
            <View style={styles.identityRing}>
              <CoachEmoji size="md" />
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              AI COACH
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              Online ·{" "}
              {activeConversation?.context === "nutrition" ? "Nutrition" : "Fitness"}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Chat history"
            onPress={() => setHistoryVisible(true)}
            style={styles.roundBtn}
          >
            <History color={ACCENT_SOFT} size={17} strokeWidth={2.4} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Start new chat"
            onPress={newChat}
            style={[styles.roundBtn, styles.roundBtnAccent]}
          >
            <Plus color="#FFFFFF" size={18} strokeWidth={2.6} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.keyboard} behavior="padding">
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
            setNearBottom(
              contentOffset.y + layoutMeasurement.height >= contentSize.height - 56,
            );
          }}
          scrollEventThrottle={16}
        >
          {!activeConversation?.messages.some((message) => message.role === "user") && (
            <View style={styles.welcome}>
              <View style={styles.welcomeIcon}>
                <CoachEmoji size="lg" />
              </View>
              <Text style={styles.welcomeTitle}>How can I help today?</Text>
              <Text style={styles.welcomeText}>
                {context === "nutrition"
                  ? "Ask naturally about meals, targets or plan changes."
                  : "Ask about workouts, recovery, habits or your next step."}
              </Text>
              <View style={styles.suggestions}>
                {suggestions[context].map((item, index) => {
                  const Icon = SUGGESTION_ICONS[context][index] ?? Sparkles;
                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.75}
                      onPress={() => send(item)}
                      style={styles.suggestion}
                      accessibilityRole="button"
                    >
                      <View style={styles.suggestionIcon}>
                        <Icon size={15} color={ACCENT} strokeWidth={2.4} />
                      </View>
                      <Text style={styles.suggestionText} numberOfLines={1}>
                        {item}
                      </Text>
                      <ArrowUpRight size={15} color={ACCENT_SOFT} strokeWidth={2.4} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {activeConversation?.messages.map((message) => {
            const user = message.role === "user";
            return (
              <View
                key={message.id}
                style={[styles.messageRow, user ? styles.userRow : styles.assistantRow]}
              >
                {!user && (
                  <View style={styles.messageAvatar}>
                    <CoachEmoji size="sm" />
                  </View>
                )}
                {user ? (
                  <View style={styles.userMessage}>
                    <LinearGradient
                      colors={USER_BUBBLE}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.userMessageText}>{message.content}</Text>
                    <Text style={styles.userTime}>{messageTime(message.timestamp)}</Text>
                  </View>
                ) : (
                  <View style={styles.assistantMessage}>
                    <Text style={styles.assistantMessageText}>{message.content}</Text>
                    <Text style={styles.assistantTime}>{messageTime(message.timestamp)}</Text>
                    {message.proposedChange && (
                      <View style={styles.proposal}>
                        <Text style={styles.proposalLabel}>SUGGESTED CHANGE</Text>
                        <Text style={styles.proposalTitle}>{message.proposedChange.title}</Text>
                        <Text style={styles.proposalText}>{message.proposedChange.summary}</Text>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => confirmProposal(message)}
                          style={styles.proposalButton}
                          accessibilityRole="button"
                        >
                          <LinearGradient
                            colors={BUTTON_GRADIENT}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                          />
                          <View>
                            <Check color="#FFFFFF" size={14} strokeWidth={3} />
                          </View>
                          <Text style={styles.proposalButtonText}>CONFIRM CHANGE</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {isSending && (
            <CoachTypingIndicator
              rowStyle={[styles.messageRow, styles.assistantRow]}
              avatarStyle={styles.messageAvatar}
              bubbleStyle={styles.typing}
            />
          )}
        </ScrollView>

        <View style={[styles.composerArea, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.composer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Message your coach…"
              placeholderTextColor="#64748B"
              style={styles.input}
              multiline
              maxLength={1200}
              editable={!isSending}
              accessibilityLabel="Message AI Coach"
            />
            <TouchableOpacity
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              onPress={() => send()}
              disabled={!canSend}
              style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            >
              {canSend ? (
                <LinearGradient
                  colors={BUTTON_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              <View>
                <ArrowUp color={canSend ? "#FFFFFF" : "#64748B"} size={18} strokeWidth={2.8} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* History sheet */}
      <Modal
        visible={historyVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHistoryVisible(false)}
      >
        <View style={styles.historyBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setHistoryVisible(false)}
            accessibilityLabel="Close chat history"
          />
          <View style={[styles.historySheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.grabber} />
            <View style={styles.historyHeader}>
              <View>
                <Text style={styles.historyKicker}>CONVERSATIONS</Text>
                <Text style={styles.historyTitle}>Chat history</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setHistoryVisible(false)}
                style={styles.closeBtn}
                accessibilityLabel="Close chat history"
              >
                <X color="#CBD5E1" size={16} strokeWidth={2.6} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={newChat}
              style={styles.newChatButton}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={BUTTON_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View>
                <Plus color="#FFFFFF" size={16} strokeWidth={2.8} />
              </View>
              <Text style={styles.newChatText}>NEW CHAT</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.historyList}>
              {conversations.length === 0 ? (
                <Text style={styles.emptyHistory}>No conversations yet.</Text>
              ) : (
                conversations.map((item) => {
                  const active = item.id === activeConversationId;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.75}
                      onPress={() => {
                        selectConversation(item.id);
                        setHistoryVisible(false);
                      }}
                      style={[styles.historyItem, active && styles.historyItemActive]}
                    >
                      <View style={styles.historyItemIcon}>
                        <MessageCircle size={15} color={ACCENT} strokeWidth={2.4} />
                      </View>
                      <View style={styles.historyItemText}>
                        <Text numberOfLines={1} style={styles.historyItemTitle}>
                          {item.title}
                        </Text>
                        <Text style={styles.historyItemMeta}>
                          {historyDate(item.lastMessageAt)} ·{" "}
                          {item.context === "nutrition" ? "Nutrition" : "Fitness"}
                        </Text>
                      </View>
                      <View style={styles.historyItemActions}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => {
                            setRenameTarget(item);
                            setRenameValue(item.title);
                          }}
                          hitSlop={9}
                          style={styles.miniBtn}
                          accessibilityLabel="Rename conversation"
                        >
                          <Pencil color="#94A3B8" size={13} strokeWidth={2.4} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => confirmDelete(item)}
                          hitSlop={9}
                          style={styles.miniBtn}
                          accessibilityLabel="Delete conversation"
                        >
                          <Trash2 color="#F87171" size={13} strokeWidth={2.4} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Rename */}
      <Modal
        visible={!!renameTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameTarget(null)}
      >
        <KeyboardAvoidingView behavior="padding" style={styles.renameBackdrop}>
          <View style={styles.renameCard}>
            <Text style={styles.renameTitle}>Rename chat</Text>
            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              style={styles.renameInput}
              autoFocus
              selectTextOnFocus
              placeholderTextColor="#64748B"
            />
            <View style={styles.renameActions}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setRenameTarget(null)}
                style={styles.renameSecondary}
              >
                <Text style={styles.renameSecondaryText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  if (renameTarget) renameConversation(renameTarget.id, renameValue);
                  setRenameTarget(null);
                }}
                style={styles.renamePrimary}
              >
                <LinearGradient
                  colors={BUTTON_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.renamePrimaryText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#060810" },

  // Header
  header: {
    height: 68,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    // Transparent so it blends with the status-bar area (no two-tone band).
    borderBottomWidth: 1,
    borderBottomColor: "rgba(56,189,248,0.12)",
    backgroundColor: "transparent",
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
  },
  roundBtnAccent: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9",
  },
  identity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  // Even sky ring (a gradient fill read as lopsided on device); emoji centred.
  identityAvatar: {
    width: 42,
    height: 42,
  },
  identityRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(56,189,248,0.6)",
  },
  onlineDot: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#060810",
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    ...typography.pageTitleCompact,
    color: "#F6F8FF",
  },
  headerSubtitle: {
    ...typography.caption,
    color: ACCENT_SOFT,
  },
  headerActions: { flexDirection: "row", gap: 8 },

  keyboard: { flex: 1 },
  messages: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    gap: 14,
  },

  // Welcome
  welcome: {
    alignItems: "center",
    paddingTop: 26,
    paddingBottom: 12,
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  welcomeTitle: {
    ...typography.sectionTitle,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0,
    textTransform: "none",
    color: "#F8FAFC",
  },
  welcomeText: {
    ...typography.body,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 6,
    maxWidth: 300,
  },
  suggestions: { width: "100%", marginTop: 22, gap: 10 },
  suggestion: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.2)",
    backgroundColor: "#111A25",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  suggestionText: {
    ...typography.subtitle,
    flex: 1,
    color: "#E2E8F0",
  },

  // Messages
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    maxWidth: "100%",
  },
  assistantRow: { alignSelf: "flex-start", paddingRight: 32 },
  userRow: { alignSelf: "flex-end", paddingLeft: 48 },
  messageAvatar: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  assistantMessage: {
    backgroundColor: "#111A25",
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.16)",
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 8,
    maxWidth: "100%",
  },
  userMessage: {
    borderRadius: 20,
    borderBottomRightRadius: 6,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 8,
    maxWidth: "100%",
  },
  assistantMessageText: { ...typography.body, color: "#E5EDF6" },
  userMessageText: { ...typography.body, color: "#FFFFFF" },
  assistantTime: { ...typography.caption, fontSize: 10, lineHeight: 14, color: "#64748B", marginTop: 6 },
  userTime: {
    ...typography.caption,
    fontSize: 10,
    lineHeight: 14,
    color: "rgba(255,255,255,0.75)",
    textAlign: "right",
    marginTop: 6,
  },
  typing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 15,
    height: 42,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.16)",
  },
  proposal: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(56,189,248,0.07)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  proposalLabel: { ...typography.overline, color: ACCENT_SOFT },
  proposalTitle: { ...typography.cardTitle, fontSize: 14, lineHeight: 18, color: "#F8FAFC", marginTop: 4 },
  proposalText: { ...typography.bodySmall, color: "#A7B3C5", marginTop: 4 },
  proposalButton: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    overflow: "hidden",
    height: 40,
    marginTop: 12,
  },
  proposalButtonText: { ...typography.buttonSmall, letterSpacing: 1, color: "#FFFFFF" },

  // Composer
  composerArea: {
    borderTopWidth: 1,
    borderTopColor: "rgba(56,189,248,0.10)",
    paddingHorizontal: 14,
    paddingTop: 10,
    backgroundColor: "rgba(6,8,16,0.92)",
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    borderRadius: 26,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 52,
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  input: {
    ...typography.input,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    color: "#F1F5F9",
    maxHeight: 112,
    paddingVertical: 8,
    textAlignVertical: "center",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: { backgroundColor: "rgba(148,163,184,0.12)" },

  // History
  historyBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2,4,10,0.72)",
  },
  historySheet: {
    height: "78%",
    backgroundColor: "#0D1420",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(56,189,248,0.2)",
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(148,163,184,0.3)",
    marginBottom: 14,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  historyKicker: { ...typography.overline, color: ACCENT_SOFT },
  historyTitle: { ...typography.cardTitle, color: "#F8FAFC" },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
  },
  newChatText: { ...typography.button, letterSpacing: 1, color: "#FFFFFF" },
  historyList: { gap: 8, paddingBottom: 22 },
  historyItem: {
    minHeight: 64,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  historyItemActive: {
    borderColor: "rgba(56,189,248,0.5)",
    backgroundColor: "rgba(56,189,248,0.07)",
  },
  historyItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.10)",
  },
  historyItemText: { flex: 1, minWidth: 0 },
  historyItemTitle: { ...typography.cardTitle, fontSize: 14, lineHeight: 18, color: "#F1F5F9" },
  historyItemMeta: { ...typography.caption, color: "#7C8BA1", marginTop: 2 },
  historyItemActions: { flexDirection: "row", gap: 6 },
  miniBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  emptyHistory: { ...typography.bodySmall, color: "#7C8BA1", textAlign: "center", marginTop: 28 },

  // Rename
  renameBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2,4,10,0.78)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  renameCard: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "#0D1420",
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  renameTitle: { ...typography.cardTitle, color: "#F8FAFC" },
  renameInput: {
    ...typography.input,
    fontSize: 14,
    lineHeight: 20,
    color: "#F8FAFC",
    backgroundColor: "rgba(6,8,16,0.6)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
    paddingHorizontal: 14,
    height: 48,
  },
  renameActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  renameSecondary: {
    height: 42,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 14,
  },
  renameSecondaryText: { ...typography.buttonSmall, letterSpacing: 1, color: "#94A3B8" },
  renamePrimary: {
    height: 42,
    paddingHorizontal: 22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    overflow: "hidden",
  },
  renamePrimaryText: { ...typography.buttonSmall, letterSpacing: 1, color: "#FFFFFF" },
});
