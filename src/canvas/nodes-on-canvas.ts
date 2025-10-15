import type { Node } from "reactflow";
import { createNode } from "./nodes/auto-registry";

const NODE_SPACING_X = 300;
const NODE_SPACING_Y = 150;
const START_X = 100;
const START_Y = 100;

export interface NodePlacementConfig {
  iteration: number;
  parameterIndex: number;
}

export interface MultiInputConfig {
  [handleId: string]: {
    label: string;
    position: "left" | "top";
  };
}

export class NodesOnCanvas {
  private iterationCount = 0;
  private parameterCount = 0;

  calculatePosition(config: NodePlacementConfig): { x: number; y: number } {
    return {
      x: START_X + config.iteration * NODE_SPACING_X,
      y: START_Y + config.parameterIndex * NODE_SPACING_Y,
    };
  }

  createNodeAtIteration(
    nodeType: string,
    iteration: number,
    parameterIndex: number = 0,
    additionalData?: Record<string, any>
  ): Node {
    const position = this.calculatePosition({ iteration, parameterIndex });
    return createNode(nodeType, position, additionalData);
  }

  createNodeWithAutoPosition(
    nodeType: string,
    additionalData?: Record<string, any>
  ): Node {
    const position = this.calculatePosition({
      iteration: this.iterationCount,
      parameterIndex: this.parameterCount,
    });

    this.iterationCount++;

    return createNode(nodeType, position, additionalData);
  }

  incrementParameterIndex(): void {
    this.parameterCount++;
  }

  resetParameterIndex(): void {
    this.parameterCount = 0;
  }

  advanceIteration(): void {
    this.iterationCount++;
    this.parameterCount = 0;
  }

  reset(): void {
    this.iterationCount = 0;
    this.parameterCount = 0;
  }

  getCurrentIteration(): number {
    return this.iterationCount;
  }

  getCurrentParameterIndex(): number {
    return this.parameterCount;
  }
}

export const nodesOnCanvas = new NodesOnCanvas();
