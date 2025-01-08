import { useCallback, useEffect } from "react";
import { useTwitterConnection } from "../store/twitter-store";
import { Twitter } from "lucide-react";

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
    <button
      onClick={handleClick}
      disabled={isConnecting}
      className="flex items-center gap-2 px-4 py-2 border-2 border-gray-800 hover:bg-gray-100 shadow-[2px_2px_0_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Twitter size={18} />
      {isConnecting
        ? "Connecting..."
        : isConnected
          ? "Disconnect Twitter"
          : "Connect Twitter"}
    </button>
  );
}
