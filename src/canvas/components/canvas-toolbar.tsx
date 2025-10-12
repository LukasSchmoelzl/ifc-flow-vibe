"use client";

import { NodesToolbar } from "@/src/ui/toolbar/nodes-toolbar";
import { useCanvas } from "@/src/canvas/canvas-context";

export function CanvasToolbar() {
  const {
    handleMobileNodeSelect,
    selectedNodeType,
    placementMode,
  } = useCanvas();

  return (
    <NodesToolbar
      onNodeSelect={handleMobileNodeSelect}
      selectedNodeType={selectedNodeType}
      placementMode={placementMode}
    />
  );
}

