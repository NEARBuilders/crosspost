import { useContext, useEffect } from 'react';
import { NearContext } from '../wallets/near';
import { useXStore } from '../store/twitter-store';
import { useNearSocialStore } from '../store/near-social-store';
import { PenSquare, Wallet } from 'lucide-react';
import { XButton } from '../components/connect-to-twitter';
import { PostForm } from '../components/compose-post';

export default function Home() {
  const { wallet, signedAccountId } = useContext(NearContext);
  const isConnected = useXStore((state) => state.isConnected);
  const setWallet = useNearSocialStore((state) => state.setWallet);

  useEffect(() => {
    if (wallet && signedAccountId) {
      setWallet(wallet);
    }
  }, [wallet, signedAccountId, setWallet]);

  const handleSignIn = () => {
    wallet?.signIn();
  };

  const handleSignOut = () => {
    wallet?.signOut();
  };

  return (
    <div className="min-h-screen p-8 relative bg-gray-100">
      <div className="blob"></div>
      <div className="mx-auto min-h-[790px] max-w-4xl border-2 border-gray-800 bg-white shadow-[4px_4px_0_rgba(0,0,0,1)]">
        <header className="border-b-2 border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PenSquare size={24} />
              <h1 className="text-2xl font-bold">crosspost.near</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={signedAccountId ? handleSignOut : handleSignIn}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-800 hover:bg-gray-100 shadow-[2px_2px_0_rgba(0,0,0,1)]"
              >
                <Wallet size={18} />
                {signedAccountId ? 'Disconnect NEAR' : 'Connect NEAR'}
              </button>
              {signedAccountId && <XButton />}
            </div>
          </div>
          {signedAccountId && (
            <p className="mt-2 text-sm text-gray-600">
              Connected as: {signedAccountId}
            </p>
          )}
        </header>

        <main className="p-6">
          {!signedAccountId ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">
                Connect your NEAR wallet to start posting
              </p>
            </div>
          ) : !isConnected ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">
                Connect X to start posting
              </p>
            </div>
          ) : (
            <PostForm />
          )}
        </main>
      </div>
    </div>
  );
}
