import { nodeCategories } from "@/src/components/sidebar";

// Gets user-friendly node label from nodeCategories
export const getNodeLabel = (nodeId: string): string => {
  for (const category of nodeCategories) {
    const node = category.nodes.find(n => n.id === nodeId);
    if (node) {
      return node.label;
    }
  }
  throw new Error(`No label found for node type: ${nodeId}`);
};

