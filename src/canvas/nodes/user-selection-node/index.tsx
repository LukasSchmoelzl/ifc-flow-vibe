import { UserSelectionNode } from "./user-selection-node";
import { userSelectionNodeMetadata } from "./user-selection-metadata";
import { UserSelectionNodeProcessor } from "./user-selection-processor";

export const userSelectionNode = {
  component: UserSelectionNode,
  metadata: userSelectionNodeMetadata,
  processor: new UserSelectionNodeProcessor()
};
