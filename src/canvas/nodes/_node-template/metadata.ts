// TODO: Replace [NAME] with your node name in PascalCase
// TODO: Replace [name] with your node name in camelCase
// TODO: Choose appropriate icon from lucide-react
// TODO: Add llmTools if your node should be AI-controllable

import type { NodeMetadata } from "../../node-metadata";
import { HelpCircle } from "lucide-react"; // TODO: Replace with appropriate icon
import { [NAME]NodeProcessor } from "./[name]-processor";
// import { [name]LLMTools } from "./llm-tools"; // Uncomment if using LLM tools

export const [name]NodeMetadata: NodeMetadata = {
  type: "[name]Node", // MUST match auto-registry naming: camelCase + "Node"
  label: "[DISPLAY_NAME]", // Display name in toolbar
  icon: HelpCircle, // Icon from lucide-react
  status: "working", // "working" | "wip" | "new"
  processor: new [NAME]NodeProcessor(),
  defaultData: {
    label: "[DISPLAY_NAME]",
    // Add default data fields here
  },
  // llmTools: [name]LLMTools, // Uncomment if using LLM tools
};

