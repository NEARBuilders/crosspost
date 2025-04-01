import { OPEN_CROSSPOST_PROXY_API, SupportedPlatform } from "../config";
import { getCurrentAuthData } from "./auth/near-auth";
import {
  AccountActivityResponse,
  AccountPostsResponse,
  ApiResponse,
  LeaderboardResponse,
  PlatformAccount,
  PostRequest,
  TimePeriod,
} from "./api-types";

/**
 * CrosspostApiClient - A client for interacting with the Crosspost API
 * This class provides methods for making authenticated requests to the API
 */
export class CrosspostApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = OPEN_CROSSPOST_PROXY_API) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get headers with NEAR authentication
   * @returns Headers object with Authorization header if authenticated
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const authData = getCurrentAuthData();
    if (authData) {
      headers["Authorization"] = `Bearer ${JSON.stringify(authData)}`;
    }

    return headers;
  }

  /**
   * Make an authenticated request to the API
   * @param endpoint - API endpoint path
   * @param method - HTTP method
   * @param body - Request body (optional)
   * @returns Promise resolving to the API response
   */
  private async request<T = any>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: any,
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = this.getAuthHeaders();

      const options: RequestInit = {
        method,
        headers,
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.error || `Error ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error(`API request error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Fetch all connected accounts for the authenticated NEAR user
   * @returns Promise resolving to the list of connected accounts
   */
  async fetchConnectedAccounts(): Promise<ApiResponse<PlatformAccount[]>> {
    const response = await this.request<{ accounts: any[] }>(
      "/auth/accounts",
      "GET",
    );

    if (!response.success) {
      return {
        success: false,
        error: response.error,
      };
    }

    // Handle nested data structure: { data: { accounts: [...] } }
    const accounts = response.data?.accounts || [];

    return {
      success: true,
      data: accounts,
    };
  }

  /**
   * Initiate the connection flow for a platform account
   * @param platform - Platform to connect
   * @param returnUrl - URL to return to after connection
   * @returns Promise resolving to the auth URL
   */
  async connectPlatformAccount(
    platform: SupportedPlatform,
    returnUrl: string,
  ): Promise<ApiResponse<{ authUrl: string }>> {
    const response = await this.request<{ authUrl: string }>(
      `/auth/${platform.toLowerCase()}/login`,
      "POST",
      { returnUrl },
    );

    // If successful, redirect to the auth URL
    if (response.success && response.data?.authUrl) {
      window.location.href = response.data.authUrl;
    }

    return response;
  }

  /**
   * Disconnect a platform account
   * @param platform - Platform to disconnect
   * @param userId - User ID to disconnect
   * @returns Promise resolving to the API response
   */
  async disconnectPlatformAccount(
    platform: SupportedPlatform,
    userId: string,
  ): Promise<ApiResponse> {
    return this.request(`/auth/${platform.toLowerCase()}/revoke`, "DELETE", {
      userId,
    });
  }

  /**
   * Refresh a platform account's token
   * @param platform - Platform to refresh
   * @param userId - User ID to refresh
   * @returns Promise resolving to the API response
   */
  async refreshPlatformAccount(
    platform: SupportedPlatform,
    userId: string,
  ): Promise<ApiResponse> {
    return this.request(
      `/auth/${platform.toLowerCase()}/refresh-profile`,
      "POST",
      { userId },
    );
  }

  /**
   * Check a platform account's status
   * @param platform - Platform to check
   * @param userId - User ID to check
   * @returns Promise resolving to the account status
   */
  async checkPlatformAccountStatus(
    platform: SupportedPlatform,
    userId: string,
  ): Promise<ApiResponse<{ isConnected: boolean }>> {
    // Use query parameters instead of body for GET request
    const url = new URL(
      `${this.baseUrl}/auth/${platform.toLowerCase()}/status`,
    );
    url.searchParams.append("userId", userId);

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.error || `Error ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: { isConnected: data.isConnected || false },
      };
    } catch (error) {
      console.error(`Error checking ${platform} account status:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create a post on selected platforms
   * @param postRequest - Post request data
   * @returns Promise resolving to the API response
   */
  async createPost(postRequest: PostRequest): Promise<ApiResponse> {
    return this.request("/api/post", "POST", postRequest);
  }

  /**
   * Get rate limit status for an endpoint
   * @param endpoint - Optional endpoint to check
   * @returns Promise resolving to the rate limit status
   */
  async getRateLimitStatus(endpoint?: string): Promise<ApiResponse> {
    const path = endpoint ? `/api/rate-limit/${endpoint}` : "/api/rate-limit";

    return this.request(path, "GET");
  }

  /**
   * Get leaderboard data
   * @param limit - Maximum number of entries to return
   * @param offset - Number of entries to skip
   * @param timeframe - Time period for filtering
   * @param platform - Platform name for filtering
   * @returns Promise resolving to the leaderboard data
   */
  async getLeaderboard(
    limit: number = 10,
    offset: number = 0,
    timeframe: TimePeriod = TimePeriod.ALL_TIME,
    platform?: string,
  ): Promise<ApiResponse<LeaderboardResponse>> {
    const url = new URL(`${this.baseUrl}/api/leaderboard`);
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("offset", offset.toString());
    url.searchParams.append("timeframe", timeframe);

    if (platform) {
      url.searchParams.append("platform", platform);
    }

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.error || `Error ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get account activity
   * @param signerId - NEAR account ID
   * @param platform - Platform name for filtering
   * @returns Promise resolving to the account activity data
   */
  async getAccountActivity(
    signerId: string,
    platform?: string,
  ): Promise<ApiResponse<AccountActivityResponse>> {
    const url = new URL(`${this.baseUrl}/api/activity/${signerId}`);

    if (platform) {
      url.searchParams.append("platform", platform);
    }

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.error || `Error ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`Error fetching account activity for ${signerId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get account posts
   * @param signerId - NEAR account ID
   * @param platform - Platform name for filtering
   * @param limit - Maximum number of posts to return
   * @param offset - Number of posts to skip
   * @returns Promise resolving to the account posts data
   */
  async getAccountPosts(
    signerId: string,
    platform?: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<ApiResponse<AccountPostsResponse>> {
    const url = new URL(`${this.baseUrl}/api/activity/${signerId}/posts`);
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("offset", offset.toString());

    if (platform) {
      url.searchParams.append("platform", platform);
    }

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.error || `Error ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`Error fetching posts for ${signerId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Create and export a singleton instance of the API client
export const apiClient = new CrosspostApiClient();
