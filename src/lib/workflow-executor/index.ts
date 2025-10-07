import {
  extractGeometry,
  filterElements,
  transformElements,
  extractQuantities,
  manageProperties,
  manageClassifications,
  spatialQuery,
  queryRelationships,
  exportData,
  downloadExportedFile,
  loadIfcFile,
  IfcModel,
  getLastLoadedModel,
  extractGeometryWithGeom,
  runPythonScript,
} from "@/src/lib/ifc-utils";
import { performAnalysis } from "@/src/nodes/analysis-node/utils";
import { withActiveViewer, hasActiveModel } from "@/src/nodes/viewer-node/manager";
import * as THREE from "three";
import { buildClusters, buildClustersFromElements, applyClusterColors, ClusterConfig, getClusterStats } from "@/src/nodes/cluster-node/utils";
import type { PropertyInfo, PropertyNodeElement, ProcessorContext } from "./types";
import { safeStringify, topologicalSort, findUpstreamIfcNode, hasDownstreamGLBExport, hasDownstreamViewer, checkIfInputHasGeometry } from "./helpers";
import { IfcNodeProcessor } from "@/src/nodes/ifc-node/processor";
import { FilterNodeProcessor } from "@/src/nodes/filter-node/processor";
import { ParameterNodeProcessor } from "@/src/nodes/parameter-node/processor";
import { GeometryNodeProcessor } from "@/src/nodes/geometry-node/processor";

// Node processor registry
const NODE_PROCESSORS = {
  ifcNode: new IfcNodeProcessor(),
  filterNode: new FilterNodeProcessor(),
  parameterNode: new ParameterNodeProcessor(),
  geometryNode: new GeometryNodeProcessor(),
} as const;

// TODO: error handling and progress tracking
export class WorkflowExecutor {
  private nodes: any[] = [];
  private edges: any[] = [];
  private nodeResults: Map<string, any> = new Map();
  private isRunning = false;
  private abortController: AbortController | null = null;
  private onNodeUpdate?: (nodeId: string, data: any) => void;

  constructor(nodes: any[], edges: any[], onNodeUpdate?: (nodeId: string, data: any) => void) {
    this.nodes = nodes;
    this.edges = edges;
    this.onNodeUpdate = onNodeUpdate;
  }

  // Add getter for the final nodes list
  public getUpdatedNodes(): any[] {
    return this.nodes;
  }

  public async execute(): Promise<Map<string, any>> {
    if (this.isRunning) {
      throw new Error("Workflow is already running");
    }

    this.isRunning = true;
    this.nodeResults.clear();
    this.abortController = new AbortController();

    try {
      console.log("Starting workflow execution...");

      const sortedNodes = topologicalSort(this.nodes, this.edges);

      for (const nodeId of sortedNodes) {
        console.log(`Processing node ${nodeId}`);
        await this.processNode(nodeId);
      }

      console.log("Workflow execution completed");
      return this.nodeResults;
    } catch (error) {
      console.error("Error executing workflow:", error);
      throw error;
    } finally {
      this.isRunning = false;
      this.abortController = null;
    }
  }

  public stop(): void {
    if (this.isRunning && this.abortController) {
      this.abortController.abort();
      this.isRunning = false;
    }
  }

  private findInputNodes(): string[] {
    const nodesWithIncomingEdges = new Set(
      this.edges.map((edge) => edge.target)
    );

    return this.nodes
      .filter((node) => !nodesWithIncomingEdges.has(node.id))
      .map((node) => node.id);
  }

  private async processNode(nodeId: string): Promise<any> {
    if (this.nodeResults.has(nodeId)) {
      return this.nodeResults.get(nodeId);
    }

    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found`);
    }

    const inputValues = await this.getInputValues(nodeId);

    // Create processor context
    const context: ProcessorContext = {
      nodeResults: this.nodeResults,
      edges: this.edges,
      nodes: this.nodes,
      updateNodeData: (nodeId: string, data: any) => this.updateNodeDataInList(nodeId, data),
    };

    // Try new processor system first
    const processor = NODE_PROCESSORS[node.type as keyof typeof NODE_PROCESSORS];
    let result = processor ? await processor.process(node, inputValues, context) : null;
    
    // Fallback to old switch-case for nodes not yet migrated
    if (result === null && !processor) {
      result = await this.processNodeLegacy(node, inputValues, nodeId);
    }

    this.nodeResults.set(nodeId, result);
    return result;
  }

  // Legacy processor for nodes not yet migrated
  private async processNodeLegacy(node: any, inputValues: any, nodeId: string): Promise<any> {
    let result;
    switch (node.type) {
      case "transformNode":
        // Transform elements
        if (!inputValues.input) {
          console.warn(`No input provided to transform node ${nodeId}`);
          result = [];
        } else {
          const translation: [number, number, number] = [
            Number.parseFloat(node.data.properties?.translateX || 0),
            Number.parseFloat(node.data.properties?.translateY || 0),
            Number.parseFloat(node.data.properties?.translateZ || 0),
          ];
          const rotation: [number, number, number] = [
            Number.parseFloat(node.data.properties?.rotateX || 0),
            Number.parseFloat(node.data.properties?.rotateY || 0),
            Number.parseFloat(node.data.properties?.rotateZ || 0),
          ];
          const scale: [number, number, number] = [
            Number.parseFloat(node.data.properties?.scaleX || 1),
            Number.parseFloat(node.data.properties?.scaleY || 1),
            Number.parseFloat(node.data.properties?.scaleZ || 1),
          ];

          // Check if we have elements with real geometry that can be transformed in viewer
          const elements = Array.isArray(inputValues.input) ? inputValues.input : inputValues.input.elements || [];
          const elementsWithRealGeometry = elements.filter((el: any) => el.hasRealGeometry);

          if (elementsWithRealGeometry.length > 0 && hasActiveModel()) {
            console.log(`Applying real-time transformation to ${elementsWithRealGeometry.length} elements in viewer`);

            // Apply transformation in viewer for elements with real geometry
            const expressIds = elementsWithRealGeometry.map((el: any) => el.expressId);
            withActiveViewer(viewer => {
              viewer.applyTransform(expressIds, { translation, rotation, scale });
            });
          }

          // Always update the element metadata (for downstream nodes and exports)
          result = transformElements(inputValues.input, translation, rotation, scale);
        }
        break;

      case "quantityNode":
        // Extract quantities via worker
        if (!inputValues.input) {
          console.warn(`No input provided to quantity node ${nodeId}`);
          // Return a properly structured empty result that the watchNode can display safely
          result = {
            groups: { "Error": 0 },
            unit: "",
            total: 0,
            error: "No input data available"
          };
        } else {
          // The input should be the IfcModel object from the previous node
          const modelInput = inputValues.input as IfcModel;

          // Validate input has necessary properties for the worker call
          if (!modelInput || !modelInput.elements || !modelInput.name) {
            console.error("Invalid input to quantityNode: Missing model, elements, or name.", modelInput);
            // Return a properly structured empty result with error message
            result = {
              groups: { "Invalid Model": 0 },
              unit: "",
              total: 0,
              error: "Invalid input model"
            };
          } else {
            try {
              // Get quantityType and groupBy from node properties with defaults
              const quantityType = node.data.properties?.quantityType || "area";
              const groupBy = node.data.properties?.groupBy || "none";
              const ignoreUnknownRefs = node.data.properties?.ignoreUnknownRefs || false;

              // Store the current settings back to the node data to ensure they persist
              // This is the key fix - we persist these values by updating the node data
              this.updateNodeDataInList(nodeId, {
                ...node.data,
                properties: {
                  ...node.data.properties,
                  quantityType: quantityType,
                  groupBy: groupBy,
                  ignoreUnknownRefs: ignoreUnknownRefs
                }
              });

              // Await the async call to the worker via extractQuantities
              result = await extractQuantities(
                modelInput, // Pass the full model object
                quantityType,
                groupBy,
                undefined, // Placeholder for onProgress callback (optional)
                // --- Pass the callback to update node data with messageId ---
                (messageId: string) => {
                  // Update the node data, but keep our property settings
                  this.updateNodeDataInList(nodeId, {
                    ...node.data,
                    messageId: messageId,
                    properties: {
                      ...node.data.properties,
                      quantityType: quantityType,
                      groupBy: groupBy,
                      ignoreUnknownRefs: ignoreUnknownRefs
                    }
                  });
                  console.log(`Stored messageId ${messageId} for quantity node ${nodeId}`);
                },
                // ---------------------------------------------------------
                ignoreUnknownRefs // Pass the ignore unknown references option
              );

              // Add the groupBy property to the result
              if (result && typeof result === 'object') {
                (result as any).groupBy = groupBy;
              }
            } catch (error) {
              console.error(`Error during quantity extraction for node ${nodeId}:`, error);
              // Return a properly structured error result that won't crash the UI
              result = {
                groups: { "Error": 0 },
                unit: "",
                total: 0,
                error: error instanceof Error ? error.message : String(error)
              };
            }
          }
        }
        break;

      case "propertyNode":
        // console.log("Processing propertyNode", { node, inputValues });

        // Add debugging to see the structure of the inputs
        if (!inputValues || !inputValues.input) {
          console.warn("No input provided to property node");
          result = { elements: [] };
          break;
        }

        // Determine if input is model object or elements array
        let nodeElements = [];

        if (Array.isArray(inputValues.input)) {
          nodeElements = inputValues.input;
          console.log(
            "Input is an array with",
            nodeElements.length,
            "elements"
          );
        } else if (inputValues.input && inputValues.input.elements) {
          nodeElements = inputValues.input.elements;
          console.log(
            "Input is a model object with",
            nodeElements.length,
            "elements"
          );
        } else {
          console.warn("Unexpected input format:", typeof inputValues.input);
          console.log("Input:", inputValues.input);
          result = { elements: [] };
          break;
        }

        // Always log the first element to understand structure
        if (nodeElements.length > 0) {
          console.log(
            "Sample element structure:",
            JSON.stringify(nodeElements[0], null, 2)
          );

          // Check if psets are available
          if (nodeElements[0].psets) {
            console.log(
              "Element has psets:",
              Object.keys(nodeElements[0].psets)
            );

            // Check for common wall psets
            if (nodeElements[0].psets["Pset_WallCommon"]) {
              console.log(
                "Pset_WallCommon:",
                nodeElements[0].psets["Pset_WallCommon"]
              );
            }
          }
        }

        // Extract properties from the node configuration
        const propertyName = node.data.properties?.propertyName || "";
        const action = node.data.properties?.action || "get";
        const propertyValue = node.data.properties?.propertyValue || "";
        const targetPset = node.data.properties?.targetPset || "any";

        // Determine where property values should come from
        let valueToUse = propertyValue;
        if (
          node.data.properties?.useValueInput &&
          inputValues.valueInput !== undefined
        ) {
          // Log the original input value for debugging
          // console.log("Using value from input:", inputValues.valueInput);

          // Handle different input types for valueInput
          const inputValue = inputValues.valueInput;

          // If it's a complex object, try to extract a usable value
          if (typeof inputValue === "object" && inputValue !== null) {
            // Check if it's a property node result (has elements with propertyInfo)
            if (
              inputValue.elements &&
              Array.isArray(inputValue.elements) &&
              inputValue.elements[0]?.propertyInfo
            ) {
              console.log("Input value is a property node result");

              // Extract values from the property node results
              // If there's only one unique value, use that
              if (
                inputValue.uniqueValues &&
                inputValue.uniqueValues.length === 1
              ) {
                valueToUse = inputValue.uniqueValues[0];
                console.log("Using single unique value:", valueToUse);
              }
              // If there are multiple unique values, use the value from the first matching element
              else if (
                inputValue.elements.length > 0 &&
                inputValue.elements[0].propertyInfo?.exists
              ) {
                valueToUse = inputValue.elements[0].propertyInfo.value;
                console.log(
                  "Using first element's property value:",
                  valueToUse
                );
              }
              // Fallback to the raw input if we couldn't extract a better value
              else {
                valueToUse = inputValue;
                console.log(
                  "Using complex object as value (might cause issues)"
                );
              }
            }
            // Otherwise just use the input value
            else {
              valueToUse = inputValue;
            }
          } else {
            // For primitive types, use directly
            valueToUse = inputValue;
          }
        }

        // console.log("Final value used for property:", valueToUse);

        // Manage properties using the utility function with options object
        const updatedElements = manageProperties(nodeElements, {
          action: action.toLowerCase(),
          propertyName,
          propertyValue: valueToUse,
          targetPset,
        });

        // Return the result with the updated elements
        result = { elements: updatedElements };

        // Also store the results in the node data for UI access
        node.data.results = updatedElements;
        break;

      case "watchNode":
        // Process data for watch node
        console.log("Processing watchNode", { node, inputValues });

        if (!inputValues || !inputValues.input) {
          console.log("No input provided to watch node");
          result = null;
          break;
        }

        let processedData = inputValues.input;

        // Get actual input type for display
        let inputType = "unknown";
        let itemCount = 0;

        if (Array.isArray(processedData)) {
          // Check if this is an array of IFC elements with geometry
          if (
            processedData.length > 0 &&
            processedData[0].type &&
            processedData[0].type.startsWith("Ifc") &&
            (processedData[0].geometry ||
              processedData[0].properties?.hasSimplifiedGeometry)
          ) {
            console.log(
              "Watch node received IFC elements with geometry:",
              processedData.length
            );

            // For geometry elements, create a more useful summary
            const geometryTypes = processedData.reduce((types, el) => {
              types[el.type] = (types[el.type] || 0) + 1;
              return types;
            }, {});

            // Process as a special geometry result
            processedData = {
              elements: processedData,
              elementCount: processedData.length,
              geometryTypes,
              hasGeometry: true,
            };

            inputType = "geometryResult";
            itemCount = processedData.elements.length;
          } else {
            // Regular array
            inputType = "array";
            itemCount = processedData.length;
          }
        } else if (processedData === null) {
          inputType = "null";
        } else if (processedData === undefined) {
          inputType = "undefined";
        } else if (typeof processedData === "object") {
          // Check if this is coming from a property node with propertyInfo
          if (
            processedData.elements &&
            Array.isArray(processedData.elements) &&
            processedData.elements[0]?.propertyInfo
          ) {
            // This is property node output - extract the relevant data
            const elements: PropertyNodeElement[] = processedData.elements;
            const elementsWithProperty = elements.filter(
              (e: PropertyNodeElement) => e.propertyInfo?.exists
            );

            // Get first element's property info to determine what we're dealing with
            const firstProperty = elementsWithProperty[0]?.propertyInfo;

            if (firstProperty) {
              // Find unique values
              const uniqueValues = [
                ...new Set(
                  elementsWithProperty
                    .map((e: PropertyNodeElement) => e.propertyInfo?.value)
                    .map((v: any) =>
                      typeof v === "object" ? safeStringify(v) : String(v)
                    )
                ),
              ].map((v: string) => {
                try {
                  return JSON.parse(v);
                } catch {
                  return v;
                }
              });

              // Create a more concise result focused on the property but including GlobalId for reference
              processedData = {
                propertyName: firstProperty.name,
                psetName: firstProperty.psetName,
                found: elementsWithProperty.length > 0,
                totalElements: elements.length,
                elementsWithProperty: elementsWithProperty.length,
                type: typeof firstProperty.value,
                uniqueValues,
                // Add element references with ids and GlobalIds
                elements: elementsWithProperty.map(
                  (e: PropertyNodeElement) => ({
                    id: e.id,
                    expressId: e.expressId,
                    type: e.type,
                    GlobalId: e.properties?.GlobalId,
                    Name: e.properties?.Name,
                    value: e.propertyInfo?.value,
                  })
                ),
              };

              inputType = "propertyResults";
              itemCount = elementsWithProperty.length;
            }
          }
          // ADD CHECK: Check if this is coming from a quantity node
          else if (processedData.groups && typeof processedData.unit === 'string' && typeof processedData.total === 'number') {
            inputType = "quantityResults";
            itemCount = Object.keys(processedData.groups).length; // Count the number of groups
          }
          // CHECK: Room assignment results
          else if (processedData.elementSpaceMap && processedData.spaceElementsMap && processedData.summary) {
            inputType = "roomAssignment";
            itemCount = processedData.summary.totalSpaces || 0;
          }
          // CHECK: Space metrics results
          else if (processedData.spaces && processedData.totals && processedData.totals.totalArea !== undefined) {
            inputType = "spaceMetrics";
            itemCount = processedData.totals.spaceCount || 0;
          }
          // CHECK: Circulation analysis results
          else if (processedData.circulationArea !== undefined && processedData.programArea !== undefined && processedData.circulationRatio !== undefined) {
            inputType = "circulation";
            itemCount = (processedData.circulationSpaces || 0) + (processedData.programSpaces || 0);
          }
          // CHECK: Occupancy analysis results
          else if (processedData.spaces && Array.isArray(processedData.spaces) && processedData.summary && processedData.summary.totalOccupancy !== undefined) {
            inputType = "occupancy";
            itemCount = processedData.spaces.length;
          }
          // Fallback for generic objects
          else {
            inputType = "object";
            itemCount = Object.keys(processedData).length;
          }
        } else {
          inputType = typeof processedData;
        }

        // Update the node data with input information for display
        node.data.inputData = {
          type: inputType,
          value: processedData,
          count: itemCount,
        };

        // Watch nodes don't change the data, just pass it through
        result = processedData;
        break;

      case "classificationNode":
        // Manage classifications
        if (!inputValues.input) {
          console.warn(`No input provided to classification node ${nodeId}`);
          result = [];
        } else {
          result = manageClassifications(
            inputValues.input,
            node.data.properties?.system || "uniclass",
            node.data.properties?.action || "get",
            node.data.properties?.code || ""
          );
        }
        break;

      case "spatialNode":
        // Spatial query
        if (!inputValues.input) {
          console.warn(`No input provided to spatial node ${nodeId}`);
          result = [];
        } else {
          result = spatialQuery(
            inputValues.input,
            inputValues.reference || [],
            node.data.properties?.queryType || "contained",
            Number.parseFloat(node.data.properties?.distance || 1.0)
          );
        }
        break;

      case "relationshipNode":
        // Relationship query
        if (!inputValues.input) {
          console.warn(`No input provided to relationship node ${nodeId}`);
          result = [];
        } else {
          result = queryRelationships(
            inputValues.input,
            node.data.properties?.relationType || "containment",
            node.data.properties?.direction || "outgoing"
          );
        }
        break;

      case "analysisNode":
        // Analysis - focused on space analysis
        console.log(`Processing analysis node ${nodeId}`, { inputValues, node });

        if (!inputValues.input) {
          console.warn(`No input provided to analysis node ${nodeId}. InputValues:`, inputValues);
          result = {
            error: "No input",
            message: "Please connect an IFC node to analyze spaces"
          };
        } else {
          // Get the source model for space analysis
          let sourceModel = null;

          // Try to find the model from the input chain
          if (inputValues.input && typeof inputValues.input === 'object') {
            // Check if input is a model object
            if (inputValues.input.file && inputValues.input.elements) {
              sourceModel = inputValues.input;
            }
            // Check if input has a model reference
            else if (inputValues.input.model) {
              sourceModel = inputValues.input.model;
            }
            // Check if input is an array of elements with model reference
            else if (Array.isArray(inputValues.input) && inputValues.input.length > 0 && inputValues.input[0]?.model) {
              sourceModel = inputValues.input[0].model;
            }
          }

          // Fallback to last loaded model if no model found in input chain
          if (!sourceModel) {
            sourceModel = getLastLoadedModel();
          }

          // Ensure input is in the right format (array of elements)
          let elementsToAnalyze = inputValues.input;
          if (!Array.isArray(elementsToAnalyze)) {
            if (elementsToAnalyze.elements) {
              elementsToAnalyze = elementsToAnalyze.elements;
            } else {
              elementsToAnalyze = [];
            }
          }

          // Update node to show loading state
          this.updateNodeDataInList(nodeId, {
            ...node.data,
            isLoading: true,
            error: null,
          });

          try {
            // Create progress callback to update node with live progress messages
            const onProgress = (message: string) => {
              // Get current progress messages or initialize empty array
              const currentMessages = node.data.progressMessages || [];

              // Add new message and keep only last 6 messages
              const updatedMessages = [...currentMessages, message].slice(-6);

              // Update node with new progress messages
              this.updateNodeDataInList(nodeId, {
                ...node.data,
                isLoading: true,
                progressMessages: updatedMessages,
                error: null,
              });
            };

            result = await performAnalysis(
              elementsToAnalyze,
              [], // No reference elements needed for space analysis
              "space", // Always space analysis for now
              {
                metric: node.data.properties?.metric || "room_assignment",
                model: sourceModel, // Pass the model for space analysis
              },
              onProgress // Pass the progress callback
            );

            // Update node with results
            this.updateNodeDataInList(nodeId, {
              ...node.data,
              isLoading: false,
              result: result,
              error: null,
              progressMessages: [], // Clear progress messages when complete
            });
          } catch (error) {
            // Update node with error
            this.updateNodeDataInList(nodeId, {
              ...node.data,
              isLoading: false,
              result: null,
              error: error instanceof Error ? error.message : String(error),
              progressMessages: [], // Clear progress messages on error
            });
            result = {
              error: error instanceof Error ? error.message : String(error),
              message: "Analysis failed"
            };
          }
        }
        break;

      case "pythonNode": {
        console.log("Processing pythonNode", { node, inputValues });

        // Python nodes can work with various input types
        // Try to get the model from the last loaded model if input is not a model
        let model: IfcModel | null = null;

        // Check if input is a model
        if (inputValues.input && inputValues.input.name && inputValues.input.elements) {
          model = inputValues.input as IfcModel;
        } else {
          // Input is not a model (could be analysis results, etc.)
          // Get the last loaded model for IFC context
          model = getLastLoadedModel();
          console.log(`Python node using last loaded model: ${model?.name}`);
        }

        this.updateNodeDataInList(nodeId, {
          ...node.data,
          isLoading: true,
          progress: { percentage: 5, message: "Running Python..." },
          error: null,
        });

        try {
          // Pass input data and properties to the Python script
          // Use model if available, otherwise pass null (worker will handle it)
          result = await runPythonScript(
            model || null,
            node.data.properties?.code || "# No code provided\nresult = None",
            (p, m) => {
              this.updateNodeDataInList(nodeId, {
                ...node.data,
                isLoading: true,
                progress: { percentage: p, message: m || "Processing" },
              });
            },
            inputValues.input, // Pass the input data
            node.data.properties // Pass the node properties
          );
          this.updateNodeDataInList(nodeId, {
            ...node.data,
            isLoading: false,
            progress: null,
            result,
          });
        } catch (err) {
          this.updateNodeDataInList(nodeId, {
            ...node.data,
            isLoading: false,
            progress: null,
            error: err instanceof Error ? err.message : String(err),
          });
          throw err;
        }
        break;
      }

      case "exportNode":
        // Export
        if (!inputValues.input) {
          console.warn(`No input provided to export node ${nodeId}`);
          result = "";
        } else {
          let exportInput = inputValues.input;
          const exportFormat = node.data.properties?.format || "csv";
          const exportFileName = node.data.properties?.fileName || "export";

          console.log(`Export node: format=${exportFormat}, fileName=${exportFileName}`);

          // Check if this is GLB export and we need to extract geometry
          if (exportFormat === "glb") {
            console.log("GLB export detected - checking if geometry extraction is needed");

            // Check if input has geometry data
            const hasGeometry = checkIfInputHasGeometry(exportInput);

            if (!hasGeometry) {
              console.log("No geometry found in input - extracting geometry for GLB export");

              // Extract geometry from the input model using GeometryNodeProcessor
              try {
                const { GeometryNodeProcessor } = await import('@/src/nodes/geometry-node/processor');
                const geometryProcessor = new GeometryNodeProcessor();
                exportInput = await geometryProcessor.extractForGLBExport(exportInput);
                console.log("Geometry extracted for GLB export:", exportInput?.length || 0, "elements");
              } catch (error) {
                console.error("Failed to extract geometry for GLB export:", error);
              }
            }
          }

          result = await exportData(
            exportInput,
            exportFormat,
            exportFileName
          );

          console.log(`Export result for format ${exportFormat}:`, typeof result,
            typeof result === 'string' ? result.length :
              result instanceof ArrayBuffer ? result.byteLength :
                result);

          // Only download directly for non-IFC formats
          // IFC format is handled by event listener
          if (
            result !== undefined &&
            exportFormat.toLowerCase() !== "ifc"
          ) {
            downloadExportedFile(
              result,
              exportFormat,
              exportFileName
            );
          }
        }
        break;

      case "clusterNode":
        // Clustering
        console.log("Processing clusterNode", { node, inputValues });

        if (!inputValues.input) {
          console.warn(`No input provided to cluster node ${nodeId}`);
          result = {
            clusters: [],
            totalElements: 0,
            error: "No input data"
          };
        } else {
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

            // Build clusters without requiring an active viewer
            const clusterResult = buildClustersFromElements(elements, config);

            if (clusterResult) {
              // Pass through the original file reference for downstream nodes (like viewer)
              // Need to trace back to find the original model with file reference
              let originalFile = null;

              // Check if input has file directly
              if (inputValues.input?.file) {
                originalFile = inputValues.input.file;
              }
              // Check if we need to trace back through the workflow to find the original model
              else {
                // Find the IFC node that started this chain
                const ifcNodeId = findUpstreamIfcNode(nodeId, this.edges, this.nodes);
                if (ifcNodeId) {
                  const ifcResult = this.nodeResults.get(ifcNodeId);
                  if (ifcResult?.file) {
                    originalFile = ifcResult.file;
                  }
                }
              }

              result = {
                clusters: clusterResult.clusters,
                config,
                stats: clusterResult.stats,
                totalElements: elements.length,
                elements: elements, // Pass through elements for downstream processing
                file: originalFile  // Pass through file reference for viewer nodes
              };

              // Store in node data for UI access
              node.data.clusterResult = result;

              console.log(`Clustering completed: ${clusterResult.clusters.length} clusters from ${elements.length} elements`);
            } else {
              result = {
                clusters: [],
                totalElements: elements.length,
                error: "Failed to create clusters"
              };
            }
          } catch (error) {
            console.error(`Error during clustering for node ${nodeId}:`, error);
            result = {
              clusters: [],
              totalElements: elements.length,
              error: error instanceof Error ? error.message : String(error)
            };
          }
        }
        break;

      case "dataTransformNode":
        // Data Transform
        // console.log("Processing dataTransformNode", { node, inputValues });

        if (!inputValues.input) {
          console.log("No input provided to data transform node");
          result = null;
          break;
        }

        try {
          const { executeTransformPipeline } = await import('../../nodes/data-transform-node/utils');

          const steps = node.data.properties?.steps || [];
          const restrictToIncomingElements = node.data.properties?.restrictToIncomingElements || false;

          const transformResult = executeTransformPipeline(steps, {
            input: inputValues.input,
            inputB: inputValues.inputB,
            restrictToIncomingElements,
          });

          result = transformResult.data;

          // Store preview information for the UI
          node.data.preview = {
            inputCount: transformResult.metadata.inputCount,
            outputCount: transformResult.metadata.outputCount,
            sampleOutput: Array.isArray(result) ? result.slice(0, 3) :
              (result && typeof result === 'object' && result.mappings) ?
                Object.entries(result.mappings).slice(0, 3) : [],
            warnings: transformResult.metadata.warnings,
          };

          // Store results for UI access
          node.data.results = result;

          // console.log("Data transform completed", {
          //   inputCount: transformResult.metadata.inputCount,
          //   outputCount: transformResult.metadata.outputCount,
          //   warnings: transformResult.metadata.warnings,
          // });

        } catch (error) {
          console.error("Data transform error:", error);
          result = null;
          node.data.preview = {
            inputCount: 0,
            outputCount: 0,
            sampleOutput: [],
            warnings: [`Transform failed: ${error instanceof Error ? error.message : String(error)}`],
          };
        }
        break;

      default:
        result = null;
    }

    // Cache the result
    this.nodeResults.set(nodeId, result);
    return result;
  }

  private async getInputValues(nodeId: string): Promise<Record<string, any>> {
    const inputEdges = this.edges.filter((edge) => edge.target === nodeId);
    const inputValues: Record<string, any> = {};

    for (const edge of inputEdges) {
      // Process the source node to get its output
      const sourceResult = await this.processNode(edge.source);

      // Map the output to the correct input based on the target handle
      if (edge.targetHandle === "input") {
        inputValues.input = sourceResult;
      } else if (edge.targetHandle === "reference") {
        inputValues.reference = sourceResult;
      } else if (edge.targetHandle === "valueInput") {
        inputValues.valueInput = sourceResult;
      } else {
        // Default case
        inputValues[edge.targetHandle || "input"] = sourceResult;
      }
    }

    return inputValues;
  }

  // Helper to update node data in the internal list
  private updateNodeDataInList(nodeId: string, newData: any) {
    this.nodes = this.nodes.map((n) =>
      n.id === nodeId ? { ...n, data: newData } : n
    );

    // Call the real-time update callback if provided
    if (this.onNodeUpdate) {
      this.onNodeUpdate(nodeId, newData);
    }
  }

}
