"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  MenubarCheckboxItem,
} from "@/src/ui/components/ui/menubar";
import { Button } from "@/src/ui/components/ui/button";
import { Play, Pause, Check, Menu, MoreVertical } from "lucide-react";
import { OpenFileDialog } from "@/src/ui/dialogs/open-file-dialog";
import { SaveWorkflowDialog } from "@/src/ui/dialogs/save-workflow-dialog";
import { SettingsDialog } from "@/src/ui/dialogs/settings-dialog";
import { HelpDialog } from "@/src/ui/dialogs/help-dialog";
import { AboutDialog } from "@/src/ui/dialogs/about-dialog";
import { WorkflowLibrary } from "@/src/ui/components/workflow-library";
import { useToast } from "@/src/hooks/use-toast";
import { useIsMobile } from "@/src/hooks/use-mobile";
import type { Workflow } from "@/src/canvas/workflow-storage";
import { cleanWorkflowData } from "@/src/canvas/workflow-storage";
import {
  formatKeyCombination,
  useKeyboardShortcuts,
} from "@/src/lib/keyboard-shortcuts";
import { Sheet, SheetContent } from "@/src/ui/components/ui/sheet";
import { useCanvas } from "@/src/canvas/canvas-context";

export function AppHeader() {
  // Canvas state from context - NO MORE PROPS!
  const {
    handleOpenFile: onOpenFile,
    handleSaveWorkflow,
    handleRunWorkflow: onRunWorkflow,
    handleLoadWorkflow: onLoadWorkflow,
    isRunning,
    setIsRunning,
    canUndo,
    canRedo,
    handleUndo: onUndo,
    handleRedo: onRedo,
    getFlowObject,
    currentWorkflow,
    reactFlowInstance,
    showGrid,
    setShowGrid,
    showMinimap,
    setShowMinimap,
    handleSelectAll: onSelectAll,
    handleCopy: onCopy,
    handleCut: onCut,
    handlePaste: onPaste,
    handleDelete: onDelete,
  } = useCanvas();

  const onSaveWorkflow = (workflow: Workflow) => {
    handleSaveWorkflow(workflow.name, workflow.flowData);
  };
  const [openFileDialogOpen, setOpenFileDialogOpen] = useState(false);
  const [saveWorkflowDialogOpen, setSaveWorkflowDialogOpen] = useState(false);
  const [workflowLibraryOpen, setWorkflowLibraryOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const { shortcuts } = useKeyboardShortcuts();
  const { theme, setTheme } = useTheme();

  const findShortcut = (id: string) => {
    return shortcuts.find((s) => s.id === id);
  };

  const getShortcutDisplay = (id: string) => {
    const shortcut = findShortcut(id);
    return shortcut ? formatKeyCombination(shortcut.keys) : "";
  };

  const handleOpenFile = (file: File) => {
    onOpenFile(file);
    setOpenFileDialogOpen(false);
    toast({
      title: "File opened",
      description: `Successfully opened ${file.name}`,
    });
  };

  const handleSaveToLibrary = (workflow: Workflow) => {
    onSaveWorkflow(workflow);
    toast({
      title: "Workflow saved to library",
      description: `${workflow.name} has been saved to your workflow library`,
    });
  };

  const handleSaveLocally = (workflow: Workflow) => {
    const json = JSON.stringify(workflow, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflow.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Workflow saved locally",
      description: `${workflow.name} has been saved to your device`,
    });
  };

  const handleLoadWorkflow = (workflow: Workflow) => {
    onLoadWorkflow(workflow);
    toast({
      title: "Workflow loaded",
      description: `${workflow.name} has been loaded successfully`,
    });
  };

  const handleRunWorkflow = () => {
    if (isRunning) {
      setIsRunning(false);
      toast({
        title: "Execution paused",
        description: "Workflow execution has been paused",
      });
    } else {
      setIsRunning(true);
      try {
        onRunWorkflow();
        toast({
          title: "Execution started",
          description: "Workflow execution has started",
        });
      } catch (error: unknown) {
        console.error("Error executing workflow:", error);
        let errorMessage = "Unknown error";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (error && typeof error === "object" && "toString" in error) {
          errorMessage = error.toString();
        }
        toast({
          title: "Execution error",
          description: `Error: ${errorMessage}`,
          variant: "destructive",
        });
        setIsRunning(false);
      }
    }
  };

  const handleUndo = () => {
    if (canUndo) {
      onUndo();
      toast({
        title: "Undo",
        description: "Last action undone",
        variant: "default",
      });
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      onRedo();
      toast({
        title: "Redo",
        description: "Action redone",
        variant: "default",
      });
    }
  };

  const handleZoomIn = () => {
    if (reactFlowInstance) {
      const zoom = reactFlowInstance.getZoom();
      reactFlowInstance.zoomTo(Math.min(zoom + 0.2, 2));
      toast({
        title: "Zoom In",
        description: "Canvas zoomed in",
      });
    }
  };

  const handleZoomOut = () => {
    if (reactFlowInstance) {
      const zoom = reactFlowInstance.getZoom();
      reactFlowInstance.zoomTo(Math.max(zoom - 0.2, 0.2));
      toast({
        title: "Zoom Out",
        description: "Canvas zoomed out",
      });
    }
  };

  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
      toast({
        title: "Fit View",
        description: "Canvas adjusted to fit all nodes",
      });
    }
  };

  const handleToggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const handleToggleMinimap = () => {
    setShowMinimap(!showMinimap);
  };

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:flex flex-col border-b bg-card">
        {/* Header Row 1: Logo + Menus + Run Button */}
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="flex items-center gap-4">
            {/* Logo and Brand */}
            <div className="flex items-center gap-2 pr-4 border-r">
              <img 
                src="/workflow.svg" 
                alt="IFCflow" 
                width={24} 
                height={24}
                className="text-primary"
              />
              <span className="text-lg font-semibold">IFCflow</span>
            </div>

            {/* Menubar */}
            <Menubar className="border-none">
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem
                    onClick={() => setOpenFileDialogOpen(true)}
                    data-open-file-dialog-trigger
                  >
                    Open IFC File
                    <MenubarShortcut>{getShortcutDisplay("open-file")}</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => setSaveWorkflowDialogOpen(true)}
                    data-save-workflow-dialog-trigger
                  >
                    Save Workflow
                    <MenubarShortcut>{getShortcutDisplay("save-workflow")}</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => setWorkflowLibraryOpen(true)}
                    data-workflow-library-trigger
                  >
                    Open Workflow Library
                    <MenubarShortcut>{getShortcutDisplay("open-workflow-library")}</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={handleUndo} disabled={!canUndo}>
                    Undo
                    <MenubarShortcut>{getShortcutDisplay("undo")}</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={handleRedo} disabled={!canRedo}>
                    Redo
                    <MenubarShortcut>{getShortcutDisplay("redo")}</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={onCut}>
                    Cut
                    <MenubarShortcut>{getShortcutDisplay("cut")}</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={onCopy}>
                    Copy
                    <MenubarShortcut>{getShortcutDisplay("copy")}</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={onPaste}>
                    Paste
                    <MenubarShortcut>{getShortcutDisplay("paste")}</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={onSelectAll}>
                    Select All
                    <MenubarShortcut>{getShortcutDisplay("select-all")}</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={onDelete}>
                    Delete Selected
                    <MenubarShortcut>{getShortcutDisplay("delete")}</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={handleZoomIn}>
                    Zoom In
                    <MenubarShortcut>{getShortcutDisplay("zoom-in")}</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={handleZoomOut}>
                    Zoom Out
                    <MenubarShortcut>{getShortcutDisplay("zoom-out")}</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={handleFitView}>
                    Fit View
                    <MenubarShortcut>{getShortcutDisplay("fit-view")}</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarCheckboxItem
                    checked={showGrid}
                    onCheckedChange={handleToggleGrid}
                  >
                    Show Grid
                    <MenubarShortcut>{getShortcutDisplay("toggle-grid")}</MenubarShortcut>
                  </MenubarCheckboxItem>
                  <MenubarCheckboxItem
                    checked={showMinimap}
                    onCheckedChange={handleToggleMinimap}
                  >
                    Show Minimap
                    <MenubarShortcut>{getShortcutDisplay("toggle-minimap")}</MenubarShortcut>
                  </MenubarCheckboxItem>
                  <MenubarSeparator />
                  <MenubarSub>
                    <MenubarSubTrigger>Theme</MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarSub>
                        <MenubarSubTrigger>Boring</MenubarSubTrigger>
                        <MenubarSubContent>
                          <MenubarItem onClick={() => setTheme('light')}>
                            Light
                            {theme === 'light' && <Check className="h-4 w-4 ml-auto" />}
                          </MenubarItem>
                          <MenubarItem onClick={() => setTheme('dark')}>
                            Dark
                            {theme === 'dark' && <Check className="h-4 w-4 ml-auto" />}
                          </MenubarItem>
                        </MenubarSubContent>
                      </MenubarSub>
                      <MenubarSub>
                        <MenubarSubTrigger>Less Boring</MenubarSubTrigger>
                        <MenubarSubContent>
                          <MenubarItem onClick={() => setTheme('tokyo-night-light')}>
                            Light
                            {theme === 'tokyo-night-light' && (
                              <Check className="h-4 w-4 ml-auto" />
                            )}
                          </MenubarItem>
                          <MenubarItem onClick={() => setTheme('tokyo-night-dark')}>
                            Dark
                            {theme === 'tokyo-night-dark' && (
                              <Check className="h-4 w-4 ml-auto" />
                            )}
                          </MenubarItem>
                        </MenubarSubContent>
                      </MenubarSub>
                    </MenubarSubContent>
                  </MenubarSub>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger>Help</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem
                    onClick={() => setHelpDialogOpen(true)}
                    data-help-dialog-trigger
                  >
                    Documentation
                    <MenubarShortcut>{getShortcutDisplay("help")}</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => {
                      setHelpDialogOpen(true);
                      setTimeout(() => {
                        const shortcutsTab = document.querySelector(
                          '[data-tab="shortcuts"]'
                        ) as HTMLElement;
                        if (shortcutsTab) shortcutsTab.click();
                      }, 100);
                    }}
                  >
                    Keyboard Shortcuts
                    <MenubarShortcut>
                      {getShortcutDisplay("keyboard-shortcuts")}
                    </MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => setAboutDialogOpen(true)}>
                    About IFCflow
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger>Presets</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={() => setWorkflowLibraryOpen(true)}>
                    Workflow Library
                  </MenubarItem>
                  <MenubarItem onClick={() => setSaveWorkflowDialogOpen(true)}>
                    Save as Preset
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>

          {/* Run Button */}
          <div className="flex items-center gap-2">
            {currentWorkflow && (
              <div className="text-sm font-medium text-muted-foreground">
                {currentWorkflow.name}
              </div>
            )}
            <Button
              variant={isRunning ? "destructive" : "default"}
              size="sm"
              className="gap-1.5"
              onClick={handleRunWorkflow}
              data-testid="run-workflow-button"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? "Stop" : "Run"}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex md:hidden items-center justify-between border-b p-2 bg-card">
        <div className="flex items-center gap-2">
          <img 
            src="/workflow.svg" 
            alt="IFCflow" 
            width={20} 
            height={20}
          />
          {currentWorkflow && (
            <span className="text-sm font-medium truncate max-w-[150px]">
              {currentWorkflow.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isRunning ? "destructive" : "default"}
            size="icon"
            onClick={handleRunWorkflow}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="sr-only">Run</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
            <MoreVertical className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="top" className="p-2 pt-4">
          <Menubar className="border-none flex-col md:flex-row">
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={() => {
                  setOpenFileDialogOpen(true);
                  setMobileMenuOpen(false);
                }}>
                  Open IFC File
                </MenubarItem>
                <MenubarItem onClick={() => {
                  setSaveWorkflowDialogOpen(true);
                  setMobileMenuOpen(false);
                }}>
                  Save Workflow
                </MenubarItem>
                <MenubarItem onClick={() => {
                  setWorkflowLibraryOpen(true);
                  setMobileMenuOpen(false);
                }}>
                  Workflow Library
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger>Edit</MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={handleUndo} disabled={!canUndo}>Undo</MenubarItem>
                <MenubarItem onClick={handleRedo} disabled={!canRedo}>Redo</MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={onCut}>Cut</MenubarItem>
                <MenubarItem onClick={onCopy}>Copy</MenubarItem>
                <MenubarItem onClick={onPaste}>Paste</MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={onSelectAll}>Select All</MenubarItem>
                <MenubarItem onClick={onDelete}>Delete</MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger>View</MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={handleZoomIn}>Zoom In</MenubarItem>
                <MenubarItem onClick={handleZoomOut}>Zoom Out</MenubarItem>
                <MenubarItem onClick={handleFitView}>Fit View</MenubarItem>
                <MenubarSeparator />
                <MenubarCheckboxItem checked={showGrid} onCheckedChange={handleToggleGrid}>
                  Show Grid
                </MenubarCheckboxItem>
                <MenubarCheckboxItem checked={showMinimap} onCheckedChange={handleToggleMinimap}>
                  Show Minimap
                </MenubarCheckboxItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger>Help</MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={() => {
                  setHelpDialogOpen(true);
                  setMobileMenuOpen(false);
                }}>
                  Documentation
                </MenubarItem>
                <MenubarItem onClick={() => {
                  setAboutDialogOpen(true);
                  setMobileMenuOpen(false);
                }}>
                  About
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <OpenFileDialog
        open={openFileDialogOpen}
        onOpenChange={setOpenFileDialogOpen}
        onFileSelected={handleOpenFile}
      />

      <SaveWorkflowDialog
        open={saveWorkflowDialogOpen}
        onOpenChange={setSaveWorkflowDialogOpen}
        onSave={handleSaveToLibrary}
        onSaveLocally={handleSaveLocally}
        flowData={cleanWorkflowData(getFlowObject())}
        existingWorkflow={currentWorkflow}
      />

      <WorkflowLibrary
        open={workflowLibraryOpen}
        onOpenChange={setWorkflowLibraryOpen}
        onLoadWorkflow={handleLoadWorkflow}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />

      <HelpDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen} />

      <AboutDialog open={aboutDialogOpen} onOpenChange={setAboutDialogOpen} />
    </>
  );
}

