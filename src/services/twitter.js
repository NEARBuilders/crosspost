import { TwitterApi } from "twitter-api-v2";

// This service is used in the Next.js server context,
// which manages API credentials and handles OAuth communciation with Twitter

export class TwitterService {
  constructor(clientId, clientSecret, apiKey, apiSecret) {
    if (!clientId || !clientSecret || !apiKey || !apiSecret) {
      throw new Error("Twitter API credentials are required");
    }
    this.client = new TwitterApi({
      clientId: clientId,
      clientSecret: clientSecret,
      appKey: apiKey,
      appSecret: apiSecret,
    });
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  static async initialize() {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;
    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;

    return new TwitterService(clientId, clientSecret, apiKey, apiSecret);
  }

  async getAuthLink(callbackUrl) {
    const { url, oauth_token, oauth_token_secret } =
      await this.client.generateAuthLink(callbackUrl);
    return { url, oauth_token, oauth_token_secret };
  }

  async handleCallback(oauthToken, oauthVerifier, oauthTokenSecret) {
    const tempClient = new TwitterApi({
      appKey: this.apiKey,
      appSecret: this.apiSecret,
      accessToken: oauthToken,
      accessSecret: oauthTokenSecret,
    });

    return tempClient.login(oauthVerifier);
  }

  async tweet(accessToken, accessSecret, text) {
    const userClient = new TwitterApi({
      appKey: this.apiKey,
      appSecret: this.apiSecret,
      accessToken,
      accessSecret,
    });

    return userClient.v2.tweet(text);
  }

  async getUserInfo(accessToken, accessSecret) {
    const userClient = new TwitterApi({
      appKey: this.apiKey,
      appSecret: this.apiSecret,
      accessToken,
      accessSecret,
    });

    const me = await userClient.v2.me();
    return me.data;
  }
}
