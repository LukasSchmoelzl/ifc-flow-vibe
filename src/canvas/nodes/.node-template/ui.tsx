"use client";

// TODO: Replace [NAME] with your node name in PascalCase
// TODO: Add your data fields to the interface
// TODO: Implement your UI rendering logic

import React from "react";

interface [NAME]NodeUIProps {
  data: {
    output1?: string;
    output2?: number;
    error?: string;
    isLoading?: boolean;
    // TODO: Add your data fields here
  };
}

export const [NAME]NodeUI: React.FC<[NAME]NodeUIProps> = ({ data }) => {
  const { output1, output2, error, isLoading } = data;

  // Loading state
  if (isLoading) {
    return (
      <div className="text-xs text-muted-foreground">
        Processing...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-xs text-red-500">
        Error: {error}
      </div>
    );
  }

  // Empty state
  if (!output1 && output2 === undefined) {
    return (
      <div className="text-xs text-muted-foreground">
        No data available
      </div>
    );
  }

  // Data display
  return (
    <div className="text-xs space-y-2">
      {output1 && (
        <div>
          <span className="font-medium">Output 1: </span>
          <span>{output1}</span>
        </div>
      )}
      
      {output2 !== undefined && (
        <div>
          <span className="font-medium">Output 2: </span>
          <span>{output2}</span>
        </div>
      )}
    </div>
  );
};

