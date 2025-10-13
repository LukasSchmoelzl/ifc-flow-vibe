// OPTIONAL: Only needed if your node should be AI-controllable
// TODO: Replace [name] with your node name in camelCase
// TODO: Define your LLM tools

import type { LLMTool } from "../../node-metadata";

export const [name]LLMTools: LLMTool[] = [
  {
    name: "[tool_name]",
    description: "Describe what this tool does. Be specific and concise.",
    input_schema: {
      type: "object",
      properties: {
        param1: {
          type: "string",
          description: "Description of param1"
        },
        param2: {
          type: "number",
          description: "Description of param2"
        }
      },
      required: ["param1"] // Optional: list required parameters
    }
  },
  // Add more tools if needed
];

