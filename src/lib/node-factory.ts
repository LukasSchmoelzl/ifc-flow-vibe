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
      ...(type === 'dataTransformNode' && {
        properties: {
          mode: 'steps',
          steps: [],
          restrictToIncomingElements: false,
        }
      }),
      ...additionalData,
    },
  };
};

/**
 * Creates an IFC file node
 */
export const createIfcNode = (
  position: { x: number; y: number },
  file: File,
  fileHandle: any
): Node => {
  return {
    id: generateNodeId(),
    type: "ifcNode",
    position,
    data: {
      fileName: file.name,
      fileSize: file.size,
      fileHandle: fileHandle,
      modelState: null,
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

