// Node Data Types - Defines all data types that can flow between nodes

// IfcEntity interface moved inline

// Base types for all nodes
export interface NodeInput {
  [key: string]: any;
}

export interface NodeOutput {
  [key: string]: any;
}

// File Manager Node Output
export interface FileManagerOutput {
  name: string;
  fileName: string;
  totalElements: number;
  schema: string;
  projectName: string;
  elementCounts: Record<string, number>;
  model?: any; // fragmentsModel reference
}

// Search Node Input
export interface SearchInput {
  query?: string;
  types?: string[];
  limit?: number;
  offset?: number;
}

// Search Node Output
export interface SearchOutput {
  searchResults: Array<{
    name: string;
    expressID: number;
    type: string;
  }>;
  count: number;
  query: string;
  types: string[];
}

// Project Info Node Output
export interface ProjectInfoOutput {
  metadata?: any;
  statistics?: any;
  structure?: any;
  projectName?: string;
  totalElements?: number;
  description?: string;
  format?: string;
  status?: string;
  features?: string[];
  version?: string;
  modelId?: string;
  entityCount?: number;
  attributeNames?: string[];
  categories?: string[];
  loadedAt?: string;
  summary?: string;
}

// User Selection Node Input
export interface UserSelectionInput {
  expressIds?: number[];
  action?: 'get' | 'set' | 'clear';
}

// User Selection Node Output
export interface UserSelectionOutput {
  selectedEntities: Array<{
    expressID: number;
    type: string;
    name: string;
  }>;
  count: number;
  types: Record<string, number>;
  expressIds?: number[];
  cleared?: boolean;
}

// AI Visibility Node Input
export interface AIVisibilityInput {
  expressIds?: number[];
  action?: 'get_highlight' | 'clear_highlight' | 'get_invisible' | 'set_visible' | 'set_invisible';
}

// AI Visibility Node Output
export interface AIVisibilityOutput {
  highlightedIds?: number[];
  invisibleIds?: number[];
  visibleIds?: number[];
  count?: number;
  cleared?: boolean;
}

// Entity data that can be passed between nodes
// Inline IfcEntity interface
interface IfcEntity {
  expressID: number;
  type: string;
  name?: string;
  globalId?: string;
  description?: string;
  objectType?: string;
  tag?: string;
  properties?: Record<string, any>;
}

export interface EntityData extends IfcEntity {
  expressID: number;
  type: string;
  name?: string;
  globalId?: string;
}

// Collection of entities
export interface EntityCollection {
  entities: EntityData[];
  count: number;
  types?: Record<string, number>;
}

