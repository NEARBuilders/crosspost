import { useEffect, useState } from "react";
import Image from "next/image";
import { getProfile, getImageUrl } from "@/lib/near-social";

const fallbackUrl =
  "https://ipfs.near.social/ipfs/bafkreibmiy4ozblcgv3fm3gc6q62s55em33vconbavfd2ekkuliznaq3zm";

export const Avatar = ({ url, accountId, size = 48 }) => {
  const [profileUrl, setProfileUrl] = useState(url);
  const [profileName, setProfileName] = useState(accountId);

  useEffect(() => {
    if (!url && accountId) {
      getProfile(accountId)
        .then((profile) => {
          const imageUrl = getImageUrl(profile?.image);
          if (imageUrl) {
            setProfileUrl(imageUrl);
          }
          if (profile?.name) {
            setProfileName(profile.name);
          }
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
        });
    }
  }, [url, accountId]);

  return (
    <img
      src={profileUrl ?? fallbackUrl}
      alt={profileName}
      width={size}
      height={size}
      className="rounded-full object-cover base-component"
    />
  );
};
