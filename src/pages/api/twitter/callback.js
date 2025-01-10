import { TwitterService } from "../../../services/twitter";
import { parse } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, state } = req.query;
  const cookies = parse(req.headers.cookie || "");
  const { code_verifier, oauth_state } = cookies;

  if (!code || !state || !code_verifier || !oauth_state) {
    return res.status(400).json({ error: "Missing OAuth parameters" });
  }

  // Verify the state parameter to prevent CSRF attacks
  if (state !== oauth_state) {
    return res.status(400).json({ error: "Invalid OAuth state" });
  }

  try {
    const twitterService = await TwitterService.initialize();
    const { accessToken, refreshToken } = await twitterService.handleCallback(
      code,
      code_verifier,
      state,
    );

    // Get user info using the new access token
    const userInfo = await twitterService.getUserInfo(accessToken);

    // Store tokens in HttpOnly cookies
    res.setHeader("Set-Cookie", [
      `twitter_access_token=${accessToken}; Path=/; HttpOnly; SameSite=Lax`,
      `twitter_refresh_token=${refreshToken}; Path=/; HttpOnly; SameSite=Lax`,
      "code_verifier=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
      "oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    ]);

    // Redirect with user info
    res.redirect(`/?twitter_connected=true&handle=${userInfo.username}`);
  } catch (error) {
    console.error("Twitter callback error:", error);
    res
      .status(500)
      .json({ error: "Failed to complete Twitter authentication" });
  }
}
