import { FileManagerNode } from "./file-manager-node";
import { fileManagerNodeMetadata } from "./file-manager-metadata";
import { FileManagerNodeProcessor } from "./file-manager-processor";

export const fileManagerNode = {
  component: FileManagerNode,
  metadata: fileManagerNodeMetadata,
  processor: new FileManagerNodeProcessor()
};
