import { create } from 'zustand'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type ChatState = {
  messages: Message[]
  sendMessage: (msg: string) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  sendMessage: async (msg: string) => {
    const userMsg: Message = { role: 'user', content: msg }
    set({ messages: [...get().messages, userMsg] })

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chatbot/ask/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: msg }),
      })

      const data = await res.json()
      const botMsg: Message = { role: 'assistant', content: data.reply }
      set({ messages: [...get().messages, userMsg, botMsg] })
    } catch (err) {
      console.error("ChatBot Error:", err)
    }
  }
}))
