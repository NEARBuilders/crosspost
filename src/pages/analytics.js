import { useEffect, useState } from "react";
import Head from "next/head";
import { getAnalytics } from "@/lib/analytics";
import { WindowContainer } from "@/components/window-container";

export default function Analytics() {
  const [stats, setStats] = useState({
    visitors: 0,
    posts: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const analytics = await getAnalytics();
      setStats(analytics);
    };

    fetchStats();
    // Refresh stats every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>analytics | crosspost</title>
      </Head>
        <main className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Unique Visitors Card */}
            <div className="base-component p-4">
              <dt className="text-sm text-gray-500 dark:text-gray-400">
                Unique Visitors
              </dt>
              <dd className="mt-2 text-2xl">
                {stats.visitors}
              </dd>
            </div>

            {/* Total Posts Card */}
            <div className="base-component p-4">
              <dt className="text-sm text-gray-500 dark:text-gray-400">
                Total Posts
              </dt>
              <dd className="mt-2 text-2xl">
                {stats.posts}
              </dd>
            </div>
            {/* Connected Wallets Card */}
            <div className="base-component p-4">
              <dt className="text-sm text-gray-500 dark:text-gray-400">
                Connected Wallets
              </dt>
              <dd className="mt-2 text-2xl">
                {stats.wallets}
              </dd>
            </div>
          </div>
        </main>
    </>
  );
}
