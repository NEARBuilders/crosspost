"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      delayDuration={100}
      className={cn(
        "z-50 overflow-hidden rounded-lg border-2 border-gray-800 bg-white px-3 py-1.5 text-sm text-gray-800 shadow-[2px_2px_0_rgba(0,0,0,1)]",
        className,
      )}
      {...props}
    />
  ),
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };

