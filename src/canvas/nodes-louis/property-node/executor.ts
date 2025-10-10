import type { NodeProcessor, ProcessorContext } from '@/src/canvas/workflow-executor';
// DEPRECATED: These functions were removed from ifc-utils
// import { ... } from '@/src/lib/ifc-utils';

export class PropertyNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    if (!inputValues || !inputValues.input) {
      console.warn("No input provided to property node");
      return { elements: [] };
    }

    let nodeElements: any[] = [];

    if (Array.isArray(inputValues.input)) {
      nodeElements = inputValues.input;
      console.log("Input is an array with", nodeElements.length, "elements");
    } else if (inputValues.input && inputValues.input.elements) {
      nodeElements = inputValues.input.elements;
      console.log("Input is a model object with", nodeElements.length, "elements");
    } else {
      console.warn("Unexpected input format:", typeof inputValues.input);
      console.log("Input:", inputValues.input);
      return { elements: [] };
    }

    if (nodeElements.length > 0) {
      console.log("Sample element structure:", JSON.stringify(nodeElements[0], null, 2));

      if (nodeElements[0].psets) {
        console.log("Element has psets:", Object.keys(nodeElements[0].psets));

        if (nodeElements[0].psets["Pset_WallCommon"]) {
          console.log("Pset_WallCommon:", nodeElements[0].psets["Pset_WallCommon"]);
        }
      }
    }

    const propertyName = node.data.properties?.propertyName || "";
    const action = node.data.properties?.action || "get";
    const propertyValue = node.data.properties?.propertyValue || "";
    const targetPset = node.data.properties?.targetPset || "any";

    let valueToUse = propertyValue;
    if (node.data.properties?.useValueInput && inputValues.valueInput !== undefined) {
      const inputValue = inputValues.valueInput;

      if (typeof inputValue === "object" && inputValue !== null) {
        if (inputValue.elements && Array.isArray(inputValue.elements) && inputValue.elements[0]?.propertyInfo) {
          console.log("Input value is a property node result");

          if (inputValue.uniqueValues && inputValue.uniqueValues.length === 1) {
            valueToUse = inputValue.uniqueValues[0];
            console.log("Using single unique value:", valueToUse);
          } else if (inputValue.elements.length > 0 && inputValue.elements[0].propertyInfo?.exists) {
            valueToUse = inputValue.elements[0].propertyInfo.value;
            console.log("Using first element's property value:", valueToUse);
          } else {
            valueToUse = inputValue;
            console.log("Using complex object as value (might cause issues)");
          }
        } else {
          valueToUse = inputValue;
        }
      } else {
        valueToUse = inputValue;
      }
    }

    const updatedElements = manageProperties(nodeElements, {
      action: action.toLowerCase(),
      propertyName,
      propertyValue: valueToUse,
      targetPset,
    });

    node.data.results = updatedElements;
    return { elements: updatedElements };
  }
}

