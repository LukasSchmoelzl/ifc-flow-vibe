# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IFCflow is a visual node-based tool for working with Industry Foundation Classes (IFC) files. It provides a graphical interface for viewing, filtering, transforming, and analyzing Building Information Modeling (BIM) data through a drag-and-drop workflow system built with Next.js, React, and React Flow.

**Key Technologies:**
- Next.js 14.2 with App Router
- React 18.2 + React Flow for node-based UI
- @thatopen/components & @thatopen/fragments for 3D IFC visualization
- Tailwind CSS + Radix UI for styling
- TypeScript

## Development Commands

```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture Overview

### Node System Architecture

The application uses a **factory + processor pattern** for nodes:

1. **Node Factory Registry** (`src/nodes/node-factory-registry.ts`)
   - Maps node types to factory functions
   - Each node type has a `factory.ts` that creates node instances
   - Example: `createIfcNode()`, `createTemplateNode()`

2. **Node Processors** (`src/lib/workflow-executor.ts`)
   - Separate processor classes handle node execution logic
   - `IfcNodeProcessor` (ifc-loader.ts) - loads IFC into viewer
   - `TemplateNodeProcessor` (text-processor.ts) - processes text
   - Processors implement `NodeProcessor` interface with `process()` method

3. **Workflow Execution**
   - `WorkflowExecutor` class performs topological sort of nodes
   - Executes nodes in dependency order
   - Results cached in `Map<string, any>` to avoid reprocessing

### Two Node Directories

- **`src/canvas/nodes/nodes/`** - Active nodes (IFC, Template)
  - Each node has: `index.tsx` (UI), `factory.ts` (creation), `{processor}.ts` (execution)
  - Registry-based creation and processing
  - Import from `@/src/canvas/nodes/nodes`

- **`src/canvas/nodes-louis/`** - ⚠️ DEPRECATED Legacy nodes
  - 15+ specialized node types for IFC operations (Analysis, Filter, Property, etc.)
  - Each has: `{name}-node.tsx` (UI), `executor.ts` (logic), optional `properties.tsx`, `utils.ts`
  - NOT migrated to factory pattern
  - Many functions commented out due to removed dependencies
  - **Do not use or extend these nodes**

### 3D Viewer Integration

- **FragmentsViewer** (`src/viewer/fragments-viewer.tsx`)
  - Uses @thatopen/components for 3D visualization
  - Separate pane on right side of canvas (desktop only)
  - Loads IFC models using web-ifc via fragments API
  - Global event system for cross-component communication (`ifc:export`, etc.)

### State Management Pattern

**Custom Hooks Architecture** - App logic split into focused hooks (in `src/canvas/hooks/`):
- `use-workflow-operations.ts` - workflow save/load/execute
- `use-node-operations.ts` - node CRUD operations
- `use-flow-handlers.ts` - React Flow event handlers
- `use-workflow-history.ts` - undo/redo system
- `use-clipboard.ts` - copy/paste nodes
- `use-mobile-placement.ts` - mobile node placement
- `use-view-settings.ts` - UI settings (grid, minimap)
- `use-file-drop-handler.ts` - file drag and drop

**Main App Structure** (`app/page.tsx`):
- `FlowWithProvider` component orchestrates all hooks
- React Flow state via `useNodesState` and `useEdgesState`
- Central `saveToHistory()` function passed to hooks

## Coding Standards (from ls_rules.md)

**Critical Rules:**
- **No fallback logic** - causes unexpected behavior and complexity
- **No setTimeout** - difficult to debug, causes unexpected behavior
- **No mock data** - only use real data
- **No README/docs unless requested** - documentation is often outdated
- **Hardcoded values** - define at top of file in UPPERCASE
- **Comments** - single-line format only (`// comment`), not multi-line blocks
- **Code organization:**
  - Node-specific code stays in the node folder
  - Shared code between nodes goes in `lib/`

## Adding a New Node Type

To add a new node following the factory pattern:

1. Create node directory: `src/canvas/nodes/nodes/{name}-node/`
2. Create `factory.ts`:
   ```typescript
   import type { Node } from "reactflow";

   const generateNodeId = (): string => {
     return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
   };

   export const create{Name}Node = (
     position: { x: number; y: number },
     additionalData?: Record<string, any>
   ): Node => ({
     id: generateNodeId(),
     type: "{name}Node",
     position,
     data: { label: "...", ...additionalData },
   });
   ```
3. Create processor (e.g., `{purpose}.ts`):
   ```typescript
   import type { NodeProcessor, ProcessorContext } from '@/src/canvas/workflow-executor';

   export class {Name}NodeProcessor implements NodeProcessor {
     async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
       // Implementation
     }
   }
   ```
4. Create UI (`index.tsx`) with React Flow node component
5. Register in `node-factory-registry.ts`:
   ```typescript
   import { create{Name}Node } from "./{name}-node/factory";

   const NODE_FACTORIES: Record<string, NodeFactory> = {
     // ...
     {name}Node: create{Name}Node,
   };
   ```
6. Register processor in `src/canvas/workflow-executor.ts`:
   ```typescript
   import { {Name}NodeProcessor } from "@/src/canvas/nodes/nodes/{name}-node/{processor}";

   const NODE_PROCESSORS = {
     // ...
     {name}Node: new {Name}NodeProcessor(),
   };
   ```
7. Export from `src/canvas/nodes/nodes/index.ts`

## Key Patterns

**File Naming:**
- Executor files use descriptive names (not `executor.ts`)
  - Good: `ifc-loader.ts`, `text-processor.ts`
  - Avoid: `executor.ts` (too generic)

**TypeScript:**
- Node data interfaces in `src/canvas/nodes/nodes/node-types.ts`
- Extend `BaseNodeData` for all node types

**React Flow:**
- Centralized `nodeTypes` object in `src/canvas/nodes/nodes/index.ts`
- All node components exported and registered there

**Import Paths:**
- Canvas/Workflow: `@/src/canvas/*`
- Nodes: `@/src/canvas/nodes/nodes/*`
- Viewer: `@/src/viewer/*`
- UI Components: `@/src/ui/components/*` or `@/src/ui/components/ui/*`
- Shared: `@/src/lib/*` and `@/src/hooks/*`

**Performance:**
- Client-side IFC processing using WebAssembly
- Web workers for heavy computation (`ifcWorker.js`, `spaceAnalysisWorker.js`)

## Project Structure

The codebase is organized into three main domains:

```
src/
├── canvas/           # 🎨 Canvas & Workflow Domain
│   ├── components/   # FlowCanvas, Overlays, NodeStatusBadge
│   ├── hooks/        # useFlowHandlers, useWorkflowOps, useNodeOps
│   ├── nodes/        # Node definitions
│   │   └── nodes/    # Active nodes (IFC, Template)
│   ├── nodes-louis/  # ⚠️  DEPRECATED legacy nodes (commented out)
│   ├── workflow-executor.ts
│   ├── workflow-storage.ts
│   └── node-factory.ts
│
├── viewer/           # 👁️  3D Viewer Domain
│   ├── fragments-viewer.tsx
│   ├── viewer-focus-context.tsx
│   └── use-ifc-export.ts
│
├── ui/               # 🎯 UI & Layout Domain
│   ├── header/       # AppHeader, Menubar
│   ├── toolbar/      # NodesToolbar, Toolbar
│   ├── dialogs/      # All dialog components
│   ├── properties-panel/
│   └── components/   # Sidebar, WorkflowLibrary, UI primitives
│       └── ui/       # Shadcn/Radix UI components
│
├── lib/              # 🔧 Shared Utilities
│   ├── ifc-utils.ts
│   ├── settings-manager.ts
│   └── keyboard-shortcuts.ts
│
└── hooks/            # Shared React hooks (use-mobile, use-toast, etc.)

app/                  # Next.js App Router
├── page.tsx          # Main application orchestration
└── layout.tsx        # Root layout

public/
├── wasm/             # web-ifc WebAssembly files
├── ifcWorker.js      # IFC processing worker
└── spaceAnalysisWorker.js
```

## Recent Architecture Changes (2025-10-09)

The codebase was recently restructured into domain-based directories:

**What Changed:**
- Split monolithic `src/` into three domains: `canvas/`, `viewer/`, `ui/`
- Moved workflow logic from `src/lib/` → `src/canvas/`
- Moved all UI components to `src/ui/` with subdirectories
- Centralized node definitions in `src/canvas/nodes/nodes/`
- Deprecated `src/canvas/nodes-louis/` - legacy nodes commented out

**Migration Status:**
- **Active nodes**: Use factory+processor pattern in `src/canvas/nodes/nodes/`
- **Legacy nodes** (`src/canvas/nodes-louis/`): Deprecated, many functions disabled
- Do NOT extend or use legacy nodes - they have missing dependencies
