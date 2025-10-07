import type { NodeTypes } from "reactflow"
import { IfcNode } from "./ifc-node/ifc-node"
import { GeometryNode } from "./geometry-node/geometry-node"
import { FilterNode } from "./filter-node/filter-node"
import { TransformNode } from "./transform-node/transform-node"
import { ViewerNode } from "./viewer-node/viewer-node"
import { QuantityNode } from "./quantity-node/quantity-node"
import { PropertyNode } from "./property-node/property-node"
import { ClassificationNode } from "./classification-node/classification-node"
import { SpatialNode } from "./spatial-node/spatial-node"
import { ExportNode } from "./export-node/export-node"
import { RelationshipNode } from "./relationship-node/relationship-node"
import { AnalysisNode } from "./analysis-node/analysis-node"
import { WatchNode } from "./watch-node/watch-node"
import { ParameterNode } from "./parameter-node/parameter-node"
import { PythonNode } from "./python-node/python-node"
import { DataTransformNode } from "./data-transform-node/data-transform-node"
import { ClusterNode } from "./cluster-node/cluster-node"
import { AiNode } from "./ai-node/ai-node"

// Define custom node types as a constant to prevent React Flow warning
export const nodeTypes: NodeTypes = {
  ifcNode: IfcNode,
  geometryNode: GeometryNode,
  filterNode: FilterNode,
  transformNode: TransformNode,
  viewerNode: ViewerNode,
  quantityNode: QuantityNode,
  propertyNode: PropertyNode,
  classificationNode: ClassificationNode,
  spatialNode: SpatialNode,
  exportNode: ExportNode,
  relationshipNode: RelationshipNode,
  analysisNode: AnalysisNode,
  watchNode: WatchNode,
  parameterNode: ParameterNode,
  pythonNode: PythonNode,
  dataTransformNode: DataTransformNode,
  clusterNode: ClusterNode,
  aiNode: AiNode,
} as const

export {
  IfcNode,
  GeometryNode,
  FilterNode,
  TransformNode,
  ViewerNode,
  DataTransformNode,
  QuantityNode,
  PropertyNode,
  ClassificationNode,
  SpatialNode,
  ExportNode,
  RelationshipNode,
  AnalysisNode,
  WatchNode,
  ParameterNode,
  PythonNode,
  ClusterNode,
  AiNode,
}

