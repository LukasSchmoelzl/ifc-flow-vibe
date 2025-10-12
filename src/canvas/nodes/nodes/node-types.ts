import type * as FRAGS from "@thatopen/fragments";

// Common base interface for all node data
export interface BaseNodeData {
  label: string;
  properties?: Record<string, any>;
}

// IFC Node Output Type
export interface IfcNodeOutput {
  name: string;
  model: FRAGS.FragmentsModel;
}

// Info Node Input Type  
export interface InfoNodeInput {
  name: string;
  model: FRAGS.FragmentsModel;
}

// IFC node data
export interface IfcNodeData extends BaseNodeData {
  file?: File;
  fileName?: string;
  isLoading?: boolean;
  error?: string | null;
  model?: {
    schema?: string;
    project?: { Name?: string };
    elementCounts?: Record<string, number>;
    totalElements?: number;
  };
}

// Template node data
export interface TemplateNodeData extends BaseNodeData {
  isLoading?: boolean;
  error?: string | null;
  result?: any;
}

// Info node data
export interface InfoNodeData extends BaseNodeData {
  displayData?: InfoNodeInput;
}
