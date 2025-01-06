import { useContext } from "react";
import { useXStore } from "../store/xStore";
import { NearContext } from "../wallets/near";
import { PostForm } from "./PostForm";

export default function TwitterConnect() {
  const { signedAccountId } = useContext(NearContext);
  const { isConnected } = useXStore((state) => ({
    isConnected: state.isConnected,
  }));

  if (!signedAccountId) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">
          Please connect your NEAR wallet first
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isConnected && <PostForm />}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
