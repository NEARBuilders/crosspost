import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Twitter } from "lucide-react";
import { SupportedPlatform } from "../config";

import { PlatformAccount } from "../lib/api-types";

interface ProfileCardProps {
  account: PlatformAccount;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ProfileCard({
  account,
  className = "",
  size = "md",
}: ProfileCardProps) {
  const { platform } = account;
  const username = account.profile?.username || account.username;
  const profileImageUrl = account.profile?.profileImageUrl;
  // Size classes for different components
  const sizeClasses = {
    sm: {
      container: "gap-2",
      avatar: "h-6 w-6",
      username: "text-sm",
      platform: "text-xs",
    },
    md: {
      container: "gap-3",
      avatar: "h-8 w-8",
      username: "text-base",
      platform: "text-xs",
    },
    lg: {
      container: "gap-4",
      avatar: "h-10 w-10",
      username: "text-lg",
      platform: "text-sm",
    },
  };

  return (
    <div
      className={`flex items-center ${sizeClasses[size].container} ${className}`}
    >
      <Avatar className={sizeClasses[size].avatar}>
        {profileImageUrl ? (
          <AvatarImage src={profileImageUrl} alt={username} />
        ) : (
          <AvatarFallback className="bg-gray-200">
            {platform === "Twitter" && (
              <Twitter
                size={size === "sm" ? 14 : size === "md" ? 18 : 22}
                className="text-gray-400"
              />
            )}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="flex flex-col">
        <span className={`font-medium ${sizeClasses[size].username}`}>
          @{username}
        </span>
        <span className={`text-gray-500 ${sizeClasses[size].platform}`}>
          {platform}
        </span>
      </div>
    </div>
  );
}
