"use client";

import React from "react";
import type { Position } from "reactflow";
import { Handle } from "reactflow";

// Glassmorphism styles constants
const NODE_CARD_STYLES = {
  minWidth: "280px",
  maxWidth: "400px",
  background: "linear-gradient(135deg, rgba(79, 70, 229, 0.3), rgba(124, 58, 237, 0.3)), rgba(255, 255, 255, 0.15)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: "12px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

const getNodeCardStyles = (selected: boolean, isDragging?: boolean) => ({
  ...NODE_CARD_STYLES,
  border: selected 
    ? "2px solid rgba(147, 51, 234, 0.9)" 
    : isDragging
    ? "2px solid rgba(168, 85, 247, 0.9)"
    : "1px solid rgba(255, 255, 255, 0.3)",
  boxShadow: selected
    ? "0 8px 32px rgba(147, 51, 234, 0.5), 0 0 60px rgba(147, 51, 234, 0.3)"
    : "0 8px 32px rgba(0, 0, 0, 0.2)",
});

interface HandleConfig {
  id?: string;
  position: Position;
  style?: React.CSSProperties;
}

import type { HandleInfo } from "./types";

interface BaseNodeLayoutProps {
  selected: boolean;
  title: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  children: React.ReactNode;
  inputHandles?: HandleConfig[];
  outputHandles?: HandleConfig[];
  inputInfo?: HandleInfo[];
  outputInfo?: HandleInfo[];
  dragHandlers?: {
    dropRef?: React.RefObject<HTMLDivElement>;
    isDraggingOver?: boolean;
    onDragOver?: (e: React.DragEvent) => void;
    onDragLeave?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
    onDoubleClick?: () => void;
  };
}

export const BaseNodeLayout: React.FC<BaseNodeLayoutProps> = ({
  selected,
  title,
  icon,
  isLoading,
  error,
  children,
  inputHandles = [],
  outputHandles = [],
  inputInfo = [],
  outputInfo = [],
  dragHandlers,
}) => {
  return (
    <div
      ref={dragHandlers?.dropRef}
      style={getNodeCardStyles(selected, dragHandlers?.isDraggingOver)}
      onDragOver={dragHandlers?.onDragOver}
      onDragLeave={dragHandlers?.onDragLeave}
      onDrop={dragHandlers?.onDrop}
      onDoubleClick={dragHandlers?.onDoubleClick}
    >
      {inputHandles.map((handle, idx) => (
        <Handle
          key={handle.id || `input-${idx}`}
          type="target"
          position={handle.position}
          id={handle.id}
          style={handle.style}
        />
      ))}

      {/* Header - Volle Breite */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center gap-2 font-semibold text-white">
          {icon && <span className="text-purple-300">{icon}</span>}
          <span>{title}</span>
        </div>
      </div>

      <div className="flex h-full">
        {/* Inputs - Links */}
        {inputInfo && inputInfo.length > 0 && (
          <div className="w-1/3 p-3 border-r border-white/20">
            <div className="text-xs font-medium text-white/80 mb-2">Inputs</div>
            <div className="space-y-1">
              {inputInfo.map((input, idx) => (
                <div key={idx} className="text-xs text-white/60">
                  <div className="font-medium">{input.label}</div>
                  {input.apiCall && (
                    <div className="text-white/50 text-[10px]">[{input.apiCall}]</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Beschreibung - Mitte */}
        <div className="flex-1 p-3">
          {isLoading && (
            <div className="text-xs text-white/70">Loading...</div>
          )}

          {!isLoading && error && (
            <div className="text-xs text-red-300">Error: {error}</div>
          )}

          {!isLoading && !error && children}
        </div>

        {/* Outputs - Rechts */}
        {outputInfo && outputInfo.length > 0 && (
          <div className="w-1/3 p-3 border-l border-white/20">
            <div className="text-xs font-medium text-white/80 mb-2">Outputs</div>
            <div className="space-y-1">
              {outputInfo.map((output, idx) => (
                <div key={idx} className="text-xs text-white/60">
                  <div className="font-medium">{output.label}</div>
                  {output.apiCall && (
                    <div className="text-white/50 text-[10px]">[{output.apiCall}]</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {outputHandles.map((handle, idx) => (
        <Handle
          key={handle.id || `output-${idx}`}
          type="source"
          position={handle.position}
          id={handle.id}
          style={handle.style}
        />
      ))}
    </div>
  );
};
