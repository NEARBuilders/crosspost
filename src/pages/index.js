import { ConnectToNearButton } from "@/components/connext-to-near";
import { PenSquare } from "lucide-react";
import { useContext } from "react";
import { ComposePost, PostForm } from "../components/compose-post";
import {
  ConnectToTwitterButton
} from "../components/connect-to-twitter";
import { NearContext } from "../wallets/near";
import { useTwitterConnection } from "@/store/twitter-store";

export default function Home() {
  const { signedAccountId } = useContext(NearContext);

  const { isConnected, handle } = useTwitterConnection();

  return (
    <div className="min-h-screen p-8 relative bg-gray-100">
      <div className="blob"></div>
      <div className="mx-auto min-h-[790px] max-w-4xl border-2 border-gray-800 bg-white shadow-[4px_4px_0_rgba(0,0,0,1)]">

        {/* TOP BAR ( WINDOW CONTAINER ) */}
        <header className="border-b-2 border-gray-800 p-6">
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
            <div className="flex items-center gap-2">
              <PenSquare size={24} />
              <h1 className="text-2xl font-bold">crosspost.near</h1>
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <ConnectToNearButton />
              {signedAccountId && <ConnectToTwitterButton />}
            </div>
          </div>
          {signedAccountId && (
            <div className="mt-4 space-y-1 text-center sm:text-left">
              <p className="text-sm text-gray-600">
                Connected as: {signedAccountId}
              </p>
              {isConnected && handle && (
                <p className="text-sm text-gray-600">
                  Twitter Account: @{handle}
                </p>
              )}
            </div>
          )}
        </header>

        <main className="p-6">
          {/* MAIN CONTENT */}

          {!signedAccountId ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">
                Connect your NEAR wallet to start posting
              </p>
            </div>
          ) : !isConnected ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">
                Connect Twitter to start posting
              </p>
            </div>
          ) : (
            <ComposePost />
          )}
        </main>
      </div>
    </div>
  );
}
