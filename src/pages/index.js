import { TwitterApiNotice } from "@/components/twitter-api-notice";
import { NEAR_SOCIAL_ENABLED, TWITTER_ENABLED } from "@/config";
import { tweet } from "@/lib/twitter";
import { useNearSocialPost } from "@/store/near-social-store";
import { useContext } from "react";
import { ComposePost } from "../components/compose-post";
import { NearContext } from "../wallets/near";

export default function Home() {
  const { signedAccountId } = useContext(NearContext);

  const { post: postToNearSocial } = useNearSocialPost(); // currently needed, so we can "hydrate" client with wallet

  // posts to all the enabled target platforms
  // errors are handled in ComposePost
  const post = async (posts) => {
    // TODO: generic interface for external plugins
    const promises = [];

    if (NEAR_SOCIAL_ENABLED) {
      promises.push(postToNearSocial(posts));
    }

    if (TWITTER_ENABLED) {
      promises.push(tweet(posts));
    }

    await Promise.all(promises); // execute all postings
  };

  return (
    <main className="p-6">
      <TwitterApiNotice post={post} />
      {/* MAIN CONTENT */}

      {!signedAccountId ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">
            Connect your NEAR wallet to start posting
          </p>
        </div>
      ) : (
        // : !isConnected ? (
        //   <div className="text-center py-12">
        //     <p className="text-lg text-gray-600">
        //       Connect Twitter to start posting
        //     </p>
        //   </div>
        // )
        <>
          <ComposePost onSubmit={post} />
        </>
      )}
    </main>
  );
}
