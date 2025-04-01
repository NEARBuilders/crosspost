import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { APP_NAME } from "../config";
import {
  initWithNearAuth,
  NearAuthData,
  signInWithNear,
} from "../lib/auth/near-auth";

interface NearAuthState {
  // State
  isAuthorized: boolean;
  isAuthorizing: boolean;
  error: string | null;
  authData: NearAuthData | null;

  // Actions
  authorize: (wallet: any, accountId: string) => Promise<boolean>;
  setAuthData: (authData: NearAuthData | null) => void;
  setIsAuthorized: (isAuthorized: boolean) => void;
  reset: () => void;
}

export const useNearAuth = create<NearAuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthorized: false,
      isAuthorizing: false,
      error: null,
      accountId: null,
      authData: null,

      /**
       * Authorize the app with the proxy API
       * This function signs a message with the NEAR wallet and sends it to the proxy API
       * to authorize the app to post on behalf of the user
       */
      authorize: async (wallet, accountId) => {
        if (!wallet || !accountId) {
          set({ error: "Wallet and account ID are required" });
          return false;
        }

        set({ isAuthorizing: true, error: null });

        try {
          // Create the auth message
          const message = `I authorize ${APP_NAME} to post on my behalf to connected social platforms using my NEAR account: ${accountId}`;

          // Sign the message with the wallet
          const authData: NearAuthData = await signInWithNear(wallet, message);

          // Store auth data in the store
          set({ authData });

          // Initialize with the proxy API
          const returnUrl = window.location.origin + "/manage";
          const response = await initWithNearAuth(authData, returnUrl);

          // Check if the response indicates success
          if (
            response &&
            (response.success || (response.data && response.data.success))
          ) {
            set({
              isAuthorized: true,
              isAuthorizing: false,
            });
            return true;
          } else {
            throw new Error(
              response.error || response.data?.error || "Authorization failed",
            );
          }
        } catch (error) {
          console.error("App authorization error:", error);
          set({
            isAuthorizing: false,
            error:
              error instanceof Error
                ? error.message
                : "Unknown error during authorization",
          });
          return false;
        }
      },

      /**
       * Set the auth data
       * This function is used to update the auth data in the store
       */
      setAuthData: (authData) => {
        set({ authData });
      },

      /**
       * Set the authorization status
       * This function is used to directly update the isAuthorized state
       */
      setIsAuthorized: (isAuthorized) => {
        set({ isAuthorized });
      },

      /**
       * Reset authorization state
       * This function clears all authorization state and logs the user out
       */
      reset: () => {
        set({
          isAuthorized: false,
          isAuthorizing: false,
          error: null,
          authData: null,
        });
      },
    }),
    {
      name: "near-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthorized: state.isAuthorized,
        authData: state.authData,
      }), // Only persist these fields
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as NearAuthState),
      }),
    },
  ),
);
