import { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import React from "react";
import { Toaster } from "@/components/ui/toaster";

export const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : React.lazy(() =>
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

export const ReactQueryDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : React.lazy(() =>
        import("@tanstack/react-query-devtools").then((d) => ({
          default: d.ReactQueryDevtools,
        })),
      );

// Define the auth context interface
export interface AuthContext {
  userId: string;
}

export const Route = createRootRouteWithContext<{
  auth: AuthContext;
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  notFoundComponent: () => <>Not found</>,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
      <React.Suspense>
        <TanStackRouterDevtools position="bottom-left" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
      </React.Suspense>
    </>
  );
}
