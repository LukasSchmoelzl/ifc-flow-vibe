import { InfoViewerNode } from "./node";
import { infoViewerNodeMetadata } from "./metadata";
import { InfoViewerNodeProcessor } from "./processor";

export const infoViewerNode = {
  component: InfoViewerNode,
  metadata: infoViewerNodeMetadata,
  processor: new InfoViewerNodeProcessor()
};
