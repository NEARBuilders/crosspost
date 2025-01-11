import { Twitter } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useTwitterConnection } from "../store/twitter-store";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";

export function ConnectToTwitterButton() {
  const { isConnected, isConnecting, connect, disconnect, handle, error } =
    useTwitterConnection();
  const { toast } = useToast();

  // // Check connection status on mount
  // useEffect(() => {
  //   checkConnection();
  // }, [checkConnection]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error, toast]);

  const handleClick = useCallback(() => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  }, [isConnected, connect, disconnect]);

  return (
    <Button onClick={handleClick}>
      <Twitter size={18} />
      {isConnecting
        ? "Connecting..."
        : isConnected
          ? `Disconnect @${handle}`
          : "Connect Twitter"}
    </Button>
  );
}
