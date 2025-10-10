import type { NodeTypes } from "reactflow"
import { IfcNode } from "./ifc-node"
import { TemplateNode } from "./template-node"

export const nodeTypes: NodeTypes = {
  ifcNode: IfcNode,
  templateNode: TemplateNode,
} as const

export {
  IfcNode,
  TemplateNode,
}

