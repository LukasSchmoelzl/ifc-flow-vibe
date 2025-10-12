import { FolderOpen } from "lucide-react";
import { FileManagerNodeProcessor } from "./file-loader";
import type { NodeMetadata } from "../../node-metadata";

export const fileManagerNodeMetadata: NodeMetadata = {
  type: "fileManagerNode",
  label: "File Manager",
  icon: FolderOpen,
  status: "working",
  processor: new FileManagerNodeProcessor(),
  defaultData: {
    label: "IFC Loader",
  },
};

