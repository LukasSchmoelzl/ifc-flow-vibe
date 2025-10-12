"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { ScrollArea } from "@/src/shared/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/src/shared/components/ui/dialog";
import type { Node as ReactFlowNode } from "reactflow";

interface Node extends ReactFlowNode {
    data: {
        label: string;
        properties?: Record<string, any>;
    };
}

interface PropertiesDialogProps {
    node: Node | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
}

export function PropertiesDialog({
    node,
    open,
    onOpenChange,
    setNodes,
}: PropertiesDialogProps) {
    const [nodeName, setNodeName] = useState("");

    useEffect(() => {
        if (node && node.data) {
            setNodeName(node.data.label || "");
        }
    }, [node]);

    const handleApply = () => {
        if (!node) return;

        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === node.id) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            label: nodeName,
                        },
                    };
                }
                return n;
            })
        );
        onOpenChange(false);
    };

    const handleCancel = () => {
        if (node && node.data) {
            setNodeName(node.data.label || "");
        }
        onOpenChange(false);
    };

    if (!node) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                <DialogHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                        <DialogTitle>Properties</DialogTitle>
                        <Input
                            value={nodeName}
                            onChange={(e) => setNodeName(e.target.value)}
                            placeholder="Node name"
                            className="h-7 text-xs w-[240px]"
                        />
                    </div>
                </DialogHeader>

                <DialogFooter className="gap-2 pt-3">
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleApply}>Apply Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
