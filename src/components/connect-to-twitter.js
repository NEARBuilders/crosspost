import { Twitter } from "lucide-react";
import { useCallback } from "react";
import { useTwitterConnection } from "../store/twitter-store";
import { Button } from "./ui/button";

export function ConnectToTwitterButton() {
  const { isConnected, isConnecting, connect, disconnect } =
    useTwitterConnection();

  const handleClick = useCallback(() => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  }, [isConnected, connect, disconnect]);

  return (
    <Button onClick={handleClick} disabled={false}>
      <Twitter size={18} />
      {isConnecting
        ? "Connecting..."
        : isConnected
          ? "Disconnect Twitter"
          : "Connect Twitter"}
    </Button>
  );
}
