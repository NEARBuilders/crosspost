import { TwitterService } from '../../../services/twitter';
import { parse } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { oauth_token, oauth_verifier } = req.query;
  const cookies = parse(req.headers.cookie || '');
  const oauth_token_secret = cookies.oauth_token_secret;

  if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
    return res.status(400).json({ error: 'Missing OAuth parameters' });
  }

  try {
    const twitterService = await TwitterService.initialize();
    const { accessToken, accessSecret } = await twitterService.handleCallback(
      oauth_token,
      oauth_verifier,
      oauth_token_secret
    );

    res.setHeader('Set-Cookie', [
      `twitter_access_token=${accessToken}; Path=/; HttpOnly; SameSite=Lax`,
      `twitter_access_secret=${accessSecret}; Path=/; HttpOnly; SameSite=Lax`,
      'oauth_token_secret=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    ]);

    // Clean redirect since we're using Zustand store
    res.redirect('/');
  } catch (error) {
    console.error('Twitter callback error:', error);
    res.status(500).json({ error: 'Failed to complete Twitter authentication' });
  }
}
