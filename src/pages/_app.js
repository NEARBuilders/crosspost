import { useEffect, useState } from "react";
import Head from "next/head";

import "../styles/globals.css";

import { NETWORK_ID } from "../config";
import { NearContext, Wallet } from "../wallets/near";

const wallet = new Wallet({ networkId: NETWORK_ID });

export default function App({ Component, pageProps }) {
  const [signedAccountId, setSignedAccountId] = useState("");

  useEffect(() => {
    // Start up NEAR wallet
    wallet.startUp(setSignedAccountId);
  }, []);

  return (
    <>
      <Head>
        <title>crosspost | your content, everywhere</title>
        <meta name="description" content="Open source user interface to crosspost across Twitter (X) and Near Social platforms." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta charSet="utf-8" />
        <meta name="language" content="English" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://crosspost.everything.dev" />
        <meta property="og:title" content="crosspost | your content, everywhere" />
        <meta property="og:description" content="Open source user interface to crosspost across Twitter (X) and Near Social platforms." />
        <meta property="og:image" content="/near-logo.svg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://crosspost.everything.dev" />
        <meta property="twitter:title" content="crosspost | your content, everywhere" />
        <meta property="twitter:description" content="Open source user interface to crosspost across Twitter (X) and Near Social platforms." />
        <meta property="twitter:image" content="/near-logo.svg" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/near-logo.svg" />
      </Head>
      <NearContext.Provider value={{ wallet, signedAccountId }}>
        <Component {...pageProps} />
      </NearContext.Provider>
    </>
  );
}
