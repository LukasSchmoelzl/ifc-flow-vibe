import { FolderOpen, Box } from "lucide-react";
import type { LoadedFileInfo } from "./types";

interface FileManagerNodeData {
  label: string;
  fileName?: string;
  fileInfo?: LoadedFileInfo;
}

interface FileManagerNodeUIProps {
  data: FileManagerNodeData;
}

export function FileManagerNodeUI({ data }: FileManagerNodeUIProps) {
  const { fileName, fileInfo } = data;

  // Show drop zone if no file loaded (will load bridge.ifc by default on execution)
  if (!fileName && !fileInfo) {
    return (
      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/30 rounded-md">
        <Box className="w-8 h-8 text-white/50 mb-2" />
        <p className="text-xs text-white/60 text-center">
          Drop .ifc file or execute to load bridge.ifc
        </p>
      </div>
    );
  }

  // Show file info if loaded
  return (
    <div className="space-y-2 text-white/90">
      {/* File Name */}
      <div className="flex items-center gap-2">
        <Box className="w-4 h-4 text-purple-300" />
        <span className="text-xs font-medium truncate" title={fileName}>
          {fileName}
        </span>
      </div>

      {/* File Info */}
      {fileInfo && (
        <div className="space-y-1 text-xs text-white/70">
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
  );
}
