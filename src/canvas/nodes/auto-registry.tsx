import type { NodeTypes } from "reactflow";
import type { Node } from "reactflow";
import type { NodeProcessor } from "@/src/canvas/executor";
import type { NodeMetadata } from "./types";

// Import all nodes (single import per node)
import { fileManagerNode } from "./file-manager-node";
import { searchNode } from "./search-node";
import { fragmentsApiNode } from "./fragments-api-node";
import { userSelectionNode } from "./user-selection-node";
import { aiVisibilityNode } from "./ai-visibility-node";
import { infoViewerNode } from "./info-viewer-node";

// Single registry for all node information
const NODE_REGISTRY = {
  fileManagerNode,
  searchNode,
  fragmentsApiNode,
  userSelectionNode,
  aiVisibilityNode,
  infoViewerNode,
} as const;

// React Flow node types (for rendering)
export const nodeTypes: NodeTypes = Object.fromEntries(
  Object.entries(NODE_REGISTRY).map(([key, { component }]) => [key, component])
) as NodeTypes;

// Node processors (for workflow execution)
export const NODE_PROCESSORS: Record<string, NodeProcessor> = Object.fromEntries(
  Object.entries(NODE_REGISTRY).map(([key, { metadata }]) => [key, metadata.processor])
);

// Generate unique node ID
export const generateNodeId = (): string => {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

// Node factory - creates a node instance
export const createNode = (
  type: string,
  position: { x: number; y: number },
  additionalData?: Record<string, any>
): Node => {
  const nodeInfo = NODE_REGISTRY[type as keyof typeof NODE_REGISTRY];
  if (!nodeInfo) {
    throw new Error(`No node found for type: ${type}`);
  }

  return {
    id: generateNodeId(),
    type,
    position,
    data: {
      isLoading: false,
      error: null,
      ...additionalData,
    },
  };
};

// Get all nodes for toolbar/sidebar display
export const getAllNodes = (): Array<{
  id: string;
  label: string;
  icon: React.ReactElement;
}> => {
  return Object.entries(NODE_REGISTRY).map(([id, { metadata }]) => {
    const IconComponent = metadata.icon;
    return {
      id,
      label: metadata.label,
      icon: <IconComponent className="h-4 w-4 mr-2" />,
    };
  });
};


// Special factory for File Manager nodes from File menu
export const createFileManagerNodeFromFile = (
  position: { x: number; y: number },
  file: File
): Node => {
  return createNode("fileManagerNode", position, {
    file: file,
    fileName: file.name,
  });
};

// Export node registry for external use
export { NODE_REGISTRY };

