// File Manager Node Types - IFC files only

export interface LoadedFileInfo {
  fileName: string;
  fileType: 'ifc';
  category: 'model';
  size: number;
  loadedAt: Date;
  metadata: FileMetadata;
}

export interface FileMetadata {
  schema?: string;
  project?: { Name?: string };
  totalElements?: number;
  elementCounts?: Record<string, number>;
}
