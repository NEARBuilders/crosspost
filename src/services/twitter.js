import { TwitterApi } from "twitter-api-v2";

// This service is used in the Next.js server context,
// which manages API credentials and handles OAuth communciation with Twitter

export class TwitterService {
  constructor(credentials) {
    if (!credentials.clientId || !credentials.clientSecret) {
      throw new Error("Twitter OAuth 2.0 credentials are required");
    }
    
    // OAuth 2.0 client for tweet operations
    this.oauth2Client = new TwitterApi({
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
    });

    // OAuth 1.0a client for user operations if credentials are provided
    if (credentials.apiKey && credentials.apiSecret && credentials.accessToken && credentials.accessSecret) {
      this.oauth1Client = new TwitterApi({
        appKey: credentials.apiKey,
        appSecret: credentials.apiSecret,
        accessToken: credentials.accessToken,
        accessSecret: credentials.accessSecret,
      });
    }
  }

  static async initialize() {
    const credentials = {
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    };

    return new TwitterService(credentials);
  }

  async getAuthLink(callbackUrl) {
    // Use OAuth 2.0 with PKCE for more granular scope control
    const { url, codeVerifier, state } = this.oauth2Client.generateOAuth2AuthLink(
      callbackUrl,
      { scope: ["tweet.read", "tweet.write", "users.read"] },
    );
    return { url, codeVerifier, state };
  }

  async handleCallback(code, codeVerifier, state) {
    return this.oauth2Client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/twitter/callback`,
    });
  }

  async tweet(accessToken, posts) {
    // Create OAuth 2.0 client with user access token for tweet operations
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
    if (!this.oauth1Client) {
      throw new Error("OAuth 1.0a credentials are required for user operations");
    }

    try {
      const me = await this.oauth1Client.v2.me();
      return me.data;
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      throw error;
    }
  }
}
