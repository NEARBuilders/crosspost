import { redirect } from "@tanstack/react-router";
import { useNearAuth } from "@/store/near-auth-store";

/**
 * Route guard to check if user is authorized
 * This function can be used in route loaders to protect routes
 * that require authorization
 */
export function requireAuthorization() {
  const { isAuthorized } = useNearAuth.getState();
  // If not authorized, redirect to home with auth required parameter
  if (!isAuthorized) {
    throw redirect({
      to: "/",
    });
  }

  return true;
}
