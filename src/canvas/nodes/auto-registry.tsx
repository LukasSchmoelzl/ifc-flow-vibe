import type { NodeTypes } from "reactflow";
import type { Node } from "reactflow";
import type { NodeProcessor } from "../executor";
import type { NodeMetadata, NodeStatus } from "./node-metadata";

// Import all node components
import { TemplateNode } from "./nodes/template-node";
import { InfoNode } from "./nodes/info-node";
import { FileManagerNode } from "./nodes/file-manager-node";
import { SearchNode } from "./nodes/search-node";
import { ProjectInfoNode } from "./nodes/project-info-node";
import { UserSelectionNode } from "./nodes/user-selection-node";
import { AIVisibilityNode } from "./nodes/ai-visibility-node";

// Import all node metadata
import { templateNodeMetadata } from "./nodes/template-node/metadata";
import { infoNodeMetadata } from "./nodes/info-node/metadata";
import { fileManagerNodeMetadata } from "./nodes/file-manager-node/metadata";
import { searchNodeMetadata } from "./nodes/search-node/metadata";
import { projectInfoNodeMetadata } from "./nodes/project-info-node/metadata";
import { userSelectionNodeMetadata } from "./nodes/user-selection-node/metadata";
import { aiVisibilityNodeMetadata } from "./nodes/ai-visibility-node/metadata";

// Registry of all nodes with their metadata
const NODE_METADATA_MAP: Record<string, NodeMetadata> = {
  templateNode: templateNodeMetadata,
  infoNode: infoNodeMetadata,
  fileManagerNode: fileManagerNodeMetadata,
  searchNode: searchNodeMetadata,
  projectInfoNode: projectInfoNodeMetadata,
  userSelectionNode: userSelectionNodeMetadata,
  aiVisibilityNode: aiVisibilityNodeMetadata,
};

// React Flow node types (for rendering)
export const nodeTypes: NodeTypes = {
  templateNode: TemplateNode,
  infoNode: InfoNode,
  fileManagerNode: FileManagerNode,
  searchNode: SearchNode,
  projectInfoNode: ProjectInfoNode,
  userSelectionNode: UserSelectionNode,
  aiVisibilityNode: AIVisibilityNode,
} as const;

// Node processors (for workflow execution)
export const NODE_PROCESSORS: Record<string, NodeProcessor> = Object.entries(NODE_METADATA_MAP).reduce(
  (acc, [type, metadata]) => {
    acc[type] = metadata.processor;
    return acc;
  },
  {} as Record<string, NodeProcessor>
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
  const metadata = NODE_METADATA_MAP[type];
  if (!metadata) {
    throw new Error(`No node metadata found for type: ${type}`);
  }

  return {
    id: generateNodeId(),
    type: metadata.type,
    position,
    data: {
      ...metadata.defaultData,
      ...additionalData,
    },
  };
};

// Get all nodes for toolbar/sidebar display
export const getAllNodes = (): Array<{
  id: string;
  label: string;
  icon: React.ReactElement;
  status: NodeStatus;
}> => {
  return Object.entries(NODE_METADATA_MAP).map(([id, metadata]) => {
    const IconComponent = metadata.icon;
    return {
      id,
      label: metadata.label,
      icon: <IconComponent className="h-4 w-4 mr-2" />,
      status: metadata.status,
    };
  });
};

// Get node label by type
export const getNodeLabel = (nodeType: string): string => {
  const metadata = NODE_METADATA_MAP[nodeType];
  if (!metadata) {
    throw new Error(`No node metadata found for type: ${nodeType}`);
  }
  return metadata.label;
};

// Special factory for File Manager nodes from File menu
export const createIfcNodeFromFile = (
  position: { x: number; y: number },
  file: File,
  _legacyFileHandle?: any
): Node => {
  return createNode("fileManagerNode", position, {
    file: file,
    fileName: file.name,
  });
};

// Export node metadata for external use
export { NODE_METADATA_MAP };

