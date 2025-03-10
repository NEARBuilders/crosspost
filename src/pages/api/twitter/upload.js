import { TwitterService } from "../../../services/twitter";
import { parse } from "cookie";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = parse(req.headers.cookie || "");
  const accessToken = cookies.twitter_access_token;
  if (!accessToken) {
    return res.status(401).json({ error: "Not authenticated with Twitter" });
  }

  try {
    const form = formidable({
      maxFileSize: 512 * 1024 * 1024, // Twitter's limit is 512MB
    });

    const [_, files] = await form.parse(req);

    if (!files.media?.[0]) {
      return res.status(400).json({ error: "No media file provided" });
    }

    const file = files.media[0];

    // Basic mimetype validation
    if (!file.mimetype?.match(/^(image\/.*|video\/.*)$/)) {
      return res
        .status(400)
        .json({ error: "Only images and videos are supported" });
    }
    const twitterService = await TwitterService.initialize();

    if (!twitterService.oauth1Client) {
      console.error("OAuth 1.0a client not initialized - check credentials");
      return res.status(500).json({
        error:
          "Server is not configured for media uploads. OAuth 1.0a credentials are missing.",
      });
    }

    try {
      const mediaId = await twitterService.uploadMedia(
        file.filepath,
        file.mimetype,
      );
      return res.status(200).json({
        success: true,
        mediaId,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      return res.status(500).json({
        error: "Failed to upload media: " + (error.message || "Unknown error"),
      });
    } finally {
      // Clean up the temporary file
      try {
        fs.unlinkSync(file.filepath);
      } catch (error) {
        console.error("Failed to clean up temp file:", error);
      }
    }
  } catch (error) {
    console.error("Media upload error:", error);
    if (
      error.message === "OAuth 1.0a credentials are required for media uploads"
    ) {
      res.status(500).json({
        error:
          "Server is not configured for media uploads. Please ensure OAuth 1.0a credentials are set.",
      });
    } else {
      res
        .status(500)
        .json({ error: "Failed to upload media: " + error.message });
    }
  }
}
