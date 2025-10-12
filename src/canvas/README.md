# Canvas Domain

Der Canvas-Bereich enthält die gesamte Workflow- und Node-Logik der Anwendung.

## Struktur

```
canvas/
├── components/          # UI-Komponenten für den Flow-Canvas
│   ├── flow/           # Overlays und Feedback-Komponenten
│   └── flow-canvas.tsx # Haupt-Canvas-Komponente (ReactFlow + 3D Viewer)
├── hooks/              # Canvas-spezifische React Hooks
├── nodes/              # Node-System
│   ├── node-registry.tsx  # Zentrale Node-Registry (Metadata, Icons, Factories)
│   └── nodes/            # Node-Implementierungen
│       ├── ifc-node/    # IFC-Datei laden
│       ├── template-node/ # Text-Template-Verarbeitung
│       └── info-node/   # Info-Anzeige
├── workflow-executor.ts # Workflow-Ausführungs-Engine
└── workflow-storage.ts  # Workflow-Persistierung (localStorage)
```

## Kernkomponenten

### workflow-executor.ts

Die Workflow-Ausführungs-Engine:
- Führt topologische Sortierung der Nodes durch (erkennt Zyklen)
- Führt Nodes in der richtigen Reihenfolge aus
- Cached Ergebnisse um Neuberechnung zu vermeiden
- Ruft für jeden Node-Typ den entsprechenden Processor auf

**Node Processor Pattern:**
```typescript
interface NodeProcessor {
  process(node: any, inputValues: any, context: ProcessorContext): Promise<any>;
}
```

Alle Processors müssen in `NODE_PROCESSORS` registriert werden.

### workflow-storage.ts

Workflow-Persistierung über localStorage:
- Speichert/lädt Workflows
- Generiert Thumbnails von Workflows
- **Wichtig:** `cleanWorkflowData()` entfernt alle nicht-serialisierbaren Daten (File-Objekte, IFC-Modelle) vor dem Speichern
- IFC-Nodes werden als leer markiert, nur der Dateiname wird gespeichert

### node-registry.tsx

Zentrale Node-Registry:
- `NODE_REGISTRY` - Objekt mit allen Node-Metadaten (Label, Icon, Status, Factory)
- `getAllNodes()` - Gibt alle Nodes als Array zurück (für Toolbar)
- `getNodeLabel(nodeType)` - Holt benutzerfreundliche Labels
- `createNode(type, position, data)` - Generische Factory-Funktion
- `createIfcNodeFromFile(position, file)` - Spezielle Factory für IFC-Datei-Upload

## Node-System

### Node-Struktur

Jeder Node-Typ hat seine eigene Verzeichnisstruktur:

```
nodes/nodes/{node-type}/
├── index.tsx              # Node-Komponente (UI)
├── ui.tsx                 # Display-Logik
├── {name}-processor.ts    # Workflow-Execution-Logik
└── {spezifisch}.tsx       # Node-spezifische Komponenten
```

Die Factory-Funktion ist in `nodes/node-registry.tsx` im `NODE_REGISTRY` definiert.

### Node hinzufügen

Um einen neuen Node-Typ hinzuzufügen:

1. **Verzeichnis erstellen:** `nodes/nodes/my-node/`

2. **Node-Komponente** (`index.tsx`):
```typescript
export const MyNode = memo(({ id, data, isConnectable }: NodeProps<MyNodeData>) => {
  return (
    <div>
      {/* Node UI */}
      <Handle type="source" position={Position.Right} id="output" isConnectable={isConnectable} />
    </div>
  );
});
```

3. **Processor** (`my-processor.ts`):
```typescript
export class MyNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext) {
    // Verarbeitungslogik
    return result;
  }
}
```

4. **Registrierung in `nodes/node-registry.tsx`:**
```typescript
import { MyIcon } from "lucide-react";

export const NODE_REGISTRY = {
  // ... existing nodes
  myNode: {
    label: "My Node",
    icon: <MyIcon className="h-4 w-4 mr-2" />,
    status: "working" as const,
    factory: (position: { x: number; y: number }, additionalData?: Record<string, any>): Node => ({
      id: generateNodeId(),
      type: "myNode",
      position,
      data: {
        label: "My Node",
        ...additionalData,
      },
    }),
  },
}
```

5. **Weitere Registrierungen:**
   - `nodes/nodes/index.ts` - Node exportieren und zu `nodeTypes` hinzufügen
   - `workflow-executor.ts` - Processor zu `NODE_PROCESSORS` hinzufügen

### Node-Daten während Execution aktualisieren

Verwende `context.updateNodeData(nodeId, newData)` in Processors um die Node-UI während der Workflow-Ausführung zu aktualisieren:

```typescript
context.updateNodeData(node.id, {
  ...node.data,
  isLoading: true,
});
```

## Hooks

### use-workflow-operations.ts
- `handleOpenFile()` - Erstellt IFC-Node aus Datei
- `handleSaveWorkflow()` - Speichert Workflow in State
- `handleLoadWorkflow()` - Lädt Workflow aus Storage
- `handleRunWorkflow()` - Führt Workflow aus (WorkflowExecutor)

### use-workflow-history.ts
- Undo/Redo-Funktionalität
- Max. 50 History-Einträge

### use-clipboard.ts
- Copy/Paste-Funktionalität für Nodes

### use-node-operations.ts
- Select All, Copy, Cut, Paste, Delete
- Arbeitet mit History zusammen

### use-flow-handlers.ts
- React Flow Event-Handler
- Node-Click, Drag & Drop, Connection-Handling

### use-mobile-placement.ts
- Mobile Node-Platzierung
- Touch-freundliche Interaktion

## Komponenten

### flow-canvas.tsx

Haupt-Canvas-Komponente:
- Split-Screen Layout (50% ReactFlow, 50% 3D Viewer)
- Integriert ReactFlow mit allen Event-Handlern
- Zeigt Overlays für File-Drop und Mobile-Placement
- Conditional Rendering basierend auf `focusedViewerId` (disable pan/zoom wenn Viewer fokussiert)

### components/flow/

- `FileDropOverlay.tsx` - Visuelles Feedback beim Datei-Drag
- `FooterPill.tsx` - Workflow-Name-Anzeige
- `MobilePlacementOverlay.tsx` - Anleitung für Mobile-Placement

## Wichtige Patterns

### Topologische Sortierung

```typescript
const sortedNodes = topologicalSort(nodes, edges);
for (const nodeId of sortedNodes) {
  await processNode(nodeId);
}
```

### Input-Werte sammeln

Der Executor sammelt automatisch Input-Werte von verbundenen Nodes:

```typescript
const inputValues = await this.getInputValues(nodeId);
// inputValues enthält Ergebnisse von Source-Nodes, indexiert nach targetHandle
```

### Workflow Cleaning

Vor dem Speichern werden alle nicht-serialisierbaren Daten entfernt:

```typescript
const cleanedWorkflow = {
  ...workflow,
  flowData: cleanWorkflowData(workflow.flowData)
};
```

IFC-Nodes werden als `isEmptyNode: true` markiert und nur der `fileName` bleibt erhalten.
