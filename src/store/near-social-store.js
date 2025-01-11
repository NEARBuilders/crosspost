import { create } from "zustand";
import { NearSocialService } from "../services/near-social";
import { toast } from "@/hooks/use-toast";

const store = (set, get) => ({
  wallet: null,
  service: null,
  // TODO: move to init() the plugin, we're initializing the service with the wallet (when client renders in _app)
  setWallet: (wallet) => {
    const service = new NearSocialService(wallet);
    set({ wallet, service });
  },
  // TODO: posting plugin's standard interface
  post: async (posts) => {
    const { service } = get();
    if (!service) {
      throw new Error("Near Social service not initialized");
    }

    try {
      const transaction = await service.createPost(posts);

      if (!transaction) {
        throw new Error("Failed to create post transaction");
      }

      try {
        await get().wallet.signAndSendTransactions({
          // we're in application state
          // plugin is using it as middleware for signing transactions
          transactions: [
            {
              receiverId: transaction.contractId,
              actions: transaction.actions,
            },
          ],
        });

        return true;
      } catch (error) {
        console.error("Near Social post error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Near Social post error:", error);
      throw error;
    }
  },
});

export const useNearSocialStore = create(store);

// Focused hooks
export const useNearSocialPost = () => {
  const post = useNearSocialStore((state) => state.post);
  return { post };
};
