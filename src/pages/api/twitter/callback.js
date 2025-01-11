import { TwitterService } from "../../../services/twitter";
import { parse } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, state, error, error_description } = req.query;
  const cookies = parse(req.headers.cookie || "");
  const { code_verifier, oauth_state } = cookies;

  // Handle OAuth errors (e.g., user denied access)
  if (error) {
    console.log("OAuth error:", error, error_description);
    return res.redirect(
      `/?twitter_error=${"Twitter access was denied: " + encodeURIComponent(error)}`,
    );
  }

  // Validate OAuth parameters
  if (!code || !state) {
    return res.redirect(
      `/?twitter_error=${encodeURIComponent("Missing authorization code")}`,
    );
  }

  if (!code_verifier || !oauth_state) {
    return res.redirect(
      `/?twitter_error=${encodeURIComponent("Invalid session state")}`,
    );
  }

  // Verify the state parameter to prevent CSRF attacks
  if (state !== oauth_state) {
    return res.redirect(
      `/?twitter_error=${encodeURIComponent("Invalid OAuth state")}`,
    );
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
    return res.redirect(
      `/?twitter_error=${encodeURIComponent("Failed to complete Twitter authentication")}`,
    );
  }
}
