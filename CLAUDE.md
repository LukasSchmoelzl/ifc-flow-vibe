# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IFCflow is a visual node-based tool for working with Industry Foundation Classes (IFC) files. It provides a graphical interface for viewing, filtering, transforming, and analyzing Building Information Modeling (BIM) data through an intuitive workflow system built on React Flow.

**Tech Stack:**
- Next.js 14.2 (App Router, client-side only)
- React 18.2 with TypeScript
- React Flow 11.10 for node-based UI
- @thatopen/fragments for IFC processing (via web-ifc 0.0.72)
- Three.js for 3D visualization
- Radix UI + Tailwind CSS for UI components

## Architecture Overview

### Domain-Based Structure

The codebase follows a domain-based architecture with clear separation of concerns:

```
src/
├── canvas/          # Canvas & workflow domain
│   ├── components/  # Flow canvas UI components
│   ├── hooks/       # Canvas-specific hooks (history, clipboard, operations)
│   ├── nodes/       # Node system
│   │   ├── node-registry.tsx  # Central node registry (metadata, icons, factories)
│   │   └── nodes/            # Individual node implementations
│   │       ├── ifc-node/    # IFC file loading
│   │       ├── template-node/ # Template text processing
│   │       └── info-node/   # Info display
│   ├── workflow-executor.ts  # Workflow execution engine
│   └── workflow-storage.ts   # Workflow persistence
│
├── viewer/          # 3D viewer domain
│   └── fragments-viewer.tsx        # ThatOpen Fragments 3D viewer
│
├── ui/              # UI components domain
│   ├── components/  # Reusable UI components (buttons, toasts, etc.)
│   ├── dialogs/     # Modal dialogs
│   ├── header/      # App header
│   ├── toolbar/     # Nodes toolbar
│   └── properties-panel/  # Node properties panel
│
├── lib/             # Shared utilities
│   ├── keyboard-shortcuts.ts
│   └── settings-manager.ts
│
└── hooks/           # Shared React hooks
    ├── use-mobile.ts
    ├── use-toast.ts
    └── use-app-hotkeys.ts
```

### Node System Architecture

Each node type is self-contained in its own directory with a consistent structure:

```
src/canvas/nodes/nodes/{node-type}/
├── index.tsx              # Main node component (UI)
├── ui.tsx                 # Display logic
├── {processor}.ts         # Workflow execution logic
└── {node-specific}.tsx    # Additional components
```

Factory functions are defined centrally in `src/canvas/nodes/node-registry.tsx`.

**Key principles:**
1. **Node Registration**: All nodes must be registered in:
   - `src/canvas/nodes/node-registry.tsx` - Add to NODE_REGISTRY with metadata, icon, and factory
   - `src/canvas/nodes/nodes/index.ts` - Export node component and add to nodeTypes
   - `src/canvas/workflow-executor.ts` - Add processor to NODE_PROCESSORS

2. **Node Structure**: Nodes follow React Flow's standard pattern:
   - Use `memo()` + `NodeProps<T>` type
   - Include `Handle` components for connections
   - Implement separate processor class for workflow execution

3. **Processor Pattern**: Each node has a processor class implementing `NodeProcessor` interface:
   ```typescript
   interface NodeProcessor {
     process(node: any, inputValues: any, context: ProcessorContext): Promise<any>;
   }
   ```

### Workflow Execution

The workflow executor (`src/canvas/workflow-executor.ts`) runs nodes in topological order:
1. Builds dependency graph from edges
2. Sorts nodes topologically (detects cycles)
3. Executes each processor with input values from connected nodes
4. Caches results to avoid reprocessing

### IFC Processing Flow

IFC files are processed using the ThatOpen Fragments library:
1. User drops/selects IFC file → stored in node.data.file
2. On workflow execution → `IfcNodeProcessor.process()` is called
3. IFC → Fragments conversion using `FRAGS.IfcImporter`
4. Fragments loaded into viewer via global `window.__fragmentsViewer`
5. Model stored in `window.__fragmentsModels[nodeId]`
6. Metadata extracted and displayed in node UI

**Important**: IFC models are NOT serialized in workflow saves - only filenames are preserved.

### Global State

The app uses React state and refs with minimal global state:
- `window.__fragmentsViewer` - Fragments viewer singleton (components, fragments, world)
- `window.__fragmentsModels` - Map of nodeId → FragmentsModel
- localStorage - Workflow persistence via `WorkflowStorage`

## Code Style Rules (from ls_rules.md)

**General:**
- Do NOT create README or .md files unless explicitly asked
- Remove fallback logic - fallbacks lead to unexpected behavior and complexity
- Hardcoded values should be UPPERCASE constants at the top of files
- Avoid setTimeout - hard to debug and causes unexpected behavior
- Only add code that is immediately used
- Never use MOCKDATA
- Use single-line comments `// Comment` instead of multi-line `/** */`

**Node-specific:**
- Code used by only one node should be in the node's directory
- Code used by multiple nodes should be in `src/lib/`

## Common Patterns

### Adding a New Node Type

1. Create node directory: `src/canvas/nodes/nodes/my-node/`
2. Implement node component (index.tsx):
   ```typescript
   export const MyNode = memo(({ id, data, isConnectable }: NodeProps<MyNodeData>) => {
     // Node UI with Handle components
   });
   ```
3. Implement processor (my-processor.ts):
   ```typescript
   export class MyNodeProcessor implements NodeProcessor {
     async process(node: any, inputValues: any, context: ProcessorContext) {
       // Processing logic
     }
   }
   ```
4. Register in `src/canvas/nodes/node-registry.tsx`:
   ```typescript
   export const NODE_REGISTRY = {
     // ... existing nodes
     myNode: {
       label: "My Node",
       icon: <MyIcon className="h-4 w-4 mr-2" />,
       status: "working" as const,
       factory: (position, additionalData?) => ({
         id: generateNodeId(),
         type: "myNode",
         position,
         data: { label: "My Node", ...additionalData }
       })
     }
   }
   ```
5. Register in `src/canvas/nodes/nodes/index.ts` (add to nodeTypes)
6. Register processor in `src/canvas/workflow-executor.ts` (add to NODE_PROCESSORS)

### Updating Node Data During Execution

Use `context.updateNodeData(nodeId, newData)` in processors to update node UI during workflow execution.

### Workflow Persistence

Clean workflow data before saving using `cleanWorkflowData()` which:
- Removes File objects and model data from nodes
- Keeps only serializable properties
- Marks IFC nodes as empty with filename for reference

## Important Notes

- This is a client-side only app (no server-side rendering)
- All IFC processing happens in the browser using WebAssembly
- The app uses localStorage for workflow persistence
- Fragments viewer is initialized once and reused globally
- The recent restructuring (commit 9086c7e) moved from a flat structure to domain-based organization
- Legacy node implementations in `src/canvas/nodes-louis/` are deprecated and should not be used
