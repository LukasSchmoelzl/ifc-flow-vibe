"use client";

import { AppHeader } from "@/src/ui/header/app-header";
import { useCanvas } from "@/src/canvas/canvas-context";

export function CanvasHeader() {
  const {
    handleOpenFile,
    handleSaveWorkflow,
    handleRunWorkflow,
    handleLoadWorkflow,
    isRunning,
    setIsRunning,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    getFlowObject,
    currentWorkflow,
    reactFlowInstance,
    showGrid,
    setShowGrid,
    showMinimap,
    setShowMinimap,
    handleSelectAll,
    handleCopy,
    handleCut,
    handlePaste,
    handleDelete,
  } = useCanvas();

  return (
    <AppHeader
      onOpenFile={handleOpenFile}
      onSaveWorkflow={(wf) => handleSaveWorkflow(wf.name, wf.flowData)}
      onRunWorkflow={handleRunWorkflow}
      onLoadWorkflow={handleLoadWorkflow}
      isRunning={isRunning}
      setIsRunning={setIsRunning}
      canUndo={canUndo}
      canRedo={canRedo}
      onUndo={handleUndo}
      onRedo={handleRedo}
      getFlowObject={getFlowObject}
      currentWorkflow={currentWorkflow}
      reactFlowInstance={reactFlowInstance}
      showGrid={showGrid}
      setShowGrid={setShowGrid}
      showMinimap={showMinimap}
      setShowMinimap={setShowMinimap}
      onSelectAll={handleSelectAll}
      onCopy={handleCopy}
      onCut={handleCut}
      onPaste={handlePaste}
      onDelete={handleDelete}
    />
  );
}

