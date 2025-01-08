import { useNearSocialStore } from "@/store/near-social-store";
import { NearContext } from "@/wallets/near";
import { Wallet } from "lucide-react";
import { useContext, useEffect } from "react";

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
    <button
      onClick={signedAccountId ? handleSignOut : handleSignIn}
      className="flex items-center gap-2 px-4 py-2 border-2 border-gray-800 hover:bg-gray-100 shadow-[2px_2px_0_rgba(0,0,0,1)]"
    >
      <Wallet size={18} />
      {signedAccountId ? "Disconnect NEAR" : "Connect NEAR"}
    </button>
  );
}
