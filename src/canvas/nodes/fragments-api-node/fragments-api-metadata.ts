import type { NodeMetadata } from "../types";

export const fragmentsApiNodeMetadata: NodeMetadata = {
  label: "fragments API",
  icon: (() => {
    const { Database } = require("lucide-react");
    return Database;
  })(),
  processor: (() => {
    const { fragmentsApiNodeProcessor } = require("./fragments-api-processor");
    return new fragmentsApiNodeProcessor();
  })(),
  inputInfo: [
    { id: "model", label: "fragments Model" }
  ],
  outputInfo: [
    { id: "get_metadata", label: "Metadata", apiCall: "get_metadata" },
    { id: "get_structure", label: "Structure", apiCall: "get_structure" },
    { id: "get_statistics", label: "Statistics", apiCall: "get_statistics" }
  ],
  llmTools: [
    {
      name: "get_metadata",
      description: "Get model metadata including project information, properties, and attributes. Use this when user asks for metadata, project details, or model properties.",
      input_schema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      name: "get_structure",
      description: "Get project structure including building levels, spaces, and organizational hierarchy. Use this when user asks about building structure, levels, or spatial organization.",
      input_schema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      name: "get_statistics",
      description: "Get detailed project statistics including element counts, types, and distribution. Use this when user asks for statistics, counts, or quantitative information about the project.",
      input_schema: {
        type: "object",
        properties: {},
        required: []
      }
    }
  ],
};