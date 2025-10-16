import { SearchNode } from "./search-node";
import { searchNodeMetadata } from "./search-metadata";
import { SearchNodeProcessor } from "./search-processor";

export const searchNode = {
  component: SearchNode,
  metadata: searchNodeMetadata,
  processor: new SearchNodeProcessor()
};
