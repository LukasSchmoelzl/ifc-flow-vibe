// Search Node Types

export interface SearchParams {
  query?: string;
  types?: string[];
  type?: string;
}

export interface SearchResult {
  name: string;
  expressID: number;
  type: string;
}

export interface SearchResponse {
  description: string;
  entities: SearchResult[];
}

export interface CountParams {
  types?: string[];
}

export interface CountResponse {
  description: string;
  counts: Record<string, number>;
}


