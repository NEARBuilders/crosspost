import { withTwitterAuth } from "./utils";

export default async function handler(req, res) {
  try {
    const result = await withTwitterAuth(req, res, async ({ twitterService, accessToken, refreshToken }) => {
      const userInfo = await twitterService.getUserInfo(accessToken, refreshToken);
      
      if (!userInfo) {
        return res.json({ isConnected: false, handle: null });
      }

      return res.json({ 
        isConnected: true, 
        handle: userInfo.username,
        tokens: userInfo.tokens 
      });
    });
    
    return result;
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return res.json({ isConnected: false, handle: null });
  }
}
