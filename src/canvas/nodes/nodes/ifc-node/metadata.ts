import { FileUp } from "lucide-react";
import { IfcNodeProcessor } from "./ifc-loader";
import type { NodeMetadata } from "../../node-metadata";

export const ifcNodeMetadata: NodeMetadata = {
  type: "ifcNode",
  label: "IFC File",
  icon: FileUp,
  status: "working",
  processor: new IfcNodeProcessor(),
  defaultData: {
    label: "IFC File",
  },
};

