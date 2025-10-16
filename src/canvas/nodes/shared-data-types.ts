// Shared Data Types - Einheitliches Datentyp-System für alle Nodes

// ============================================================================
// BASE TYPES - Grundlegende Datentypen
// ============================================================================

// Basis-Interface für alle Node-Ausgänge
export interface BaseNodeOutput {
  timestamp: string;
  nodeId: string;
  nodeType: string;
  success: boolean;
  error?: string;
}

// Basis-Interface für alle Node-Eingänge
export interface BaseNodeInput {
  nodeId: string;
  nodeType: string;
  timestamp?: string;
}

// ============================================================================
// MODEL DATA - IFC Model bezogene Daten
// ============================================================================

// fragmentsModel Referenz (von File Manager)
export interface ModelReference {
  modelId: string;
  model: any; // fragmentsModel instance
  fileName: string;
  fileSize: number;
  loadedAt: string;
}

// Model Metadata
export interface ModelMetadata {
  name?: string;
  description?: string;
  version?: string;
  schema?: string;
  author?: string;
  organization?: string;
  ifcVersion?: string;
  totalElements?: number;
  format?: string;
  status?: string;
  features?: string[];
}

// ============================================================================
// PROJECT DATA - Projekt bezogene Daten
// ============================================================================

// Project Information
export interface ProjectInfo {
  name?: string;
  description?: string;
  phase?: string;
  status?: string;
  location?: string;
  client?: string;
  architect?: string;
  projectId?: string;
}

// Project Statistics
export interface ProjectStatistics {
  totalElements?: number;
  totalTypes?: number;
  totalProperties?: number;
  fileSize?: number;
  processingTime?: number;
  levelsCount?: number;
  spacesCount?: number;
  totalVolume?: number;
  elementCounts?: Record<string, number>;
  categories?: string[];
}

// Project Structure
export interface ProjectStructure {
  sites?: Array<{
    name?: string;
    description?: string;
    location?: string;
    buildings?: Array<{
      name?: string;
      description?: string;
      stories?: number;
      storeys?: Array<{
        name?: string;
        level?: number;
        description?: string;
      }>;
    }>;
  }>;
  buildings?: Array<{
    name?: string;
    description?: string;
    stories?: number;
  }>;
  floors?: Array<{
    name?: string;
    level?: number;
    description?: string;
  }>;
}

// ============================================================================
// ENTITY DATA - IFC Entity bezogene Daten
// ============================================================================

// Basis IFC Entity
export interface IfcEntity {
  expressID: number;
  type: string;
  name?: string;
  globalId?: string;
  description?: string;
  objectType?: string;
  tag?: string;
  properties?: Record<string, any>;
}

// Entity Collection
export interface EntityCollection {
  entities: IfcEntity[];
  count: number;
  types?: Record<string, number>;
  query?: string;
  filters?: Record<string, any>;
}

// ============================================================================
// UNIFIED OUTPUT TYPES - Einheitliche Ausgänge
// ============================================================================

// File Manager Output (konsolidiert)
export interface FileManagerOutput extends BaseNodeOutput {
  modelReference: ModelReference;
  metadata: ModelMetadata;
  projectInfo?: ProjectInfo;
  statistics?: ProjectStatistics;
  structure?: ProjectStructure;
}

// Project Info Outputs (konsolidiert)
export interface ProjectInfoOutput extends BaseNodeOutput {
  modelReference?: ModelReference;
  metadata?: ModelMetadata;
  projectInfo?: ProjectInfo;
  statistics?: ProjectStatistics;
  structure?: ProjectStructure;
  // Spezifische Ausgänge
  modelInfo?: ModelMetadata;
  projectData?: ProjectInfo;
  projectStats?: ProjectStatistics;
  projectStructure?: ProjectStructure;
}

// Search Output (konsolidiert)
export interface SearchOutput extends BaseNodeOutput {
  results: EntityCollection;
  query: string;
  filters: Record<string, any>;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}

// User Selection Output (konsolidiert)
export interface UserSelectionOutput extends BaseNodeOutput {
  selection: EntityCollection;
  action: 'get' | 'set' | 'clear';
  previousSelection?: EntityCollection;
}

// AI Visibility Output (konsolidiert)
export interface AIVisibilityOutput extends BaseNodeOutput {
  highlighted: EntityCollection;
  invisible: EntityCollection;
  visible: EntityCollection;
  action: 'highlight' | 'clear' | 'hide' | 'show';
}

// Info Viewer Output (konsolidiert)
export interface InfoViewerOutput extends BaseNodeOutput {
  displayData: {
    type: 'model' | 'project' | 'statistics' | 'structure' | 'mixed';
    content: any;
    formatted: string;
    metadata: Record<string, any>;
  };
  sourceNodeId: string;
  sourceNodeType: string;
}

// ============================================================================
// UNIFIED INPUT TYPES - Einheitliche Eingänge
// ============================================================================

// Generic Input für alle Nodes
export interface GenericNodeInput extends BaseNodeInput {
  data?: any;
  parameters?: Record<string, any>;
  options?: Record<string, any>;
}

// Model Input (für Nodes die Model-Daten brauchen)
export interface ModelNodeInput extends BaseNodeInput {
  modelReference?: ModelReference;
  modelId?: string;
}

// Entity Input (für Nodes die Entity-Daten brauchen)
export interface EntityNodeInput extends BaseNodeInput {
  entities?: EntityCollection;
  expressIds?: number[];
  filters?: Record<string, any>;
}

// ============================================================================
// COMPATIBILITY MAPPING - Kompatibilitäts-Mapping
// ============================================================================

// Mapping von alten zu neuen Datentypen
export const COMPATIBILITY_MAP = {
  // File Manager
  'FileManagerOutput': 'FileManagerOutput',
  'load_ifc_file': 'FileManagerOutput',
  
  // Project Info
  'bim_get_model_info': 'ProjectInfoOutput',
  'project_get_info': 'ProjectInfoOutput', 
  'project_get_statistics': 'ProjectInfoOutput',
  'project_get_structure': 'ProjectInfoOutput',
  
  // Search
  'bim_search': 'SearchOutput',
  'SearchOutput': 'SearchOutput',
  
  // User Selection
  'get_user_selection': 'UserSelectionOutput',
  'set_user_selection': 'UserSelectionOutput',
  'clear_user_selection': 'UserSelectionOutput',
  
  // AI Visibility
  'get_ai_highlight': 'AIVisibilityOutput',
  'set_ai_highlight': 'AIVisibilityOutput',
  'clear_ai_highlight': 'AIVisibilityOutput',
  'set_visible': 'AIVisibilityOutput',
  'get_invisible': 'AIVisibilityOutput',
  'set_invisible': 'AIVisibilityOutput',
  
  // Info Viewer
  'display_info': 'InfoViewerOutput',
  'displayed_info': 'InfoViewerOutput',
} as const;

// ============================================================================
// TYPE GUARDS - Type Guards für Datentyp-Erkennung
// ============================================================================

export function isModelReference(data: any): data is ModelReference {
  return data && typeof data === 'object' && 'modelId' in data && 'model' in data;
}

export function isEntityCollection(data: any): data is EntityCollection {
  return data && typeof data === 'object' && 'entities' in data && Array.isArray(data.entities);
}

export function isProjectInfo(data: any): data is ProjectInfo {
  return data && typeof data === 'object' && ('name' in data || 'description' in data);
}

export function isProjectStatistics(data: any): data is ProjectStatistics {
  return data && typeof data === 'object' && ('totalElements' in data || 'totalTypes' in data);
}

export function isProjectStructure(data: any): data is ProjectStructure {
  return data && typeof data === 'object' && ('sites' in data || 'buildings' in data);
}

// ============================================================================
// DATA TRANSFORMATION - Daten-Transformation zwischen Nodes
// ============================================================================

export function transformToUnifiedOutput(
  sourceType: string,
  sourceData: any,
  targetType: string
): any {
  // Basis-Transformation
  const baseOutput = {
    timestamp: new Date().toISOString(),
    nodeId: sourceData.nodeId || 'unknown',
    nodeType: sourceType,
    success: !sourceData.error,
    error: sourceData.error,
  };

  // Spezifische Transformationen
  switch (targetType) {
    case 'FileManagerOutput':
      return {
        ...baseOutput,
        modelReference: sourceData.modelReference || sourceData,
        metadata: sourceData.metadata || sourceData,
        projectInfo: sourceData.projectInfo,
        statistics: sourceData.statistics,
        structure: sourceData.structure,
      };
      
    case 'ProjectInfoOutput':
      return {
        ...baseOutput,
        modelReference: sourceData.modelReference,
        metadata: sourceData.metadata,
        projectInfo: sourceData.projectInfo,
        statistics: sourceData.statistics,
        structure: sourceData.structure,
        // Spezifische Mappings
        modelInfo: sourceData.metadata,
        projectData: sourceData.projectInfo,
        projectStats: sourceData.statistics,
        projectStructure: sourceData.structure,
      };
      
    case 'SearchOutput':
      return {
        ...baseOutput,
        results: sourceData.results || sourceData,
        query: sourceData.query || '',
        filters: sourceData.filters || {},
      };
      
    case 'UserSelectionOutput':
      return {
        ...baseOutput,
        selection: sourceData.selection || sourceData,
        action: sourceData.action || 'get',
      };
      
    case 'AIVisibilityOutput':
      return {
        ...baseOutput,
        highlighted: sourceData.highlighted || sourceData,
        invisible: sourceData.invisible || sourceData,
        visible: sourceData.visible || sourceData,
        action: sourceData.action || 'highlight',
      };
      
    case 'InfoViewerOutput':
      return {
        ...baseOutput,
        displayData: {
          type: detectDataType(sourceData),
          content: sourceData,
          formatted: formatForDisplay(sourceData),
          metadata: extractMetadata(sourceData),
        },
        sourceNodeId: sourceData.nodeId || 'unknown',
        sourceNodeType: sourceType,
      };
      
    default:
      return { ...baseOutput, ...sourceData };
  }
}

function detectDataType(data: any): string {
  if (isProjectStatistics(data)) return 'statistics';
  if (isProjectStructure(data)) return 'structure';
  if (isProjectInfo(data)) return 'project';
  if (isModelReference(data)) return 'model';
  return 'mixed';
}

function formatForDisplay(data: any): string {
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2);
  }
  return String(data);
}

function extractMetadata(data: any): Record<string, any> {
  const metadata: Record<string, any> = {};
  
  if (data.timestamp) metadata.timestamp = data.timestamp;
  if (data.nodeId) metadata.sourceNodeId = data.nodeId;
  if (data.nodeType) metadata.sourceNodeType = data.nodeType;
  if (data.success !== undefined) metadata.success = data.success;
  
  return metadata;
}
