import type { Node } from "reactflow";
import { nodeCategories } from "@/src/components/sidebar";

/**
 * Generates a unique node ID
 */
export const generateNodeId = (): string => {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Gets user-friendly node label from nodeCategories
 */
export const getNodeLabel = (nodeId: string): string => {
  for (const category of nodeCategories) {
    const node = category.nodes.find(n => n.id === nodeId);
    if (node) {
      return node.label;
    }
  }
  return nodeId; // fallback to ID if not found
};

/**
 * Creates a new node with default properties
 */
export const createNode = (
  type: string,
  position: { x: number; y: number },
  additionalData?: Record<string, any>
): Node => {
  return {
    id: generateNodeId(),
    type,
    position,
    data: {
      label: getNodeLabel(type),
      ...additionalData,
    },
  };
};

/**
 * Creates an IFC file node (used by File > Open menu)
 */
export const createIfcNode = (
  position: { x: number; y: number },
  file: File,
  _legacyFileHandle?: any // Keep for backwards compatibility but ignore
): Node => {
  return {
    id: generateNodeId(),
    type: "ifcNode",
    position,
    data: {
      label: "IFC File",
      file: file, // Store the File object directly for new Fragments-based system
      fileName: file.name, // Keep for UI display
    },
  };
};

/**
 * Helper function to load viewer settings from localStorage
 */
export const loadViewerSetting = (
  key: 'showGrid' | 'showMinimap',
  defaultValue: boolean
): boolean => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('app-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.viewer?.[key] ?? defaultValue;
      }
    } catch (e) {
      console.error(`Error loading ${key} setting:`, e);
    }
  }
  return defaultValue;
};

