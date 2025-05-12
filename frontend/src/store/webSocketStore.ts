import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { toast } from "sonner";

interface WebSocketState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  ws: WebSocket | null;
  connectionAttempted: boolean;

  connect: (chatType: "group" | "user", identifier: string | number) => void;
  disconnect: () => void;
  sendMessage: (messageData: any) => void;

  _messageHandlers: Set<(event: MessageEvent) => void>;
  addHandler: (handler: (event: MessageEvent) => void) => void;
  removeHandler: (handler: (event: MessageEvent) => void) => void;
}

const BASE_WEBSOCKET_URL = "ws://127.0.0.1:8000/ws/chat/";

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  isConnected: false,
  isLoading: false,
  error: null,
  ws: null,
  connectionAttempted: false,
  _messageHandlers: new Set(),

  addHandler: (handler) => {
    const handlers = get()._messageHandlers;
    if (!handlers.has(handler)) {
      handlers.add(handler);
      set({ _messageHandlers: new Set(handlers) });
      console.log(
        "WebSocketStore: Handler added. Total handlers:",
        handlers.size
      );
    }
  },

  removeHandler: (handler) => {
    const handlers = get()._messageHandlers;
    if (handlers.has(handler)) {
      handlers.delete(handler);
      set({ _messageHandlers: new Set(handlers) });
      console.log(
        "WebSocketStore: Handler removed. Total handlers:",
        handlers.size
      );
    }
  },

  connect: (chatType, identifier) => {
    const { isConnected, isLoading, connectionAttempted } = get();
    const accessToken = useAuthStore.getState().accessToken;

    if (isConnected || isLoading || !accessToken || connectionAttempted) {
      if (isConnected) console.log("WebSocketStore: Already connected.");
      if (isLoading)
        console.log("WebSocketStore: Connection already in progress.");
      if (!accessToken)
        console.error(
          "WebSocketStore: No access token available for connection."
        );
      if (connectionAttempted && !isConnected)
        console.log("WebSocketStore: Connection already attempted.");
      return;
    }

    set({ isLoading: true, error: null, connectionAttempted: true });
    console.log(
      `WebSocketStore: Attempting to connect to ${chatType} chat with ID/Identifier: ${identifier}`
    );

    let url = BASE_WEBSOCKET_URL;
    if (chatType === "group") {
      url += `group/${identifier}/`;
    } else if (chatType === "user") {
      url += `user/${identifier}/`;
    } else {
      console.error("WebSocketStore: Invalid chat type:", chatType);
      set({
        isLoading: false,
        error: "Invalid chat type for WebSocket",
        connectionAttempted: false,
      });
      return;
    }

    url += `?token=${accessToken}`;

    try {
      const newWs = new WebSocket(url);

      newWs.onopen = () => {
        console.log("WebSocketStore: Connection established.");
        set({ isConnected: true, isLoading: false, error: null, ws: newWs });
      };

      newWs.onmessage = (event) => {
        get()._messageHandlers.forEach((handler) => handler(event));
      };

      newWs.onerror = (event) => {
        console.error("WebSocketStore: WebSocket error:", event);
        set({
          error: "WebSocket error occurred",
          isConnected: false,
          isLoading: false,
          ws: null,
        });
      };

      newWs.onclose = (event) => {
        console.log(
          `WebSocketStore: Connection closed (Code: ${event.code}, Reason: ${
            event.reason || "N/A"
          }).`
        );
        set({ isConnected: false, isLoading: false, ws: null });
      };

      set({ ws: newWs });
    } catch (err: any) {
      console.error("WebSocketStore: Error creating WebSocket:", err);
      set({
        isLoading: false,
        error: "Failed to create WebSocket connection",
        ws: null,
      });
    }
  },

  disconnect: () => {
    const { ws, isConnected } = get();
    if (ws && isConnected) {
      console.log("WebSocketStore: Closing connection...");
      ws.close(1000, "Component unmount");
    } else {
      console.log("WebSocketStore: No active connection to close.");
    }

    set({
      isConnected: false,
      isLoading: false,
      error: null,
      ws: null,
      connectionAttempted: false,
      _messageHandlers: new Set(),
    });
  },

  sendMessage: (messageData) => {
    const { ws, isConnected } = get();
    if (ws && isConnected) {
      try {
        const jsonMessage = JSON.stringify(messageData);
        ws.send(jsonMessage);
        console.log("WebSocketStore: Message sent:", messageData);
      } catch (error) {
        console.error("WebSocketStore: Error sending message:", error);
        toast.error("Error sending message");
      }
    } else {
      toast.error("Cannot send message, not connected.");
    }
  },
}));
