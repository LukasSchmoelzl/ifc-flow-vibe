// User Selection Node Types

export interface SelectionState {
  selectedEntities: any[];
}

export interface SelectionResponse {
  description: string;
  entities: any[];
  count: number;
  types?: Record<string, number>;
}

export interface SelectionParams {
  includeDetails?: boolean;
  format?: 'summary' | 'detailed';
}

