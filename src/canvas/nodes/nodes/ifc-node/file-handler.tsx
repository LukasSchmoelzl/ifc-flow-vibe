import { useState, useCallback, useRef } from "react";
import { useReactFlow } from "reactflow";

export function useIfcFileHandler(nodeId: string) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const { setNodes } = useReactFlow();

  const handleFileSelect = useCallback((file: File) => {
    if (file.name.toLowerCase().endsWith(".ifc")) {
      console.log(`[IFC Node] File selected: ${file.name} (${file.size} bytes)`);
      console.log(`[IFC Node] File stored in node data. Run the workflow to load it into the viewer.`);
      
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                label: file.name,
                file,
                fileName: file.name,
                properties: {
                  ...node.data.properties,
                  file: file.name,
                },
                isLoading: false,
                error: null,
              },
            };
          }
          return node;
        })
      );
    }
  }, [nodeId, setNodes]);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.types.includes("Files")) {
      event.dataTransfer.dropEffect = "copy";
      setIsDraggingOver(true);
    }
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDraggingOver(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDraggingOver(false);

      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const onDoubleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ifc';
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files ? target.files[0] : null;
      if (file) {
        handleFileSelect(file);
      }
    };
    input.click();
  }, [handleFileSelect]);

  return {
    dropRef,
    isDraggingOver,
    onDragOver,
    onDragLeave,
    onDrop,
    onDoubleClick,
  };
}

