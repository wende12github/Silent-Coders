import { useState } from "react";
import PrivateChat from "../components/privateChat/PrivateChat";


// Example usage in a parent component

export function AiChatPage() {
  const [chatWithUserId, setChatWithUserId] = useState<number | null>(null);
  return (
    <div>
      {/* Button to open chat (example) */}
      <button onClick={() => setChatWithUserId(1)}>
       User 2
      </button>

      {/* The chat component */}
      {chatWithUserId && (
        <div className="fixed bottom-0 right-0 w-96 h-[500px] shadow-xl">
          <PrivateChat 
            otherUserId={chatWithUserId}
            onClose={() => setChatWithUserId(null)}
          />
        </div>
      )}
    </div>
  );
}