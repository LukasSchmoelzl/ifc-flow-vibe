// File Manager Node Types

export type SupportedFileType = 'ifc' | 'frag' | 'ids';
export type FileCategory = 'model' | 'specification';

export interface FileMetadata {
  originalName: string;
  mimeType?: string;
  description?: string;
  tags?: string[];
  modelId?: string;
}

export interface LoadedFileInfo {
  fileName: string;
  fileType: SupportedFileType;
  category: FileCategory;
  size: number;
  metadata: FileMetadata;
  loadedAt: Date;
}

