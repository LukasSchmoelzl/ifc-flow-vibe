import { useState } from "react";
import { Info, Building } from "lucide-react";
import { IfcNodeData as BaseIfcNodeData } from "../node-types";

// Simple utility functions for element type formatting
const getElementTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    IFCWALL: "bg-blue-500",
    IFCWALLSTANDARDCASE: "bg-blue-500",
    IFCSLAB: "bg-gray-500",
    IFCBEAM: "bg-yellow-500",
    IFCCOLUMN: "bg-red-500",
    IFCDOOR: "bg-green-500",
    IFCWINDOW: "bg-cyan-500",
    IFCROOF: "bg-purple-500",
    IFCSTAIR: "bg-orange-500",
    IFCSPACE: "bg-indigo-500",
  };
  return colors[type] || "bg-gray-400";
};

const formatElementType = (type: string): string => {
  return type.replace(/^IFC/, "").replace(/([A-Z])/g, " $1").trim();
};

interface ExtendedIfcNodeData extends BaseIfcNodeData {
  model?: {
    schema?: string;
    project?: { Name?: string };
    elementCounts?: Record<string, number>;
    totalElements?: number;
  };
  isEmptyNode?: boolean;
  fileName?: string;
}

interface IfcNodeUIProps {
  data: ExtendedIfcNodeData;
  isDraggingOver: boolean;
}

export function IfcNodeUI({ data, isDraggingOver }: IfcNodeUIProps) {
  const [elementsExpanded, setElementsExpanded] = useState(false);

  const renderModelInfo = () => {
    if (!data.model) return null;

    const { schema, project, elementCounts, totalElements } = data.model;
    const sortedElements = elementCounts
      ? Object.entries(elementCounts)
        .filter(([, count]) => (count as number) > 0)
        .sort(([, a], [, b]) => (b as number) - (a as number))
      : [];

    return (
      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium mb-2">
          <Info className="w-4 h-4" />
          <span>IFC Model Info</span>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Schema:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{schema || "Unknown"}</span>
            </div>

            {project?.Name && (
              <div className="flex items-center gap-1">
                <Building className="w-3 h-3 text-gray-500 flex-shrink-0" />
                <span className="flex-1 truncate text-gray-900 dark:text-gray-100" title={project.Name}>
                  {project.Name}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Total Elements:</span>
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{totalElements?.toLocaleString() || 0}</span>
          </div>

          <button
            className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center justify-center py-1 px-2 rounded border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setElementsExpanded(!elementsExpanded);
            }}
          >
            {elementsExpanded ? "Hide" : "Show"} Element Types
            <span className="ml-1 text-xs">{elementsExpanded ? "▲" : "▼"}</span>
          </button>

          {elementsExpanded && sortedElements.length > 0 && (
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Element Breakdown ({sortedElements.length} types)
              </div>
              {sortedElements.slice(0, 15).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between py-0.5 px-1 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${getElementTypeColor(type)}`}
                      title={`${type} elements`}
                    />
                    <span className="text-gray-700 dark:text-gray-300 truncate" title={type}>
                      {formatElementType(type)}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {(count as number).toLocaleString()}
                  </span>
                </div>
              ))}
              {sortedElements.length > 15 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                  ... and {sortedElements.length - 15} more types
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (data.properties?.file) {
    return (
      <div className="p-3 text-xs">
        {data.model ? (
          renderModelInfo()
        ) : (
          <div className="text-muted-foreground text-xs mt-1">
            Loaded. Drag & drop to replace.
          </div>
        )}
      </div>
    );
  }

  if (data.isEmptyNode) {
    return (
      <div className="p-3">
        <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
          IFC file needs to be reloaded
        </div>
        {data.fileName && (
          <div className="text-xs text-muted-foreground mt-1">
            Original file: {data.fileName}
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-1">
          Drag & drop or click to load IFC file
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 text-xs text-muted-foreground">
      {isDraggingOver ? "Drop IFC file here" : "No file selected"}
    </div>
  );
}

