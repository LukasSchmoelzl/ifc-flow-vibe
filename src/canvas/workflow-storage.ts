// Constants
const THUMBNAIL_WIDTH = 300;
const THUMBNAIL_HEIGHT = 200;

export interface Workflow {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  thumbnail?: string;
  flowData: any;
}

// Check if localStorage is available (not available during SSR)
const isLocalStorageAvailable = () => {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = 'test-localStorage';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Storage service for workflows
export class WorkflowStorage {
  private storageKey = "ifcflow-workflows";

  // Get all workflows
  getWorkflows(): Workflow[] {
    if (!isLocalStorageAvailable()) {
      throw new Error("localStorage not available");
    }
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  // Get a single workflow by ID
  getWorkflow(id: string): Workflow | null {
    const workflows = this.getWorkflows();
    return workflows.find((workflow) => workflow.id === id) || null;
  }

  // Save a workflow
  saveWorkflow(workflow: Workflow): Workflow {
    if (!isLocalStorageAvailable()) {
      throw new Error("localStorage not available");
    }

    const cleanedWorkflow = {
      ...workflow,
      flowData: cleanWorkflowData(workflow.flowData)
    };

    const workflows = this.getWorkflows();
    const existingIndex = workflows.findIndex((w) => w.id === cleanedWorkflow.id);

    if (existingIndex >= 0) {
      // Update existing workflow
      workflows[existingIndex] = {
        ...cleanedWorkflow,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new workflow
      workflows.push({
        ...cleanedWorkflow,
        id: cleanedWorkflow.id || crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    localStorage.setItem(this.storageKey, JSON.stringify(workflows));
    return cleanedWorkflow;
  }

  // Delete a workflow
  deleteWorkflow(id: string): boolean {
    if (!isLocalStorageAvailable()) {
      throw new Error("localStorage not available");
    }

    const workflows = this.getWorkflows();
    const filteredWorkflows = workflows.filter(
      (workflow) => workflow.id !== id
    );

    if (filteredWorkflows.length !== workflows.length) {
      localStorage.setItem(this.storageKey, JSON.stringify(filteredWorkflows));
      return true;
    }

    return false;
  }

  // Generate a thumbnail from flow data (client-only, renders offscreen ReactFlow)
  async generateThumbnail(flowData: any): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('Thumbnail generation requires browser environment');
    }

    const hasNodes = Array.isArray(flowData?.nodes) && flowData.nodes.length > 0;
    if (!hasNodes) {
      throw new Error('No nodes in workflow to generate thumbnail');
    }

    const [{ toPng }, React, ReactDOMClient, ReactFlowModule, nodesModule] = await Promise.all([
      import('html-to-image'),
      import('react'),
      import('react-dom/client'),
      import('reactflow'),
      import('@/src/canvas/nodes/nodes'),
    ]);

    const nodeTypes = (nodesModule as any).nodeTypes || undefined;
    const ReactFlowComponent = (ReactFlowModule as any).default;
    const Background = (ReactFlowModule as any).Background;
    const ReactFlowProvider = (ReactFlowModule as any).ReactFlowProvider;

    const thumbnailNodes = (flowData.nodes as any[]).map((n: any) => ({
      id: n.id,
      type: 'default',
      position: n.position,
      style: { width: 140, height: 44 },
      data: { label: n.data?.label ?? n.type ?? 'Node' },
    }));
    
    const hasEdges = Array.isArray(flowData?.edges);
    const thumbnailEdges = (hasEdges ? flowData.edges : []).map((e: any, idx: number) => ({
      id: e.id ?? `e-${idx}`,
      source: e.source,
      target: e.target,
      label: e.label,
      type: e.type,
    }));

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-10000px';
    container.style.left = '-10000px';
    container.style.width = `${THUMBNAIL_WIDTH}px`;
    container.style.height = `${THUMBNAIL_HEIGHT}px`;
    container.style.pointerEvents = 'none';
    container.style.background = 'white';
    document.body.appendChild(container);

    const root = (ReactDOMClient as any).createRoot(container);

    const onInit = (instance: any) => {
      if (flowData?.viewport) {
        instance.setViewport?.(flowData.viewport);
      } else {
        instance.fitView?.({ padding: 0.15, duration: 0 });
      }
    };

    let computedViewport: { x: number; y: number; zoom: number } | undefined;
    if (!flowData?.viewport && thumbnailNodes.length > 0) {
      const padding = 16;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const n of thumbnailNodes as any[]) {
        const w = n.style?.width ?? 140;
        const h = n.style?.height ?? 44;
        const x1 = n.position?.x ?? 0;
        const y1 = n.position?.y ?? 0;
        const x2 = x1 + w;
        const y2 = y1 + h;
        if (x1 < minX) minX = x1;
        if (y1 < minY) minY = y1;
        if (x2 > maxX) maxX = x2;
        if (y2 > maxY) maxY = y2;
      }
      const contentW = Math.max(1, maxX - minX);
      const contentH = Math.max(1, maxY - minY);
      const scaleX = THUMBNAIL_WIDTH / (contentW + padding * 2);
      const scaleY = THUMBNAIL_HEIGHT / (contentH + padding * 2);
      const zoom = Math.max(0.1, Math.min(2, Math.min(scaleX, scaleY)));
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const x = (THUMBNAIL_WIDTH / 2) - centerX * zoom;
      const y = (THUMBNAIL_HEIGHT / 2) - centerY * zoom;
      computedViewport = { x, y, zoom };
    }

    root.render(
      React.createElement(
        ReactFlowProvider,
        null,
        React.createElement(
          ReactFlowComponent,
          {
            nodes: thumbnailNodes,
            edges: thumbnailEdges,
            nodeTypes,
            fitView: !(flowData?.viewport || computedViewport),
            defaultViewport: flowData?.viewport || computedViewport,
            minZoom: 0.1,
            maxZoom: 2,
            nodesDraggable: false,
            nodesConnectable: false,
            elementsSelectable: false,
            panOnDrag: false,
            panOnScroll: false,
            zoomOnScroll: false,
            zoomOnPinch: false,
            zoomOnDoubleClick: false,
            onInit,
            proOptions: { hideAttribution: true },
            style: { width: `${THUMBNAIL_WIDTH}px`, height: `${THUMBNAIL_HEIGHT}px`, background: 'white' },
          },
          React.createElement(Background, { color: '#e5e7eb', gap: 12 })
        )
      )
    );

    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    const dataUrl = await toPng(container, {
      cacheBust: true,
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      style: { background: 'white' },
    });

    root.unmount();
    document.body.removeChild(container);

    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image') && dataUrl.length > 1000) {
      return dataUrl;
    }

    throw new Error('Thumbnail generation produced invalid image data');
  }

  // Export workflow to file
  exportWorkflow(workflow: Workflow): void {
    if (typeof window === 'undefined') {
      throw new Error("Cannot export workflow in server-side context");
    }

    const cleanedWorkflow = {
      ...workflow,
      flowData: cleanWorkflowData(workflow.flowData)
    };

    const json = JSON.stringify(cleanedWorkflow, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflow.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import workflow from file
  async importWorkflow(file: File): Promise<Workflow> {
    if (!isLocalStorageAvailable()) {
      return Promise.reject(new Error("localStorage not available"));
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          if (!event.target) {
            reject(new Error("Error reading file: No data received"));
            return;
          }

          const workflow = JSON.parse(
            event.target.result as string
          ) as Workflow;
          // Update timestamps
          workflow.updatedAt = new Date().toISOString();
          // Save to storage
          this.saveWorkflow(workflow);
          resolve(workflow);
        } catch (error) {
          reject(new Error("Invalid workflow file"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsText(file);
    });
  }
}

// Clean workflow data before saving - removes IFC model data and other heavy data from nodes
export function cleanWorkflowData(flowData: any): any {
  if (!flowData) return flowData;

  // Create a deep copy to avoid mutating the original
  const cleanedData = JSON.parse(JSON.stringify(flowData));

  // Clean nodes if they exist
  if (cleanedData.nodes && Array.isArray(cleanedData.nodes)) {
    cleanedData.nodes = cleanedData.nodes.map((node: any) => {
      // Create a clean copy of the node
      const cleanNode = { ...node };

      // Clean the node data
      if (cleanNode.data) {
        const cleanData = { ...cleanNode.data };

        // For IFC nodes, remove the actual model data
        if (node.type === 'ifcNode') {
          // Remove heavy data properties
          delete cleanData.model;
          delete cleanData.modelInfo;
          delete cleanData.file;
          delete cleanData.fileHandle;
          delete cleanData.modelState;
          delete cleanData.elements;

          // Keep only essential properties for restoration
          cleanData.isEmptyNode = true; // Mark as empty for loading
          if (cleanData.properties?.filename) {
            cleanData.fileName = cleanData.properties.filename; // Preserve filename for reference
          }
        }

        // For other nodes that might have cached IFC data
        if (cleanData.modelInfo) {
          delete cleanData.modelInfo;
        }
        if (cleanData.inputData?.value && cleanData.inputData.type === 'ifcModel') {
          // Clear the actual model data but keep the type info
          cleanData.inputData = {
            ...cleanData.inputData,
            value: null,
            isCleared: true
          };
        }

        // Remove any execution results or temporary data
        delete cleanData.executionResult;
        delete cleanData.error;
        delete cleanData.isLoading;
        delete cleanData.progress;

        cleanNode.data = cleanData;
      }

      return cleanNode;
    });
  }

  return cleanedData;
}

// Create a singleton instance
export const workflowStorage = new WorkflowStorage();
