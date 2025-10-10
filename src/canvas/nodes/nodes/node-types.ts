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

// Template node data
export interface TemplateNodeData extends BaseNodeData {
    template?: string;
}

// Louis nodes data types - using flexible BaseNodeData with index signature
export interface AnalysisNodeData extends BaseNodeData {
    [key: string]: any;
}
export interface ClassificationNodeData extends BaseNodeData {
    [key: string]: any;
}
export interface ClusterNodeData extends BaseNodeData {
    [key: string]: any;
}
export interface DataTransformNodeData extends BaseNodeData {
    [key: string]: any;
}
export interface ExportNodeData extends BaseNodeData {
    [key: string]: any;
}
export interface FilterNodeData extends BaseNodeData {
    [key: string]: any;
}
export interface GeometryNodeData extends BaseNodeData {
    [key: string]: any;
}
export interface ParameterNodeData extends BaseNodeData {
    [key: string]: any;
}
export interface PropertyNodeData extends BaseNodeData {
    [key: string]: any;
}
export interface PythonNodeData extends BaseNodeData {
    [key: string]: any;
}
export interface QuantityNodeData extends BaseNodeData {
    [key: string]: any;
}
export interface RelationshipNodeData extends BaseNodeData {
    [key: string]: any;
}
export interface SpatialNodeData extends BaseNodeData {
    [key: string]: any;
}
export interface TransformNodeData extends BaseNodeData {
    [key: string]: any;
}
export interface WatchNodeData extends BaseNodeData {
    [key: string]: any;
} 