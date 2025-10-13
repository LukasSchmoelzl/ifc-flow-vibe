// AI Visibility Node Types

export interface AIVisibilityState {
  highlightedIds: number[];
  invisibleIds: number[];
}

export interface AIVisibilityResponse {
  description: string;
  expressIds?: number[];
  count?: number;
  success?: boolean;
  cleared?: boolean;
}

export interface AIVisibilityParams {
  expressIds: number[];
}

