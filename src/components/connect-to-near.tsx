import { toast } from "../hooks/use-toast";
import { useNearAuth } from "../store/near-auth-store";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Wallet } from "lucide-react";
import * as React from "react";
import { Button } from "./ui/button";

export function ConnectToNearButton(): React.ReactElement {
  const { signedAccountId, signIn, signOut } = useWalletSelector();
  const { reset: resetAuthState } = useNearAuth();

  const handleSignIn = async (): Promise<void> => {
    signIn();
  };

  const handleSignOut = (): void => {
    signOut().then(() => {
      resetAuthState();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    });
  };

  return (
    <Button
      onClick={signedAccountId ? handleSignOut : handleSignIn}
      className="text-sm sm:text-base"
    >
      <Wallet size={18} className="mr-2" />
      {signedAccountId
        ? window.innerWidth < 640
          ? "Disconnect"
          : `Disconnect @${signedAccountId}`
        : "Connect NEAR"}
    </Button>
  );
}
