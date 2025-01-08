import { create } from 'zustand';
import { connectTwitter, disconnectTwitter, status, tweet } from "../lib/twitter";

const store = (set, get) => ({
  isConnected: false,
  isConnecting: false,
  error: null,
  post: tweet,
  checkConnection: async () => {
    const isConnected = await status();
    set({ isConnected });
  },
  connect: async () => {
    if (get().isConnecting) return;
    try {
      set({ isConnecting: true, error: null });
      await connectTwitter();
    } catch (err) {
      set({ isConnecting: false, error: 'Failed to connect to X' });
      console.error('X connection error:', err);
    }
  },
  disconnect: async () => {
    await disconnectTwitter();
    set({ isConnected: false, isConnecting: false, error: null });
  }
});

export const useTwitterStore = create(store);

// Focused hooks
export const useTwitterConnection = () => {
  const isConnected = useTwitterStore((state) => state.isConnected);
  const isConnecting = useTwitterStore((state) => state.isConnecting);
  const connect = useTwitterStore((state) => state.connect);
  const disconnect = useTwitterStore((state) => state.disconnect);
  const checkConnection = useTwitterStore((state) => state.checkConnection);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    checkConnection
  };
};
