import { useNearSocialStore } from "@/store/near-social-store";
import { NearContext } from "@/wallets/near";
import { Wallet } from "lucide-react";
import { useContext, useEffect } from "react";
import { Button } from "./ui/button";

export function ConnectToNearButton() {
  const { signedAccountId, wallet } = useContext(NearContext);
  const setWallet = useNearSocialStore((state) => state.setWallet);

  useEffect(() => {
    if (wallet && signedAccountId) {
      // (basically initNearSocial(wallet) )
      setWallet(wallet);
    }
  }, [wallet, signedAccountId, setWallet]);

  const handleSignIn = () => {
    // would be nice if this was just adding an access key
    wallet?.signIn();
  };

  const handleSignOut = () => {
    try {
      wallet?.signOut();
    } catch (err) {
      // don't want cancel login with Meteor wallet to fail
      console.error("Erorr signing out, ", err);
    }
  };

  return (
    <Button onClick={signedAccountId ? handleSignOut : handleSignIn}>
      <Wallet size={18} />
      {signedAccountId ? `Disconnect @${signedAccountId}` : "Connect NEAR"}
    </Button>
  );
}
