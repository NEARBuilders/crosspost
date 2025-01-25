import { withTwitterAuth } from "./utils";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Tweet ID is required" });
  }

  try {
    const result = await withTwitterAuth(
      req,
      res,
      async ({ twitterService, accessToken, refreshToken }) => {
        const tweet = await twitterService.getTweet(
          accessToken,
          refreshToken,
          id
        );
        // Return both the tweet data and any referenced tweets
        const { data, includes } = tweet;
        return res.status(200).json({ data, includes });
      }
    );

    return result;
  } catch (error) {
    console.error("Get tweet error:", error);
    return res.status(500).json({
      error: error.message || "Failed to get tweet",
    });
  }
}
