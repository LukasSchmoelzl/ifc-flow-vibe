import type { NodeProcessor, ProcessorContext } from '@/src/lib/workflow-executor/types';
import { buildClustersFromElements, type ClusterConfig } from '@/src/nodes/cluster-node/utils';
import { findUpstreamIfcNode } from '@/src/lib/workflow-executor/helpers';

export class ClusterNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    console.log("Processing clusterNode", { node, inputValues });

    if (!inputValues.input) {
      console.warn(`No input provided to cluster node ${node.id}`);
      return {
        clusters: [],
        totalElements: 0,
        error: "No input data"
      };
    }

    const elements = Array.isArray(inputValues.input) ? inputValues.input : inputValues.input.elements || [];
    const groupBy = node.data.properties?.groupBy || 'type';
    const property = node.data.properties?.property;
    const pset = node.data.properties?.pset;

    try {
      const config: ClusterConfig = {
        groupBy: groupBy as 'type' | 'level' | 'material' | 'property',
        property,
        pset
      };

      const clusterResult = buildClustersFromElements(elements, config);

      if (clusterResult) {
        let originalFile = null;

        if (inputValues.input?.file) {
          originalFile = inputValues.input.file;
        } else {
          const ifcNodeId = findUpstreamIfcNode(node.id, context.edges, context.nodes);
          if (ifcNodeId) {
            const ifcResult = context.nodeResults.get(ifcNodeId);
            if (ifcResult?.file) {
              originalFile = ifcResult.file;
            }
          }
        }

        const result = {
          clusters: clusterResult.clusters,
          config,
          stats: clusterResult.stats,
          totalElements: elements.length,
          elements: elements,
          file: originalFile
        };

        node.data.clusterResult = result;

        console.log(`Clustering completed: ${clusterResult.clusters.length} clusters from ${elements.length} elements`);
        return result;
      } else {
        return {
          clusters: [],
          totalElements: elements.length,
          error: "Failed to create clusters"
        };
      }
    } catch (error) {
      console.error(`Error during clustering for node ${node.id}:`, error);
      return {
        clusters: [],
        totalElements: elements.length,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

