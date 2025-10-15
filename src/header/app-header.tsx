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
} from "@/src/shared/ui/menubar";
import { Button } from "@/src/shared/ui/button";
import { Play, Pause, Check, Menu, MoreVertical } from "lucide-react";
import { OpenFileDialog } from "@/src/header/dialogs/open-file-dialog";
import { SaveWorkflowDialog } from "@/src/header/dialogs/save-workflow-dialog";
import { SettingsDialog } from "@/src/header/dialogs/settings-dialog";
import { HelpDialog } from "@/src/header/dialogs/help-dialog";
import { AboutDialog } from "@/src/header/dialogs/about-dialog";
import { WorkflowLibrary } from "@/src/canvas/workflow-library";
import { useToast } from "@/src/shared/use-toast";
import { useUIStore } from "@/src/shared/ui-store";
import type { Workflow } from "@/src/canvas/storage";
import { cleanWorkflowData } from "@/src/canvas/storage";
import { Sheet, SheetContent } from "@/src/shared/ui/sheet";
import { useCanvasStore, getFlowObject } from "@/src/canvas/store";
import { useSettingsStore } from "@/src/shared/settings-store";
import * as workflowOps from "@/src/canvas/workflow-operations";
import * as clipboardOps from "@/src/canvas/clipboard-operations";

export function AppHeader() {
  // Zustand store - atomic selections
  const isRunning = useCanvasStore(state => state.isRunning);
  const canUndo = useCanvasStore(state => state.canUndo);
  const canRedo = useCanvasStore(state => state.canRedo);
  const currentWorkflow = useCanvasStore(state => state.currentWorkflow);
  const reactFlowInstance = useCanvasStore(state => state.reactFlowInstance);
  const showGrid = useSettingsStore(state => state.viewer.showGrid);
  const showMinimap = useSettingsStore(state => state.viewer.showMinimap);
  const updateViewerSettings = useSettingsStore(state => state.updateViewerSettings);
  const undo = useCanvasStore(state => state.undo);
  const redo = useCanvasStore(state => state.redo);
  const setNodes = useCanvasStore(state => state.setNodes);
  const setEdges = useCanvasStore(state => state.setEdges);

  const [openFileDialogOpen, setOpenFileDialogOpen] = useState(false);
  const [saveWorkflowDialogOpen, setSaveWorkflowDialogOpen] = useState(false);
  const [workflowLibraryOpen, setWorkflowLibraryOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const isMobile = useUIStore(state => state.isMobile);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();


  // Action handlers with error handling
  const handleOpenFile = async (file: File) => {
    try {
      await workflowOps.openFile(file, toast);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to open file",
        variant: "destructive",
      });
    }
  };

  const handleSaveWorkflow = async (name: string, flowData: any) => {
    try {
      await workflowOps.saveWorkflow(name, flowData, toast);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save workflow",
        variant: "destructive",
      });
    }
  };

  const handleLoadWorkflow = (workflow: Workflow) => {
    try {
      workflowOps.loadWorkflow(workflow, toast);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load workflow",
        variant: "destructive",
      });
    }
  };

  const handleRunWorkflow = async () => {
    try {
      await workflowOps.runWorkflow(toast, (nodeId, data) => {
        setNodes((nodes: any) => nodes.map((n: any) => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n));
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to execute workflow",
        variant: "destructive",
      });
    }
  };
  
  const handleSelectAll = () => clipboardOps.selectAll();
  
  const handleCopy = () => {
    try {
      clipboardOps.copy(toast);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to copy",
        variant: "destructive",
      });
    }
  };

  const handleCut = () => {
    try {
      clipboardOps.cut(toast);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cut",
        variant: "destructive",
      });
    }
  };

  const handlePaste = () => {
    try {
      clipboardOps.paste(toast);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to paste",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    try {
      clipboardOps.deleteNodes(toast);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const getCurrentFlowObject = () => getFlowObject(reactFlowInstance);

  const onSaveWorkflow = (workflow: Workflow) => {
    handleSaveWorkflow(workflow.name, workflow.flowData);
  };

  return (
    <>
      {/* Desktop Menubar */}
      {!isMobile ? (
        <div className="border-b bg-card flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <Image
              src="/workflow.svg"
              alt="IFCflow Logo"
              width={24}
              height={24}
              className="dark:invert"
            />
            <Menubar className="border-none bg-transparent">
              {/* File Menu */}
              <MenubarMenu>
                <MenubarTrigger className="cursor-pointer">File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={() => setOpenFileDialogOpen(true)}>
                    Open IFC File
                    <MenubarShortcut>Ctrl+O</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => setSaveWorkflowDialogOpen(true)}>
                    Save Workflow
                    <MenubarShortcut>Ctrl+S</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={() => setWorkflowLibraryOpen(true)}>
                    Workflow Library
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              {/* Edit Menu */}
              <MenubarMenu>
                <MenubarTrigger className="cursor-pointer">Edit</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={undo} disabled={!canUndo}>
                    Undo
                    <MenubarShortcut>Ctrl+Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={redo} disabled={!canRedo}>
                    Redo
                    <MenubarShortcut>Ctrl+Y</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={handleSelectAll}>
                    Select All
                    <MenubarShortcut>Ctrl+A</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={handleCopy}>
                    Copy
                    <MenubarShortcut>Ctrl+C</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={handleCut}>
                    Cut
                    <MenubarShortcut>Ctrl+X</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={handlePaste}>
                    Paste
                    <MenubarShortcut>Ctrl+V</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={handleDelete}>
                    Delete
                    <MenubarShortcut>Del</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              {/* View Menu */}
              <MenubarMenu>
                <MenubarTrigger className="cursor-pointer">View</MenubarTrigger>
                <MenubarContent>
                  <MenubarCheckboxItem checked={showGrid} onCheckedChange={(checked) => updateViewerSettings({ showGrid: checked })}>
                    Show Grid
                  </MenubarCheckboxItem>
                  <MenubarCheckboxItem checked={showMinimap} onCheckedChange={(checked) => updateViewerSettings({ showMinimap: checked })}>
                    Show Minimap
                  </MenubarCheckboxItem>
                  <MenubarSeparator />
                  <MenubarSub>
                    <MenubarSubTrigger>Theme</MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarItem onClick={() => setTheme("light")}>
                        Light
                        {theme === "light" && <Check className="ml-auto h-4 w-4" />}
                      </MenubarItem>
                      <MenubarItem onClick={() => setTheme("dark")}>
                        Dark
                        {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
                      </MenubarItem>
                      <MenubarItem onClick={() => setTheme("system")}>
                        System
                        {theme === "system" && <Check className="ml-auto h-4 w-4" />}
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                </MenubarContent>
              </MenubarMenu>

              {/* Settings Menu */}
              <MenubarMenu>
                <MenubarTrigger className="cursor-pointer" onClick={() => setSettingsDialogOpen(true)}>
                  Settings
                </MenubarTrigger>
              </MenubarMenu>

              {/* Help Menu */}
              <MenubarMenu>
                <MenubarTrigger className="cursor-pointer">Help</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={() => setHelpDialogOpen(true)}>
                    Keyboard Shortcuts
                  </MenubarItem>
                  <MenubarItem onClick={() => setAboutDialogOpen(true)}>
                    About IFCflow
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>

          {/* Run Button */}
          <Button
            onClick={handleRunWorkflow}
            disabled={isRunning}
            variant="default"
            size="sm"
            className="gap-2"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Workflow
              </>
            )}
          </Button>
        </div>
      ) : (
        /* Mobile Header */
        <div className="border-b bg-card flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-ifcflow.svg"
              alt="IFCflow Logo"
              width={20}
              height={20}
              className="dark:invert"
            />
            <span className="text-sm font-semibold">IFCflow</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleRunWorkflow}
              disabled={isRunning}
              variant="default"
              size="sm"
              className="gap-1"
            >
              {isRunning ? (
                <>
                  <Pause className="h-3 w-3" />
                  <span className="text-xs">Running</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  <span className="text-xs">Run</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[80vw]">
          <div className="flex flex-col gap-4 py-4">
            <Button onClick={() => { setOpenFileDialogOpen(true); setMobileMenuOpen(false); }} variant="outline" className="w-full justify-start">
              Open IFC File
            </Button>
            <Button onClick={() => { setSaveWorkflowDialogOpen(true); setMobileMenuOpen(false); }} variant="outline" className="w-full justify-start">
              Save Workflow
            </Button>
            <Button onClick={() => { setWorkflowLibraryOpen(true); setMobileMenuOpen(false); }} variant="outline" className="w-full justify-start">
              Workflow Library
            </Button>
            <Button onClick={() => { setSettingsDialogOpen(true); setMobileMenuOpen(false); }} variant="outline" className="w-full justify-start">
              Settings
            </Button>
            <Button onClick={() => { setHelpDialogOpen(true); setMobileMenuOpen(false); }} variant="outline" className="w-full justify-start">
              Help
            </Button>
          </div>
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
        onSave={onSaveWorkflow}
        onSaveLocally={onSaveWorkflow}
        flowData={getCurrentFlowObject()}
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

