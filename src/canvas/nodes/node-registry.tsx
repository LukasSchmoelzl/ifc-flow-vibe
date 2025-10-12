// Re-export everything from auto-registry
export {
  createNode,
  getAllNodes,
  getNodeLabel,
  createIfcNodeFromFile,
  NODE_METADATA_MAP,
} from "./auto-registry";

export type { NodeStatus } from "./node-metadata";
