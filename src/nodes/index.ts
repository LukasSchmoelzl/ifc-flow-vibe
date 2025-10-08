import type { NodeTypes } from "reactflow"
import { IfcNode } from "./ifc-node/ifc-node"
import { TemplateNode } from "./template-node/template-node"
// import { GeometryNode } from "../nodes-louis/geometry-node/geometry-node"
// import { FilterNode } from "../nodes-louis/filter-node/filter-node"
// import { TransformNode } from "../nodes-louis/transform-node/transform-node"
// import { QuantityNode } from "../nodes-louis/quantity-node/quantity-node"
// import { PropertyNode } from "../nodes-louis/property-node/property-node"
// import { ClassificationNode } from "../nodes-louis/classification-node/classification-node"
// import { SpatialNode } from "../nodes-louis/spatial-node/spatial-node"
// import { ExportNode } from "../nodes-louis/export-node/export-node"
// import { RelationshipNode } from "../nodes-louis/relationship-node/relationship-node"
// import { AnalysisNode } from "../nodes-louis/analysis-node/analysis-node"
// import { WatchNode } from "../nodes-louis/watch-node/watch-node"
// import { ParameterNode } from "../nodes-louis/parameter-node/parameter-node"
// import { PythonNode } from "../nodes-louis/python-node/python-node"
// import { DataTransformNode } from "../nodes-louis/data-transform-node/data-transform-node"
// import { ClusterNode } from "../nodes-louis/cluster-node/cluster-node"

export const nodeTypes: NodeTypes = {
  ifcNode: IfcNode,
  templateNode: TemplateNode,
  // geometryNode: GeometryNode,
  // filterNode: FilterNode,
  // transformNode: TransformNode,
  // quantityNode: QuantityNode,
  // propertyNode: PropertyNode,
  // classificationNode: ClassificationNode,
  // spatialNode: SpatialNode,
  // exportNode: ExportNode,
  // relationshipNode: RelationshipNode,
  // analysisNode: AnalysisNode,
  // watchNode: WatchNode,
  // parameterNode: ParameterNode,
  // pythonNode: PythonNode,
  // dataTransformNode: DataTransformNode,
  // clusterNode: ClusterNode,
} as const

export {
  IfcNode,
  TemplateNode,
  // GeometryNode,
  // FilterNode,
  // TransformNode,
  // DataTransformNode,
  // QuantityNode,
  // PropertyNode,
  // ClassificationNode,
  // SpatialNode,
  // ExportNode,
  // RelationshipNode,
  // AnalysisNode,
  // WatchNode,
  // ParameterNode,
  // PythonNode,
  // ClusterNode,
}

