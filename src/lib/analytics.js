import posthog from "posthog-js";

// Only track events in production
const shouldTrack = () =>
  typeof window !== "undefined" && process.env.NODE_ENV === "production";

export const trackEvent = (eventName, properties = {}) => {
  if (shouldTrack()) {
    posthog?.capture(eventName, properties);
  }
};

export const trackPost = (signedAccountId, postCount = 1) => {
  trackEvent("save_post", {
    signedAccountId,
    postCount,
  });
};

export const trackWalletConnection = (signedAccountId) => {
  trackEvent("wallet_connect", {
    signedAccountId,
    timestamp: new Date().toISOString(),
  });
};

// Get analytics data
export const getAnalytics = async () => {
  if (!shouldTrack()) return { visitors: 0, posts: 0, wallets: 0 };

  try {
    // Get unique users from PostHog API
    const response = await fetch(
      `https://us.i.posthog.com/api/projects/${process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID}/persons/`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_KEY}`,
        },
      },
    );
    const data = await response.json();

    // Get event counts and unique wallets from PostHog API
    const [eventsResponse, walletsResponse] = await Promise.all([
      fetch(
        `https://us.i.posthog.com/api/projects/${process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID}/events/?event=save_post`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_KEY}`,
          },
        },
      ),
      fetch(
        `https://us.i.posthog.com/api/projects/${process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID}/events/?event=wallet_connect`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_KEY}`,
          },
        },
      ),
    ]);

    const [eventsData, walletsData] = await Promise.all([
      eventsResponse.json(),
      walletsResponse.json(),
    ]);

    // Sum up all postCount properties from save_post events
    const totalPosts = eventsData.results.reduce((sum, event) => {
      return sum + (event.properties?.postCount || 1);
    }, 0);

    // Get unique wallet IDs
    const uniqueWallets = new Set(
      walletsData.results
        .map((event) => event.properties?.signedAccountId)
        .filter(Boolean),
    ).size;

    return {
      visitors: data.count || 0,
      posts: totalPosts,
      wallets: uniqueWallets,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return { visitors: 0, posts: 0, wallets: 0 };
  }
};
