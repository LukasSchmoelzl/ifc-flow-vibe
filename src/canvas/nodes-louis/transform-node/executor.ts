import type { NodeProcessor, ProcessorContext } from '@/src/canvas/workflow-executor';
// DEPRECATED: These functions were removed from ifc-utils
// import { ... } from '@/src/lib/ifc-utils';

export class TransformNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    if (!inputValues.input) {
      console.warn(`No input provided to transform node ${node.id}`);
      return [];
    }

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

    const elements = Array.isArray(inputValues.input) ? inputValues.input : inputValues.input.elements || [];
    const elementsWithRealGeometry = elements.filter((el: any) => el.hasRealGeometry);

    if (elementsWithRealGeometry.length > 0 && hasActiveModel()) {
      console.log(`Applying real-time transformation to ${elementsWithRealGeometry.length} elements in viewer`);

      const expressIds = elementsWithRealGeometry.map((el: any) => el.expressId);
      withActiveViewer(viewer => {
        viewer.applyTransform(expressIds, { translation, rotation, scale });
      });
    }

    return transformElements(inputValues.input, translation, rotation, scale);
  }
}

