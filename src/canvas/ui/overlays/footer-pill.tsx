"use client";

import { useState } from "react";
import CoffeeSupport from "@/src/shared/components/coffee-support";
import { useCanvasStore } from "../../state/store";

export function FooterPill() {
  const [isHovered, setIsHovered] = useState(false);
  const currentWorkflow = useCanvasStore(state => state.currentWorkflow);

  return (
    <div
      className="bg-card/90 backdrop-blur rounded-full px-3 py-1.5 shadow-sm border cursor-pointer transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 transition-all duration-300 justify-start">
        {!isHovered && (
          <>
            <div className="text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground/80">
                {currentWorkflow ? currentWorkflow.name : "IFCflow"}
              </span>
              <span className="text-foreground/50 ml-2">v0.2.0</span>
            </div>
            <div className="border-l border-border/50 h-5"></div>
          </>
        )}
        <CoffeeSupport isHovered={isHovered} />
      </div>
    </div>
  );
}

