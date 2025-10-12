// Simplified BIM Result Format

export interface BIMResult {
  success: boolean;
  response?: string;
}

// Factory function to create BIM results
export function createBIMResult(data: Partial<BIMResult>): BIMResult {
  return {
    success: data.success ?? true,
    response: data.response
  };
}

