import { create } from "zustand";
import { apiClient } from "../services/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatState = {
  messages: Message[];
  isLoading: boolean;
  connectToWebSocket: (roomName: string) => void;
  sendMessage: (msg: string, isAI?: boolean) => Promise<void>;
};

export const useChatStore = create<ChatState>((set) => {
  let socket: WebSocket | null = null;

  return {
    messages: [],
    isLoading: false,

    connectToWebSocket: (roomName: string) => {
      const wsUrl = `ws://localhost:8000/ws/chat/${roomName}/`; // Replace with your backend WebSocket URL
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("WebSocket connected");
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const newMessage: Message = {
          role: data.user === "assistant" ? "assistant" : "user",
          content: data.message,
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected");
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    },

    sendMessage: async (msg: string, isAI = false) => {
      const userMsg: Message = { role: "user", content: msg };
      set((state) => ({
        messages: [...state.messages, userMsg],
        isLoading: true,
      }));

      if (isAI) {
        // Handle AI Chat Assistant
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
      } else {
        // Handle WebSocket Chat
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ message: msg, message_type: "text" }));
        } else {
          console.error("WebSocket is not connected");
        }
        set({ isLoading: false });
      }
    },
  };
});