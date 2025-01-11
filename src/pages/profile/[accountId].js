import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getProfile } from "../../lib/near-social";
import { ProfileView } from "../../components/social/profile";

export default function ProfilePage() {
  const router = useRouter();
  const { accountId } = router.query;
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) return;

    const fetchProfile = async () => {
      try {
        const data = await getProfile(accountId);
        setProfile(data);
      } catch (err) {
        setError(err.message);
        // Don't redirect on error, just show the error message
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [accountId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-gray-500 p-4 text-center">
        No profile found
      </div>
    );
  }

  return <ProfileView profile={profile} />;
}
