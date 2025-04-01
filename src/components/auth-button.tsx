import { Button, ButtonProps } from "@/components/ui/button";
import { useNearAuth } from "@/store/near-auth-store";
import { Shield } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { AuthModal } from "./auth-modal";

interface AuthButtonProps extends ButtonProps {
  children?: React.ReactNode;
}

export function AuthButton({
  children,
  ...props
}: AuthButtonProps): React.ReactElement {
  const { isAuthorized } = useNearAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = () => {
    if (!isAuthorized) {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <Button onClick={handleClick} {...props}>
        <Shield size={18} className="mr-2" />
        {children || (isAuthorized ? "Authorized" : "Authorize App")}
      </Button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
