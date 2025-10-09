// Common base interface for all node data
export interface BaseNodeData {
    label: string;
    properties?: Record<string, any>;
}

// IFC node data
export interface IfcNodeData extends BaseNodeData {
    properties?: {
        filename?: string;
        filesize?: number;
        elementCount?: number;
        [key: string]: any;
    };
} 