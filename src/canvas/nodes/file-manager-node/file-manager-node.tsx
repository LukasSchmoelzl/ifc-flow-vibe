"use client";

import React, { useRef, useState, useCallback } from "react";
import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNodeLayout } from "../shared-node-layout";
import { useCanvasStore } from "@/src/canvas/store";
import { FolderOpen, Box } from "lucide-react";
import { fileManagerNodeMetadata } from "./file-manager-metadata";

// useFileHandler hook
function useFileHandler(nodeId: string) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const setNodes = useCanvasStore(state => state.setNodes);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files.find(f => f.name.toLowerCase().endsWith('.ifc'));

    if (file) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, file, fileName: file.name } }
            : node
        )
      );
    }
  }, [nodeId, setNodes]);

  const handleDoubleClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".ifc";
    input.style.display = "none";

    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        setNodes((nodes) =>
          nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, file, fileName: file.name } }
              : node
          )
        );
      }

      document.body.removeChild(input);
    };

    document.body.appendChild(input);
    input.click();
  }, [nodeId, setNodes]);

  return {
    dropRef,
    isDraggingOver,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    onDoubleClick: handleDoubleClick,
  };
}

// FileManagerNode Component
export const FileManagerNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { dropRef, isDraggingOver, onDragOver, onDragLeave, onDrop, onDoubleClick } = useFileHandler(id);
  const { fileName, fileInfo } = data;

  return (
    <BaseNodeLayout
      selected={selected}
      title="File Manager"
      icon={<FolderOpen className="h-4 w-4" />}
      isLoading={data.isLoading}
      error={data.error}
      outputHandles={[
        { id: "load_ifc_file", position: Position.Right }
      ]}
      inputInfo={fileManagerNodeMetadata.inputInfo}
      outputInfo={fileManagerNodeMetadata.outputInfo}
      dragHandlers={{
        dropRef,
        isDraggingOver,
        onDragOver,
        onDragLeave,
        onDrop,
        onDoubleClick,
      }}
    >
      {!fileName && !fileInfo ? (
        <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/30 rounded-md">
          <div className="text-white/80 mb-2">File Manager Node</div>
          <Box className="w-8 h-8 text-white/50 mb-2" />
          <p className="text-xs text-white/60 text-center">
            Drop .ifc file or execute to load bridge.ifc
          </p>
        </div>
      ) : (
        <div className="space-y-2 text-white/90">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-purple-300" />
            <span className="text-xs font-medium truncate" title={fileName}>
              {fileName}
            </span>
          </div>

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
      )}
    </BaseNodeLayout>
  );
};

export { fileManagerNodeMetadata } from "./file-manager-metadata";
