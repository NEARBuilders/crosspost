import { TwitterApiNotice } from "@/components/twitter-api-notice";
import { NEAR_SOCIAL_ENABLED, TWITTER_ENABLED } from "@/config";
import { tweet } from "@/lib/twitter";
import { useNearSocialPost } from "@/store/near-social-store";
import { useContext } from "react";
import { ComposePost } from "../components/compose-post";
import { NearContext } from "../wallets/near";
import { toast } from "@/hooks/use-toast";

export default function Home() {
  const { signedAccountId } = useContext(NearContext);

  const { post: postToNearSocial } = useNearSocialPost(); // currently needed, so we can "hydrate" client with wallet

  // posts to all the enabled target platforms
  const post = async (posts) => {
    try {
      // TODO: generic interface for external plugins
      const promises = [];

      if (NEAR_SOCIAL_ENABLED) {
        promises.push(postToNearSocial(posts));
      }

      if (TWITTER_ENABLED) {
        promises.push(tweet(posts));
      }

      await Promise.all(promises); // execute all postings
      toast({
        title: "Post Successful",
        description: "Your post has been published",
      });
    } catch (e) {
      toast({
        title: "Post Failed",
        description: e.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
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
