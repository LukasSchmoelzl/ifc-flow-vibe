# 📐 IFC-Flow - Detaillierte Projektstruktur

## 🎯 Übersicht

IFC-Flow ist eine **visuelle Node-basierte Web-Anwendung** für die Verarbeitung von IFC-Dateien (Industry Foundation Classes) aus dem BIM-Bereich (Building Information Modeling). Die App ermöglicht es, komplexe Datenverarbeitungs-Workflows durch einfaches Drag-and-Drop von Nodes zu erstellen.

**Tech-Stack:** Next.js 14, React 18, TypeScript, React Flow, Tailwind CSS, web-ifc, IfcOpenShell, Three.js, shadcn/ui, Radix UI  
**Details:** Siehe `package.json` für alle Dependencies und Versionen

---

## 📁 Projektstruktur

```
202510_IFCFlow/
│
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API Routes
│   │   └── chat/
│   │       └── route.ts          # AI-Chat API-Endpunkt
│   ├── globals.css               # Globale Styles
│   ├── layout.tsx                # Root-Layout mit Theme-Provider
│   └── page.tsx                  # Hauptseite (Flow-Canvas)
│
├── components/                   # React-Komponenten
│   ├── nodes/                    # 18 verschiedene Node-Typen
│   │   ├── ifc-node.tsx          # IFC-Datei Import
│   │   ├── filter-node.tsx       # Element-Filterung
│   │   ├── viewer-node.tsx       # 3D-Viewer
│   │   ├── property-node.tsx     # Property-Management
│   │   ├── geometry-node.tsx     # Geometrie-Extraktion
│   │   ├── quantity-node.tsx     # Mengenermittlung
│   │   ├── spatial-node.tsx      # Räumliche Abfragen
│   │   ├── export-node.tsx       # Daten-Export (CSV/JSON/IFC)
│   │   ├── python-node.tsx       # Python-Scripting
│   │   ├── ai-node.tsx           # KI-Chat-Integration
│   │   ├── analysis-node.tsx     # Analysen (z.B. Clash Detection)
│   │   ├── watch-node.tsx        # Debugging/Monitoring
│   │   ├── parameter-node.tsx    # Workflow-Parameter
│   │   ├── transform-node.tsx    # 3D-Transformationen
│   │   ├── data-transform-node.tsx # Daten-Transformationen
│   │   ├── relationship-node.tsx # Beziehungs-Abfragen
│   │   ├── classification-node.tsx # Klassifikations-Management
│   │   ├── cluster-node.tsx      # Element-Clustering
│   │   ├── node-types.ts         # TypeScript-Interfaces
│   │   └── index.ts              # Node-Registry
│   │
│   ├── dialogs/                  # Modal-Dialoge
│   │   ├── properties-dialog.tsx # Node-Eigenschaften bearbeiten
│   │   ├── export-dialog.tsx     # Export-Optionen
│   │   ├── save-workflow-dialog.tsx # Workflow speichern
│   │   ├── open-file-dialog.tsx  # Datei öffnen
│   │   ├── python-editor-dialog.tsx # Python-Editor
│   │   ├── settings-dialog.tsx   # App-Einstellungen
│   │   ├── help-dialog.tsx       # Hilfe-Dialog
│   │   └── about-dialog.tsx      # Über-Dialog
│   │
│   ├── properties-panel/         # Properties-Panel-Komponenten
│   │   ├── properties-panel.tsx  # Hauptkomponente
│   │   ├── node-property-renderer.tsx # Node-spezifische Renderer
│   │   └── property-editors/     # Spezielle Property-Editoren
│   │       ├── filter-editor.tsx
│   │       ├── geometry-editor.tsx
│   │       ├── data-transform-editor.tsx
│   │       └── space-analysis-editor.tsx
│   │
│   ├── contexts/                 # React Contexts
│   │   └── viewer-focus-context.tsx # Viewer-Focus-Management
│   │
│   ├── ui/                       # 51 shadcn/ui Komponenten
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── toast.tsx
│   │   └── ...                   # 46 weitere UI-Komponenten
│   │
│   ├── flow-canvas.tsx           # React Flow Canvas
│   ├── sidebar.tsx               # Sidebar mit Node-Palette
│   ├── menubar.tsx               # Hauptmenü
│   ├── toolbar.tsx               # Toolbar
│   ├── workflow-library.tsx      # Workflow-Bibliothek
│   ├── theme-provider.tsx        # Dark/Light Mode
│   ├── toaster.tsx               # Toast-Notifications
│   └── coffee-support.tsx        # Ko-fi Integration
│
├── lib/                          # Geschäftslogik & Utilities
│   ├── ifc/                      # IFC-Verarbeitungs-Module (12 Module)
│   │   ├── geometry-utils.ts     # Geometrie-Extraktion
│   │   ├── filter-utils.ts       # Element-Filterung
│   │   ├── property-utils.ts     # Property-Management
│   │   ├── quantity-utils.ts     # Mengenermittlung
│   │   ├── spatial-utils.ts      # Räumliche Abfragen
│   │   ├── analysis-utils.ts     # Analysen (Clash Detection, etc.)
│   │   ├── cluster-utils.ts      # Element-Clustering
│   │   ├── element-utils.ts      # Element-Utilities
│   │   ├── viewer-manager.ts     # 3D-Viewer-Management
│   │   ├── viewer-utils.ts       # 3D-Viewer-Utilities
│   │   ├── file-uploader.ts      # Datei-Upload-Logic
│   │   └── index.ts              # Export-Barrel
│   │
│   ├── ai/                       # KI-Integration
│   │   ├── model-helpers.ts      # KI-Model-Helpers
│   │   └── optimized-sql-queries.ts # SQL-Abfragen für KI
│   │
│   ├── workflow-executor.ts      # Workflow-Ausführungslogik (1629 Zeilen!)
│   ├── workflow-storage.ts       # Workflow-Persistierung
│   ├── ifc-utils.ts              # IFC-Hauptutilities
│   ├── model-utils.ts            # Model-Utilities
│   ├── data-transform-utils.ts   # Daten-Transformationen
│   ├── server-python-executor.ts # Python-Ausführung (Server-Side)
│   ├── server-sqlite.ts          # SQLite-Integration
│   ├── client-query-transport.ts # Client-Server-Kommunikation
│   ├── logger.ts                 # Logging-System
│   ├── settings-manager.ts       # Einstellungs-Management
│   ├── keyboard-shortcuts.ts     # Tastatur-Shortcuts
│   ├── node-styles.ts            # Node-Styling-Logic
│   ├── rate-limiter.ts           # Rate-Limiting
│   ├── input-validator.ts        # Input-Validierung
│   ├── turnstile.ts              # Cloudflare Turnstile
│   └── utils.tsx                 # Allgemeine Utilities
│
├── hooks/                        # React Custom Hooks
│   ├── use-toast.ts              # Toast-Hook
│   ├── use-mobile.tsx            # Mobile-Detection
│   ├── use-file-drag.ts          # File-Drag-and-Drop
│   ├── use-node-dragging.ts      # Node-Dragging
│   ├── use-node-selection.ts     # Node-Selection
│   ├── use-workflow-history.ts   # Undo/Redo
│   ├── use-clipboard.ts          # Clipboard-Operationen
│   ├── use-client-query-chat.ts  # KI-Chat-Hook
│   └── index.ts                  # Export-Barrel
│
├── ifc2sql/                      # IFC-zu-SQLite-Konvertierung
│   ├── pyodide-worker.ts         # Pyodide Web Worker
│   └── use-pyodide.ts            # Pyodide-Hook
│
├── public/                       # Statische Assets
│   ├── wasm/                     # WebAssembly-Dateien
│   │   ├── web-ifc.wasm          # IFC-Parser (Browser)
│   │   ├── web-ifc-mt.wasm       # IFC-Parser (Multi-Threading)
│   │   ├── web-ifc-node.wasm     # IFC-Parser (Node.js)
│   │   ├── web-ifc-api.js        # JavaScript-API
│   │   ├── web-ifc-mt.worker.js  # Web Worker
│   │   ├── ifcopenshell-*.whl    # IfcOpenShell Python-Paket
│   │   └── *.d.ts                # TypeScript-Definitionen
│   ├── ifcWorker.js              # IFC Web Worker
│   ├── spaceAnalysisWorker.js    # Space-Analysis Worker
│   └── ifc2sql.py                # Python-Script für IFC-zu-SQL
│
├── tests/                        # Test-Scripts
│   ├── automated-ifc2sql-test.js
│   ├── test-ai-chat.js
│   ├── test-browser-workflow.js
│   ├── test-full-database-generation.js
│   └── ...                       # 13 weitere Test-Dateien
│
├── scripts/                      # Utility-Scripts
│   └── view-ai-logs.js           # KI-Log-Viewer
│
├── docs/                         # Dokumentation
│   ├── assets/                   # Screenshots
│   │   ├── ui_light.png
│   │   └── ui_dark.png
│   ├── python-examples/          # Python-Beispiele
│   │   ├── add-room-info-example.py
│   │   ├── room-assignment-transform.py
│   │   └── space-analysis-example.py
│   ├── data-transform-examples.md
│   ├── logging-system.md
│   ├── sqlite-ifc-queries.md
│   └── turnstile-setup.md
│
├── styles/                       # Zusätzliche Styles
│   └── globals.css
│
├── package.json                  # NPM-Abhängigkeiten (720 Pakete)
├── tsconfig.json                 # TypeScript-Konfiguration
├── next.config.js                # Next.js-Konfiguration (WASM-Support)
├── tailwind.config.ts            # Tailwind-Konfiguration
├── components.json               # shadcn/ui-Konfiguration
├── eslint.config.mjs             # ESLint-Konfiguration
├── middleware.ts                 # Next.js Middleware
├── README.md                     # Projekt-README
└── LICENSE                       # AGPL-3.0 Lizenz
```

---

## 🔄 Datenfluss & Architektur

### **1. IFC-Datei-Verarbeitung**

```
┌─────────────┐
│ IFC-Datei   │
│ (.ifc)      │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────┐
│  IFC-Node (ifc-node.tsx)             │
│  - File-Upload-Handler               │
│  - Speichert Datei im lokalen Cache  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Web Worker (ifcWorker.js)           │
│  - Läuft in separatem Thread         │
│  - Vermeidet UI-Blocking             │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  WebAssembly Verarbeitung            │
│  ┌────────────────────────────────┐  │
│  │ web-ifc.wasm                   │  │
│  │ - Schnelles IFC-Parsing        │  │
│  │ - Extrahiert Geometrie         │  │
│  │ - Liest Properties             │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ IfcOpenShell (via Pyodide)     │  │
│  │ - Python-basierte Verarbeitung │  │
│  │ - Komplexe IFC-Operationen     │  │
│  │ - Property-Modifikationen      │  │
│  └────────────────────────────────┘  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  JSON-Model                          │
│  - JavaScript-freundliches Format    │
│  - Alle Elemente & Properties        │
│  - Geometrie-Daten                   │
└──────────────┬───────────────────────┘
               │
               ▼
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌─────────┐       ┌──────────┐
│ Filter  │       │ Viewer   │
│ Node    │       │ Node     │
└────┬────┘       └────┬─────┘
     │                 │
     ▼                 ▼
  Weitere           3D-Ansicht
  Nodes             (Three.js)
```

### **2. Workflow-Ausführung**

```
1. User klickt "Run Workflow" (F5)
   ↓
2. WorkflowExecutor.execute() startet
   ↓
3. Topologische Sortierung der Nodes
   - Findet Start-Nodes (keine Inputs)
   - Berechnet Abhängigkeiten
   - Sortiert für sequentielle Ausführung
   ↓
4. Nodes werden nacheinander ausgeführt
   - Inputs von vorherigen Nodes holen
   - Node-spezifische Logic ausführen
   - Ergebnisse speichern
   - UI-Update triggern (Live-Feedback)
   ↓
5. Ergebnisse werden in nodeResults Map gespeichert
   ↓
6. UI-Update: Alle Nodes zeigen ihre Ergebnisse
```

### **3. Node-Typen & Funktionen**

| Node-Typ | Funktion | Input | Output |
|---------|----------|-------|--------|
| **IFC Node** | Lädt IFC-Datei | - | IFC-Model |
| **Filter Node** | Filtert Elemente | Elements | Filtered Elements |
| **Viewer Node** | 3D-Visualisierung | Elements/Model | Visual Output |
| **Property Node** | Get/Set Properties | Elements | Modified Elements |
| **Geometry Node** | Geometrie-Extraktion | Elements | Geometry Data |
| **Quantity Node** | Mengenermittlung | Elements | Quantities |
| **Spatial Node** | Räumliche Abfragen | Elements | Spatial Data |
| **Export Node** | Export (CSV/JSON/IFC) | Elements | File Download |
| **Python Node** | Python-Scripting | Elements | Script Output |
| **AI Node** | KI-Chat-Integration | Model | AI Response |
| **Analysis Node** | Clash Detection, etc. | Elements | Analysis Results |
| **Watch Node** | Debug/Monitor | Any | Display Value |
| **Parameter Node** | Workflow-Parameter | - | Parameter Value |
| **Transform Node** | 3D-Transformationen | Elements | Transformed Elements |
| **Data Transform** | Daten-Transformationen | Data | Transformed Data |
| **Relationship Node** | Beziehungs-Abfragen | Elements | Relationships |
| **Classification Node** | Klassifikations-Mgmt | Elements | Classifications |
| **Cluster Node** | Element-Clustering | Elements | Clusters |

---

## 🧩 Kern-Module

### **1. workflow-executor.ts (1629 Zeilen)**
Das Herzstück der App. Führt Workflows aus:
- Topologische Sortierung von Nodes
- Ausführung in korrekter Reihenfolge
- Fehlerbehandlung
- Live-UI-Updates
- 18 verschiedene Node-Handler

### **2. ifc-utils.ts + lib/ifc/**
IFC-Verarbeitungs-Pipeline:
- File-Upload & Caching
- Web Worker Management
- WASM-Integration
- Geometrie-Extraktion
- Property-Management
- Spatial Queries
- Analysis (Clash Detection)

### **3. flow-canvas.tsx (1349 Zeilen)**
React Flow Integration:
- Node-Rendering
- Edge-Rendering
- Drag & Drop
- Keyboard Shortcuts
- Undo/Redo
- Copy/Paste
- Mobile-Support

### **4. AI-Integration (lib/ai/)**
OpenRouter/OpenAI Integration:
- Chat mit IFC-Model
- SQL-Query-Generierung
- Context-Management
- Streaming-Responses

---

## 🎨 UI-Komponenten

### **shadcn/ui (51 Komponenten)**
Basierend auf Radix UI Primitives:
- Dialogs, Modals, Drawers
- Buttons, Inputs, Forms
- Tables, Charts, Cards
- Tooltips, Popovers, Dropdowns
- Alle vollständig accessible (ARIA)

### **Theme-System**
- Light/Dark Mode
- System-Sync
- next-themes Integration
- Tailwind CSS Variables

---

## 🔧 Wichtige Konfigurationen

### **next.config.js**
- WebAssembly-Support aktiviert
- WASM-Mime-Type-Header
- Security-Header
- Custom Webpack-Config

### **tsconfig.json**
- Strict Mode
- Path-Aliases (@/)
- ESNext Target

### **tailwind.config.ts**
- Custom Colors
- Custom Animations
- shadcn/ui Integration

---

## 🚀 Entwicklung

### **Installation**
```bash
npm install
```

### **Development Server**
```bash
npm run dev
# Läuft auf http://localhost:3000
```

### **Build**
```bash
npm run build
```

### **Linting**
```bash
npm run lint
```

---

## 📦 Dependencies

**Alle Dependencies und Versionen:** Siehe `package.json`

**Hauptkomponenten:**
- Next.js 14 (React Framework mit App Router)
- React Flow (Node-basierte UI)
- web-ifc + IfcOpenShell (IFC-Verarbeitung via WASM/Pyodide)
- Three.js (3D-Visualisierung)
- Radix UI + shadcn/ui (51 accessible UI-Komponenten)
- Vercel AI SDK (AI-Integration)
- SQLite3 + alasql (Datenbank)

---

## 🔐 Sicherheit

### **AGPL-3.0 Lizenz**
- Open Source
- Copyleft
- Server-Side-Änderungen müssen veröffentlicht werden

### **Security Headers**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### **Cloudflare Turnstile**
- Bot-Protection
- CAPTCHA-Alternative

---

## 🐛 Testing

### **Test-Scripts (tests/)**
- `automated-ifc2sql-test.js` - IFC-zu-SQL Tests
- `test-ai-chat.js` - AI-Chat Tests
- `test-browser-workflow.js` - Browser-Workflow Tests
- `test-full-database-generation.js` - Datenbank-Tests
- Insgesamt 20 Test-Dateien

---

## 📚 Dokumentation

### **docs/**
- `data-transform-examples.md` - Daten-Transformations-Beispiele
- `logging-system.md` - Logging-System-Dokumentation
- `sqlite-ifc-queries.md` - SQL-Query-Beispiele
- `python-examples/` - Python-Script-Beispiele

---

## 🎯 Key Features im Code

### **1. Undo/Redo System**
- Implementiert in `flow-canvas.tsx`
- History-Stack (max 50 Einträge)
- Keyboard Shortcuts (Ctrl+Z / Ctrl+Shift+Z)

### **2. Mobile Support**
- Responsive Design
- Touch-optimierte Interaktionen
- Mobile Sidebar
- Placement Mode für Nodes

### **3. Real-time Execution**
- Live-Updates während Workflow-Ausführung
- Progress-Messages
- Error-Handling mit Toast-Notifications

### **4. File Drag & Drop**
- IFC-Dateien direkt auf Canvas ziehen
- Automatische Node-Erstellung
- Visual Feedback

### **5. 3D Viewer**
- Three.js Integration
- Viewer-Focus-Mode
- Element-Highlighting
- Camera Controls

### **6. Python Scripting**
- Pyodide Integration
- IfcOpenShell-Zugriff
- Custom Scripts für IFC-Manipulation

### **7. AI Integration**
- Chat mit IFC-Model
- SQL-Query-Generierung
- Context-aware Responses
- Streaming-Support

---

## 🔮 Architektur-Highlights

### **Client-Side Processing**
- Alle IFC-Verarbeitung im Browser
- Keine Server-Uploads nötig
- Privacy-freundlich

### **Web Workers**
- IFC-Parsing in separatem Thread
- UI bleibt responsiv
- Multi-Threading-Support (web-ifc-mt.wasm)

### **WebAssembly**
- Native Performance
- C++ Code (web-ifc)
- Python Code (IfcOpenShell via Pyodide)

### **React Flow**
- Node-basierte UI
- Echtzeit-Visualisierung
- Drag & Drop
- Auto-Layout-Optionen

---

## 📊 Code-Statistiken

- **Gesamt-Packages**: 720 npm-Pakete
- **Komponenten**: 18 Node-Typen + 51 UI-Komponenten
- **Größte Datei**: workflow-executor.ts (1629 Zeilen)
- **IFC-Module**: 12 spezialisierte Module
- **Test-Dateien**: 20 Test-Scripts
- **Dialoge**: 8 verschiedene Modal-Dialoge

---

## 🎓 Lernressourcen

- **Next.js**: https://nextjs.org/docs
- **React Flow**: https://reactflow.dev/docs
- **web-ifc**: https://github.com/ThatOpen/engine_web-ifc
- **IfcOpenShell**: https://blenderbim.org/docs-python/
- **shadcn/ui**: https://ui.shadcn.com/

---

## 🚦 Getting Started Guide

1. **Installation**
   ```bash
   npm install
   ```

2. **Development Server starten**
   ```bash
   npm run dev
   ```

3. **App öffnen**
   - Browser: http://localhost:3000

4. **IFC-Datei laden**
   - IFC-Node aus Sidebar ziehen
   - IFC-Datei hochladen oder per Drag & Drop

5. **Workflow erstellen**
   - Weitere Nodes hinzufügen
   - Nodes verbinden
   - Properties konfigurieren

6. **Workflow ausführen**
   - F5 drücken oder Run-Button klicken
   - Ergebnisse in Echtzeit beobachten

---

## 🎨 Styling-Konzept

### **Tailwind CSS**
- Utility-First CSS
- Custom Theme mit CSS Variables
- Dark/Light Mode Support

### **CSS Architecture**
```
globals.css
├── Tailwind Base Layer
├── Tailwind Components Layer
├── Tailwind Utilities Layer
├── Custom CSS Variables (Colors, Sizes)
└── Node-specific Styles
```

### **shadcn/ui Customization**
- Komponenten in `components/ui/`
- Vollständig customizable
- Radix UI Primitives als Basis

---

## 🌐 Deployment

### **Vercel (Empfohlen)**
- Optimiert für Next.js
- Automatische WASM-Unterstützung
- Edge Functions
- Global CDN

### **Wichtige Konfigurationen**
- `next.config.js` - WASM-Support
- `middleware.ts` - Routing
- Environment Variables für API-Keys

---

## 📝 Lizenz

**AGPL-3.0**
- Open Source
- Copyleft
- Server-Änderungen müssen veröffentlicht werden
- Kommerzielle Nutzung erlaubt

---

**Version**: 0.2.0  
**Autor**: louistrue  
**GitHub**: https://github.com/louistrue/ifc-flow  
**Website**: https://ifcflow.com

