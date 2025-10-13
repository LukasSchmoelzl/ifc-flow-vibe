"use client";

import React from "react";

interface SearchNodeUIProps {
  data: {
    searchResults?: Array<{ name: string; expressID: number; type: string }>;
    count?: number;
    query?: string;
    types?: string[];
  };
}

export const SearchNodeUI: React.FC<SearchNodeUIProps> = ({ data }) => {
  const { searchResults, count, query, types } = data;

  return (
    <div className="text-xs space-y-2">
      {query && (
        <div>
          <span className="font-medium">Query: </span>
          <span>{query}</span>
        </div>
      )}
      
      {types && types.length > 0 && (
        <div>
          <span className="font-medium">Types: </span>
          <span>{types.join(", ")}</span>
        </div>
      )}

      {count !== undefined && (
        <div>
          <span className="font-medium">Results: </span>
          <span>{count} entities</span>
        </div>
      )}

      {searchResults && searchResults.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-1">
          {searchResults.slice(0, 10).map((result, idx) => (
            <div key={idx} className="p-1 bg-muted/50 rounded text-xs">
              <div className="font-medium">{result.name}</div>
              <div className="text-muted-foreground">
                {result.type} (ID: {result.expressID})
              </div>
            </div>
          ))}
          {searchResults.length > 10 && (
            <div className="text-muted-foreground italic">
              ... and {searchResults.length - 10} more
            </div>
          )}
        </div>
      )}
    </div>
  );
};

