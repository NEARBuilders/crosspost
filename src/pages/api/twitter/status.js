import { parse } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parse(req.headers.cookie || '');
  const isConnected = !!(cookies.twitter_access_token && cookies.twitter_access_secret);

  res.json({ isConnected });
}
