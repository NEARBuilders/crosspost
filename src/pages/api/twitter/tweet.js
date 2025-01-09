import { TwitterService } from "../../../services/twitter";
import { parse } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { posts } = req.body;
  if (!Array.isArray(posts) || posts.length === 0 || !posts.every(p => p.text?.trim())) {
    return res.status(400).json({ error: "Valid posts array is required" });
  }

  const cookies = parse(req.headers.cookie || "");
  const accessToken = cookies.twitter_access_token;
  const accessSecret = cookies.twitter_access_secret;
  if (!accessToken || !accessSecret) {
    return res.status(401).json({ error: "Not authenticated with Twitter" });
  }

  try {
    const twitterService = await TwitterService.initialize();
    const response = await twitterService.tweet(accessToken, accessSecret, posts);
    res.status(200).json({ 
      success: true,
      data: Array.isArray(response) ? response : [response]
    });
  } catch (error) {
    console.error("Tweet error:", error);
    res.status(500).json({ error: "Failed to send tweet" });
  }
}
