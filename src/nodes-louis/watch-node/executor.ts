import type { NodeProcessor, ProcessorContext, PropertyNodeElement } from '@/src/lib/workflow-executor';
import { safeStringify } from '@/src/lib/workflow-executor';

export class WatchNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    console.log("Processing watchNode", { node, inputValues });

    if (!inputValues || !inputValues.input) {
      console.log("No input provided to watch node");
      return null;
    }

    let processedData = inputValues.input;
    let inputType = "unknown";
    let itemCount = 0;

    if (Array.isArray(processedData)) {
      if (
        processedData.length > 0 &&
        processedData[0].type &&
        processedData[0].type.startsWith("Ifc") &&
        (processedData[0].geometry || processedData[0].properties?.hasSimplifiedGeometry)
      ) {
        console.log("Watch node received IFC elements with geometry:", processedData.length);

        const geometryTypes = processedData.reduce((types: any, el: any) => {
          types[el.type] = (types[el.type] || 0) + 1;
          return types;
        }, {});

        processedData = {
          elements: processedData,
          elementCount: processedData.length,
          geometryTypes,
          hasGeometry: true,
        };

        inputType = "geometryResult";
        itemCount = processedData.elements.length;
      } else {
        inputType = "array";
        itemCount = processedData.length;
      }
    } else if (processedData === null) {
      inputType = "null";
    } else if (processedData === undefined) {
      inputType = "undefined";
    } else if (typeof processedData === "object") {
      if (
        processedData.elements &&
        Array.isArray(processedData.elements) &&
        processedData.elements[0]?.propertyInfo
      ) {
        const elements: PropertyNodeElement[] = processedData.elements;
        const elementsWithProperty = elements.filter(
          (e: PropertyNodeElement) => e.propertyInfo?.exists
        );

        const firstProperty = elementsWithProperty[0]?.propertyInfo;

        if (firstProperty) {
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

          processedData = {
            propertyName: firstProperty.name,
            psetName: firstProperty.psetName,
            found: elementsWithProperty.length > 0,
            totalElements: elements.length,
            elementsWithProperty: elementsWithProperty.length,
            type: typeof firstProperty.value,
            uniqueValues,
            elements: elementsWithProperty.map((e: PropertyNodeElement) => ({
              id: e.id,
              expressId: e.expressId,
              type: e.type,
              GlobalId: e.properties?.GlobalId,
              Name: e.properties?.Name,
              value: e.propertyInfo?.value,
            })),
          };

          inputType = "propertyResults";
          itemCount = elementsWithProperty.length;
        }
      } else if (processedData.groups && typeof processedData.unit === 'string' && typeof processedData.total === 'number') {
        inputType = "quantityResults";
        itemCount = Object.keys(processedData.groups).length;
      } else if (processedData.elementSpaceMap && processedData.spaceElementsMap && processedData.summary) {
        inputType = "roomAssignment";
        itemCount = processedData.summary.totalSpaces || 0;
      } else if (processedData.spaces && processedData.totals && processedData.totals.totalArea !== undefined) {
        inputType = "spaceMetrics";
        itemCount = processedData.totals.spaceCount || 0;
      } else if (processedData.circulationArea !== undefined && processedData.programArea !== undefined && processedData.circulationRatio !== undefined) {
        inputType = "circulation";
        itemCount = (processedData.circulationSpaces || 0) + (processedData.programSpaces || 0);
      } else if (processedData.spaces && Array.isArray(processedData.spaces) && processedData.summary && processedData.summary.totalOccupancy !== undefined) {
        inputType = "occupancy";
        itemCount = processedData.spaces.length;
      } else {
        inputType = "object";
        itemCount = Object.keys(processedData).length;
      }
    } else {
      inputType = typeof processedData;
    }

    node.data.inputData = {
      type: inputType,
      value: processedData,
      count: itemCount,
    };

    return processedData;
  }
}

