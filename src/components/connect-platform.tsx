import React from "react";
import { SupportedPlatform } from "../config";
import { Button } from "./ui/button";
import { Twitter } from "lucide-react";
import { useConnectAccount } from "../store/platform-accounts-store";
import { toast } from "../hooks/use-toast";

interface ConnectPlatformProps {
  platform: SupportedPlatform;
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
}

export function ConnectPlatform({
  platform,
  className = "",
  variant = "default",
  size = "sm",
  showIcon = true,
}: ConnectPlatformProps) {
  const connectAccount = useConnectAccount();

  const handleConnect = async () => {
    try {
      // Use the current URL as the return URL
      const returnUrl = `${window.location.origin}/manage`;
      await connectAccount.mutateAsync({
        platform: platform as any,
        returnUrl,
      });
    } catch (error) {
      toast({
        title: "Connection Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to connect ${platform} account`,
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={connectAccount.isPending}
      size={size}
      variant={variant}
      className={`gap-2 ${className}`}
    >
      {showIcon && (
        <>
          {platform === "Twitter" ? (
            <Twitter size={size === "sm" ? 18 : 24} />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={size === "sm" ? 16 : 20}
              height={size === "sm" ? 16 : 20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          )}
        </>
      )}
      {connectAccount.isPending
        ? "Connecting..."
        : `Connect ${platform} Account`}
    </Button>
  );
}
