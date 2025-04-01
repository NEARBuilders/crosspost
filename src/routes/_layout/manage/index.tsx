import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { Button } from "../../../components/ui/button";
import { ConnectionCallback } from "../../../components/connection-callback";
import { NearAccountItem } from "../../../components/near-account-item";
import { PlatformAccountList } from "../../../components/platform-account-list";
import { SUPPORTED_PLATFORMS } from "../../../config";
import { requireAuthorization } from "../../../lib/auth/route-guards";
import {
  useConnectedAccounts,
  useNearAccount,
  usePlatformAccountsStore,
} from "../../../store/platform-accounts-store";

export const Route = createFileRoute("/_layout/manage/")({
  beforeLoad: () => {
    // Check if user is authorized before loading the route
    requireAuthorization();
  },
  component: ManageAccountsPage,
});

function ManageAccountsPage() {
  const navigate = useNavigate();
  const { data: accounts = [], isLoading } = useConnectedAccounts();
  const { data: nearAccount, isLoading: isLoadingNearAccount } =
    useNearAccount();
  const { selectedAccountIds } = usePlatformAccountsStore();

  // Handle continue to editor
  const handleContinue = () => {
    navigate({ to: "/editor" });
  };

  return (
    <>
      <ConnectionCallback />
      <div className="w-full max-w-2xl mx-auto">
        <div className="border-b pb-4 mb-6">
          <div className="flex items-center mb-4">
            <Button
              size="sm"
              className="mr-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={16} className="mr-1" />
              Back
            </Button>
          </div>
          <h1 className="text-2xl font-bold">Manage Social Accounts</h1>
          <p className="text-gray-500">
            Connect and manage your social media accounts for crossposting
          </p>
        </div>

        <div className="space-y-6">
          {/* NEAR Account Section */}
          <div className="space-y-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-xl font-semibold">Near Social Account</h2>
            </div>

            {isLoadingNearAccount ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin text-gray-400">⟳</div>
              </div>
            ) : nearAccount ? (
              <div className="space-y-4 w-full">
                <NearAccountItem account={nearAccount} />
              </div>
            ) : (
              <div className="rounded-md border-2 border-dashed border-gray-200 p-4 sm:p-8 text-center">
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No NEAR account connected
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Please sign in with your NEAR wallet to use NEAR Social
                </p>
              </div>
            )}
          </div>

          {/* Other Platform Accounts */}
          {SUPPORTED_PLATFORMS.map((platform) => (
            <PlatformAccountList
              key={platform}
              platform={platform}
              accounts={accounts}
              selectedAccountIds={selectedAccountIds}
              isLoading={isLoading}
            />
          ))}

          <div className="flex justify-center sm:justify-end pt-4 border-t">
            <Button
              onClick={handleContinue}
              disabled={selectedAccountIds.length === 0}
              className="gap-2 w-full sm:w-auto"
            >
              Continue to Editor
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
