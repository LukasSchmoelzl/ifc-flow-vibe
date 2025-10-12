import type { Node } from "reactflow";
import { FileUp, FileText, Info } from "lucide-react";

// Generate unique node ID
const generateNodeId = (): string => {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Node metadata with factory functions
export const NODE_REGISTRY = {
  ifcNode: {
    label: "IFC File",
    icon: <FileUp className="h-4 w-4 mr-2" />,
    status: "working" as const,
    factory: (position: { x: number; y: number }, additionalData?: Record<string, any>): Node => ({
      id: generateNodeId(),
      type: "ifcNode",
      position,
      data: {
        label: "IFC File",
        ...additionalData,
      },
    }),
  },
  templateNode: {
    label: "Template",
    icon: <FileText className="h-4 w-4 mr-2" />,
    status: "working" as const,
    factory: (position: { x: number; y: number }, additionalData?: Record<string, any>): Node => ({
      id: generateNodeId(),
      type: "templateNode",
      position,
      data: {
        label: "Template",
        ...additionalData,
      },
    }),
  },
  infoNode: {
    label: "Info Display",
    icon: <Info className="h-4 w-4 mr-2" />,
    status: "working" as const,
    factory: (position: { x: number; y: number }, additionalData?: Record<string, any>): Node => ({
      id: generateNodeId(),
      type: "infoNode",
      position,
      data: {
        label: "Info",
        displayData: null,
        ...additionalData,
      },
    }),
  },
} as const;

export type NodeType = keyof typeof NODE_REGISTRY;
export type NodeStatus = "working" | "wip" | "new";

// Get all nodes as flat array for toolbar
export const getAllNodes = () => {
  return Object.entries(NODE_REGISTRY).map(([id, meta]) => ({
    id,
    ...meta,
  }));
};

// Get node label by type
export const getNodeLabel = (nodeType: string): string => {
  const node = NODE_REGISTRY[nodeType as NodeType];
  if (!node) {
    throw new Error(`No node found for type: ${nodeType}`);
  }
  return node.label;
};

// Generic node creation using factory
export const createNode = (
  type: string,
  position: { x: number; y: number },
  additionalData?: Record<string, any>
): Node => {
  const node = NODE_REGISTRY[type as NodeType];
  if (!node) {
    throw new Error(`No factory found for node type: ${type}`);
  }
  return node.factory(position, additionalData);
};

// Creates an IFC node from a File (used by File > Open menu)
export const createIfcNodeFromFile = (
  position: { x: number; y: number },
  file: File,
  _legacyFileHandle?: any
): Node => {
  return createNode("ifcNode", position, {
    file: file,
    fileName: file.name,
  });
};
