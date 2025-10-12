import { FolderOpen, Box } from "lucide-react";
import type { LoadedFileInfo } from "./types";

interface FileManagerNodeData {
  label: string;
  fileName?: string;
  fileInfo?: LoadedFileInfo;
}

interface FileManagerNodeUIProps {
  data: FileManagerNodeData;
  isDraggingOver: boolean;
}

export function FileManagerNodeUI({ data, isDraggingOver }: FileManagerNodeUIProps) {
  const { fileName, fileInfo } = data;

  // Show drop zone if no file loaded (will load bridge.ifc by default on execution)
  if (!fileName && !fileInfo) {
    return (
      <div className="p-4">
        <div className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md transition-colors ${
          isDraggingOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
        }`}>
          <Box className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Drop .ifc file or execute to load bridge.ifc
          </p>
        </div>
      </div>
    );
  }

  // Show file info if loaded
  return (
    <div className="p-3">
      <div className="space-y-2">
        {/* File Name */}
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-medium truncate" title={fileName}>
            {fileName}
          </span>
        </div>

        {/* File Info */}
        {fileInfo && (
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Size:</span>
              <span>{(fileInfo.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            {fileInfo.metadata.totalElements && (
              <div className="flex justify-between">
                <span>Elements:</span>
                <span>{fileInfo.metadata.totalElements}</span>
              </div>
            )}
            {fileInfo.metadata.schema && (
              <div className="flex justify-between">
                <span>Schema:</span>
                <span className="font-mono">{fileInfo.metadata.schema}</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
