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
import { NETWORK_ID } from "../config";
import { NearContext, Wallet } from "../wallets/near";

const wallet = new Wallet({
  networkId: NETWORK_ID,
  createAccessKeyFor: SOCIAL_CONTRACT[NETWORK_ID],
});

posthog.init("phc_HZ4woEIkjMhk0U1iQMXSS4cDePyOvr6B80O8GGqoKkz", {
  api_host: "https://us.i.posthog.com",
  person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
});

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
