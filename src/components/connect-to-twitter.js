import { useCallback, useEffect } from 'react';
import { useXConnection } from '../store/xStore';
import { XIcon } from './icons/XIcon';

export function XButton() {
  const { isConnected, isConnecting, connect, disconnect, checkConnection } = useXConnection();
  
  useEffect(() => {
    checkConnection();
  }, []); // Check connection on mount

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
      <XIcon size={18} />
      {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect X' : 'Connect X'}
    </button>
  );
}
