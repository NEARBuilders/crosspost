import React from "react";
import { PlatformAccount } from "../lib/api-types";
import { ProfileCard } from "./profile-card";
import { Button } from "./ui/button";
import { usePlatformAccountsStore } from "../store/platform-accounts-store";

interface NearAccountItemProps {
  account: PlatformAccount;
}

export function NearAccountItem({ account }: NearAccountItemProps) {
  const { selectedAccountIds, selectAccount, unselectAccount } =
    usePlatformAccountsStore();
  const isSelected = selectedAccountIds.includes(account.userId);

  const handleSelect = () => {
    if (isSelected) {
      unselectAccount(account.userId);
    } else {
      selectAccount(account.userId);
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border-2 p-3 sm:p-4 gap-3 ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
      }`}
    >
      <div className="flex items-center space-x-4">
        <ProfileCard account={account} size="md" />
      </div>

      <div className="flex items-center space-x-2 ml-0 sm:ml-auto">
        <Button size="sm" onClick={handleSelect}>
          {isSelected ? "Selected" : "Select"}
        </Button>
      </div>
    </div>
  );
}
