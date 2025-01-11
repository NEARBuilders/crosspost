import { create } from "zustand";
import {
  connectTwitter,
  disconnectTwitter,
  status,
  tweet,
} from "../lib/twitter";

const STORAGE_KEY = "twitter_connection";

const store = (set, get) => ({
  isConnected: false,
  isConnecting: false,
  handle: null,
  error: null,
  post: tweet,
  init: () => {
    if (typeof window === "undefined") return;

    // First try to restore from URL params (OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const isConnected = params.get("twitter_connected") === "true";
    const handle = params.get("handle");
    const error = params.get("twitter_error");

    if (isConnected && handle) {
      // Save to localStorage and state
      const connectionState = { isConnected: true, handle };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(connectionState));
      set({ isConnected: true, handle, isConnecting: false, error: null });
    } else if (error) {
      // Handle OAuth errors (e.g., user denied access)
      const decodedError = decodeURIComponent(error);
      localStorage.removeItem(STORAGE_KEY);
      set({
        isConnected: false,
        isConnecting: false,
        handle: null,
        error: decodedError,
      });
    } else {
      // Try to restore from localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const { isConnected, handle } = JSON.parse(saved);
          set({ isConnected, handle, isConnecting: false, error: null });
        }
      } catch (e) {
        console.error("Failed to restore Twitter connection state:", e);
      }
    }
    // clean url
    window.history.replaceState({}, "", "/");
  },
  checkConnection: async () => {
    try {
      const { isConnected, handle } = await status();
      // Update localStorage with verified state
      if (isConnected && handle) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ isConnected, handle }),
        );
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      set({ isConnected, handle });
    } catch (error) {
      console.error("Failed to check Twitter connection:", error);
      localStorage.removeItem(STORAGE_KEY);
      set({ isConnected: false, handle: null });
    }
  },
  connect: async () => {
    if (get().isConnecting) return;
    try {
      set({ isConnecting: true, error: null });
      await connectTwitter();
    } catch (err) {
      const errorMessage = "Failed to connect to Twitter";
      set({ isConnecting: false, error: errorMessage });
      console.error("Twitter connection error:", err);
    }
  },
  disconnect: async () => {
    await disconnectTwitter();
    localStorage.removeItem(STORAGE_KEY);
    set({ isConnected: false, isConnecting: false, handle: null, error: null });
    await get().checkConnection();
  },
});

export const useTwitterStore = create(store);

// Initialize store
if (typeof window !== "undefined") {
  useTwitterStore.getState().init();
}

// Focused hooks
export const useTwitterConnection = () => {
  const isConnected = useTwitterStore((state) => state.isConnected);
  const isConnecting = useTwitterStore((state) => state.isConnecting);
  const handle = useTwitterStore((state) => state.handle);
  const error = useTwitterStore((state) => state.error);
  const connect = useTwitterStore((state) => state.connect);
  const disconnect = useTwitterStore((state) => state.disconnect);
  const checkConnection = useTwitterStore((state) => state.checkConnection);

  return {
    isConnected,
    isConnecting,
    handle,
    error,
    connect,
    disconnect,
    checkConnection,
  };
};
