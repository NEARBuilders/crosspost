import { parse } from 'cookie';
import { TwitterService } from '../../../services/twitter';

const cache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

const getCacheKey = (accessToken, accessSecret) => `${accessToken}:${accessSecret}`;

const getCachedUserInfo = (accessToken, accessSecret) => {
  const key = getCacheKey(accessToken, accessSecret);
  const cached = cache.get(key);
  if (!cached) return null;
  
  // Check if cache has expired
  if (Date.now() - cached.timestamp > CACHE_EXPIRY) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

const setCachedUserInfo = (accessToken, accessSecret, userInfo) => {
  const key = getCacheKey(accessToken, accessSecret);
  cache.set(key, {
    data: userInfo,
    timestamp: Date.now()
  });
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parse(req.headers.cookie || '');
  const accessToken = cookies.twitter_access_token;
  const accessSecret = cookies.twitter_access_secret;
  const isConnected = !!(accessToken && accessSecret);

  if (!isConnected) {
    return res.json({ isConnected, handle: null });
  }

  try {
    // Check cache first
    const cachedInfo = getCachedUserInfo(accessToken, accessSecret);
    if (cachedInfo) {
      return res.json({ isConnected, handle: cachedInfo.username });
    }

    // If not in cache, fetch from Twitter
    const twitterService = await TwitterService.initialize();
    const userInfo = await twitterService.getUserInfo(accessToken, accessSecret);
    
    // Cache the result
    setCachedUserInfo(accessToken, accessSecret, userInfo);
    
    res.json({ isConnected, handle: userInfo.username });
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    res.json({ isConnected, handle: null });
  }
}
