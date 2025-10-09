"use client";

import { memo, type ReactNode } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { LucideIcon } from "lucide-react";
import { NodeLoadingIndicator } from "./node-loading-indicator";
import { BaseNodeData } from "./node-types";

// Node color themes
const NODE_COLORS = {
  blue: "border-blue-500 dark:border-blue-400 bg-blue-500",
  green: "border-green-500 dark:border-green-400 bg-green-500",
  purple: "border-purple-500 dark:border-purple-400 bg-purple-500",
  orange: "border-orange-500 dark:border-orange-400 bg-orange-500",
  red: "border-red-500 dark:border-red-400 bg-red-500",
} as const;

// Handle configuration
interface HandleConfig {
  type: "source" | "target";
  position: Position;
  id: string;
}

// Base node configuration
export interface BaseNodeConfig {
  icon: LucideIcon;
  color?: keyof typeof NODE_COLORS;
  handles?: HandleConfig[];
  width?: string;
  loadingMessage?: string;
}

interface BaseNodeContentData extends BaseNodeData {
  isLoading?: boolean;
  error?: string | null;
}

interface BaseNodeComponentProps<T extends BaseNodeContentData = BaseNodeContentData> {
  data: T;
  isConnectable: boolean;
  config: BaseNodeConfig;
  children?: ReactNode;
}

export const BaseNodeComponent = memo(<T extends BaseNodeContentData>({ 
  data, 
  isConnectable, 
  config,
  children 
}: BaseNodeComponentProps<T>) => {
  const Icon = config.icon;
  const color = config.color || "blue";
  const borderColor = NODE_COLORS[color].split(" ")[0];
  const bgColor = NODE_COLORS[color].split(" ")[2];
  const width = config.width || "min-w-[200px]";
  const loadingMessage = config.loadingMessage || "Processing...";

  const defaultHandles: HandleConfig[] = [
    { type: "target", position: Position.Left, id: "input" },
    { type: "source", position: Position.Right, id: "output" },
  ];

  const handles = config.handles || defaultHandles;

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 ${borderColor} rounded-md shadow-md ${width}`}>
      <div className={`${bgColor} text-white px-3 py-2 flex items-center gap-2`}>
        <Icon className="w-4 h-4" />
        <div className="text-sm font-medium truncate">{data.label}</div>
      </div>

      <NodeLoadingIndicator
        isLoading={data.isLoading || false}
        message={loadingMessage}
      />

      {!data.isLoading && data.error && (
        <div className="p-3 text-xs text-red-500 break-words">
          Error: {data.error}
        </div>
      )}

      {!data.isLoading && !data.error && children}

      {handles.map((handle) => (
        <Handle
          key={`${handle.type}-${handle.id}`}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          style={{ background: "#555", width: 8, height: 8 }}
          isConnectable={isConnectable}
        />
      ))}
    </div>
  );
});

BaseNodeComponent.displayName = "BaseNodeComponent";

// Helper function to create a node with minimal boilerplate
export function createNode<T extends BaseNodeContentData>(
  config: BaseNodeConfig,
  renderContent: (data: T, nodeProps: NodeProps<T>) => ReactNode
) {
  const NodeComponent = memo(({ data, isConnectable, ...props }: NodeProps<T>) => {
    return (
      <BaseNodeComponent data={data} isConnectable={isConnectable} config={config}>
        {renderContent(data, { data, isConnectable, ...props } as NodeProps<T>)}
      </BaseNodeComponent>
    );
  });

  return NodeComponent;
}

