import { useNearAuth } from "@/store/near-auth-store";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PenSquare, Trophy } from "lucide-react";
import * as React from "react";
import { ConnectToNearButton } from "./connect-to-near";
import { Button } from "./ui/button";

export const WindowControls: React.FC = () => {
  const { isAuthorized } = useNearAuth();

  return (
    <div className="relative border-b-2 border-gray-800 p-4 sm:p-6">
      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
        <Link to="/">
          <div className="flex items-center gap-2">
            <PenSquare size={24} />
            <h1 className="text-3xl font-bold">crosspost</h1>
          </div>
        </Link>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <ConnectToNearButton />
          {isAuthorized && (
            <>
              <Link to="/leaderboard">
                <Button className="flex items-center gap-2">
                  <Trophy size={16} />
                  Leaderboard
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface WindowContainerProps {
  children: React.ReactNode;
}

export function WindowContainer({ children }: WindowContainerProps) {
  return (
    <div className="min-h-screen p-1 sm:p-2 md:p-8 relative">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto min-h-[calc(100vh-0.5rem)] sm:min-h-[790px] w-full sm:max-w-4xl border-2 border-gray-800 bg-white shadow-[2px_2px_0_rgba(0,0,0,1)] sm:shadow-[4px_4px_0_rgba(0,0,0,1)]"
      >
        <WindowControls />
        <div className="p-2 sm:p-4 md:p-8">{children}</div>
      </motion.div>
    </div>
  );
}
