import { Building, FileText, Info } from "lucide-react";

export const nodeCategories = [
  {
    name: "Input",
    description: "Nodes for loading and providing data",
    nodes: [
      {
        name: "IFC File",
        icon: <Building className="h-4 w-4" />,
        description: "Load IFC models from files",
        usage: "Drag and drop IFC files or click to browse. Provides building data to downstream nodes.",
        inputs: [],
        outputs: [
          "file: Original IFC File object",
          "name: Filename string",
          "model: FragmentModel with geometry and properties"
        ],
        tips: [
          "Supports IFC2x3 and IFC4 formats",
          "Large files may take time to load",
          "Check element counts in the node preview",
          "Model provides methods: getMetadata(), getCategories(), getItemsOfCategories()"
        ]
      },
      {
        name: "Template",
        icon: <FileText className="h-4 w-4" />,
        description: "Provide template text or configuration",
        usage: "Create reusable text templates or configuration data for workflows.",
        inputs: [],
        outputs: ["text: Template content as string"],
        tips: [
          "Use for static text or JSON configuration",
          "Can be used as input for processing nodes",
          "Supports multi-line content"
        ]
      }
    ]
  },
  {
    name: "Output",
    description: "Display and export results",
    nodes: [
      {
        name: "Info Display",
        icon: <Info className="h-4 w-4" />,
        description: "Display incoming data as formatted text",
        usage: "Connect any node output to visualize the data structure. Terminal node with no output.",
        inputs: ["input: Any data type (objects, arrays, strings, numbers)"],
        outputs: [],
        tips: [
          "Automatically formats different data types",
          "Shows JSON objects with syntax highlighting",
          "Arrays display with count and formatted content",
          "Large objects truncated at 1000 characters",
          "Scrollable display for large datasets",
          "Perfect for debugging workflow data flow"
        ]
      }
    ]
  }
];
