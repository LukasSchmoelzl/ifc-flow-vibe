"use client";

import { X } from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { ScrollArea } from "@/src/shared/components/ui/scroll-area";
import { Node as ReactFlowNode } from "reactflow";

interface Node extends ReactFlowNode {
  data: {
    label: string;
    properties?: Record<string, any>;
  };
}

interface PropertiesPanelProps {
  node: Node | null;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>;
}

export function PropertiesPanel({
  node,
  setNodes,
  setSelectedNode,
}: PropertiesPanelProps) {
  if (!node) return null;

  return (
    <div className="w-80 border-l bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">Properties: {node.data.label}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedNode(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nodeName">Node Name</Label>
              <Input
                id="nodeName"
                value={node.data.label}
                onChange={(e) => {
                  setNodes((nds) =>
                    nds.map((n) => {
                      if (n.id === node.id) {
                        return {
                          ...n,
                          data: {
                            ...n.data,
                            label: e.target.value,
                          },
                        };
                      }
                      return n;
                    })
                  );
                }}
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
