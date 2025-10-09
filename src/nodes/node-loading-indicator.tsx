"use client";

import { Loader2 } from "lucide-react";

interface NodeLoadingIndicatorProps {
  isLoading: boolean;
  message: string;
}

export function NodeLoadingIndicator({ isLoading, message }: NodeLoadingIndicatorProps) {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="p-3 text-xs">
      <div className="flex items-start gap-2 text-blue-500">
        <Loader2 className="h-3 w-3 animate-spin flex-shrink-0 mt-0.5" />
        <span>{message}</span>
      </div>
    </div>
  );
}
