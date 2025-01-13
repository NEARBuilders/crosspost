import { TwitterService } from "../../../services/twitter";
import { validateOAuthCallback, setAuthCookies } from "./utils";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Validate OAuth callback parameters
  const validation = validateOAuthCallback(req);
  if (!validation.isValid) {
    return res.redirect(
      `/?twitter_error=${encodeURIComponent(validation.error)}`,
    );
  }

  try {
    const twitterService = await TwitterService.initialize();

    // get tokens from callback parameters
    const tokens = await twitterService.handleCallback(
      validation.code,
      validation.code_verifier,
      validation.state,
    );

    // get user info using the new access token
    const userInfo = await twitterService.getUserInfo(tokens.accessToken);
    if (!userInfo) {
      return res.redirect(
        `/?twitter_error=${encodeURIComponent("Failed to fetch user info")}`,
      );
    }

    // store tokens in HttpOnly cookies
    setAuthCookies(res, tokens);

    // redirect with user info
    res.redirect(`/?twitter_connected=true&handle=${userInfo.username}`);
  } catch (error) {
    console.error("Twitter callback error:", error);
    return res.redirect(
      `/?twitter_error=${encodeURIComponent("Failed to complete Twitter authentication")}`,
    );
  }
}
