import { AIVisibilityNode } from "./ai-visibility-node";
import { aiVisibilityNodeMetadata } from "./ai-visibility-metadata";
import { AIVisibilityNodeProcessor } from "./ai-visibility-processor";

export const aiVisibilityNode = {
  component: AIVisibilityNode,
  metadata: aiVisibilityNodeMetadata,
  processor: new AIVisibilityNodeProcessor()
};
