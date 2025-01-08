import { useTwitterConnection } from "@/store/twitter-store";
import { NearContext } from "@/wallets/near";
import { motion } from "framer-motion";
import { PenSquare } from "lucide-react";
import { useContext } from "react";
import { ConnectToNearButton } from "./connect-to-near";
import { ConnectToTwitterButton } from "./connect-to-twitter";

export const WindowControls = () => {
  // const [isOpen, setIsOpen] = useState(false);
  // const router = useRouter();
  // const { accountId, signOut } = useNearSocialStore();
  const { signedAccountId } = useContext(NearContext);
  const { isConnected, handle } = useTwitterConnection();

  // const menuItems = [
  //   { label: "Home", path: "/" },
  // ];

  return (
    <div className="relative border-b-2 border-gray-800 p-6">
      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
        <div className="flex items-center gap-2">
          <PenSquare size={24} />
          <h1 className="text-3xl font-bold">crosspost</h1>
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
            <p className="text-sm text-gray-600">Twitter Account: @{handle}</p>
          )}
        </div>
      )}
      {/* <div className="flex items-center justify-end">
        <div
          className="mx-4 my-3 h-4 w-4 cursor-pointer rounded-full bg-black transition-opacity hover:opacity-80"
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-4 top-8 z-50 w-48 border-2 border-gray-800 bg-white shadow-[2px_2px_0_rgba(0,0,0,1)]"
          >
            {menuItems.map((item) => (
              <button
                key={item.path}
                className="w-full px-4 py-2 text-left font-mono transition-colors hover:bg-gray-100"
                onClick={() => {
                  router.push(item.path);
                  setIsOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
            {accountId ? (
              <button
                key="logout"
                className="w-full px-4 py-2 text-left font-mono transition-colors hover:bg-gray-100"
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
              >
                Logout
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence> */}
    </div>
  );
};

export function WindowContainer({ children }) {
  return (
    <div className="min-h-screen p-2 sm:p-8 relative">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-1 sm:mx-auto min-h-[790px] max-w-4xl border-2 border-gray-800 bg-white shadow-[4px_4px_0_rgba(0,0,0,1)]"
      >
        <WindowControls />
        <div className="p-8">{children}</div>
      </motion.div>
    </div>
  );
}
