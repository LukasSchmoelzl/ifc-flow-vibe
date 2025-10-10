// Node factory registry - maps node types to their factory functions
import type { Node } from "reactflow";
import { createIfcNode } from "./ifc-node/factory";
import { createTemplateNode } from "./template-node/factory";

type NodeFactory = (position: { x: number; y: number }, additionalData?: Record<string, any>) => Node;

const NODE_FACTORIES: Record<string, NodeFactory> = {
  ifcNode: createIfcNode,
  templateNode: createTemplateNode,
} as const;

// Generic node creation using factory registry
export const createNode = (
  type: string,
  position: { x: number; y: number },
  additionalData?: Record<string, any>
): Node => {
  const factory = NODE_FACTORIES[type];
  if (!factory) {
    throw new Error(`No factory found for node type: ${type}`);
  }
  return factory(position, additionalData);
};

