import { create } from 'zustand';
import { connectX, disconnectX, status } from "../lib/x";

const store = (set, get) => ({
  isConnected: false,
  isConnecting: false,
  error: null,
  checkConnection: async () => {
    const isConnected = await status();
    set({ isConnected });
  },
  connect: async () => {
    if (get().isConnecting) return;
    try {
      set({ isConnecting: true, error: null });
      await connectX();
    } catch (err) {
      set({ isConnecting: false, error: 'Failed to connect to X' });
      console.error('X connection error:', err);
    }
  },
  disconnect: async () => {
    await disconnectX();
    set({ isConnected: false, isConnecting: false, error: null });
  }
});

export const useXStore = create(store);

// Focused hooks
export const useXConnection = () => {
  const isConnected = useXStore((state) => state.isConnected);
  const isConnecting = useXStore((state) => state.isConnecting);
  const connect = useXStore((state) => state.connect);
  const disconnect = useXStore((state) => state.disconnect);
  const checkConnection = useXStore((state) => state.checkConnection);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    checkConnection
  };
};
