import type { LLMTool } from "../../node-metadata";

export const projectInfoLLMTools: LLMTool[] = [
  {
    name: "bim_get_model_info",
    description: "Get general information about the currently loaded BIM model including format, status, and capabilities.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "project_get_info",
    description: "Get comprehensive project information including metadata, statistics, and spatial structure.",
    input_schema: {
      type: "object",
      properties: {
        includeStatistics: {
          type: "boolean",
          description: "Include element count statistics (default: true)"
        },
        includeStructure: {
          type: "boolean",
          description: "Include spatial structure hierarchy (default: true)"
        },
        includeMetadata: {
          type: "boolean",
          description: "Include project metadata (default: true)"
        }
      },
      required: []
    }
  },
  {
    name: "project_get_statistics",
    description: "Get detailed project statistics including element counts, volumes, and spatial data.",
    input_schema: {
      type: "object",
      properties: {
        groupByType: {
          type: "boolean",
          description: "Group statistics by element type (default: true)"
        },
        includeVolumes: {
          type: "boolean",
          description: "Include volume calculations (default: true)"
        },
        includeSpaces: {
          type: "boolean",
          description: "Include space and zone information (default: true)"
        }
      },
      required: []
    }
  },
  {
    name: "project_get_structure",
    description: "Get project spatial structure hierarchy including sites, buildings, and storeys.",
    input_schema: {
      type: "object",
      properties: {
        maxDepth: {
          type: "number",
          description: "Maximum depth to traverse (default: unlimited)"
        },
        includeElements: {
          type: "boolean",
          description: "Include elements within each space (default: false)"
        }
      },
      required: []
    }
  }
];


