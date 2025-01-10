import { TwitterApi } from "twitter-api-v2";

// This service is used in the Next.js server context,
// which manages API credentials and handles OAuth communciation with Twitter

export class TwitterService {
  constructor(clientId, clientSecret) {
    if (!clientId || !clientSecret) {
      throw new Error("Twitter OAuth 2.0 credentials are required");
    }
    this.client = new TwitterApi({
      clientId: clientId,
      clientSecret: clientSecret
    });
  }

  static async initialize() {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;

    return new TwitterService(clientId, clientSecret);
  }

  async getAuthLink(callbackUrl) {
    // Use OAuth 2.0 with PKCE for more granular scope control
    const { url, codeVerifier, state } = this.client.generateOAuth2AuthLink(
      callbackUrl,
      { scope: ['tweet.read', 'tweet.write', 'users.read'] }
    );
    return { url, codeVerifier, state };
  }

  async handleCallback(code, codeVerifier, state) {
    return this.client.loginWithOAuth2({ 
      code,
      codeVerifier,
      redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/twitter/callback`
    });
  }

  async tweet(accessToken, posts) {
    const userClient = new TwitterApi(accessToken);

    // Handle array of post objects
    if (!Array.isArray(posts)) {
      throw new Error("Posts must be an array");
    }

    if (posts.length === 1) {
      // Single tweet
      return userClient.v2.tweet(posts[0].text);
    } else {
      // Thread implementation
      let lastTweetId = null;
      const responses = [];

      for (const post of posts) {
        const tweetData = lastTweetId
          ? { text: post.text, reply: { in_reply_to_tweet_id: lastTweetId } }
          : { text: post.text };

        const response = await userClient.v2.tweet(tweetData);
        responses.push(response);
        lastTweetId = response.data.id;
      }

      return responses;
    }
  }

  async getUserInfo(accessToken) {
    const userClient = new TwitterApi(accessToken);

    const me = await userClient.v2.me();
    return me.data;
  }
}
