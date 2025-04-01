import { useConnectedAccounts } from "@/store/platform-accounts-store";
import { useEffect } from "react";
import { toast } from "../hooks/use-toast";

export function ConnectionCallback() {
  const { refetch } = useConnectedAccounts();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const userId = params.get("userId");

    // Clear the URL parameters regardless of the outcome
    window.history.replaceState({}, document.title, window.location.pathname);

    if (success === "true" && userId) {
      // Refresh the accounts list
      refetch();

      toast({
        title: "Connected Successful",
        description: "Select to begin posting with this account.",
        variant: "success",
      });
    } else if (success === "false") {
      // Show error message
      toast({
        title: "Connection Failed",
        description: "Failed to connect account. Please try again.",
        variant: "destructive",
      });
    }
  }, [refetch]);

  // This component doesn't render anything visible
  return null;
}
