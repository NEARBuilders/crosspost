import "@near-wallet-selector/modal-ui/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import { NearWalletProvider } from "./components/providers/NearWalletProvider";
import "./index.css";
import { routeTree } from "./routeTree.gen";

// Create a new QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Create the router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  context: {
    queryClient,
    auth: { userId: "guest" }, // Default to guest, will be updated when user connects
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Main App component
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NearWalletProvider>
        <RouterProvider router={router} />
      </NearWalletProvider>
    </QueryClientProvider>
  );
}
