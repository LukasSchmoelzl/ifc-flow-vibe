import type * as FRAGS from "@thatopen/fragments";

// Common base interface for all node data
export interface BaseNodeData {
  label: string;
  properties?: Record<string, any>;
}

// File Manager Node Output Type (replaces IFC Node)
export interface FileManagerNodeOutput {
  name: string;
  model: FRAGS.FragmentsModel;
}

// Info Node Input Type  
export interface InfoNodeInput {
  name: string;
  model: FRAGS.FragmentsModel;
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
