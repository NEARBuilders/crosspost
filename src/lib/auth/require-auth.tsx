import React, { useState, useCallback } from "react";
import { useNearAuth } from "@/store/near-auth-store";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { AuthModal } from "@/components/auth-modal";
import { toast } from "@/hooks/use-toast";

/**
 * Hook for requiring authentication before performing an action
 * @returns Object with requireAuth function and AuthModal component
 */
export function useRequireAuth() {
  const { isAuthorized } = useNearAuth();
  const { signedAccountId } = useWalletSelector();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(
    null,
  );

  const requireAuth = useCallback(
    (callback: () => void) => {
      if (!signedAccountId) {
        toast({
          title: "Connect Wallet",
          description: "Please connect your NEAR wallet first",
          variant: "destructive",
        });
        return false;
      }

      if (!isAuthorized) {
        setPendingCallback(() => callback);
        setShowAuthModal(true);
        return false;
      }

      return callback();
    },
    [isAuthorized],
  );

  const handleAuthSuccess = useCallback(() => {
    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
  }, [pendingCallback]);

  return {
    requireAuth,
    AuthModal: (
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    ),
  };
}
