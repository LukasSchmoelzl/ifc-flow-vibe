import type { NodeProcessor } from "@/src/canvas/executor";
import type { ProcessorContext } from "@/src/canvas/executor";
import { transformDataForCompatibility } from "../data-compatibility";
import type { InfoViewerOutput } from "../shared-data-types";

export class InfoViewerNodeProcessor implements NodeProcessor {
  async process(
    node: any,
    inputValues: Record<string, any>,
    context: ProcessorContext
  ): Promise<Record<string, any>> {
    try {
      console.log('📥 InfoViewer: Received node:', node);
      console.log('📥 InfoViewer: Received inputValues:', inputValues);
      
      // Get project data from single input
      const projectData = inputValues.project_data;
      console.log('📊 InfoViewer: Project data:', projectData);
      console.log('📊 InfoViewer: Project data keys:', Object.keys(projectData || {}));
      console.log('📊 InfoViewer: Structure:', projectData?.structure);
      console.log('📊 InfoViewer: Metadata:', projectData?.metadata);
      console.log('📊 InfoViewer: Statistics:', projectData?.statistics);

      // Transform data for compatibility if needed
      const transformedData = transformDataForCompatibility(
        projectData,
        'ProjectInfoData', // Source data type
        'InfoViewerOutput' // Target data type
      );
      console.log('🔄 InfoViewer: Transformed data:', transformedData);

      // Data is automatically compatible - let the node handle it

      // Display any data generically
      let activeView = "Data Viewer";
      let displayType = 'generic';

      // Prepare InfoViewer output
      const infoViewerOutput: InfoViewerOutput = {
        timestamp: new Date().toISOString(),
        nodeId: context.nodes?.find(n => n.type === 'infoViewerNode')?.id || 'unknown',
        nodeType: 'infoViewerNode',
        success: !transformedData?.error,
        error: transformedData?.error,
        displayData: {
          type: displayType as any,
          content: transformedData,
          formatted: this.formatDataForDisplay(transformedData),
          metadata: {
            sourceNodeId: transformedData?.nodeId || 'unknown',
            sourceNodeType: transformedData?.nodeType || 'unknown',
            activeView,
            hasData: !!transformedData
          }
        },
        sourceNodeId: transformedData?.nodeId || 'unknown',
        sourceNodeType: transformedData?.nodeType || 'unknown'
      };

      const result = {
        displayed_info: infoViewerOutput,
        // Also set individual data for the UI
        projectData: transformedData,
        activeView,
        timestamp: infoViewerOutput.timestamp,
        hasData: !!transformedData
      };
      
      console.log('📤 InfoViewer: Returning result:', result);
      
      // Update node data to trigger UI re-render
      context.updateNodeData(node.id, {
        ...node.data,
        projectData: transformedData,
        activeView,
        timestamp: infoViewerOutput.timestamp,
        hasData: !!transformedData,
        isLoading: false,
        error: null
      });
      console.log('🔄 InfoViewer: Updated node data for UI');
      
      return result;

    } catch (error) {
      console.error(`❌ InfoViewer:`, error);
      throw new Error(`Failed to process info viewer data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  private formatDataForDisplay(data: any): string {
    if (!data) return 'No data available';
    
    // Generic formatting for any data type
    try {
      return JSON.stringify(data, null, 2).substring(0, 200) + '...';
    } catch {
      return String(data).substring(0, 200) + '...';
    }
  }
}
