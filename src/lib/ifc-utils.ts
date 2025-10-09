// IFC data processing via Pyodide web worker
// This file contains legacy Pyodide-based IFC processing still used by File > Open menu

// Interfaces based on IfcOpenShell structure
export interface IfcElement {
  id: string;
  expressId: number;
  type: string;
  properties: Record<string, any>;
  geometry?: any;
  psets?: Record<string, any>;
  qtos?: Record<string, any>;
  propertyInfo?: {
    name: string;
    exists: boolean;
    value: any;
    psetName: string;
  };
  classifications?: Array<{
    System: string;
    Code: string;
    Description: string;
  }>;
  transformedGeometry?: {
    translation: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
}

export interface IfcModel {
  id: string;
  name: string;
  file?: any;
  schema?: string;
  project?: {
    GlobalId: string;
    Name: string;
    Description: string;
  };
  elementCounts?: Record<string, number>;
  totalElements?: number;
  elements: IfcElement[];
  sqliteDb?: string;
  sqliteSuccess?: boolean;
}

// Global reference to the last loaded model
let _lastLoadedModel: IfcModel | null = null;

// Cache for storing the original File objects of loaded IFC files
const ifcFileCache: Map<string, File> = new Map();

// Function to cache a File object
export function cacheIfcFile(file: File) {
  if (file && file.name) {
    if (!ifcFileCache.has(file.name)) {
      ifcFileCache.set(file.name, file);
    }
  }
}

// Function to get the last loaded model
export function getLastLoadedModel(): IfcModel | null {
  return _lastLoadedModel;
}

// Function to set the last loaded model (for debugging/testing)
export function setLastLoadedModel(model: IfcModel | null): void {
  _lastLoadedModel = model;
}

// Function to retrieve a stored File object
export function getIfcFile(fileName: string): File | null {
  return ifcFileCache.get(fileName) || null;
}

// Worker management
let ifcWorker: Worker | null = null;
let isWorkerInitialized = false;
const workerPromiseResolvers: Map<
  string,
  { resolve: Function; reject: Function }
> = new Map();

const workerMessageId = 0;

// SQLite warm-up status and events
type WarmStatus = 'idle' | 'warming' | 'ready' | 'error' | 'building' | 'unknown';
const sqliteWarmStatus = new Map<string, WarmStatus>();
export function getSqliteWarmStatus(model: IfcModel): WarmStatus {
  return sqliteWarmStatus.get(model.id) || 'idle';
}
function dispatchWarmStatus(modelId: string, status: WarmStatus, extra?: any) {
  try {
    window.dispatchEvent(new CustomEvent('sqlite:warm-status', { detail: { modelId, status, ...extra } }));
  } catch { }
}

// Initialize the worker
export async function initializeWorker(): Promise<void> {
  if (isWorkerInitialized) {
    return;
  }

  try {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      throw new Error('Worker is not defined');
    }
    ifcWorker = new Worker("/ifcWorker.js");

    ifcWorker.onmessage = (event) => {
      const { type, messageId, error, ...data } = event.data;

      if (type === "error") {
        if (messageId && workerPromiseResolvers.has(messageId)) {
          workerPromiseResolvers
            .get(messageId)!
            .reject(new Error(data.message));
          workerPromiseResolvers.delete(messageId);
        }
      } else if (type === "initialized") {
        if (messageId && workerPromiseResolvers.has(messageId)) {
          workerPromiseResolvers.get(messageId)!.resolve();
          workerPromiseResolvers.delete(messageId);
        }
      } else if (type === "loadComplete") {
        if (messageId && workerPromiseResolvers.has(messageId)) {
          workerPromiseResolvers.get(messageId)!.resolve(data);
          workerPromiseResolvers.delete(messageId);
        }
      } else if (type === "dataExtracted") {
        if (messageId && workerPromiseResolvers.has(messageId)) {
          workerPromiseResolvers.get(messageId)!.resolve(data);
          workerPromiseResolvers.delete(messageId);
        }
      } else if (type === "ifcExported") {
        if (messageId && workerPromiseResolvers.has(messageId)) {
          workerPromiseResolvers.get(messageId)!.resolve(data);
          workerPromiseResolvers.delete(messageId);
        }
      } else if (type === "geometry") {
        if (messageId && workerPromiseResolvers.has(messageId)) {
          workerPromiseResolvers.get(messageId)!.resolve(data.elements || []);
          workerPromiseResolvers.delete(messageId);
        }
      } else if (type === "extractQuantities") {
        if (messageId && workerPromiseResolvers.has(messageId)) {
          workerPromiseResolvers.get(messageId)!.resolve(data);
          workerPromiseResolvers.delete(messageId);
        }
      } else if (type === "quantityResults") {
        if (messageId && workerPromiseResolvers.has(messageId)) {
          workerPromiseResolvers.get(messageId)!.resolve(data.data);
          workerPromiseResolvers.delete(messageId);
        }
      } else if (type === "pythonResult") {
        if (messageId && workerPromiseResolvers.has(messageId)) {
          workerPromiseResolvers.get(messageId)!.resolve(data.result);
          workerPromiseResolvers.delete(messageId);
        }
      } else if (type === "sqliteResult") {
        if (messageId && workerPromiseResolvers.has(messageId)) {
          workerPromiseResolvers.get(messageId)!.resolve(data.result);
          workerPromiseResolvers.delete(messageId);
        }
        try {
          const model = getLastLoadedModel();
          if (model) {
            sqliteWarmStatus.set(model.id, 'ready');
            dispatchWarmStatus(model.id, 'ready');
            window.dispatchEvent(new CustomEvent('sqlite:ready', { detail: { modelId: model.id } }));
          }
        } catch { }
      } else if (type === "sqliteExport") {
        if (messageId && workerPromiseResolvers.has(messageId)) {
          workerPromiseResolvers.get(messageId)!.resolve(data.bytes);
          workerPromiseResolvers.delete(messageId);
        }
      } else if (type === "sqliteBuilt") {
        const model = getLastLoadedModel();
        if (model) {
          sqliteWarmStatus.set(model.id, 'warming');
          dispatchWarmStatus(model.id, 'warming');
        }
        if (messageId && workerPromiseResolvers.has(messageId)) {
          workerPromiseResolvers.get(messageId)!.resolve(data);
          workerPromiseResolvers.delete(messageId);
        }
      } else if (type === "sqliteWarmed") {
        const model = getLastLoadedModel();
        if (model) {
          sqliteWarmStatus.set(model.id, 'ready');
          dispatchWarmStatus(model.id, 'ready', { tableCount: data.tableCount });
        }
        if (messageId && workerPromiseResolvers.has(messageId)) {
          workerPromiseResolvers.get(messageId)!.resolve({ key: data.key, tableCount: data.tableCount });
          workerPromiseResolvers.delete(messageId);
        }
      } else if (type === "sqliteStatus") {
        const model = getLastLoadedModel();
        if (model) {
          if (data.status === 'ready') {
            sqliteWarmStatus.set(model.id, 'ready');
            dispatchWarmStatus(model.id, 'ready', { tableCount: data.tableCount });
          } else if (data.status === 'building') {
            sqliteWarmStatus.set(model.id, 'building');
            dispatchWarmStatus(model.id, 'warming');
          } else if (data.status === 'error') {
            sqliteWarmStatus.set(model.id, 'error');
            dispatchWarmStatus(model.id, 'error', { message: data.message });
          }
        }
      }
    };

    const messageId = `init_${Date.now()}`;
    await new Promise((resolve, reject) => {
      workerPromiseResolvers.set(messageId, { resolve, reject });
      ifcWorker!.postMessage({
        action: "init",
        messageId,
      });

      setTimeout(() => {
        if (workerPromiseResolvers.has(messageId)) {
          reject(new Error("Worker initialization timed out"));
          workerPromiseResolvers.delete(messageId);
        }
      }, 30000);
    });

    isWorkerInitialized = true;

  } catch (err) {
    throw new Error(
      `Failed to initialize worker: ${err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

// Load an IFC file using IfcOpenShell via the worker
export async function loadIfcFile(
  file: File,
  onProgress?: (progress: number, message?: string) => void
): Promise<IfcModel> {

  try {
    await initializeWorker();

    if (!ifcWorker) {
      throw new Error("IFC worker initialization failed");
    }

    const allowedProgressIds = new Set<string>();
    const progressHandler = (event: MessageEvent) => {
      const msg = event.data;
      if (!msg || msg.type !== "progress" || !onProgress) return;
      if (msg.messageId && allowedProgressIds.has(msg.messageId)) {
        onProgress(msg.percentage, msg.message);
      }
    };

    ifcWorker.addEventListener("message", progressHandler);

    ifcFileCache.set(file.name, file);

    const arrayBuffer = await file.arrayBuffer();

    const messageId = `load_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    allowedProgressIds.add(messageId);

    const result = await new Promise((resolve, reject) => {
      workerPromiseResolvers.set(messageId, { resolve, reject });

      ifcWorker!.postMessage(
        {
          action: "loadIfcFast",
          messageId,
          data: {
            arrayBuffer,
            filename: file.name,
          },
        },
        [arrayBuffer]
      );

      const timeoutDuration = file.size > 100 * 1024 * 1024 ? 120000 : 60000;
      setTimeout(() => {
        if (workerPromiseResolvers.has(messageId)) {
          console.warn(`Worker timeout after ${timeoutDuration / 1000}s for file size ${(file.size / 1024 / 1024).toFixed(1)}MB`);
          reject(new Error(`Worker did not respond within ${timeoutDuration / 1000} seconds for large file processing`));
          workerPromiseResolvers.delete(messageId);
        }
      }, timeoutDuration);
    });

    const processingTimeoutDuration = file.size > 100 * 1024 * 1024 ? 300000 : 120000;
    const timeout = setTimeout(() => {
      const resolver = workerPromiseResolvers.get(messageId);
      if (resolver) {
        console.warn(`Processing timeout after ${processingTimeoutDuration / 1000}s for file size ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      }
    }, processingTimeoutDuration);

    const modelInfo: any = result;

    clearTimeout(timeout);

    ifcWorker.removeEventListener("message", progressHandler);

    const elements = modelInfo.elements || [];

    const model: IfcModel = {
      id: `model-${Date.now()}`,
      name: file.name,
      file: file,
      schema: modelInfo.schema,
      project: modelInfo.project,
      elementCounts: modelInfo.element_counts,
      totalElements: modelInfo.total_elements,
      elements: elements,
      sqliteDb: modelInfo.sqlite_db,
      sqliteSuccess: modelInfo.sqlite_success,
    };

    _lastLoadedModel = model;

    cacheIfcFile(file);

    warmupSqliteDatabase(model).catch(error => {
      console.warn(`SQLite warm-up failed for model ${model.id}:`, error);
    });

    return model;
  } catch (err) {
    throw new Error(
      `Failed to load IFC file: ${err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

// Fire-and-forget warm-up of sql.js DB in the worker
export async function warmupSqliteDatabase(model: IfcModel): Promise<{ tableCount: number }> {
  await initializeWorker();
  if (!ifcWorker) throw new Error("IFC worker initialization failed");

  const messageId = `sqlite_warm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sqliteWarmStatus.set(model.id, 'warming');
  dispatchWarmStatus(model.id, 'warming');

  try {
    const res = await new Promise<{ tableCount: number }>((resolve, reject) => {
      workerPromiseResolvers.set(messageId, { resolve, reject });
      ifcWorker!.postMessage({
        action: "warmSqlite",
        messageId,
        data: { modelKey: model.name }
      });
      setTimeout(() => {
        if (workerPromiseResolvers.has(messageId)) {
          reject(new Error("SQLite warm-up timed out"));
          workerPromiseResolvers.delete(messageId);
        }
      }, 120000);
    });

    sqliteWarmStatus.set(model.id, 'ready');
    dispatchWarmStatus(model.id, 'ready');
    return { tableCount: (res && (res as any).tableCount) || 0 };
  } catch (e) {
    sqliteWarmStatus.set(model.id, 'error');
    dispatchWarmStatus(model.id, 'error');
    throw e;
  }
}
