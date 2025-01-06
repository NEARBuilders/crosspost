import { TwitterService } from '../../../services/twitter';
import { parse } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ error: 'Tweet text is required' });
  }

  const cookies = parse(req.headers.cookie || '');
  const accessToken = cookies.twitter_access_token;
  const accessSecret = cookies.twitter_access_secret;
  if (!accessToken || !accessSecret) {
    return res.status(401).json({ error: 'Not authenticated with Twitter' });
  }

  try {
    const twitterService = await TwitterService.initialize();
    await twitterService.tweet(accessToken, accessSecret, text);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Tweet error:', error);
    res.status(500).json({ error: 'Failed to send tweet' });
  }
}
