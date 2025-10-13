"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Node, Edge, ReactFlowInstance } from "reactflow";
import type { Workflow } from "../workflow/storage";

// Constants
const MAX_HISTORY_LENGTH = 50;

// Types
interface HistoryItem {
  nodes: Node[];
  edges: Edge[];
}

interface CanvasState {
  // Flow state
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  focusedViewerId: string | null;
  reactFlowWrapper: React.RefObject<HTMLDivElement> | null;
  reactFlowInstance: ReactFlowInstance | null;

  // Workflow state
  currentWorkflow: Workflow | null;
  isRunning: boolean;

  // Clipboard state
  clipboard: { nodes: Node[]; edges: Edge[] } | null;

  // UI state
  isFileDragging: boolean;
  isNodeDragging: boolean;
  placementMode: boolean;
  selectedNodeType: string | null;
  showGrid: boolean;
  showMinimap: boolean;
  isSettingsLoaded: boolean;
  isMobile: boolean;

  // History state
  history: HistoryItem[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
}

interface CanvasActions {
  // Flow actions
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  setSelectedNode: (node: Node | null) => void;
  setFocusedViewerId: (id: string | null) => void;
  setReactFlowWrapper: (ref: React.RefObject<HTMLDivElement> | null) => void;
  setReactFlowInstance: (instance: ReactFlowInstance | null) => void;

  // Workflow actions
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  setIsRunning: (isRunning: boolean) => void;

  // Clipboard actions
  setClipboard: (clipboard: { nodes: Node[]; edges: Edge[] } | null) => void;

  // UI actions
  setIsFileDragging: (isDragging: boolean) => void;
  setIsNodeDragging: (isDragging: boolean) => void;
  setPlacementMode: (mode: boolean) => void;
  setSelectedNodeType: (type: string | null) => void;
  setShowGrid: (show: boolean) => void;
  setShowMinimap: (show: boolean) => void;
  setIsSettingsLoaded: (loaded: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;

  // History actions
  addToHistory: (nodes: Node[], edges: Edge[]) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

type CanvasStore = CanvasState & CanvasActions;

// Create store with devtools
export const useCanvasStore = create<CanvasStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      nodes: [],
      edges: [],
              selectedNode: null,
              focusedViewerId: null,
      reactFlowWrapper: null,
      reactFlowInstance: null,
      currentWorkflow: null,
      isRunning: false,
      clipboard: null,
      isFileDragging: false,
      isNodeDragging: false,
      placementMode: false,
      selectedNodeType: null,
      showGrid: true,
      showMinimap: false,
      isSettingsLoaded: false,
      isMobile: false,
      history: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false,

      // Flow actions
      setNodes: (nodesOrFn) => {
        set((state) => ({
          nodes: typeof nodesOrFn === "function" ? nodesOrFn(state.nodes) : nodesOrFn,
        }));
      },

      setEdges: (edgesOrFn) => {
        set((state) => ({
          edges: typeof edgesOrFn === "function" ? edgesOrFn(state.edges) : edgesOrFn,
        }));
      },

              setSelectedNode: (node) => set({ selectedNode: node }),
              setFocusedViewerId: (id) => set({ focusedViewerId: id }),
      setReactFlowWrapper: (ref) => set({ reactFlowWrapper: ref }),
      setReactFlowInstance: (instance) => set({ reactFlowInstance: instance }),

      // Workflow actions
      setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),
      setIsRunning: (isRunning) => set({ isRunning }),

      // Clipboard actions
      setClipboard: (clipboard) => set({ clipboard }),

      // UI actions
      setIsFileDragging: (isDragging) => set({ isFileDragging: isDragging }),
      setIsNodeDragging: (isDragging) => set({ isNodeDragging: isDragging }),
      setPlacementMode: (mode) => set({ placementMode: mode }),
      setSelectedNodeType: (type) => set({ selectedNodeType: type }),
      setShowGrid: (show) => set({ showGrid: show }),
      setShowMinimap: (show) => set({ showMinimap: show }),
      setIsSettingsLoaded: (loaded) => set({ isSettingsLoaded: loaded }),
      setIsMobile: (isMobile) => set({ isMobile }),

      // History actions
      addToHistory: (nodes, edges) => {
        const { history, historyIndex } = get();
        const newHistoryItem = { nodes, edges };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newHistoryItem);

        if (newHistory.length > MAX_HISTORY_LENGTH) {
          newHistory.shift();
          set({
            history: newHistory,
            canUndo: true,
            canRedo: false,
          });
        } else {
          set({
            history: newHistory,
            historyIndex: historyIndex + 1,
            canUndo: true,
            canRedo: false,
          });
        }
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex <= 0) return;

        const previousState = history[historyIndex - 1];
        set({
          nodes: previousState.nodes,
          edges: previousState.edges,
          historyIndex: historyIndex - 1,
          canUndo: historyIndex - 1 > 0,
          canRedo: true,
        });
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;

        const nextState = history[historyIndex + 1];
        set({
          nodes: nextState.nodes,
          edges: nextState.edges,
          historyIndex: historyIndex + 1,
          canUndo: true,
          canRedo: historyIndex + 1 < history.length - 1,
        });
      },

      clearHistory: () =>
        set({
          history: [],
          historyIndex: -1,
          canUndo: false,
          canRedo: false,
        }),
    }),
    { name: "CanvasStore" }
  )
);

