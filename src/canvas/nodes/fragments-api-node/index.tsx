import { fragmentsApiNode as FragmentsApiNodeComponent } from "./fragments-api-node";
import { fragmentsApiNodeMetadata } from "./fragments-api-metadata";
import { fragmentsApiNodeProcessor } from "./fragments-api-processor";

export const fragmentsApiNode = {
  component: FragmentsApiNodeComponent,
  metadata: fragmentsApiNodeMetadata,
  processor: new fragmentsApiNodeProcessor()
};
