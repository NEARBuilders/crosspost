import { getImageUrl, getProfile } from "@/lib/near-social";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Avatar } from "./avatar";

export function ProfileHighlight({ accountId, tooltipContent, size = 64 }) {
  const router = useRouter();
  const [profileUrl, setProfileUrl] = useState(null);

  // Preload profile data
  useEffect(() => {
    if (accountId) {
      getProfile(accountId)
        .then((profile) => {
          const imageUrl = getImageUrl(profile?.image);
          if (imageUrl) {
            setProfileUrl(imageUrl);
          }
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
        });
    }
  }, [accountId]);

  return (
    <div className={"relative"}>
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger asChild>
            <div
              className="cursor-pointer flex-shrink-0"
              onClick={() => router.push(`/profile/${accountId}`)}
            >
              <Avatar
                accountId={accountId}
                size={size}
                url={profileUrl}
                className="hover:opacity-80 transition-opacity"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="start"
            className="font-bold px-3 py-2 rounded-xl base-component animate-bounce"
          >
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
