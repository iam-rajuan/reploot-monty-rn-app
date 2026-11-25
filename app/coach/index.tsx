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
  Bot,
  Check,
  ChevronLeft,
  History,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text, TextInput } from "@/shared/components/typography";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { typography } from "@/theme/typography";

const suggestions: Record<AssistantContext, string[]> = {
  fitness: ["Plan my workout", "Help with recovery", "Improve my training"],
  nutrition: [
    "Adjust my meal plan",
    "Suggest a higher-protein dinner",
    "Make meals more budget-friendly",
  ],
};
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
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <ChevronLeft color="#E5EEF8" size={23} />
        </Pressable>
        <View style={styles.identity}>
          <View style={styles.identityIcon}>
            <Bot color="#35E5D0" size={17} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI COACH</Text>
            <Text style={styles.headerSubtitle}>
              {activeConversation?.context === "nutrition"
                ? "NUTRITION CONTEXT"
                : "FITNESS CONTEXT"}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chat history"
            onPress={() => setHistoryVisible(true)}
            style={styles.iconButton}
          >
            <History color="#A9B7C9" size={19} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start new chat"
            onPress={newChat}
            style={styles.iconButton}
          >
            <Plus color="#35E5D0" size={21} />
          </Pressable>
        </View>
      </View>
      <KeyboardAvoidingView style={styles.keyboard} behavior="padding">
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            const { contentOffset, contentSize, layoutMeasurement } =
              event.nativeEvent;
            setNearBottom(
              contentOffset.y + layoutMeasurement.height >=
                contentSize.height - 56,
            );
          }}
          scrollEventThrottle={16}
        >
          {!activeConversation?.messages.some(
            (message) => message.role === "user",
          ) && (
            <View style={styles.welcome}>
              <View style={styles.welcomeIcon}>
                <Sparkles color="#35E5D0" size={21} />
              </View>
              <Text style={styles.welcomeTitle}>How can I help today?</Text>
              <Text style={styles.welcomeText}>
                {context === "nutrition"
                  ? "Ask naturally about meals, targets, or plan adjustments."
                  : "Ask about workouts, recovery, habits, or your next training step."}
              </Text>
              <View style={styles.suggestions}>
                {suggestions[context].map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => send(item)}
                    style={styles.suggestion}
                    accessibilityRole="button"
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          {activeConversation?.messages.map((message) => {
            const user = message.role === "user";
            return (
              <View
                key={message.id}
                style={[
                  styles.messageRow,
                  user ? styles.userRow : styles.assistantRow,
                ]}
              >
                {!user && (
                  <View style={styles.messageAvatar}>
                    <Bot color="#35E5D0" size={14} />
                  </View>
                )}
                <View
                  style={user ? styles.userMessage : styles.assistantMessage}
                >
                  <Text
                    style={
                      user
                        ? styles.userMessageText
                        : styles.assistantMessageText
                    }
                  >
                    {message.content}
                  </Text>
                  <Text style={user ? styles.userTime : styles.assistantTime}>
                    {messageTime(message.timestamp)}
                  </Text>
                  {message.proposedChange && (
                    <View style={styles.proposal}>
                      <Text style={styles.proposalLabel}>
                        REVIEW SUGGESTION
                      </Text>
                      <Text style={styles.proposalTitle}>
                        {message.proposedChange.title}
                      </Text>
                      <Text style={styles.proposalText}>
                        {message.proposedChange.summary}
                      </Text>
                      <Pressable
                        onPress={() => confirmProposal(message)}
                        style={styles.proposalButton}
                        accessibilityRole="button"
                      >
                        <Check color="#071018" size={15} strokeWidth={3} />
                        <Text style={styles.proposalButtonText}>
                          CONFIRM CHANGE
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
          {isSending && (
            <View style={[styles.messageRow, styles.assistantRow]}>
              <View style={styles.messageAvatar}>
                <Bot color="#35E5D0" size={14} />
              </View>
              <View style={styles.typing}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
          )}
        </ScrollView>
        <View
          style={[
            styles.composerArea,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View style={styles.composer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Message AI Coach"
              placeholderTextColor="#718096"
              style={styles.input}
              multiline
              maxLength={1200}
              editable={!isSending}
              accessibilityLabel="Message AI Coach"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              onPress={() => send()}
              disabled={!input.trim() || isSending}
              style={[
                styles.sendButton,
                (!input.trim() || isSending) && styles.sendButtonDisabled,
              ]}
            >
              <Send color="#061018" size={17} strokeWidth={2.8} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
          <View style={styles.historySheet}>
            <View style={styles.historyHeader}>
              <View>
                <Text style={styles.historyTitle}>CHAT HISTORY</Text>
                <Text style={styles.historySub}>
                  Conversations in this app session
                </Text>
              </View>
              <Pressable
                onPress={() => setHistoryVisible(false)}
                style={styles.iconButton}
                accessibilityLabel="Close chat history"
              >
                <X color="#B8C4D4" size={20} />
              </Pressable>
            </View>
            <Pressable
              onPress={newChat}
              style={styles.newChatButton}
              accessibilityRole="button"
            >
              <Plus color="#071018" size={17} />
              <Text style={styles.newChatText}>NEW CHAT</Text>
            </Pressable>
            <ScrollView contentContainerStyle={styles.historyList}>
              {conversations.length === 0 ? (
                <Text style={styles.emptyHistory}>
                  No saved conversations yet.
                </Text>
              ) : (
                conversations.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      selectConversation(item.id);
                      setHistoryVisible(false);
                    }}
                    style={[
                      styles.historyItem,
                      item.id === activeConversationId &&
                        styles.historyItemActive,
                    ]}
                  >
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
                      <Pressable
                        onPress={() => {
                          setRenameTarget(item);
                          setRenameValue(item.title);
                        }}
                        hitSlop={9}
                        accessibilityLabel="Rename conversation"
                      >
                        <Pencil color="#91A1B7" size={15} />
                      </Pressable>
                      <Pressable
                        onPress={() => confirmDelete(item)}
                        hitSlop={9}
                        accessibilityLabel="Delete conversation"
                      >
                        <Trash2 color="#F87171" size={15} />
                      </Pressable>
                    </View>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal
        visible={!!renameTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameTarget(null)}
      >
        <KeyboardAvoidingView behavior="padding" style={styles.renameBackdrop}>
          <View style={styles.renameCard}>
            <Text style={styles.renameTitle}>RENAME CHAT</Text>
            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              style={styles.renameInput}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.renameActions}>
              <Pressable
                onPress={() => setRenameTarget(null)}
                style={styles.renameSecondary}
              >
                <Text style={styles.renameSecondaryText}>CANCEL</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (renameTarget)
                    renameConversation(renameTarget.id, renameValue);
                  setRenameTarget(null);
                }}
                style={styles.renamePrimary}
              >
                <Text style={styles.renamePrimaryText}>SAVE</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#070A11" },
  header: {
    height: 66,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,.12)",
    backgroundColor: "#090D16",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  identity: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  identityIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(53,229,208,.12)",
    borderWidth: 1,
    borderColor: "rgba(53,229,208,.24)",
  },
  headerTitle: {
    ...typography.pageTitleCompact,
    color: "#F1F5F9",
  },
  headerSubtitle: {
    color: "#35E5D0",
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 2,
  },
  headerActions: { flexDirection: "row", gap: 1 },
  keyboard: { flex: 1 },
  messages: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    gap: 14,
  },
  welcome: {
    alignItems: "center",
    paddingTop: 38,
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  welcomeIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(53,229,208,.1)",
    borderWidth: 1,
    borderColor: "rgba(53,229,208,.22)",
    marginBottom: 15,
  },
  welcomeTitle: { color: "#F8FAFC", fontSize: 20, fontWeight: "800" },
  welcomeText: {
    color: "#98A8BA",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 310,
  },
  suggestions: { width: "100%", marginTop: 24, gap: 9 },
  suggestion: {
    minHeight: 44,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,.2)",
    backgroundColor: "#101923",
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  suggestionText: {
    color: "#BCEFF1",
    fontSize: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    maxWidth: "100%",
  },
  assistantRow: { alignSelf: "flex-start", paddingRight: 32 },
  userRow: { alignSelf: "flex-end", paddingLeft: 42 },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(53,229,208,.1)",
    borderWidth: 1,
    borderColor: "rgba(53,229,208,.18)",
  },
  assistantMessage: {
    backgroundColor: "#111A25",
    borderRadius: 16,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,.14)",
    paddingHorizontal: 13,
    paddingTop: 11,
    paddingBottom: 8,
    maxWidth: "100%",
  },
  userMessage: {
    backgroundColor: "#0D7490",
    borderRadius: 16,
    borderBottomRightRadius: 5,
    paddingHorizontal: 13,
    paddingTop: 11,
    paddingBottom: 8,
    maxWidth: "100%",
  },
  assistantMessageText: { color: "#E5EDF6", fontSize: 14, lineHeight: 21 },
  userMessageText: { color: "#F8FAFC", fontSize: 14, lineHeight: 21 },
  assistantTime: { color: "#708096", fontSize: 9, marginTop: 7 },
  userTime: {
    color: "rgba(255,255,255,.7)",
    fontSize: 9,
    textAlign: "right",
    marginTop: 7,
  },
  typing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 15,
    height: 42,
    borderRadius: 15,
    borderBottomLeftRadius: 5,
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,.14)",
  },
  dot: { width: 5, height: 5, borderRadius: 4, backgroundColor: "#35E5D0" },
  proposal: {
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "rgba(53,229,208,.16)",
  },
  proposalLabel: {
    color: "#35E5D0",
    fontSize: 9,
    letterSpacing: 0.8,
  },
  proposalTitle: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5,
  },
  proposalText: {
    color: "#9CADBE",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  proposalButton: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#35E5D0",
    borderRadius: 10,
    minHeight: 38,
    marginTop: 12,
  },
  proposalButtonText: {
    color: "#071018",
    fontSize: 10,
    letterSpacing: 0.4,
  },
  composerArea: {
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,.1)",
    paddingHorizontal: 14,
    paddingTop: 10,
    backgroundColor: "#090D16",
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    borderRadius: 17,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 52,
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,.17)",
  },
  input: {
    flex: 1,
    color: "#E6EEF7",
    fontSize: 14,
    maxHeight: 112,
    paddingVertical: 7,
    textAlignVertical: "center",
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#35E5D0",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: { backgroundColor: "#263342" },
  historyBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2,6,12,.68)",
  },
  historySheet: {
    height: "78%",
    backgroundColor: "#0D141E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,.18)",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  historyTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  historySub: { color: "#718096", fontSize: 11, marginTop: 5 },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 13,
    backgroundColor: "#35E5D0",
    marginBottom: 13,
  },
  newChatText: {
    color: "#071018",
    fontSize: 11,
    letterSpacing: 0.8,
  },
  historyList: { gap: 8, paddingBottom: 22 },
  historyItem: {
    minHeight: 66,
    paddingLeft: 13,
    paddingRight: 11,
    borderRadius: 13,
    backgroundColor: "#111A25",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,.12)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  historyItemActive: {
    borderColor: "rgba(53,229,208,.48)",
    backgroundColor: "#10232A",
  },
  historyItemText: { flex: 1 },
  historyItemTitle: { color: "#EAF1F8", fontSize: 13, fontWeight: "700" },
  historyItemMeta: { color: "#8090A4", fontSize: 10, marginTop: 5 },
  historyItemActions: { flexDirection: "row", gap: 14, padding: 7 },
  emptyHistory: { color: "#8493A8", textAlign: "center", marginTop: 28 },
  renameBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,12,.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  renameCard: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: "#111A25",
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,.18)",
  },
  renameTitle: {
    color: "#F8FAFC",
    fontSize: 13,
    letterSpacing: 0.6,
  },
  renameInput: {
    color: "#F8FAFC",
    backgroundColor: "#091018",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,.22)",
    marginTop: 14,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
  },
  renameActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 15,
  },
  renameSecondary: {
    height: 38,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 10,
  },
  renameSecondaryText: {
    color: "#AAB7C8",
    fontSize: 10,
  },
  renamePrimary: {
    height: 38,
    paddingHorizontal: 17,
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#35E5D0",
  },
  renamePrimaryText: {
    color: "#071018",
    fontSize: 10,
  },
});
