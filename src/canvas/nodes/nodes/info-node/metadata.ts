import { Info } from "lucide-react";
import { InfoNodeProcessor } from "./info-processor";
import type { NodeMetadata } from "../../node-metadata";

export const infoNodeMetadata: NodeMetadata = {
  type: "infoNode",
  label: "Info Display",
  icon: Info,
  status: "working",
  processor: new InfoNodeProcessor(),
  defaultData: {
    label: "Info",
    displayData: null,
  },
};

