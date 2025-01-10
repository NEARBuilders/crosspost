import { parse } from "cookie";
import { TwitterService } from "../../../services/twitter";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = parse(req.headers.cookie || "");
  const accessToken = cookies.twitter_access_token;
  const isConnected = !!accessToken;

  if (!isConnected) {
    return res.json({ isConnected, handle: null });
  }

  try {
    const twitterService = await TwitterService.initialize();
    const userInfo = await twitterService.getUserInfo(accessToken);
    res.json({ isConnected, handle: userInfo.username });
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    res.json({ isConnected, handle: null });
  }
}
