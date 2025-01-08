import { useTwitterConnection } from "@/store/twitter-store";
import { useContext } from "react";
import { ComposePost } from "../components/compose-post";
import { NearContext } from "../wallets/near";

export default function Home() {
  const { signedAccountId } = useContext(NearContext);

  const { isConnected, handle } = useTwitterConnection();

  return (
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
  );
}
