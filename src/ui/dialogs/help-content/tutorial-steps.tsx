import { Building, Layers, FileJson, Command } from "lucide-react";

export const tutorialSteps = [
  {
    id: "loading",
    title: "Loading an IFC File",
    icon: <Building className="h-5 w-5" />,
    description: "Start by loading an IFC model to work with.",
    steps: [
      'Click the "Open File" button in the top menu or use <kbd>Ctrl+O</kbd>',
      "Select an IFC file from your device",
      "Alternatively, drag and drop an IFC file directly onto the canvas",
    ],
  },
  {
    id: "workflow",
    title: "Creating a Workflow",
    icon: <Layers className="h-5 w-5" />,
    description:
      "Build your workflow by connecting nodes to process IFC data.",
    steps: [
      "Drag nodes from the sidebar onto the canvas",
      "Connect nodes by clicking and dragging from an output handle to an input handle",
      "Configure node properties by selecting a node and using the properties panel",
      'Run the workflow by clicking the "Run" button or pressing <kbd>F5</kbd>',
    ],
  },
  {
    id: "saving",
    title: "Saving and Loading Workflows",
    icon: <FileJson className="h-5 w-5" />,
    description: "Save your work for later use or sharing.",
    steps: [
      'Save your workflow to the library by clicking "Save to Library" in the File menu or using <kbd>Ctrl+S</kbd>',
      'Download your workflow as a JSON file using "Save Locally" or <kbd>Ctrl+Shift+S</kbd>',
      "Load a saved workflow from the workflow library using <kbd>Ctrl+L</kbd>",
    ],
  },
  {
    id: "navigating",
    title: "Navigating the Canvas",
    icon: <Command className="h-5 w-5" />,
    description: "Move around and organize your workflow.",
    steps: [
      "Zoom in and out using the mouse wheel or <kbd>Ctrl+=</kbd> and <kbd>Ctrl+-</kbd>",
      "Pan by holding the middle mouse button or Space+drag",
      "Select multiple nodes by holding Shift while clicking or dragging a selection box",
      "Fit all nodes in view with <kbd>Ctrl+0</kbd>",
    ],
  },
];
