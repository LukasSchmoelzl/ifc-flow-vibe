"use client";

import React from "react";

interface NodeCardProps {
  selected?: boolean;
  isDragging?: boolean;
  children: React.ReactNode;
  className?: string;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDoubleClick?: () => void;
}

export const NodeCard = React.forwardRef<HTMLDivElement, NodeCardProps>(
  ({ selected, isDragging, children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          minWidth: "280px",
          maxWidth: "400px",
          background: "linear-gradient(135deg, rgba(79, 70, 229, 0.3), rgba(124, 58, 237, 0.3)), rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: selected 
            ? "2px solid rgba(147, 51, 234, 0.9)" 
            : isDragging
            ? "2px solid rgba(168, 85, 247, 0.9)"
            : "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "12px",
          boxShadow: selected
            ? "0 8px 32px rgba(147, 51, 234, 0.5), 0 0 60px rgba(147, 51, 234, 0.3)"
            : "0 8px 32px rgba(0, 0, 0, 0.2)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NodeCard.displayName = "NodeCard";

