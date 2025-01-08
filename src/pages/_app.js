import Head from "next/head";
import { useEffect, useState } from "react";

import "../styles/globals.css";

import { SOCIAL_CONTRACT } from "@/lib/near-social";
import Image from "next/image";
import { NETWORK_ID } from "../config";
import { NearContext, Wallet } from "../wallets/near";

const wallet = new Wallet({
  networkId: NETWORK_ID,
  createAccessKeyFor: SOCIAL_CONTRACT[NETWORK_ID],
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
        <meta charSet="utf-8" />
        <meta name="language" content="English" />

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
        <meta property="og:image" content="/og-image.svg" />
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
        <meta property="twitter:image" content="/og-image.svg" />

        {/* Favicon */}
        <link rel="icon" href="/black-dot.svg" />
        <link rel="apple-touch-icon" href="/black-dot.svg" />

        {/* GitHub Fork Ribbon */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.3/gh-fork-ribbon.min.css"
        />
        <style>{`.github-fork-ribbon:before { background-color: #333; }`}</style>
      </Head>
      <a
        className="github-fork-ribbon"
        href="https://github.com/nearbuilders/crosspost"
        data-ribbon="Fork me on GitHub"
        title="Fork me on GitHub"
      ></a>
      <NearContext.Provider value={{ wallet, signedAccountId }}>
        <Component {...pageProps} />
      </NearContext.Provider>
      <footer className="flex justify-end m-4 font-mono text-gray-500">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2">
            <span>a part of</span>
            <a
              href={"https://everything.dev"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/black-dot.svg"
                alt="everything"
                width={24}
                height={24}
              />
            </a>
          </div>
          <div className="w-36 ">
            <Image
              src="/built-on-near.svg"
              alt="built on near"
              width={144}
              height={36}
            />
          </div>
          <div className="flex items-center gap-2">
            <span>with ❤️ by</span>
            <a
              href={"https://github.com/nearbuilders/crosspost"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://builders.mypinata.cloud/ipfs/QmWt1Nm47rypXFEamgeuadkvZendaUvAkcgJ3vtYf1rBFj"
                alt="builder"
                width={24}
                height={24}
              />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
