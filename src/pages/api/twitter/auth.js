import { TwitterService } from "../../../services/twitter";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", [
      "twitter_access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; HttpOnly; SameSite=Lax",
      "twitter_refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; HttpOnly; SameSite=Lax",
      "code_verifier=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; HttpOnly; SameSite=Lax",
      "oauth_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; HttpOnly; SameSite=Lax",
    ]);
    return res.status(200).json({ message: "Logged out successfully" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
    return res
      .status(500)
      .json({ error: "Twitter OAuth 2.0 credentials are missing" });
  }

  try {
    const twitterService = await TwitterService.initialize();
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/twitter/callback`;
    const authData = await twitterService.getAuthLink(callbackUrl);

    // Store PKCE and state values in cookies
    res.setHeader("Set-Cookie", [
      `code_verifier=${authData.codeVerifier}; Path=/; HttpOnly; SameSite=Lax`,
      `oauth_state=${authData.state}; Path=/; HttpOnly; SameSite=Lax`,
    ]);
    res.status(200).json({ authUrl: authData.url });
  } catch (error) {
    console.error("Twitter auth error:", error);
    res
      .status(500)
      .json({ error: "Failed to initialize Twitter authentication" });
  }
}
