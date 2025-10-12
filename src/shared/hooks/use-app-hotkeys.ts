"use client";

import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { Node, Edge } from "reactflow";
import { useToast } from "@/src/shared/hooks/use-toast";

const HOTKEYS_ENABLED = false;

export { HOTKEYS_ENABLED };

interface UseAppHotkeysProps {
  nodes: Node[];
  edges: Edge[];
  clipboard: { nodes: Node[]; edges: Edge[] } | null;
  currentWorkflow: any;
  canUndo: boolean;
  canRedo: boolean;
  reactFlowInstance: any;
  shortcuts: any[];
  onSaveWorkflow: (name: string, flowData: any) => void;
  onOpenFile: (file: File) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSelectAll: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onRunWorkflow: () => void;
}

export function useAppHotkeys({
  nodes,
  edges,
  clipboard,
  currentWorkflow,
  canUndo,
  canRedo,
  reactFlowInstance,
  shortcuts,
  onSaveWorkflow,
  onOpenFile,
  onUndo,
  onRedo,
  onSelectAll,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onRunWorkflow,
}: UseAppHotkeysProps) {
  const { toast } = useToast();

  const findShortcut = (id: string) => {
    return shortcuts.find(s => s.id === id)?.keys || "";
  };

  useHotkeys(
    findShortcut("save-workflow") || "ctrl+s,cmd+s",
    (e) => {
      e.preventDefault();
      if (currentWorkflow) {
        const flowData = reactFlowInstance.toObject();
        onSaveWorkflow(currentWorkflow.name, flowData);
      }
    },
    { enabled: HOTKEYS_ENABLED, enableOnFormTags: ["INPUT", "TEXTAREA"] }
  );

  useHotkeys(
    findShortcut("open-file") || "ctrl+o,cmd+o",
    (e) => {
      e.preventDefault();
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".ifc";
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          onOpenFile(file);
        }
      };
      input.click();
    },
    { enabled: HOTKEYS_ENABLED, enableOnFormTags: ["INPUT", "TEXTAREA"] }
  );

  useHotkeys(
    findShortcut("undo") || "ctrl+z,cmd+z",
    (e) => {
      if (!e.shiftKey) {
        e.preventDefault();
        onUndo();
      }
    },
    { enabled: HOTKEYS_ENABLED, enableOnFormTags: false }
  );

  useHotkeys(
    findShortcut("redo") || "ctrl+shift+z,cmd+shift+z,ctrl+y,cmd+y",
    (e) => {
      e.preventDefault();
      onRedo();
    },
    { enabled: HOTKEYS_ENABLED, enableOnFormTags: false }
  );

  useHotkeys(
    findShortcut("select-all") || "ctrl+a,cmd+a",
    (e) => {
      e.preventDefault();
      onSelectAll();
    },
    { enabled: HOTKEYS_ENABLED, enableOnFormTags: false }
  );

  useHotkeys(
    findShortcut("copy") || "ctrl+c,cmd+c",
    (e) => {
      const activeElement = document.activeElement;
      const isInFormField = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).isContentEditable
      );

      const selectedNodes = nodes.filter((node) => node.selected);

      if (!isInFormField && selectedNodes.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        onCopy();
      }
    },
    { enabled: HOTKEYS_ENABLED, enableOnFormTags: false }
  );

  useHotkeys(
    findShortcut("cut") || "ctrl+x,cmd+x",
    (e) => {
      const activeElement = document.activeElement;
      const isInFormField = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).isContentEditable
      );

      const selectedNodes = nodes.filter((node) => node.selected);

      if (!isInFormField && selectedNodes.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        onCut();
      }
    },
    { enabled: HOTKEYS_ENABLED, enableOnFormTags: false }
  );

  useHotkeys(
    findShortcut("paste") || "ctrl+v,cmd+v",
    (e) => {
      const activeElement = document.activeElement;
      const isInFormField = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).isContentEditable
      );

      if (!isInFormField && clipboard && clipboard.nodes.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        onPaste();
      }
    },
    { enabled: HOTKEYS_ENABLED, enableOnFormTags: false }
  );

  useHotkeys(
    "delete,backspace",
    (e) => {
      e.preventDefault();
      onDelete();
    },
    { enabled: HOTKEYS_ENABLED, enableOnFormTags: false }
  );

  useHotkeys(
    findShortcut("run-workflow") || "F5",
    (e) => {
      e.preventDefault();
      onRunWorkflow();
    },
    { enabled: HOTKEYS_ENABLED, enableOnFormTags: false }
  );
}

