import type { NodeMetadata } from "../../node-metadata";
import { Search } from "lucide-react";
import { SearchNodeProcessor } from "./search-processor";
import { searchLLMTools } from "./llm-tools";

export const searchNodeMetadata: NodeMetadata = {
  type: "searchNode",
  label: "Search",
  icon: Search,
  status: "working",
  processor: new SearchNodeProcessor(),
  defaultData: {
    label: "Search",
  },
  llmTools: searchLLMTools,
};

