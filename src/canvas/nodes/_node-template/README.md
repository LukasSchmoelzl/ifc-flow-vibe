# Node Template

Dieses Template dient als Ausgangspunkt für neue Nodes.

## Verwendung

1. **Kopiere das gesamte `_node-template` Verzeichnis:**
   ```bash
   cp -r src/canvas/nodes/_node-template src/canvas/nodes/nodes/[your-node-name]
   ```

2. **Ersetze alle Platzhalter:**
   - `[NAME]` → PascalCase (z.B. `Search`, `ProjectInfo`)
   - `[name]` → camelCase (z.B. `search`, `projectInfo`)
   - `[DISPLAY_NAME]` → Anzeigename (z.B. `"Search"`, `"Project Info"`)
   - `[tool_name]` → LLM Tool Name (z.B. `"bim_search"`)

3. **Wähle Icon aus lucide-react:**
   - Siehe: https://lucide.dev/icons
   - Beispiele: `Search`, `FolderTree`, `Eye`, `MousePointerClick`

4. **Entferne optionale Dateien:**
   - Wenn keine LLM-Integration: `llm-tools.ts` löschen
   - Wenn keine komplexe Logic: `[name]-manager.ts` löschen
   - Wenn keine Types: `types.ts` löschen

5. **Implementiere die Logic:**
   - `[name]-processor.ts`: Haupt-Business-Logic
   - `ui.tsx`: UI-Darstellung
   - `metadata.ts`: Node-Konfiguration

6. **Test die Node:**
   ```bash
   npm run build
   ```

## Pflicht-Dateien

- `index.tsx` - React Component
- `metadata.ts` - Node Metadata
- `[name]-processor.ts` - Processor
- `ui.tsx` - UI Component

## Optionale Dateien

- `types.ts` - TypeScript Types
- `llm-tools.ts` - LLM Tool Definitionen
- `[name]-manager.ts` - Business Logic Manager

## Beispiel: Search Node

```
search-node/
  ├── index.tsx              (✓ Pflicht)
  ├── metadata.ts            (✓ Pflicht)
  ├── search-processor.ts    (✓ Pflicht)
  ├── ui.tsx                 (✓ Pflicht)
  ├── types.ts               (✓ Empfohlen)
  ├── llm-tools.ts           (✓ Optional)
  ├── search-manager.ts      (✓ Optional)
  └── README.md              (- Nicht nötig)
```

## Auto-Registry

Die Node wird automatisch erkannt wenn:
1. Verzeichnis in `src/canvas/nodes/nodes/[node-name]/` existiert
2. `index.tsx` exportiert: `export { [name]NodeMetadata } from "./metadata";`
3. Naming Convention eingehalten wird

Keine manuelle Registrierung in `auto-registry.tsx` nötig!

## Weitere Infos

Siehe: `src/canvas/nodes/NODE_TEMPLATE.md`

