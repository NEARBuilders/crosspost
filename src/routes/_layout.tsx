import { Outlet, createFileRoute } from "@tanstack/react-router";
import React from "react";
import { WindowContainer } from "../components/window-container";

export const Route = createFileRoute("/_layout")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <WindowContainer>
      <Outlet />
    </WindowContainer>
  );
}
