import type { Node } from "reactflow";

// Generate unique node ID
const generateNodeId = (): string => {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Creates a template node
export const createTemplateNode = (
  position: { x: number; y: number },
  additionalData?: Record<string, any>
): Node => {
  return {
    id: generateNodeId(),
    type: "templateNode",
    position,
    data: {
      label: "Template",
      ...additionalData,
    },
  };
};

