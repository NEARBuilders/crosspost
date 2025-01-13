import { parse } from "cookie";
import { TwitterService } from "../../../services/twitter";

export async function withTwitterAuth(req, res, handler) {
  if (!["GET", "POST", "DELETE"].includes(req.method)) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = parse(req.headers.cookie || "");
  const accessToken = cookies.twitter_access_token;
  const refreshToken = cookies.twitter_refresh_token;

  if (!accessToken && req.method !== "DELETE") {
    return res.status(401).json({ error: "Not authenticated with Twitter" });
  }

  try {
    const twitterService = await TwitterService.initialize();
    const result = await handler({ twitterService, accessToken, refreshToken });

    // Update tokens if they were refreshed
    if (result?.tokens && result.tokens.accessToken !== accessToken) {
      res.setHeader("Set-Cookie", [
        `twitter_access_token=${result.tokens.accessToken}; Path=/; HttpOnly; SameSite=Lax`,
        `twitter_refresh_token=${result.tokens.refreshToken}; Path=/; HttpOnly; SameSite=Lax`,
      ]);
    }

    return result;
  } catch (error) {
    console.error("Twitter API error:", error);
    throw error;
  }
}

export function clearTwitterCookies(res) {
  res.setHeader("Set-Cookie", [
    "twitter_access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; HttpOnly; SameSite=Lax",
    "twitter_refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; HttpOnly; SameSite=Lax",
    "code_verifier=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; HttpOnly; SameSite=Lax",
    "oauth_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; HttpOnly; SameSite=Lax",
  ]);
}

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.setHeader("Set-Cookie", [
    `twitter_access_token=${accessToken}; Path=/; HttpOnly; SameSite=Lax`,
    `twitter_refresh_token=${refreshToken}; Path=/; HttpOnly; SameSite=Lax`,
    "code_verifier=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    "oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
  ]);
}

export function validateOAuthCallback(req) {
  const { code, state, error, error_description } = req.query;
  const cookies = parse(req.headers.cookie || "");
  const { code_verifier, oauth_state } = cookies;

  if (error) {
    return {
      isValid: false,
      error: `Twitter access was denied: ${error}`,
      description: error_description,
    };
  }

  if (!code || !state) {
    return {
      isValid: false,
      error: "Missing authorization code",
    };
  }

  if (!code_verifier || !oauth_state) {
    return {
      isValid: false,
      error: "Invalid session state",
    };
  }

  if (state !== oauth_state) {
    return {
      isValid: false,
      error: "Invalid OAuth state",
    };
  }

  return {
    isValid: true,
    code,
    code_verifier,
    state,
  };
}
