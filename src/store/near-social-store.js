import { create } from 'zustand';
import { NearSocialService } from '../services/near-social';

const store = (set, get) => ({
  wallet: null,
  service: null,
  setWallet: (wallet) => {
    const service = new NearSocialService(wallet);
    set({ wallet, service });
  },
  post: async (content) => {
    const { service } = get();
    if (!service) {
      throw new Error('Near Social service not initialized');
    }
    
    try {
      const transaction = await service.createPost({
        type: 'md',
        text: content
      });
      
      if (!transaction) {
        throw new Error('Failed to create post transaction');
      }

      await get().wallet.signAndSendTransactions({
        transactions: [{
          receiverId: transaction.contractId,
          actions: transaction.actions
        }]
      });

      return true;
    } catch (error) {
      console.error('Near Social post error:', error);
      throw error;
    }
  }
});

export const useNearSocialStore = create(store);

// Focused hooks
export const useNearSocialPost = () => {
  const post = useNearSocialStore((state) => state.post);
  return { post };
};
