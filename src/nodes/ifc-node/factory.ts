import type { Node } from "reactflow";

// Generate unique node ID
const generateNodeId = (): string => {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Creates an IFC node (drag & drop from sidebar or mobile placement)
export const createIfcNode = (
  position: { x: number; y: number },
  additionalData?: Record<string, any>
): Node => {
  return {
    id: generateNodeId(),
    type: "ifcNode",
    position,
    data: {
      label: "IFC File",
      ...additionalData,
    },
  };
};

// Creates an IFC node from a File (used by File > Open menu)
export const createIfcNodeFromFile = (
  position: { x: number; y: number },
  file: File,
  _legacyFileHandle?: any // Keep for backwards compatibility but ignore
): Node => {
  return createIfcNode(position, {
    file: file,
    fileName: file.name,
  });
};

