import { useRef, useState, useCallback } from "react";
import { useCanvasStore } from "@/src/canvas/state/store";

export function useFileHandler(nodeId: string) {
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
    const file = files.find(f => 
      f.name.endsWith('.ifc') || 
      f.name.endsWith('.frag') || 
      f.name.endsWith('.ids')
    );

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
    input.accept = ".ifc,.frag,.ids";
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

