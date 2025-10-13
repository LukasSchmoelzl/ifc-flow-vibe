# Node Template System

Dieses Dokument beschreibt die standardisierte Struktur für alle Nodes in IFCFlow.

## Verzeichnis-Struktur

```
src/canvas/nodes/nodes/[node-name]/
  ├── index.tsx          # React Component (PFLICHT)
  ├── metadata.ts        # NodeMetadata (PFLICHT)
  ├── [name]-processor.ts # Processor Klasse (PFLICHT)
  ├── ui.tsx             # UI Content (PFLICHT)
  ├── types.ts           # TypeScript Types (EMPFOHLEN)
  ├── llm-tools.ts       # LLM Tool Definitionen (OPTIONAL)
  ├── [name]-manager.ts  # Business Logic (OPTIONAL)
  └── [name]-utils.ts    # Hilfsfunktionen (OPTIONAL)
```

## 1. index.tsx - React Component

**Zweck**: Rendert die Node im Canvas mit Handles und Styling

**Pattern**:
```tsx
"use client";

import React from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";
import { Card } from "@/src/shared/ui/card";
import { [Name]NodeUI } from "./ui";

export const [Name]Node: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <Card
      className={`min-w-[280px] max-w-[400px] ${
        selected ? "ring-2 ring-primary" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} />
      
      <div className="p-4">
        <div className="font-semibold mb-2">{data.label || "[Name]"}</div>
        <[Name]NodeUI data={data} />
      </div>

      <Handle type="source" position={Position.Right} />
    </Card>
  );
};

export { [name]NodeMetadata } from "./metadata";
```

**Wichtig**:
- `export { [name]NodeMetadata }` am Ende für auto-registry
- Handle links = Input, rechts = Output
- Card für konsistentes Styling
- `selected` prop für visuelles Feedback

## 2. metadata.ts - NodeMetadata

**Zweck**: Definiert alle Metadaten der Node für Registry und LLM

**Pattern**:
```typescript
import type { NodeMetadata } from "../../node-metadata";
import { [Icon] } from "lucide-react";
import { [Name]NodeProcessor } from "./[name]-processor";
import { [name]LLMTools } from "./llm-tools"; // optional

export const [name]NodeMetadata: NodeMetadata = {
  type: "[name]Node",
  label: "[Display Name]",
  icon: [Icon],
  status: "working", // "working" | "wip" | "new"
  processor: new [Name]NodeProcessor(),
  defaultData: {
    label: "[Display Name]",
  },
  llmTools: [name]LLMTools, // optional
};
```

**Wichtig**:
- `type` muss mit auto-registry übereinstimmen (camelCase + Node suffix)
- `processor` muss eine Instanz der Processor-Klasse sein
- `icon` von lucide-react importieren

## 3. [name]-processor.ts - Processor Klasse

**Zweck**: Enthält die Haupt-Business-Logic der Node

**Pattern**:
```typescript
import type { NodeProcessor, ProcessorContext } from "@/src/canvas/executor";
import { [Name]Manager } from "./[name]-manager"; // optional

export class [Name]NodeProcessor implements NodeProcessor {
  private manager = new [Name]Manager(); // optional

  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    console.log(`[[Name]Node] Processing node ${node.id}`);
    console.log(`[[Name]Node] Inputs:`, inputValues);

    try {
      // 1. Set loading state
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: true,
        error: null,
      });

      // 2. Process input values
      const input1 = inputValues?.input1 as string | undefined;
      const input2 = inputValues?.input2 as number | undefined;

      // 3. Execute business logic
      const result = await this.manager.doSomething(input1, input2);

      // 4. Update node with results
      const resultData = {
        output1: result.value1,
        output2: result.value2,
      };

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        ...resultData,
      });

      // 5. Return result for next nodes
      return resultData;
      
    } catch (error) {
      console.error(`[[Name]Node] Error:`, error);
      
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw error;
    }
  }
}
```

**Wichtig**:
- Immer `NodeProcessor` interface implementieren
- Loading/Error States über `context.updateNodeData` setzen
- Try-catch für Fehlerbehandlung
- Console-Logs mit Node-Namen prefix für Debugging

## 4. ui.tsx - UI Content

**Zweck**: Zeigt die Node-Daten im Canvas an

**Pattern**:
```tsx
"use client";

import React from "react";

interface [Name]NodeUIProps {
  data: {
    output1?: string;
    output2?: number;
    error?: string;
    // ... weitere Felder
  };
}

export const [Name]NodeUI: React.FC<[Name]NodeUIProps> = ({ data }) => {
  const { output1, output2, error } = data;

  if (error) {
    return (
      <div className="text-xs text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="text-xs space-y-2">
      {output1 && (
        <div>
          <span className="font-medium">Output 1: </span>
          <span>{output1}</span>
        </div>
      )}
      
      {output2 !== undefined && (
        <div>
          <span className="font-medium">Output 2: </span>
          <span>{output2}</span>
        </div>
      )}
    </div>
  );
};
```

**Wichtig**:
- Reine Präsentations-Komponente
- Props mit TypeScript Interface definieren
- Conditional Rendering für optionale Felder
- Konsistentes Styling (text-xs, space-y-2, font-medium)

## 5. types.ts - TypeScript Types

**Zweck**: Zentrale Type-Definitionen für die Node

**Pattern**:
```typescript
// Input Types
export interface [Name]Input {
  input1?: string;
  input2?: number;
}

// Output Types
export interface [Name]Output {
  output1: string;
  output2: number;
}

// Internal Types
export interface [Name]InternalData {
  // ...
}
```

## 6. llm-tools.ts - LLM Tool Definitionen (OPTIONAL)

**Zweck**: Definiert LLM-Tools für AI-gesteuerte Interaktion

**Pattern**:
```typescript
import type { LLMTool } from "../../node-metadata";

export const [name]LLMTools: LLMTool[] = [
  {
    name: "[tool_name]",
    description: "Beschreibung was das Tool macht",
    input_schema: {
      type: "object",
      properties: {
        param1: {
          type: "string",
          description: "Beschreibung von param1"
        },
        param2: {
          type: "number",
          description: "Beschreibung von param2"
        }
      },
      required: ["param1"] // optional
    }
  }
];
```

## 7. [name]-manager.ts - Business Logic (OPTIONAL)

**Zweck**: Separiert komplexe Business-Logic vom Processor

**Pattern**:
```typescript
export class [Name]Manager {
  private cache = new Map<string, any>();

  async doSomething(input1?: string, input2?: number): Promise<any> {
    // Cache check
    const cacheKey = `${input1}_${input2}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Business logic
    const result = { /* ... */ };

    // Cache result
    this.cache.set(cacheKey, result);
    return result;
  }

  clear(): void {
    this.cache.clear();
  }
}
```

## Beispiel: Einfache Node vs. Komplexe Node

### Einfache Node (nur 4 Dateien)
```
search-node/
  ├── index.tsx
  ├── metadata.ts
  ├── search-processor.ts
  └── ui.tsx
```

### Komplexe Node (alle Dateien)
```
file-manager-node/
  ├── index.tsx
  ├── metadata.ts
  ├── file-loader.ts (processor)
  ├── ui.tsx
  ├── types.ts
  ├── file-handler.tsx (spezielle Logik)
  ├── file-utils.ts (Hilfsfunktionen)
  └── llm-tools.ts (inline in metadata)
```

## Best Practices

1. **Naming Convention**: `[name]-processor.ts`, `[name]-manager.ts`
2. **Console Logging**: Prefix mit Node-Namen: `[NodeName]`
3. **Error Handling**: Immer try-catch in processor
4. **Loading States**: Über `context.updateNodeData` setzen
5. **Type Safety**: Props und Return-Values typisieren
6. **YAGNI**: Nur Dateien erstellen die gebraucht werden
7. **Hardcoded Values**: Am Anfang der Datei in GROSSBUCHSTABEN

## Auto-Registry Integration

Jede neue Node wird automatisch erkannt wenn:
1. Verzeichnis in `src/canvas/nodes/nodes/[node-name]/` existiert
2. `index.tsx` exportiert Node Component und Metadata
3. Naming Convention eingehalten wird

Keine manuelle Registry-Aktualisierung nötig!

