import { SupportedPlatform } from "../config";

/**
 * Time period for filtering leaderboard data
 */
export enum TimePeriod {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
  ALL_TIME = "all_time",
}

/**
 * Generic API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * User profile interface
 */
export interface UserProfile {
  userId: string;
  username: string;
  url?: string;
  profileImageUrl: string;
  isPremium?: boolean;
  platform: string;
  lastUpdated: number; // timestamp
}

/**
 * Platform account interface
 */
export interface PlatformAccount {
  platform: SupportedPlatform;
  userId: string;
  username: string;
  profileImageUrl?: string;
  profile?: UserProfile;
}

/**
 * Post target interface
 */
export interface PostTarget {
  platform: SupportedPlatform;
  userId: string;
}

/**
 * Post media interface
 */
export interface PostMedia {
  data: string; // Base64 encoded data or URL
  mimeType: string;
  altText?: string;
}

/**
 * Post content interface
 */
export interface PostContent {
  text: string;
  media?: PostMedia[];
  mediaId?: string | null;
  mediaPreview?: string | null;
}

/**
 * Post request interface
 */
export interface PostRequest {
  targets: PostTarget[];
  content: PostContent[];
}

/**
 * Leaderboard entry interface
 */
export interface LeaderboardEntry {
  signerId: string;
  username?: string;
  profileImageUrl?: string;
  postCount: number;
  platform?: string;
  rank?: number; // Added by the frontend
  firstPostTimestamp?: number;
  lastPostTimestamp?: number;
}

/**
 * Leaderboard pagination interface
 */
export interface LeaderboardPagination {
  total: number;
  limit: number;
  offset: number;
}

/**
 * Leaderboard response interface
 */
export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  pagination: LeaderboardPagination;
  timeframe: TimePeriod;
  platform?: string;
  total?: number; // For backward compatibility
}

/**
 * Leaderboard error response interface
 */
export interface LeaderboardErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * Account activity interface
 */
export interface AccountActivity {
  signerId: string;
  totalPosts: number;
  firstPostTimestamp?: number;
  lastPostTimestamp?: number;
  platforms: {
    [platform: string]: number;
  };
}

/**
 * Account activity response interface
 */
export interface AccountActivityResponse {
  activity: AccountActivity;
}

/**
 * Account post interface
 */
export interface AccountPost {
  id: string;
  signerId: string;
  platform: string;
  content: string;
  timestamp: number;
  url?: string;
}

/**
 * Account posts response interface
 */
export interface AccountPostsResponse {
  posts: AccountPost[];
  total: number;
}
