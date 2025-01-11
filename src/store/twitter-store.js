import { create } from "zustand";
import {
  connectTwitter,
  disconnectTwitter,
  status,
  tweet,
} from "../lib/twitter";

const store = (set, get) => ({
  isConnected: false,
  isConnecting: false,
  handle: null,
  error: null,
  post: tweet,
  init: () => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const isConnected = params.get('twitter_connected') === 'true';
    const handle = params.get('handle');
    const error = params.get('twitter_error');
    
    if (isConnected && handle) {
      set({ isConnected: true, handle, isConnecting: false, error: null });
    } else if (error) {
      // Handle OAuth errors (e.g., user denied access)
      set({ 
        isConnected: false, 
        isConnecting: false, 
        handle: null,
        error: decodeURIComponent(error)
      });
    }
    // clean url
    window.history.replaceState({}, '', '/'); 
  },
  checkConnection: async () => {
    const { isConnected, handle } = await status();
    set({ isConnected, handle });
  },
  connect: async () => {
    if (get().isConnecting) return;
    try {
      set({ isConnecting: true, error: null });
      await connectTwitter();
    } catch (err) {
      set({ isConnecting: false, error: "Failed to connect to Twitter" });
      console.error("Twitter connection error:", err);
    }
  },
  disconnect: async () => {
    await disconnectTwitter();
    set({ isConnected: false, isConnecting: false, handle: null, error: null });
    await get().checkConnection();
  },
});

export const useTwitterStore = create(store);

// Initialize store
if (typeof window !== 'undefined') {
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
