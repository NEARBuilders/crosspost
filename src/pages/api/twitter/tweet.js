import { withTwitterAuth } from "./utils";

export default async function handler(req, res) {
  const { posts } = req.body;
  if (
    !Array.isArray(posts) ||
    posts.length === 0 ||
    !posts.every((p) => p.text?.trim())
  ) {
    return res.status(400).json({ error: "Valid posts array is required" });
  }

  try {
    const result = await withTwitterAuth(
      req,
      res,
      async ({ twitterService, accessToken, refreshToken }) => {
        const response = await twitterService.tweet(
          accessToken,
          refreshToken,
          posts,
        );

        return res.status(200).json({
          success: true,
          data: Array.isArray(response.responses)
            ? response.responses
            : [response],
          tokens: response.tokens,
        });
      },
    );

    return result;
  } catch (error) {
    console.error("Tweet error:", error);
    return res.status(500).json({
      error: error.message || "Failed to send tweet",
    });
  }
}
