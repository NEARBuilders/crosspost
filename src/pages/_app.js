import { useEffect, useState } from "react";

import { Navigation } from "../components/navigation";
import "../styles/globals.css";

import { NetworkId } from "../config";
import { NearContext, Wallet } from "../wallets/near";

const wallet = new Wallet({ networkId: NetworkId });

export default function App({ Component, pageProps }) {
  const [signedAccountId, setSignedAccountId] = useState("");

  useEffect(() => {
    // Start up NEAR wallet
    wallet.startUp(setSignedAccountId);
  }, []); // Empty deps since checkXConnection is memoized

  return (
    <NearContext.Provider value={{ wallet, signedAccountId }}>
      <Component {...pageProps} />
    </NearContext.Provider>
  );
}
