import type { NodeTypes } from "reactflow"
import { IfcNode } from "./ifc-node"
import { TemplateNode } from "./template-node"
import { InfoNode } from "./info-node"
import { FileManagerNode } from "./file-manager-node"

// Node types are already memoized in their respective files
// This object is created once at module load time
export const nodeTypes: NodeTypes = {
  ifcNode: IfcNode,
  templateNode: TemplateNode,
  infoNode: InfoNode,
  fileManagerNode: FileManagerNode,
} as const

export {
  IfcNode,
  TemplateNode,
  InfoNode,
  FileManagerNode,
}

