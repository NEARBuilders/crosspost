import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { WalletSelectorProvider } from "@near-wallet-selector/react-hook";
import React, { ReactNode } from "react";
import { NETWORK_ID } from "../../config";

interface NearWalletProviderProps {
  children: ReactNode;
}

export function NearWalletProvider({ children }: NearWalletProviderProps) {
  return (
    <WalletSelectorProvider
      config={{
        network: NETWORK_ID,
        createAccessKeyFor: "social.near",
        modules: [setupMyNearWallet(), setupMeteorWallet()],
      }}
    >
      {children}
    </WalletSelectorProvider>
  );
}
