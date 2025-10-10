import { useCallback, useEffect, useRef } from "react";

interface UseFileDropHandlerProps {
  onFileOpen: (file: File) => void;
  isFileDragging: boolean;
  setIsFileDragging: (isDragging: boolean) => void;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
}

export function useFileDropHandler({
  onFileOpen,
  isFileDragging,
  setIsFileDragging,
  reactFlowWrapper,
}: UseFileDropHandlerProps) {
  const handleFileDragEnter = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes("Files")) {
        setIsFileDragging(true);
      }
    },
    [setIsFileDragging]
  );

  const handleFileDragLeave = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (e.target === reactFlowWrapper.current) {
        setIsFileDragging(false);
      }
    },
    [setIsFileDragging, reactFlowWrapper]
  );

  const handleFileDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      setIsFileDragging(false);

      const files = Array.from(e.dataTransfer?.files || []);
      const ifcFiles = files.filter((file) =>
        file.name.toLowerCase().endsWith(".ifc")
      );

      if (ifcFiles.length > 0) {
        for (const file of ifcFiles) {
          await onFileOpen(file);
        }
      }
    },
    [onFileOpen, setIsFileDragging]
  );

  // Set up drag and drop listeners
  useEffect(() => {
    const wrapper = reactFlowWrapper.current;
    if (!wrapper) return;

    wrapper.addEventListener("dragenter", handleFileDragEnter);
    wrapper.addEventListener("dragleave", handleFileDragLeave);
    wrapper.addEventListener("drop", handleFileDrop);

    return () => {
      wrapper.removeEventListener("dragenter", handleFileDragEnter);
      wrapper.removeEventListener("dragleave", handleFileDragLeave);
      wrapper.removeEventListener("drop", handleFileDrop);
    };
  }, [handleFileDragEnter, handleFileDragLeave, handleFileDrop]);

  return {
    handleFileDragEnter,
    handleFileDragLeave,
    handleFileDrop,
  };
}

