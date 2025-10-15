import type { LLMTool } from "../../node-metadata";

export const projectInfoLLMTools: LLMTool[] = [
  {
    name: "bim_get_model_info",
    description: `Get general information about the currently loaded BIM model including format, status, and capabilities.

NODE INPUT:
- None (uses currently loaded model)

NODE OUTPUT:
- description (string): Status message
- format (string): Model format (e.g., "IFC/Fragment")
- status (string): Model status (e.g., "Ready for analysis")
- features (string[]): Available features list
- version (string): Version number
- modelId (string): Unique model identifier
- entityCount (number): Total number of entities with geometry
- attributeNames (string[]): Available attribute names
- categories (string[]): Available IFC categories
- loadedAt (string): ISO timestamp when model was loaded

Use this to get a quick overview of the loaded model's capabilities and metadata.`.trim(),
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "project_get_info",
    description: `Get comprehensive project information including metadata, statistics, and spatial structure.

NODE INPUT:
- model (FragmentsModel, optional): Fragments model (uses global model if not provided)
- includeStatistics (boolean, optional): Include element count statistics (default: true)
- includeStructure (boolean, optional): Include spatial structure hierarchy (default: true)
- includeMetadata (boolean, optional): Include project metadata (default: true)

NODE OUTPUT:
- metadata (object): {name, description, version, ifcVersion, createdBy, createdDate, modifiedDate, projectId, siteId, buildingId}
- statistics (object): {totalElements, elementsByType, totalSpace, totalVolume, levelsCount, spacesCount, zonesCount, systemsCount}
- structure (object): {sites: Array<{id, name, type, globalId, buildings: Array<{id, name, type, storeys: [...]}> }> }
- projectName (string): Project name
- totalElements (number): Total number of elements

Use this when user asks for complete project overview, project details, or building information.`.trim(),
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
    description: `Get detailed project statistics including element counts, volumes, and spatial data.

NODE INPUT:
- model (FragmentsModel, optional): Fragments model (uses global model if not provided)
- groupByType (boolean, optional): Group statistics by element type (default: true)
- includeVolumes (boolean, optional): Include volume calculations (default: true)
- includeSpaces (boolean, optional): Include space and zone information (default: true)

NODE OUTPUT:
- statistics (object): {totalElements, elementsByType: {"IFCWALL": 45, ...}, totalSpace, totalVolume, levelsCount, spacesCount, zonesCount, systemsCount}
- summary (string): Human-readable summary text
- description (string): Status message

Use this when user asks "how many", "statistics", "stats", or wants element counts by type.`.trim(),
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
    description: `Get project spatial structure hierarchy including sites, buildings, and storeys.

        NODE INPUT:
        - model (FragmentsModel, optional): Fragments model (uses global model if not provided)
        - maxDepth (number, optional): Maximum depth to traverse (default: unlimited)
        - includeElements (boolean, optional): Include elements within each space (default: false)

        NODE OUTPUT:
        - structure (object): {sites: Array<{id, name, type, globalId, buildings: Array<{id, name, type, storeys: Array<{id, name, elevation}> }> }> }
        - summary (string): Human-readable summary (e.g., "Project structure: 1 sites, 1 buildings, 3 storeys")
        - description (string): Status message

Use this when user asks about building structure, floors, levels, storeys, or spatial hierarchy.`.trim(),
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


