import { toast } from "@/hooks/use-toast";
import { Combine } from "lucide-react";
import { TweetCard } from "@/components/tweet-card";
import { tweet } from "@/lib/twitter";
import { useTwitterStore } from "@/store/twitter-store";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

const WORKER_URL = "https://shiny-paper-a708.elliot-c59.workers.dev";

// Worker interaction functions
const workerApi = {
  async pushInteraction(username, tweetId) {
    await fetch(`${WORKER_URL}/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        tweetId,
      }),
    });
  },

  async fetchLatestInteraction() {
    const response = await fetch(`${WORKER_URL}/latest`);
    return response.json();
  },
};

// Twitter interaction functions
const twitterApi = {
  async fetchTweet(id) {
    const response = await fetch(`/api/twitter/get-tweet?id=${id}`);
    return response.json();
  },

  async createQuoteTweet(text, quoteId) {
    const response = await tweet([
      {
        text,
        quote_tweet_id: quoteId,
      },
    ]);
    // Handle single tweet response
    return response.data?.id;
  },
};

export default function Compound() {
  Compound.layoutProps = {
    title: "compound",
    icon: Combine
  };
  const [lastInteraction, setLastInteraction] = useState({
    username: null,
    tweetId: null,
  });
  const [tweetData, setTweetData] = useState(null);

  // Fetch initial interaction on mount
  useEffect(() => {
    async function fetchInitialInteraction() {
      try {
        console.log("Fetching initial interaction...");
        const data = await workerApi.fetchLatestInteraction();
        console.log("Got interaction data:", data);
        const { username, tweetId } = data;
        if (username && tweetId) {
          setLastInteraction({
            username: username,
            tweetId: tweetId,
          });
        }
      } catch (error) {
        console.error("Failed to fetch initial interaction:", error);
      }
    }
    fetchInitialInteraction();
  }, []);

  // Fetch tweet data when we have an interaction
  useEffect(() => {
    async function fetchTweetData() {
      if (!lastInteraction.tweetId) return;
      try {
        console.log("Fetching tweet data for:", lastInteraction.tweetId);
        const data = await twitterApi.fetchTweet(lastInteraction.tweetId);
        console.log("Got tweet data:", data);
        setTweetData(data);
      } catch (error) {
        console.error("Failed to fetch tweet data:", error);
      }
    }
    fetchTweetData();
  }, [lastInteraction.tweetId]);

  const handleQuoteRetweet = async () => {
    console.log("Handling quote retweet...");
    try {
      console.log("Fetching original tweet...");
      const tweetResponse = await twitterApi.fetchTweet(lastInteraction.tweetId);
      console.log("Original tweet:", tweetResponse);
      const tweetText = tweetResponse?.data?.text;
      if (!tweetText) {
        throw new Error("Could not get tweet text");
      }
      console.log("Creating quote tweet...");
      const newTweetId = await twitterApi.createQuoteTweet(
        tweetText,
        lastInteraction.tweetId
      );
      console.log("New tweet created:", newTweetId);

      const handle = useTwitterStore.getState().handle;
      console.log("Pushing new interaction for handle:", handle);
      await workerApi.pushInteraction(handle, newTweetId);
      
      // Fetch the latest interaction after pushing
      const latestData = await workerApi.fetchLatestInteraction();
      console.log("Got new latest interaction:", latestData);
      const { username, tweetId } = JSON.parse(latestData);
      if (username && tweetId) {
        setLastInteraction({
          username,
          tweetId,
        });
      }

      toast({
        title: "Quote Tweet Successful",
        description: "Your quote tweet has been published",
      });
    } catch (error) {
      toast({
        title: "Quote Tweet Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Head>
        <title>compound</title>
        <meta name="description" content="exponential interactions" />
      </Head>

      <main className="p-6">
        <div className="max-w-2xl mx-auto">

          {tweetData && (
            <TweetCard
              data={tweetData}
              username={lastInteraction.username}
              onQuote={handleQuoteRetweet}
            />
          )}

          {lastInteraction.username && !tweetData && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                Loading tweet from @{lastInteraction.username}...
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
