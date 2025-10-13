export enum ModelErrorType {
  MODEL_NOT_AVAILABLE = 'MODEL_NOT_AVAILABLE',
  QUERY_FAILED = 'QUERY_FAILED'
}

export class ModelError extends Error {
  constructor(
    public type: ModelErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ModelError';
  }

  static modelNotAvailable(): ModelError {
    return new ModelError(
      ModelErrorType.MODEL_NOT_AVAILABLE,
      'FragmentsModel not available - model may not be loaded'
    );
  }

  static queryFailed(operation: string, error: unknown): ModelError {
    return new ModelError(
      ModelErrorType.QUERY_FAILED,
      `Failed to execute ${operation}`,
      error
    );
  }
}

