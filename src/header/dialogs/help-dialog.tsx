"use client";

import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/shared/ui/dialog";
import { Button } from "@/src/shared/ui/button";
import { Info, Keyboard, Building } from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            IFCFlow Help
          </DialogTitle>
          <DialogDescription>
            Quick reference for using IFCFlow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Start */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Quick Start
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. <strong>Load IFC File:</strong> Use File → Open or drag & drop</p>
              <p>2. <strong>Add Nodes:</strong> Drag nodes from toolbar to canvas</p>
              <p>3. <strong>Connect Nodes:</strong> Drag from output to input handles</p>
              <p>4. <strong>Run Workflow:</strong> Click Run button or F5</p>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Open File:</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+O</kbd>
              </div>
              <div className="flex justify-between">
                <span>Save Workflow:</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S</kbd>
              </div>
              <div className="flex justify-between">
                <span>Run Workflow:</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">F5</kbd>
              </div>
              <div className="flex justify-between">
                <span>Undo:</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+Z</kbd>
              </div>
              <div className="flex justify-between">
                <span>Redo:</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+Y</kbd>
              </div>
              <div className="flex justify-between">
                <span>Delete:</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Del</kbd>
              </div>
            </div>
          </div>

          {/* Node Types */}
          <div>
            <h3 className="font-semibold mb-2">Available Nodes</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><strong>File Manager:</strong> Load and manage IFC files</p>
              <p><strong>Search:</strong> Find elements by type or name</p>
              <p><strong>Project Info:</strong> Get model metadata and statistics</p>
              <p><strong>User Selection:</strong> Select and highlight elements</p>
              <p><strong>AI Visibility:</strong> AI-controlled element visibility</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}