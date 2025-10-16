# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IFCflow is a visual node-based tool for working with Industry Foundation Classes (IFC) files. It provides a graphical interface for viewing, filtering, transforming, and analyzing Building Information Modeling (BIM) data through an intuitive workflow system powered by React Flow. Users can create complex data manipulation pipelines through drag-and-drop nodes, or use AI to automatically build workflows.

**Tech Stack**: Next.js 14.2, React 18.2, TypeScript, React Flow 11.10, Tailwind CSS, Zustand, @thatopen/fragments (IFC processing), Three.js (3D rendering)

## Development Commands

```bash
# Development
npm run dev          # Start development server at http://localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Architecture Overview

### Domain-Based Structure

The codebase follows a domain-based architecture (YAGNI principle) with clear separation:

```
src/
├── canvas/          # Canvas & workflow logic (nodes, executors, storage)
├── viewer/          # 3D viewer components (fragmentsViewer)
├── header/          # Header UI (AppHeader, NodesToolbar)
├── llm/             # AI integration (Claude API, tool registry, executor)
├── core/            # Entity access layer (entity cache, extractor, types)
├── shared/          # Shared utilities and stores (ui-store, settings-store)
└── overlays/        # Global overlays (file drop, mobile placement)
```

### State Management

Uses **Zustand** for all state management (NOT custom hooks):

- `src/canvas/store.ts` - Canvas state (nodes, edges, workflow, history)
- `src/shared/ui-store.ts` - UI state (mobile detection)
- `src/shared/settings-store.ts` - Application settings

### Key Architectural Patterns

1. **Node System** - All canvas nodes follow a standardized template (see Node Development section)
2. **Auto-Registry** - Nodes are automatically registered via `src/canvas/nodes/auto-registry.tsx`
3. **Workflow Execution** - `WorkflowExecutor` (src/canvas/executor.ts) processes nodes in topological order
4. **Entity Cache** - LRU cache (`src/core/entity-cache.ts`) optimizes IFC data access (max 1000 items)
5. **AI Integration** - Claude API integration via LLM tools that create and execute nodes

## Node Development

All nodes follow a standardized template structure. See `src/canvas/nodes/NODE_TEMPLATE.md` for complete documentation.

### Node Structure

```
src/canvas/nodes/nodes/[node-name]/
├── index.tsx              # React Component (REQUIRED)
├── metadata.ts            # NodeMetadata (REQUIRED)
├── [name]-processor.ts    # Processor Class (REQUIRED)
├── ui.tsx                 # UI Content (REQUIRED)
├── types.ts               # TypeScript Types (RECOMMENDED)
├── llm-tools.ts           # LLM Tool Definitions (OPTIONAL)
└── [name]-manager.ts      # Business Logic (OPTIONAL)
```

### Required Files

1. **index.tsx** - React component with Card + Handle pattern
2. **metadata.ts** - Exports `NodeMetadata` with type, label, icon, processor, defaultData
3. **[name]-processor.ts** - Implements `NodeProcessor` interface with `process()` method
4. **ui.tsx** - Presentational component that displays node data

### Node Registration

Nodes are **automatically registered** when:
1. Directory exists in `src/canvas/nodes/nodes/[node-name]/`
2. `index.tsx` exports both node component and metadata
3. Naming convention is followed (camelCase + Node suffix)

No manual registry updates needed!

### Node Processor Pattern

All processors must:
- Implement `NodeProcessor` interface from `src/canvas/executor.ts`
- Use `context.updateNodeData()` to set loading/error states
- Include try-catch for error handling
- Return data for downstream nodes
- Use console logs with `[NodeName]` prefix for debugging

### Existing Nodes

- **FileManagerNode** - Loads IFC files, processes with web-ifc
- **SearchNode** - Searches IFC entities by property/value (multi-input: model + parameter)
- **ProjectInfoNode** - Extracts project metadata (multi-output: bim_get_model_info, project_get_info, project_get_statistics, project_get_structure, metadata, statistics, structure)
- **UserSelectionNode** - Handles user-selected elements
- **AIVisibilityNode** - AI-driven visibility control

## Workflow Execution

Workflows are executed via `WorkflowExecutor` (src/canvas/executor.ts):

1. **Topological Sort** - Determines execution order (handles cycles)
2. **Sequential Processing** - Processes nodes in dependency order
3. **Input Resolution** - Automatically passes outputs to connected inputs via named handles
4. **State Updates** - Updates node data via `context.updateNodeData()`

### Multi-Input Nodes

Nodes can have multiple named input handles (e.g., SearchNode with "model" and "parameter"):
- Each handle has a unique ID (e.g., `id="model"`, `id="parameter"`)
- Executor maps inputs by handle ID: `inputValues[edge.targetHandle]`
- Processors access inputs by name: `inputValues.model`, `inputValues.parameter`

Example from SearchNode (multiple inputs):
```tsx
<Handle type="target" position={Position.Left} id="model" style={{ top: "30%" }} />
<Handle type="target" position={Position.Left} id="parameter" style={{ top: "70%" }} />
```

Example from ProjectInfoNode (multiple outputs with API command names):
```tsx
const OUTPUT_HANDLES = [
  { id: "bim_get_model_info", label: "bim_get_model_info", position: 15 },
  { id: "project_get_info", label: "project_get_info", position: 30 },
  { id: "project_get_statistics", label: "project_get_statistics", position: 45 },
  { id: "project_get_structure", label: "project_get_structure", position: 60 },
  { id: "metadata", label: "metadata", position: 70 },
  { id: "statistics", label: "statistics", position: 80 },
  { id: "structure", label: "structure", position: 90 }
];

// UI displays list of API outputs with visual indicators
<div className="mt-4 border-t border-white/10 pt-3">
  <div className="text-[10px] text-white/50 mb-2 font-semibold">fragments api</div>
  <div className="space-y-1">
    {OUTPUT_HANDLES.map((handle) => (
      <div key={handle.id} className="flex items-center justify-between">
        <span className="text-[10px] text-white/70 font-mono">{handle.label}</span>
        <div className="w-2 h-2 rounded-full bg-white/30" />
      </div>
    ))}
  </div>
</div>

// Handles positioned on the right side
{OUTPUT_HANDLES.map((handle) => (
  <Handle key={handle.id} type="source" position={Position.Right}
          id={handle.id} style={{ top: `${handle.position}%` }} />
))}
```

The executor automatically extracts the correct data based on `edge.sourceHandle`:
- `ProjectInfoNode.bim_get_model_info` → passes model info (format, status, features, entityCount)
- `ProjectInfoNode.project_get_statistics` → passes statistics object with summary
- `ProjectInfoNode.metadata` → passes only metadata object
- Other handles follow the same pattern

## AI Integration

The LLM system (`src/llm/`) enables AI-driven workflow creation:

1. **Tool Registry** (`tool-registry.ts`) - Collects all node LLM tools
2. **Executor** (`executor.ts`) - Processes user messages, executes tool chains (max 10 iterations)
3. **Canvas Actions** (`canvas-actions.ts`) - Creates nodes and connections from tool calls
4. **API Route** (`app/api/claude/route.ts`) - Proxies requests to Claude API

LLM tools are defined in each node's `llm-tools.ts` and automatically collected by the registry.

## 3D Viewer

`fragmentsViewer` (src/viewer/fragments-viewer.tsx) provides IFC visualization:
- Uses @thatopen/components and @thatopen/fragments
- Initializes Three.js scene with SimpleScene/Camera/Renderer
- Stores global state in `window.__fragmentsViewer` and `window.__fragmentsModels`
- Includes Stats.js for performance monitoring

## Code Style Rules (ls_rules.md)

**Important conventions to follow:**

1. **No fallback logic** - Fallbacks lead to unexpected behavior and complexity
2. **Hardcoded values** - Place at top of file in UPPERCASE
3. **No setTimeout** - Hard to debug, causes unexpected behavior
4. **YAGNI** - Only add code that's directly used
5. **No mock data** - Never use mock data
6. **Comment style** - Use single-line comments (`// Comment`) instead of multi-line JSDoc
7. **File naming** - File names must match content
8. **State management** - Use Zustand, not custom hooks
9. **Documentation** - Only create .md files when explicitly requested (often outdated)

## Canvas Node Management

### Node Positioning System (`src/canvas/nodes-on-canvas.ts`)

Nodes are positioned on a 2D coordinate system:
- **X-Axis** - Workflow iteration (tooling execution steps), spaced 300px apart
- **Y-Axis** - Parameter variations for the same iteration, spaced 150px apart

The `NodesOnCanvas` class manages automatic positioning:
- `createNodeAtIteration(nodeType, iteration, parameterIndex)` - Create node at specific coordinates
- `createNodeWithAutoPosition(nodeType)` - Auto-increment position
- `advanceIteration()` - Move to next X position, reset Y to 0
- `incrementParameterIndex()` - Move to next Y position

Used by `LLMCanvasActions` to automatically layout AI-generated workflows.

### File Operations

Key modules:
- `src/canvas/storage.ts` - Workflow save/load (localStorage + JSON download)
- `src/canvas/workflow-operations.ts` - Workflow CRUD operations
- `src/canvas/clipboard-operations.ts` - Copy/paste/duplicate node operations
- `src/canvas/event-handlers.ts` - Canvas event handling (drop, drag, delete)
- `src/canvas/nodes-on-canvas.ts` - Node positioning and layout management

## Import Paths

TypeScript path alias configured:
- `@/*` maps to repository root
- Example: `@/src/canvas/store` instead of `../../../src/canvas/store`

## Git Workflow

- Main branch: `master`
- Current branch: `fragments-as-nodes`
- License: AGPL-3.0 (modifications must be distributed under same license)

## Common Patterns

1. **Direct exports** - Export functions directly, not wrapped in objects
2. **Proper error handling** - Throw errors instead of using fallbacks
3. **Type safety** - All props and return values must be typed
4. **Console logging** - Prefix with component/node name for debugging
5. **Loading states** - Always show loading/error states in UI
