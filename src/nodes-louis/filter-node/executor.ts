import type { NodeProcessor, ProcessorContext } from '@/src/lib/workflow-executor';

export class FilterNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    if (!inputValues.input) {
      console.warn(`No input provided to filter node ${node.id}`);
      return { itemIds: [], model: null };
    }

    const { model } = inputValues.input;
    
    if (!model) {
      console.warn(`No model in input for filter node ${node.id}`);
      return { itemIds: [], model: null };
    }

    const property = node.data.properties?.property || "";
    const operator = node.data.properties?.operator || "equals";
    const value = node.data.properties?.value || "";

    if (!property || !value) {
      console.warn(`Filter node ${node.id}: property or value not configured`);
      return { itemIds: [], model };
    }

    const allItemIds = await model.getItemsIdsWithGeometry();
    const itemsData = await model.getItemsData(allItemIds);

    const filteredIds = itemsData
      .filter((item: any) => {
        const propValue = this.getNestedProperty(item.attributes, property);
        if (propValue === undefined) return false;

        const stringValue = String(propValue);
        
        switch (operator) {
          case "equals":
            return stringValue === value;
          case "contains":
            return stringValue.includes(value);
          case "startsWith":
            return stringValue.startsWith(value);
          case "endsWith":
            return stringValue.endsWith(value);
          default:
            return false;
        }
      })
      .map((item: any) => item.localId);

    console.log(`Filter node ${node.id}: Filtered ${filteredIds.length} of ${allItemIds.length} items`);

    return {
      itemIds: filteredIds,
      model,
      file: inputValues.input.file,
      name: inputValues.input.name,
    };
  }

  private getNestedProperty(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (!current || current[part] === undefined) return undefined;
      current = current[part];
    }
    
    return current;
  }
}

