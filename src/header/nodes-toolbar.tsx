"use client";

import { useState } from "react";
import { ScrollArea } from "@/src/shared/ui/scroll-area";
import { Button } from "@/src/shared/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/shared/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/shared/ui/tooltip";
import { ChevronDown, FileUp, FileText, Box, Filter, Move, Edit, Calculator, GitBranch, BarChart, Download, Clock, Terminal, Shuffle, Database, Layers } from "lucide-react";
import { getAllNodes } from "@/src/canvas/nodes/auto-registry";
import { NodeStatusBadge } from "@/src/canvas/nodes/node-status-badge";
import { useUIStore } from "@/src/shared/ui-store";
import { useCanvasStore } from "@/src/canvas/store";

function getStatusTooltipContent(status: string): string | null {
  switch (status) {
    case "working":
      return "This node is fully implemented and working";
    case "wip":
      return "This node is work in progress - basic functionality available";
    case "new":
      return "This node is newly added - limited functionality";
    default:
      return null;
  }
}

export function NodesToolbar() {
  const isMobile = useUIStore(state => state.isMobile);
  
  // Canvas state from Zustand store
  const selectedNodeType = useCanvasStore(state => state.selectedNodeType);
  const placementMode = useCanvasStore(state => state.placementMode);
  const setSelectedNodeType = useCanvasStore(state => state.setSelectedNodeType);
  const setPlacementMode = useCanvasStore(state => state.setPlacementMode);
  
  const onNodeSelect = (nodeType: string) => {
    if (selectedNodeType === nodeType && placementMode) {
      setSelectedNodeType(null);
      setPlacementMode(false);
    } else {
      setSelectedNodeType(nodeType);
      setPlacementMode(true);
    }
  };

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const renderNodeItem = (node: any) => {
    const tooltipContent = getStatusTooltipContent(node.status);
    const isSelected = selectedNodeType === node.id;

    const handleNodeInteraction = (event: React.MouseEvent | React.TouchEvent) => {
      if (isMobile && onNodeSelect) {
        event.preventDefault();
        onNodeSelect(node.id);
      }
    };

    return (
      <div
        key={node.id}
        className={`
          ${isMobile
            ? `flex items-center gap-2 rounded-lg border-2 px-3 py-2 cursor-pointer transition-all duration-200 active:scale-[0.98] ${isSelected
              ? 'bg-primary/10 border-primary'
              : 'bg-background hover:bg-accent/50 border-border hover:border-primary/20'
            }`
            : 'flex items-center gap-2 rounded-md border border-dashed px-3 py-2 cursor-grab bg-background hover:bg-accent transition-colors duration-200 min-w-max'
          }
        `}
        draggable={!isMobile}
        onDragStart={!isMobile ? (event) => onDragStart(event, node.id) : undefined}
        onClick={isMobile ? handleNodeInteraction : undefined}
        onTouchEnd={isMobile ? handleNodeInteraction : undefined}
      >
        <div className={`${isSelected ? 'text-primary' : ''}`}>
          {node.icon}
        </div>
        <span className={`text-sm font-medium whitespace-nowrap ${isSelected ? 'text-primary font-semibold' : ''}`}>
          {node.label}
        </span>
        {tooltipContent ? (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <NodeStatusBadge status={node.status as any} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                <p className="max-w-xs text-xs">{tooltipContent}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <NodeStatusBadge status={node.status as any} />
        )}
      </div>
    );
  };

  const allNodes = getAllNodes();

  // Desktop: Horizontal scrollable toolbar with all nodes
  if (!isMobile) {
    return (
      <div className="border-b bg-card">
        <ScrollArea className="w-full">
          <div className="flex items-center gap-3 px-4 py-2">
            {allNodes.map(renderNodeItem)}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Mobile: Horizontal scrollable nodes
  return (
    <div className="border-b bg-card">
      {placementMode && selectedNodeType && (
        <div className="mx-4 mt-2 mb-2 p-2 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
              <span className="text-xs font-medium text-primary">
                Tap on canvas to place node
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNodeSelect?.(selectedNodeType)}
              className="text-primary hover:bg-primary/20 h-6 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      <ScrollArea className="w-full">
        <div className="flex gap-2 p-3">
          {allNodes.map(renderNodeItem)}
        </div>
      </ScrollArea>
    </div>
  );
}

