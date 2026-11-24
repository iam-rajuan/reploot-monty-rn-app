import { create } from "zustand";
import type { ChatConversation, ChatMessage } from "@/services/ai/coach/types";

export type AssistantContext = "fitness" | "nutrition";

type ConversationRecord = ChatConversation & {
  context: AssistantContext;
  createdAt: string;
};

type ChatState = {
  conversations: ConversationRecord[];
  activeConversationId: string | null;
  ensureConversation: (context: AssistantContext) => string;
  createConversation: (context: AssistantContext) => string;
  selectConversation: (conversationId: string) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  renameConversation: (conversationId: string, title: string) => void;
  deleteConversation: (conversationId: string) => void;
};

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const welcomeMessage = (context: AssistantContext): ChatMessage => ({
  id: id("message"),
  role: "assistant",
  timestamp: now(),
  content:
    context === "nutrition"
      ? "I have your nutrition goals in mind. What would you like to adjust today? I can suggest changes, then you can review and confirm them."
      : "Hi, I’m your REPLOOT AI Coach. What would you like help with today?",
});

const makeConversation = (context: AssistantContext): ConversationRecord => {
  const createdAt = now();
  const message = welcomeMessage(context);
  return {
    id: id("conversation"),
    title: context === "nutrition" ? "Nutrition planning" : "New conversation",
    context,
    createdAt,
    lastMessageAt: createdAt,
    messages: [message],
  };
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  ensureConversation: (context) => {
    const activeId = get().activeConversationId;
    const active = get().conversations.find((conversation) => conversation.id === activeId);
    if (active?.context === context) return active.id;
    return get().createConversation(context);
  },
  createConversation: (context) => {
    const conversation = makeConversation(context);
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      activeConversationId: conversation.id,
    }));
    return conversation.id;
  },
  selectConversation: (conversationId) => set({ activeConversationId: conversationId }),
  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations
        .map((conversation) => {
          if (conversation.id !== conversationId) return conversation;
          const isFirstUserMessage =
            message.role === "user" && conversation.messages.every((item) => item.role !== "user");
          return {
            ...conversation,
            title: isFirstUserMessage
              ? message.content.replace(/\s+/g, " ").trim().slice(0, 42) || conversation.title
              : conversation.title,
            lastMessageAt: message.timestamp,
            messages: [...conversation.messages, message],
          };
        })
        .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)),
    })),
  renameConversation: (conversationId, title) =>
    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId && title.trim()
          ? { ...conversation, title: title.trim().slice(0, 64) }
          : conversation,
      ),
    })),
  deleteConversation: (conversationId) =>
    set((state) => {
      const conversations = state.conversations.filter((conversation) => conversation.id !== conversationId);
      return {
        conversations,
        activeConversationId:
          state.activeConversationId === conversationId ? conversations[0]?.id ?? null : state.activeConversationId,
      };
    }),
}));

export type { ConversationRecord };
