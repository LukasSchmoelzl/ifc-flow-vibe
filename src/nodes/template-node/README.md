# Template Node

Template für neue Nodes basierend auf der IFC-Node Struktur.

## Struktur

```
template-node/
├── template-node.tsx  // UI Komponente
├── executor.ts        // Business Logic
└── README.md          // Diese Datei
```

## Anleitung: Neue Node erstellen

### 1. Ordner kopieren
```bash
cp -r src/nodes/template-node src/nodes/your-node
```

### 2. Dateien umbenennen
- `template-node.tsx` → `your-node.tsx`

### 3. Namen anpassen

**In `your-node.tsx`:**
```tsx
export const YourNode = memo(({ id, data, isConnectable }: NodeProps<YourNodeData>) => {
  // ...
});

YourNode.displayName = "YourNode";
```

**In `executor.ts`:**
```typescript
export class YourNodeProcessor implements NodeProcessor {
  // ...
}
```

### 4. Node Type hinzufügen

**In `src/nodes/node-types.ts`:**
```typescript
export interface YourNodeData extends BaseNodeData {
  properties?: {
    // Deine Properties hier
  };
}
```

### 5. Node registrieren

**In `src/nodes/index.ts`:**
```typescript
import { YourNode } from "./your-node/your-node"

export const nodeTypes: NodeTypes = {
  ifcNode: IfcNode,
  yourNode: YourNode,  // ← Hier hinzufügen
}
```

### 6. Sidebar hinzufügen

**In `src/components/sidebar.tsx`:**
```typescript
{
  id: "yourNode",
  label: "Your Node",
  icon: <Box className="h-4 w-4 mr-2" />,
  status: "working",
}
```

### 7. Executor registrieren

**In `src/lib/workflow-executor.ts`:**
```typescript
import { YourNodeProcessor } from '@/src/nodes/your-node/executor';

const NODE_PROCESSORS = {
  ifcNode: new IfcNodeProcessor(),
  yourNode: new YourNodeProcessor(),  // ← Hier hinzufügen
}
```

## Ein-/Ausgänge anpassen

### Nur Ausgang (Input-Node wie IFC):
```tsx
<Handle type="source" position={Position.Right} id="output" />
```

### Nur Eingang (Output-Node):
```tsx
<Handle type="target" position={Position.Left} id="input" />
```

### Beide (Filter-Node):
```tsx
<Handle type="target" position={Position.Left} id="input" />
<Handle type="source" position={Position.Right} id="output" />
```

### Mehrere Ausgänge:
```tsx
<Handle type="source" position={Position.Right} id="output1" style={{ top: '33%' }} />
<Handle type="source" position={Position.Right} id="output2" style={{ top: '66%' }} />
```

## Farben anpassen

**Header Farbe:**
```tsx
<div className="bg-blue-500 ...">  {/* blue → red/green/purple/... */}
```

**Border Farbe:**
```tsx
<div className="... border-blue-500 ...">  {/* Gleiche Farbe wie Header */}
```

## Gemäß ls_rules.md

- ✅ Keine Mock-Daten
- ✅ Keine Fallback-Logik
- ✅ Hardcoded Werte am Anfang in GROSSBUCHSTABEN
- ✅ Code nur in Node, wenn nur von dieser Node verwendet
- ✅ Keine setTimeout
