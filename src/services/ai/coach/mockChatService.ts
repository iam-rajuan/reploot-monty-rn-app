import type { AssistantContext } from "@/features/ai-coach/chatStore";
import type { ChatMessage } from "./types";

const id = () => `message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const nutritionReply = (prompt: string) => {
  const normalized = prompt.toLowerCase();
  if (/(protein|dinner|swap|replace|meal|budget|calorie)/.test(normalized)) {
    return "I can help with that. A balanced option is to keep a lean protein source, add a high-fibre carbohydrate, and adjust the portion to fit your daily target. I’ve prepared a suggested plan change for you to review—nothing changes until you confirm it.";
  }
  return "That makes sense. Tell me which meal or target matters most, and I’ll suggest a practical change that you can review before anything is applied.";
};

export const mockChatService = {
  async sendMessage(context: AssistantContext, prompt: string): Promise<ChatMessage> {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return {
      id: id(),
      role: "assistant",
      timestamp: new Date().toISOString(),
      content:
        context === "nutrition"
          ? nutritionReply(prompt)
          : "I can help you build a focused next step. Tell me your goal, available time, and how you feel today, and I’ll tailor a practical training recommendation.",
      proposedChange:
        context === "nutrition" && /(protein|dinner|swap|replace|meal|budget|calorie)/i.test(prompt)
          ? {
              id: `proposal-${Date.now()}`,
              title: "Suggested meal-plan adjustment",
              summary: "Review this suggested change before it is applied to your nutrition plan.",
            }
          : undefined,
    };
  },
};
