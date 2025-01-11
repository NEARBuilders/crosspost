import { TwitterApi } from "twitter-api-v2";
import fs from "fs";

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

    // OAuth 1.0a client for user operations and media uploads if credentials are provided
    if (credentials.apiKey && credentials.apiSecret && credentials.accessToken && credentials.accessSecret) {
      try {
        this.oauth1Client = new TwitterApi({
          appKey: credentials.apiKey,
          appSecret: credentials.apiSecret,
          accessToken: credentials.accessToken,
          accessSecret: credentials.accessSecret,
        });
        console.log("OAuth 1.0a client initialized successfully");
      } catch (error) {
        console.error("Failed to initialize OAuth 1.0a client:", error);
        this.oauth1Client = null;
      }
    } else {
      console.warn("Missing OAuth 1.0a credentials - media uploads will not work");
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

  async uploadMedia(mediaPath, mimeType) {
    if (!this.oauth1Client) {
      throw new Error("OAuth 1.0a credentials are required for media uploads");
    }

    try {
      // Read the file into a buffer
      const buffer = await fs.promises.readFile(mediaPath);
      
      // For media uploads, we use the app-only OAuth 1.0a client
      // The user's OAuth 2.0 access token is not used for media uploads
      const mediaId = await this.oauth1Client.v1.uploadMedia(buffer, { mimeType });
      console.log("Media upload successful, mediaId:", mediaId);
      return mediaId;
    } catch (error) {
      console.error("Media upload error details:", error);
      throw error;
    }
  }

  async tweet(accessToken, posts) {
    // Create OAuth 2.0 client with user access token for tweet operations
    const userClient = new TwitterApi(accessToken);

    // Handle array of post objects
    if (!Array.isArray(posts)) {
      throw new Error("Posts must be an array");
    }

    if (posts.length === 1) {
      const post = posts[0];
      const tweetData = { text: post.text };
      
      // Add media if present
      if (post.mediaId) {
        tweetData.media = { media_ids: post.mediaId };
      }
      
      return userClient.v2.tweet(tweetData);
    } else {
      // Thread implementation
      let lastTweetId = null;
      const responses = [];

      for (const post of posts) {
        const tweetData = {
          text: post.text,
          ...(lastTweetId && { reply: { in_reply_to_tweet_id: lastTweetId } }),
          ...(post.mediaId && { media: { media_ids: post.mediaId } })
        };

        const response = await userClient.v2.tweet(tweetData);
        responses.push(response);
        lastTweetId = response.data.id;
      }

      return responses;
    }
  }

  async getUserInfo(accessToken) {
    try {
      // Create OAuth 2.0 client with user access token for user operations
      const userClient = new TwitterApi(accessToken);
      const me = await userClient.v2.me();
      return me.data;
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      throw error;
    }
  }
}
