import { useCallback, useEffect } from "react";
import { useTwitterConnection } from "../store/twitter-store";
import { Twitter } from "lucide-react";
import { Button } from "./ui/button";

export function ConnectToTwitterButton() {
  const { isConnected, isConnecting, connect, disconnect, checkConnection } =
    useTwitterConnection();

  useEffect(() => {
    checkConnection();
  }, []); // Check connection when button loads

  const handleClick = useCallback(() => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  }, [isConnected, connect, disconnect]);

  return (
    <Button onClick={handleClick} disabled={true}>
      <Twitter size={18} />
      {isConnecting
        ? "Connecting..."
        : isConnected
          ? "Disconnect Twitter"
          : "Connect Twitter"}
    </Button>
  );
}
