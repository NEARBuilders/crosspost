import Head from "next/head";
import { useEffect, useState } from "react";

import "../styles/globals.css";

import { Footer } from "@/components/footer";
import { GithubForkRibbon } from "@/components/github-fork-ribbon";
import { HelperBuddy } from "@/components/helper-buddy";
import { Toaster } from "@/components/ui/toaster";
import { WindowContainer } from "@/components/window-container";
import { SOCIAL_CONTRACT } from "@/lib/near-social";
import posthog from "posthog-js";
import { trackWalletConnection } from "@/lib/analytics";
import { NETWORK_ID } from "../config";
import { NearContext, Wallet } from "../wallets/near";

const wallet = new Wallet({
  networkId: NETWORK_ID,
  createAccessKeyFor: SOCIAL_CONTRACT[NETWORK_ID],
});

// Initialize PostHog only in production
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") posthog.opt_out_capturing();
    },
    capture_pageview: true,
    capture_pageleave: true,
    person_profiles: "identified_only",
  });
}

export default function App({ Component, pageProps }) {
  const [signedAccountId, setSignedAccountId] = useState("");
  useEffect(() => {
    // Start up NEAR wallet
    wallet.startUp((accountId) => {
      setSignedAccountId(accountId);
      if (accountId) {
        trackWalletConnection(accountId);
      }
    });
  }, []);

  return (
    <>
      <Head>
        <title>crosspost | your content, everywhere</title>
        <meta
          name="description"
          content="Open source user interface to crosspost across Twitter (X) and Near Social platforms."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://crosspost.everything.dev" />
        <meta
          property="og:title"
          content="crosspost | your content, everywhere"
        />
        <meta
          property="og:description"
          content="Open source user interface to crosspost across Twitter (X) and Near Social platforms."
        />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content="https://crosspost.everything.dev"
        />
        <meta
          property="twitter:title"
          content="crosspost | your content, everywhere"
        />
        <meta
          property="twitter:description"
          content="Open source user interface to crosspost across Twitter (X) and Near Social platforms."
        />
        <meta property="twitter:image" content="/og-image.png" />
      </Head>
      <GithubForkRibbon />
      <NearContext.Provider value={{ wallet, signedAccountId }}>
        <WindowContainer>
          <Component {...pageProps} />
        </WindowContainer>
      </NearContext.Provider>
      <Footer />
      <Toaster />
      <HelperBuddy />
    </>
  );
}
