import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { APP_NAME } from "../config";
import { useNearAuth } from "../store/near-auth-store";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Shield } from "lucide-react";
import * as React from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  message?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  message,
}: AuthModalProps) {
  const { authorize, isAuthorizing } = useNearAuth();
  const { wallet, signedAccountId } = useWalletSelector();

  const handleAuthorize = async () => {
    try {
      if (wallet && signedAccountId) {
        const success = await authorize(wallet, signedAccountId);

        if (success) {
          // Call the success callback if provided
          onSuccess?.();

          // Close the dialog
          onClose();
        }
      }
    } catch (error) {
      console.error("Authorization error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-0.5rem)] mx-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authorize {APP_NAME}
          </DialogTitle>
          <DialogDescription>
            {message ||
              "Before proceeding, you need to authorize this app to post on your behalf."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 sm:py-4">
          <div className="rounded-md border-2 border-gray-200 p-3 sm:p-4">
            <h3 className="font-medium">You are authorizing {APP_NAME} to:</h3>
            <ul className="mt-2 list-disc pl-5 text-sm">
              <li>Post content to social platforms you connect</li>
              <li>Access your connected social accounts</li>
              <li>Upload media on your behalf</li>
            </ul>
          </div>

          <div className="rounded-md bg-amber-50 p-3 sm:p-4 text-sm">
            <p className="font-medium text-amber-800">Important:</p>
            <p className="mt-1 text-amber-700">
              Your NEAR account{" "}
              <span className="font-bold">{signedAccountId}</span> will be used
              to sign all requests. You can revoke access at any time by
              disconnecting your accounts.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:justify-between">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleAuthorize}
            disabled={isAuthorizing}
            className="gap-2"
          >
            {isAuthorizing ? "Authorizing..." : "Authorize App"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
