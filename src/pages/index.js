import { useTwitterConnection } from "@/store/twitter-store";
import { useContext } from "react";
import { ComposePost } from "../components/compose-post";
import { NearContext } from "../wallets/near";
import { NEAR_SOCIAL_ENABLED, TWITTER_ENABLED } from "@/config";
import { useNearSocialPost } from "@/store/near-social-store";
import { tweet } from "@/lib/twitter";

export default function Home() {
  const { signedAccountId } = useContext(NearContext);
  const { isConnected } = useTwitterConnection();
  const { post: postToNearSocial } = useNearSocialPost(); // currently needed, so we can "hydrate" client with wallet

  // posts to all the enabled target platforms
  // errors are handled in ComposePost
  const post = (text) => {

    // TODO: generic interface for external plugins

    if (NEAR_SOCIAL_ENABLED) {
      postToNearSocial(text)
    }
    
    if (TWITTER_ENABLED) {
      tweet(text);
    }
  };

  return (
    <main className="p-6">
      {/* MAIN CONTENT */}

      {!signedAccountId ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">
            Connect your NEAR wallet to start posting
          </p>
        </div>
      ) : !isConnected ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">
            Connect Twitter to start posting
          </p>
        </div>
      ) : (
        <ComposePost onSubmit={post} />
      )}
    </main>
  );
}
