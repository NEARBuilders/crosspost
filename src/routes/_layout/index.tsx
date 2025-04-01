import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PenSquare } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AuthButton } from "../../components/auth-button";
import { AuthModal } from "../../components/auth-modal";
import { ConnectToNearButton } from "../../components/connect-to-near";
import { ManageAccountsButton } from "../../components/manage-accounts-button";
import { useNearAuth } from "../../store/near-auth-store";
import { useConnectedAccounts } from "../../store/platform-accounts-store";

export const Route = createFileRoute("/_layout/")({
  component: HomePage,
  beforeLoad: ({ context }) => {
    // Get auth state from the store
    const { isAuthorized } = useNearAuth.getState();

    // If user is authorized, redirect to editor by default
    if (isAuthorized) {
      return redirect({ to: "/editor" });
    }
  },
});

function HomePage() {
  const navigate = useNavigate();
  const { signedAccountId } = useWalletSelector();
  const { isAuthorized } = useNearAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { data: connectedAccounts = [], isLoading } = useConnectedAccounts();

  // Redirect to editor if authorized and has connected accounts
  useEffect(() => {
    if (isAuthorized) {
      if (connectedAccounts.length > 0) {
        navigate({ to: "/editor" });
      } else {
        navigate({ to: "/manage" });
      }
    }
  }, [isAuthorized, connectedAccounts.length, navigate]);

  // If not authenticated, show connect wallet UI
  if (!signedAccountId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PenSquare size={64} className="mb-6 text-gray-400" />
          <h1 className="text-3xl font-bold mb-4">Welcome to Crosspost</h1>
          <p className="text-gray-500 mb-8 max-w-md">
            Connect your NEAR wallet to get started with crossposting to
            multiple platforms.
          </p>
          <ConnectToNearButton />
        </motion.div>
      </div>
    );
  }

  // If authenticated but not authorized, show authorization dialog
  if (signedAccountId && !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            <p className="text-sm text-green-600 font-medium">
              Connected as @{signedAccountId}
            </p>
          </div>

          <h1 className="text-3xl font-bold mb-4">Authorize Crosspost</h1>
          <p className="text-gray-500 mb-8 max-w-md">
            Authorize this app to post on your behalf to connected social
            platforms.
          </p>

          <AuthButton />

          <AuthModal
            isOpen={showAuthDialog}
            onClose={() => setShowAuthDialog(false)}
          />
        </motion.div>
      </div>
    );
  }

  // If authenticated and authorized, show connect accounts or editor UI
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center mb-4">
          <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
          <p className="text-sm text-green-600 font-medium">
            Connected as @{signedAccountId}
          </p>
        </div>

        <h1 className="text-3xl font-bold mb-4">Connect Your Accounts</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Connect your social media accounts to start crossposting.
        </p>

        <div className="flex flex-col space-y-4">
          <ManageAccountsButton />
        </div>
      </motion.div>
    </div>
  );
}
