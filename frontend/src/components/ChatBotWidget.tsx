import { useState } from 'react'
import { useChatStore } from '../store/chatStore'

export default function ChatBotWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const { messages, sendMessage } = useChatStore()

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input)
      setInput("")
    }
  }

  return (
    <div className="fixed bottom-4 right-4">
      {open ? (
        <div className="w-80 bg-white rounded-2xl shadow-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">TimeBank Assistant</h2>
            <button className="cursor-pointer" onClick={() => setOpen(false)}>✖️</button>
          </div>
          <div className="h-64 overflow-y-auto space-y-2 mb-2 text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl ${m.role === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-100'}`}
              >
                {m.content}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-2 py-1 border rounded-lg text-sm"
              placeholder="Ask me anything..."
            />
            <button onClick={handleSend} className="text-white bg-blue-600 px-3 py-1 rounded-lg text-sm cursor-pointer">
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg cursor-pointer"
        >
          💬 Ask Assistant
        </button>
      )}
    </div>
  )
}
