// Helper function to safely convert values to JSON strings, avoiding cyclic references
export function safeStringify(value: any): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value !== "object") return String(value);

  const seen = new WeakSet();

  const replacer = (key: string, value: any) => {
    if (typeof value !== "object" || value === null) return value;

    if (seen.has(value)) {
      return "[Circular Reference]";
    }

    seen.add(value);
    return value;
  };

  try {
    return JSON.stringify(value, replacer);
  } catch (error) {
    console.warn("Error stringifying object:", error);
    return "[Complex Object]";
  }
}

// Topological sort for workflow execution order
export function topologicalSort(nodes: any[], edges: any[]): string[] {
  const graph: Record<string, string[]> = {};
  nodes.forEach((node) => {
    graph[node.id] = [];
  });

  edges.forEach((edge) => {
    if (graph[edge.source]) {
      graph[edge.source].push(edge.target);
    }
  });

  const visited = new Set<string>();
  const tempVisited = new Set<string>();
  const result: string[] = [];

  const visit = (nodeId: string) => {
    if (tempVisited.has(nodeId)) {
      throw new Error("Workflow contains a cycle, cannot execute");
    }

    if (!visited.has(nodeId)) {
      tempVisited.add(nodeId);

      if (graph[nodeId]) {
        for (const neighbor of graph[nodeId]) {
          visit(neighbor);
        }
      }

      tempVisited.delete(nodeId);
      visited.add(nodeId);
      result.unshift(nodeId);
    }
  };

  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      visit(node.id);
    }
  });

  return result;
}

// Find upstream IFC node
export function findUpstreamIfcNode(nodeId: string, edges: any[], nodes: any[]): string | null {
  const visited = new Set<string>();

  const checkUpstream = (currentNodeId: string): string | null => {
    if (visited.has(currentNodeId)) return null;
    visited.add(currentNodeId);

    const incomingEdges = edges.filter(edge => edge.target === currentNodeId);

    for (const edge of incomingEdges) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      if (!sourceNode) continue;

      if (sourceNode.type === "ifcNode") {
        return sourceNode.id;
      }

      const upstreamIfc = checkUpstream(edge.source);
      if (upstreamIfc) {
        return upstreamIfc;
      }
    }

    return null;
  };

  return checkUpstream(nodeId);
}

// Check if there's a downstream GLB export
export function hasDownstreamGLBExport(nodeId: string, edges: any[], nodes: any[]): boolean {
  const visited = new Set<string>();

  const checkDownstream = (currentNodeId: string): boolean => {
    if (visited.has(currentNodeId)) return false;
    visited.add(currentNodeId);

    const outgoingEdges = edges.filter(edge => edge.source === currentNodeId);

    for (const edge of outgoingEdges) {
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!targetNode) continue;

      if (targetNode.type === "exportNode" &&
        targetNode.data.properties?.format === "glb") {
        console.log(`Found downstream GLB export from geometry node ${nodeId}`);
        return true;
      }

      if (checkDownstream(edge.target)) {
        return true;
      }
    }

    return false;
  };

  return checkDownstream(nodeId);
}

// Check if there's a downstream viewer
export function hasDownstreamViewer(nodeId: string, edges: any[], nodes: any[]): boolean {
  const visited = new Set<string>();

  const checkDownstream = (currentNodeId: string): boolean => {
    if (visited.has(currentNodeId)) return false;
    visited.add(currentNodeId);

    const outgoingEdges = edges.filter(edge => edge.source === currentNodeId);

    for (const edge of outgoingEdges) {
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!targetNode) continue;

      if (checkDownstream(edge.target)) {
        return true;
      }
    }

    return false;
  };

  return checkDownstream(nodeId);
}

// Check if input data has geometry
export function checkIfInputHasGeometry(input: any): boolean {
  if (!input) return false;

  if (Array.isArray(input)) {
    return input.some((element: any) => element.geometry && element.geometry.vertices);
  }

  if (input.elements && Array.isArray(input.elements)) {
    return input.elements.some((element: any) => element.geometry && element.geometry.vertices);
  }

  return false;
}

