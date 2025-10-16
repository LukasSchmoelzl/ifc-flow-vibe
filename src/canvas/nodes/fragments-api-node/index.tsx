import { fragmentsApiNode } from "./fragments-api-node";
import { fragmentsApiNodeMetadata } from "./fragments-api-metadata";
import { fragmentsApiNodeProcessor } from "./fragments-api-processor";

export const fragmentsApiNode = {
  component: fragmentsApiNode,
  metadata: fragmentsApiNodeMetadata,
  processor: new fragmentsApiNodeProcessor()
};
