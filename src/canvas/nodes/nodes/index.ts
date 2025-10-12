import type { NodeTypes } from "reactflow"
import { IfcNode } from "./ifc-node"
import { TemplateNode } from "./template-node"
import { InfoNode } from "./info-node"

export const nodeTypes: NodeTypes = {
  ifcNode: IfcNode,
  templateNode: TemplateNode,
  infoNode: InfoNode,
} as const

export {
  IfcNode,
  TemplateNode,
  InfoNode,
}

