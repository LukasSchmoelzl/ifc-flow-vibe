// Core Entity Types for IFC entity handling

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

export type IfcEntityIndex = Record<string, number[]>;

