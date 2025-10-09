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

- **`src/nodes/`** - New architecture nodes (IFC, Template)
  - Each node has: `index.tsx` (UI), `factory.ts` (creation), `{processor}.ts` (execution)
  - Registry-based creation and processing

- **`src/nodes-louis/`** - Legacy nodes (Analysis, Filter, Property, etc.)
  - 13+ specialized node types for IFC operations
  - Each has: `{name}-node.tsx` (UI), `executor.ts` (logic), optional `properties.tsx`, `utils.ts`
  - Not yet migrated to factory pattern

### 3D Viewer Integration

- **FragmentsViewer** (`src/components/fragments-viewer.tsx`)
  - Uses @thatopen/components for 3D visualization
  - Separate pane on right side of canvas (desktop only)
  - Loads IFC models using web-ifc via fragments API
  - Global event system for cross-component communication (`ifc:export`, etc.)

### State Management Pattern

**Custom Hooks Architecture** - App logic split into focused hooks:
- `use-workflow-operations.ts` - workflow save/load/execute
- `use-node-operations.ts` - node CRUD operations
- `use-flow-handlers.ts` - React Flow event handlers
- `use-workflow-history.ts` - undo/redo system
- `use-clipboard.ts` - copy/paste nodes
- `use-mobile-placement.ts` - mobile node placement
- `use-view-settings.ts` - UI settings (grid, minimap)

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

1. Create node directory: `src/nodes/{name}-node/`
2. Create `factory.ts`:
   ```typescript
   export const create{Name}Node = (position, additionalData?) => ({
     id: generateNodeId(),
     type: "{name}Node",
     position,
     data: { label: "...", ...additionalData },
   });
   ```
3. Create processor (e.g., `{purpose}.ts`):
   ```typescript
   export class {Name}NodeProcessor implements NodeProcessor {
     async process(node, inputValues, context) { /* ... */ }
   }
   ```
4. Create UI (`index.tsx`) with React Flow node component
5. Register in `node-factory-registry.ts`:
   ```typescript
   const NODE_FACTORIES = {
     // ...
     {name}Node: create{Name}Node,
   };
   ```
6. Register processor in `workflow-executor.ts`:
   ```typescript
   const NODE_PROCESSORS = {
     // ...
     {name}Node: new {Name}NodeProcessor(),
   };
   ```
7. Export from `src/nodes/index.ts`

## Key Patterns

**File Naming:**
- Executor files use descriptive names (not `executor.ts`)
  - Good: `ifc-loader.ts`, `text-processor.ts`
  - Avoid: `executor.ts` (too generic)

**TypeScript:**
- Node data interfaces in `src/nodes/node-types.ts`
- Extend `BaseNodeData` for all node types

**React Flow:**
- Centralized `nodeTypes` object in `src/nodes/index.ts`
- All node components exported and registered there

**Performance:**
- Client-side IFC processing using WebAssembly
- Web workers for heavy computation (`ifcWorker.js`, `spaceAnalysisWorker.js`)

## Project Structure

```
src/
├── components/       # UI components (dialogs, menubar, toolbar, etc.)
├── hooks/            # Custom React hooks for state/logic
├── lib/              # Core utilities (workflow-executor, ifc-utils, etc.)
├── nodes/            # New architecture nodes (factory-based)
│   ├── ifc-node/
│   ├── template-node/
│   ├── node-factory-registry.ts
│   └── index.ts
├── nodes-louis/      # Legacy nodes (to be migrated)
│   ├── analysis-node/
│   ├── filter-node/
│   ├── property-node/
│   └── [13+ other node types]
└── types/            # TypeScript type definitions

app/                  # Next.js App Router
├── page.tsx          # Main application page
└── layout.tsx        # Root layout

public/
├── wasm/             # web-ifc WebAssembly files
├── ifcWorker.js      # IFC processing worker
└── spaceAnalysisWorker.js
```

## Migration Status

The project is in the process of migrating from hardcoded node creation to a factory+processor pattern. When modifying nodes:
- **New nodes** should use factory pattern (`src/nodes/`)
- **Legacy nodes** (`src/nodes-louis/`) should eventually be migrated
- Recent cleanup removed 2180+ lines of obsolete code from ifc-utils.ts
