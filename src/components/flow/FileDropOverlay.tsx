"use client";

import { FileUp } from "lucide-react";

interface FileDropOverlayProps {
  isVisible: boolean;
}

export function FileDropOverlay({ isVisible }: FileDropOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="bg-white bg-opacity-80 p-6 rounded-lg shadow-lg border-2 border-dashed border-blue-500">
        <FileUp className="h-12 w-12 text-blue-500 mx-auto mb-2" />
        <p className="text-lg font-medium text-blue-700">
          Drop IFC file here
        </p>
      </div>
    </div>
  );
}

