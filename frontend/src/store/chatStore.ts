import { create } from "zustand";
import { apiClient } from "../services/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatState = {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (msg: string) => Promise<void>;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,

  sendMessage: async (msg: string) => {
    const userMsg: Message = { role: "user", content: msg };
    set((state) => ({
      messages: [...state.messages, userMsg],
      isLoading: true,
    }));

    try {
      const res = await apiClient.post("/chatbot/ask/", { message: msg });

      const data = res.data;
      const botMsg: Message = { role: "assistant", content: data.reply };

      set((state) => ({
        messages: [...state.messages, botMsg],
        isLoading: false,
      }));
    } catch (err) {
      console.error("ChatBot Error:", err);
      set({ isLoading: false });
    }
  },
}));
