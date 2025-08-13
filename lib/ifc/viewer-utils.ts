import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { IfcAPI, IfcGeometry, FlatMesh, PlacedGeometry, Vector } from "web-ifc"; // Import necessary types

// Viewer configuration options
export interface ViewerOptions {
  backgroundColor?: string;
  showGrid?: boolean;
  showAxes?: boolean;
  cameraPosition?: [number, number, number];
  highlightColor?: string;
}

// Event types for viewer lifecycle
export interface ViewerEvents {
  modelLoaded: { modelName: string; elementCount: number };
  modelCleared: {};
}

// The main viewer class that handles 3D rendering
export class IfcViewer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private ifcAPI: IfcAPI | null = null;
  private modelID: number | null = null;
  // Store the main model group containing all meshes
  private ifcModelGroup: THREE.Group | null = null; // Changed from ifcModelMesh
  private selectedElements: Set<string> = new Set();
  private highlightMaterial: THREE.MeshBasicMaterial;
  private animationFrameId: number | null = null;
  // Material cache
  private materials: Record<string, THREE.Material> = {};

  // Geometry indexing for real-time access
  private expressIdToMeshes: Map<number, THREE.Mesh[]> = new Map();
  private meshToExpressId: Map<THREE.Mesh, number> = new Map();
  private originalMaterials: Map<THREE.Mesh, THREE.Material> = new Map();

  // Event callbacks
  private eventCallbacks: Partial<Record<keyof ViewerEvents, (data: any) => void>> = {};

  constructor(
    private container: HTMLElement,
    private options: ViewerOptions = {}
  ) {
    // Initialize Three.js components
    this.scene = new THREE.Scene();

    // Set background color
    const bgColor = options.backgroundColor || "#f0f0f0";
    this.scene.background = new THREE.Color(bgColor);

    // Set up camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(
      options.cameraPosition?.[0] || 10,
      options.cameraPosition?.[1] || 10,
      options.cameraPosition?.[2] || 10
    );
    this.camera.lookAt(0, 0, 0); // Look at origin initially

    // Set up renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Set up controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Slightly brighter ambient
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Slightly less intense directional
    directionalLight.position.set(10, 20, 10);
    this.scene.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5); // Add another light from a different angle
    directionalLight2.position.set(-10, -5, -15);
    this.scene.add(directionalLight2);


    // Add grid and axes if needed
    if (options.showGrid !== false) {
      const grid = new THREE.GridHelper(100, 100); // Larger grid
      this.scene.add(grid);
    }

    if (options.showAxes !== false) {
      const axes = new THREE.AxesHelper(10); // Larger axes
      this.scene.add(axes);
    }

    // Highlight material for selected elements (needs rework for LoadAllGeometry)
    this.highlightMaterial = new THREE.MeshBasicMaterial({
      color: options.highlightColor || 0xff0000,
      transparent: true,
      opacity: 0.5,
      depthTest: false, // Render highlight on top
    });

    // Start animation loop
    this.animate();

    // Handle window resize
    window.addEventListener("resize", this.handleResize);
  }

  // Initialize IfcAPI for web-ifc
  async initIfcAPI(): Promise<IfcAPI> {
    if (!this.ifcAPI) {
      console.log("Initializing IFC API...");
      this.ifcAPI = new IfcAPI();
      await this.ifcAPI.SetWasmPath("/wasm/", true);
      await this.ifcAPI.Init(); // Call Init() without arguments
      console.log("IFC API Initialized.");
    }
    return this.ifcAPI;
  }

  // Load an IFC model using web-ifc's geometry loader and build THREE meshes
  async loadIfc(file: File): Promise<void> {
    console.log("Loading IFC file:", file.name);
    let tempModelID: number | null = null;

    try {
      const ifcAPI = await this.initIfcAPI();
      if (!ifcAPI) throw new Error("IFC API not initialized");

      this.clear();

      console.log("Reading file buffer...");
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);

      console.log("Opening IFC model with web-ifc...");
      tempModelID = ifcAPI.OpenModel(data);
      this.modelID = tempModelID;
      console.log("Model opened, ID:", this.modelID);

      console.log("Requesting geometry data generation...");
      // LoadAllGeometry returns a Vector<FlatMesh> handle
      const flatMeshVector: Vector<FlatMesh> = await ifcAPI.LoadAllGeometry(this.modelID);
      console.log("Geometry data vector obtained.");

      this.ifcModelGroup = new THREE.Group();
      this.ifcModelGroup.name = file.name;

      const numFlatMeshes = flatMeshVector.size();
      console.log(`Processing ${numFlatMeshes} flat meshes...`);

      for (let i = 0; i < numFlatMeshes; i++) {
        const flatMesh: FlatMesh = flatMeshVector.get(i); // Get FlatMesh handle
        const placedGeometryVector: Vector<PlacedGeometry> = flatMesh.geometries;
        const numPlacedGeometries = placedGeometryVector.size();

        for (let j = 0; j < numPlacedGeometries; j++) {
          const placedGeometry: PlacedGeometry = placedGeometryVector.get(j); // Get PlacedGeometry handle
          // Get the geometry handle using the expressID from PlacedGeometry
          const geometryHandle: IfcGeometry = ifcAPI.GetGeometry(this.modelID, placedGeometry.geometryExpressID);

          if (geometryHandle) {
            const threeMesh = this.createThreeMesh(geometryHandle, placedGeometry);
            if (threeMesh) {
              // Associate the mesh with the original product ID for indexing
              const expressId = flatMesh.expressID;
              threeMesh.userData = { expressID: expressId };

              // Build the geometry index
              if (!this.expressIdToMeshes.has(expressId)) {
                this.expressIdToMeshes.set(expressId, []);
              }
              this.expressIdToMeshes.get(expressId)!.push(threeMesh);
              this.meshToExpressId.set(threeMesh, expressId);

              // Store original material for restoration
              this.originalMaterials.set(threeMesh, threeMesh.material as THREE.Material);

              this.ifcModelGroup.add(threeMesh);
            }
            geometryHandle.delete(); // Clean up geometry handle
          } else {
            // console.warn(`Could not get geometry handle for instance geometryExpressID: ${placedGeometry.geometryExpressID}`);
          }
          // PlacedGeometry might not have a delete method, check API if needed
          // placedGeometry.delete();
        }
      }

      // The Vector handle itself might not need deletion, only its contents
      // REMOVED: flatMeshVector.delete();
      console.log("Finished processing geometry subsets.");

      if (this.ifcModelGroup.children.length > 0) {
        this.scene.add(this.ifcModelGroup);
        console.log(`IFC model group with ${this.ifcModelGroup.children.length} meshes added to scene.`);
        console.log(`Indexed ${this.expressIdToMeshes.size} unique elements with geometry.`);

        // Emit model loaded event
        this.emitEvent('modelLoaded', {
          modelName: file.name,
          elementCount: this.expressIdToMeshes.size
        });
      } else {
        console.warn("No valid meshes were generated from the IFC geometry data.");
        this.ifcModelGroup = null;
      }

      this.fitCameraToModel();

    } catch (error) {
      console.error("Error loading IFC for visualization:", error);
      const idToClose = this.modelID !== null ? this.modelID : tempModelID;
      if (this.ifcAPI && idToClose !== null) {
        try {
          console.log("Closing potentially opened model in web-ifc:", idToClose);
          this.ifcAPI.CloseModel(idToClose);
        } catch (closeError) {
          console.error("Error closing model after load failure:", closeError);
        }
      }
      this.modelID = null;
      this.ifcModelGroup = null;
      try { this.clear(); } catch (clearError) { console.error("Error during clear after load failure:", clearError); }
      throw error;
    }
  }

  // Helper function to create a THREE.Mesh from web-ifc geometry data handles
  private createThreeMesh(geometryHandle: IfcGeometry, placedGeometry: PlacedGeometry): THREE.Mesh | null {
    // Add null check for placedGeometry
    if (!placedGeometry) {
      console.warn("createThreeMesh called with invalid placedGeometry");
      return null;
    }
    try {
      // Use local variable for null check safety
      const ifcAPI = this.ifcAPI;
      if (!ifcAPI || this.modelID === null) return null;

      // REMOVED geometry type check - attempt to process all as mesh
      // const geometryType = geometryHandle.GetGeometryType();
      // if (geometryType === ifcAPI.IFCMESH || geometryType === ifcAPI.IFCSOLID || geometryType === ifcAPI.IFCFACETEDBREP)

      // Attempt to get vertex and index data, might fail for non-mesh types
      const vertexDataPtr = geometryHandle.GetVertexData();
      const vertexDataSize = geometryHandle.GetVertexDataSize();
      const indexDataPtr = geometryHandle.GetIndexData();
      const indexDataSize = geometryHandle.GetIndexDataSize();

      if (!vertexDataPtr || vertexDataSize === 0 || !indexDataPtr || indexDataSize === 0) {
        // console.warn(`Invalid or zero-sized geometry data pointers/sizes for geometry ID: ${placedGeometry.geometryExpressID}`);
        return null;
      }

      const vertices = ifcAPI.GetVertexArray(vertexDataPtr, vertexDataSize);
      const indices = ifcAPI.GetIndexArray(indexDataPtr, indexDataSize);

      if (!vertices || vertices.length === 0 || !indices || indices.length === 0) {
        // console.warn(`Empty vertices or indices array for geometry ID: ${placedGeometry.geometryExpressID}`);
        return null;
      }

      // --- Assume interleaved Vertex Data (Position + Normal) ---
      const bufferGeometry = new THREE.BufferGeometry();
      const numFloats = vertices.length;
      if (numFloats % 6 !== 0) {
        console.warn(`Interleaved vertices array length (${numFloats}) is not a multiple of 6 for geometry ID: ${placedGeometry.geometryExpressID}`);
        // Attempt to process as position-only if not multiple of 6?
        // For now, skip if format seems wrong.
        return null;
      }

      const numVertices = numFloats / 6;
      const positions = new Float32Array(numVertices * 3);
      const normals = new Float32Array(numVertices * 3);

      for (let i = 0; i < numVertices; i++) {
        const vIndex = i * 6;
        const pIndex = i * 3;

        positions[pIndex] = vertices[vIndex];
        positions[pIndex + 1] = vertices[vIndex + 1];
        positions[pIndex + 2] = vertices[vIndex + 2];

        normals[pIndex] = vertices[vIndex + 3];
        normals[pIndex + 1] = vertices[vIndex + 4];
        normals[pIndex + 2] = vertices[vIndex + 5];
      }

      bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      // --- End Interleaved Data Handling ---

      // --- Index Validation ---
      // const numVertices = vertices.length / 3; // Original calculation based on pos-only
      // Use the calculated numVertices from interleaved data
      let maxIndex = -1;
      let invalidIndexFound = false;
      for (let i = 0; i < indices.length; i++) {
        if (indices[i] >= numVertices) {
          console.warn(`Invalid index ${indices[i]} found (max allowed is ${numVertices - 1}) for geometry ID: ${placedGeometry.geometryExpressID}`);
          invalidIndexFound = true;
          break;
        }
        if (indices[i] > maxIndex) maxIndex = indices[i];
      }

      if (invalidIndexFound) {
        console.warn(`Skipping mesh creation due to invalid indices for geometry ID: ${placedGeometry.geometryExpressID}`);
        return null; // Skip this mesh
      }
      // --- End Index Validation ---

      // Restore setIndex
      bufferGeometry.setIndex(new THREE.Uint32BufferAttribute(indices, 1));

      const { color } = placedGeometry;
      if (!color) {
        console.warn("Missing color data in placed geometry:", placedGeometry);
        return null;
      }
      const matId = `${color.x}-${color.y}-${color.z}-${color.w}`;
      let material = this.materials[matId];
      if (!material) {
        material = new THREE.MeshLambertMaterial({
          color: new THREE.Color(color.x, color.y, color.z),
          opacity: color.w,
          transparent: color.w < 1.0,
          side: THREE.DoubleSide,
          depthWrite: color.w === 1.0,
        });
        this.materials[matId] = material;
      }

      const mesh = new THREE.Mesh(bufferGeometry, material);

      if (placedGeometry.flatTransformation && placedGeometry.flatTransformation.length === 16) {
        mesh.matrix.fromArray(placedGeometry.flatTransformation);
        mesh.matrixAutoUpdate = false;
        mesh.matrixWorldNeedsUpdate = true;
      } else {
        console.warn("Missing or invalid flatTransformation in placed geometry:", placedGeometry);
      }
      return mesh;

    } catch (e) {
      // Catch errors during geometry data access (e.g., GetVertexData on non-mesh)
      console.warn("Error processing geometry handle (likely not a mesh/solid/brep):", e, "GeometryHandle:", geometryHandle, "PlacedGeometry:", placedGeometry);
      return null;
    }
  }

  // *** Highlighting needs significant rework for this geometry loading approach ***
  highlightElements(elementIds: string[]): void {
    console.warn("highlightElements is not implemented for the current geometry loading method.");
  }
  clearHighlights(): void {
    console.warn("clearHighlights is not implemented for the current geometry loading method.");
  }

  // Fit camera to model bounds
  fitCameraToModel(): void {
    if (!this.ifcModelGroup || this.ifcModelGroup.children.length === 0) {
      console.log("No model group/meshes to fit camera to.");
      // Reset camera...
      this.camera.position.set(
        this.options.cameraPosition?.[0] || 10,
        this.options.cameraPosition?.[1] || 10,
        this.options.cameraPosition?.[2] || 10
      );
      this.camera.lookAt(0, 0, 0);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
      return;
    }

    console.log("Fitting camera to model group...");
    const box = new THREE.Box3().setFromObject(this.ifcModelGroup, true);

    // Check finiteness of box components (Fix for Linter Error #4)
    if (box.isEmpty() ||
      !Number.isFinite(box.max.x) || !Number.isFinite(box.max.y) || !Number.isFinite(box.max.z) ||
      !Number.isFinite(box.min.x) || !Number.isFinite(box.min.y) || !Number.isFinite(box.min.z)) {
      console.warn("Model group bounding box is empty or invalid (Infinite/NaN bounds?).");
      return;
    }

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    console.log("Model group bounds:", box.min, box.max);
    console.log("Model group center:", center);
    console.log("Model group size:", size);

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim <= 1e-6) {
      console.warn("Model dimensions are near zero, cannot fit camera reliably. Centering view.");
      // Center view...
      this.camera.position.set(center.x + 5, center.y + 5, center.z + 5);
      this.camera.lookAt(center);
      this.controls.target.copy(center);
      this.controls.update();
      return;
    }

    const fov = this.camera.fov * (Math.PI / 180);
    let cameraDistance = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
    const sizeLength = size.length();
    cameraDistance = Math.max(cameraDistance * 1.6, sizeLength * 0.6, 1);

    if (!Number.isFinite(cameraDistance)) {
      console.warn("Calculated infinite camera distance. Resetting camera.");
      // Reset camera...
      this.camera.position.set(
        this.options.cameraPosition?.[0] || 10,
        this.options.cameraPosition?.[1] || 10,
        this.options.cameraPosition?.[2] || 10
      );
      this.camera.lookAt(0, 0, 0);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
      return;
    }

    const direction = new THREE.Vector3(0.6, 0.5, 1).normalize();
    const position = center.clone().add(direction.multiplyScalar(cameraDistance));

    console.log("Calculated camera distance:", cameraDistance);
    console.log("Setting camera position to:", position);

    this.camera.position.copy(position);
    this.camera.lookAt(center);
    this.controls.target.copy(center);
    this.controls.update();
    console.log("Camera fit complete.");
  }

  // Handle window resize
  private handleResize = (): void => {
    if (!this.container) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  // Animation loop
  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.controls.update(); // Update controls for damping
    this.renderer.render(this.scene, this.camera);
  };

  // Clear the scene
  clear(): void {
    console.log("Clearing viewer scene...");

    // Dispose cloned materials first
    this.originalMaterials.forEach((originalMaterial, mesh) => {
      if (mesh.userData.hasCustomMaterial && mesh.material && 'dispose' in mesh.material) {
        (mesh.material as THREE.Material).dispose();
      }
    });

    // Dispose cached materials
    Object.values(this.materials).forEach(material => material.dispose());
    this.materials = {};

    // Remove and dispose the main model group
    if (this.ifcModelGroup) {
      this.scene.remove(this.ifcModelGroup);

      // Dispose geometry and materials within the group
      this.ifcModelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          // Materials are disposed above via the cache
        }
      });
      this.ifcModelGroup = null; // Set to null after disposal
    }

    // Clear geometry indexes
    this.expressIdToMeshes.clear();
    this.meshToExpressId.clear();
    this.originalMaterials.clear();

    // Close the model in web-ifc API if it's open and we have an instance
    // Use a local check for ifcAPI as it might be null if constructor failed
    const localIfcApi = this.ifcAPI;
    if (localIfcApi && this.modelID !== null) {
      try {
        console.log("Closing model in web-ifc:", this.modelID);
        localIfcApi.CloseModel(this.modelID);
      } catch (e) {
        console.error("Error closing model during clear:", e);
      }
    }
    this.modelID = null; // Always reset modelID

    this.selectedElements.clear(); // Clear selection set

    // Emit cleared event
    this.emitEvent('modelCleared', {});

    console.log("Viewer scene cleared.");
  }

  // Clean up resources when done
  dispose(): void {
    console.log("Disposing IfcViewer...");
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.clear(); // Clear scene content and close model

    window.removeEventListener("resize", this.handleResize);

    this.renderer.dispose(); // Dispose renderer resources
    if (this.renderer.domElement.parentNode === this.container) {
      try {
        this.container.removeChild(this.renderer.domElement); // Remove canvas
      } catch (e) {
        console.warn("Could not remove renderer DOM element during dispose:", e);
      }
    }

    // Explicitly nullify to help GC, though IfcAPI might not have explicit dispose
    this.ifcAPI = null;

    console.log("IfcViewer disposed.");
  }

  // Public method to resize the viewer
  resize(): void {
    this.handleResize();
  }

  // === PUBLIC GEOMETRY ACCESS APIs ===

  /**
   * Get the main model group containing all meshes
   */
  getModelGroup(): THREE.Group | null {
    return this.ifcModelGroup;
  }

  /**
   * Get all meshes for a specific IFC element by expressId
   */
  getMeshesForElement(expressId: number): THREE.Mesh[] {
    return this.expressIdToMeshes.get(expressId) || [];
  }

  /**
   * Get the world matrix for an element (uses first mesh if multiple)
   */
  getWorldMatrixForElement(expressId: number): THREE.Matrix4 | null {
    const meshes = this.getMeshesForElement(expressId);
    if (meshes.length === 0) return null;

    const matrix = new THREE.Matrix4();
    meshes[0].updateMatrixWorld(true);
    matrix.copy(meshes[0].matrixWorld);
    return matrix;
  }

  /**
   * Get the world-space bounding box for an element
   */
  getBoundingBoxForElement(expressId: number): THREE.Box3 | null {
    const meshes = this.getMeshesForElement(expressId);
    if (meshes.length === 0) return null;

    const box = new THREE.Box3();
    meshes.forEach(mesh => {
      mesh.updateMatrixWorld(true);
      const meshBox = new THREE.Box3().setFromObject(mesh);
      box.union(meshBox);
    });

    return box.isEmpty() ? null : box;
  }

  /**
   * Hide elements by expressId
   */
  hide(expressIds: number[]): void {
    expressIds.forEach(expressId => {
      const meshes = this.getMeshesForElement(expressId);
      meshes.forEach(mesh => {
        mesh.visible = false;
      });
    });
  }

  /**
   * Show elements by expressId
   */
  show(expressIds: number[]): void {
    expressIds.forEach(expressId => {
      const meshes = this.getMeshesForElement(expressId);
      meshes.forEach(mesh => {
        mesh.visible = true;
      });
    });
  }

  /**
   * Isolate elements (hide all others)
   */
  isolate(expressIds: number[]): void {
    const isolateSet = new Set(expressIds);

    // Hide all elements not in the isolate set
    this.expressIdToMeshes.forEach((meshes, expressId) => {
      const shouldShow = isolateSet.has(expressId);
      meshes.forEach(mesh => {
        mesh.visible = shouldShow;
      });
    });
  }

  /**
   * Show all elements
   */
  showAll(): void {
    this.expressIdToMeshes.forEach(meshes => {
      meshes.forEach(mesh => {
        mesh.visible = true;
      });
    });
  }

  /**
   * Set color for specific elements
   */
  setColor(expressIds: number[], color: THREE.ColorRepresentation): void {
    const threeColor = new THREE.Color(color);

    expressIds.forEach(expressId => {
      const meshes = this.getMeshesForElement(expressId);
      meshes.forEach(mesh => {
        // Clone material if it's shared to avoid affecting other elements
        if (mesh.material && 'color' in mesh.material) {
          const material = mesh.material as THREE.MeshLambertMaterial;
          if (!mesh.userData.hasCustomMaterial) {
            mesh.material = material.clone();
            mesh.userData.hasCustomMaterial = true;
          }
          (mesh.material as THREE.MeshLambertMaterial).color.copy(threeColor);
        }
      });
    });
  }

  /**
   * Reset colors to original materials
   */
  resetColors(expressIds?: number[]): void {
    const targetIds = expressIds || Array.from(this.expressIdToMeshes.keys());

    targetIds.forEach(expressId => {
      const meshes = this.getMeshesForElement(expressId);
      meshes.forEach(mesh => {
        const originalMaterial = this.originalMaterials.get(mesh);
        if (originalMaterial && mesh.userData.hasCustomMaterial) {
          // Dispose the cloned material
          if (mesh.material && 'dispose' in mesh.material) {
            (mesh.material as THREE.Material).dispose();
          }
          mesh.material = originalMaterial;
          mesh.userData.hasCustomMaterial = false;
        }
      });
    });
  }

  // Store original positions for spatial clustering
  private originalPositions: Map<THREE.Mesh, THREE.Vector3> | null = null;

  /**
   * Apply spatial clustering - move elements to separate positions
   */
  applySpatialClustering(clusters: Array<{
    key: string;
    displayName: string;
    elementIds: number[];
    color: string;
    position: { x: number; y: number; z: number };
  }>): void {
    console.log('Applying spatial clustering to viewer');

    // Store original positions if not already stored
    if (!this.originalPositions) {
      this.originalPositions = new Map();
      this.expressIdToMeshes.forEach((meshes, expressId) => {
        meshes.forEach(mesh => {
          this.originalPositions!.set(mesh, mesh.position.clone());
        });
      });
    }

    // Hide all meshes that are NOT part of any cluster to avoid confusion
    const clusteredElementIds = new Set<number>();
    clusters.forEach(cluster => {
      cluster.elementIds.forEach(id => clusteredElementIds.add(id));
    });

    // Hide non-clustered elements
    this.expressIdToMeshes.forEach((meshes, expressId) => {
      if (!clusteredElementIds.has(expressId)) {
        meshes.forEach(mesh => {
          mesh.visible = false;
        });
      }
    });

    clusters.forEach(cluster => {
      console.log(`Arranging cluster "${cluster.displayName}" in grid at position:`, cluster.position);

      // Group meshes by element ID to keep elements together
      const elementMeshGroups = new Map<number, THREE.Mesh[]>();
      cluster.elementIds.forEach(expressId => {
        const meshes = this.getMeshesForElement(expressId);
        if (meshes.length > 0) {
          elementMeshGroups.set(expressId, meshes);
        }
      });

      if (elementMeshGroups.size === 0) {
        console.warn(`No meshes found for cluster "${cluster.displayName}" with ${cluster.elementIds.length} element IDs`);
        return;
      }

      console.log(`Found ${elementMeshGroups.size} elements with meshes for cluster "${cluster.displayName}"`);

      // Calculate grid layout for elements in this cluster
      const elementCount = elementMeshGroups.size;
      const gridSize = Math.ceil(Math.sqrt(elementCount));
      const elementSpacing = 8; // Reduced space between individual elements for tighter grids

      // Calculate cluster base position
      const clusterBaseX = cluster.position.x;
      const clusterBaseZ = cluster.position.z;

      // Arrange elements in a grid within this cluster
      let elementIndex = 0;
      elementMeshGroups.forEach((meshes, expressId) => {
        // Calculate grid position for this element
        const row = Math.floor(elementIndex / gridSize);
        const col = elementIndex % gridSize;

        // Center the grid around the cluster position
        const gridOffsetX = (gridSize - 1) * elementSpacing * 0.5;
        const gridOffsetZ = (gridSize - 1) * elementSpacing * 0.5;

        const elementTargetX = clusterBaseX + (col * elementSpacing) - gridOffsetX;
        const elementTargetZ = clusterBaseZ + (row * elementSpacing) - gridOffsetZ;
        const elementTargetY = 0; // Ground level

        // Calculate the center of all meshes for this element
        const elementCenter = new THREE.Vector3();
        meshes.forEach(mesh => {
          elementCenter.add(mesh.position);
        });
        elementCenter.divideScalar(meshes.length);

        // Calculate offset to move element to target position
        const targetPosition = new THREE.Vector3(elementTargetX, elementTargetY, elementTargetZ);
        const offset = targetPosition.sub(elementCenter);

        // Move all meshes for this element
        meshes.forEach((mesh, meshIndex) => {
          const oldPosition = mesh.position.clone();
          mesh.position.add(offset);

          // Update the matrix to ensure the position change is applied
          mesh.updateMatrix();
          mesh.updateMatrixWorld(true);

          // Debug: Log position change for first few elements
          if (elementIndex < 3 && meshIndex < 2) {
            console.log(`Element ${elementIndex}, Mesh ${meshIndex} moved from`, oldPosition, 'to', mesh.position.clone());
          }

          // Apply cluster color
          if (mesh.material && 'color' in mesh.material) {
            const material = mesh.material as THREE.MeshLambertMaterial;
            if (!mesh.userData.hasCustomMaterial) {
              mesh.material = material.clone();
              mesh.userData.hasCustomMaterial = true;
            }
            (mesh.material as THREE.MeshLambertMaterial).color.setHex(parseInt(cluster.color.replace('#', ''), 16));
          }
        });

        elementIndex++;
      });

      console.log(`Arranged ${elementCount} elements in ${gridSize}x${gridSize} grid for cluster "${cluster.displayName}"`);
    });

    // Force a render to show the changes
    this.renderer.render(this.scene, this.camera);

    console.log('Spatial clustering applied successfully');
  }

  /**
   * Reset spatial clustering - restore original positions
   */
  resetSpatialClustering(): void {
    console.log('Resetting spatial clustering');

    if (this.originalPositions) {
      this.originalPositions.forEach((originalPos, mesh) => {
        mesh.position.copy(originalPos);
        mesh.visible = true; // Restore visibility
      });
    }

    // Also reset colors
    this.resetColors();

    // Force a render to show the changes
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Set wireframe mode for all materials
   */
  setWireframeMode(enabled: boolean): void {
    console.log(`Setting wireframe mode: ${enabled}`);

    if (this.ifcModelGroup) {
      this.ifcModelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if ('wireframe' in mat) {
                (mat as THREE.MeshBasicMaterial).wireframe = enabled;
              }
            });
          } else if ('wireframe' in child.material) {
            (child.material as THREE.MeshBasicMaterial).wireframe = enabled;
          }
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Set X-Ray mode (transparent materials)
   */
  setXRayMode(enabled: boolean): void {
    console.log(`Setting X-Ray mode: ${enabled}`);

    if (this.ifcModelGroup) {
      this.ifcModelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if ('transparent' in mat && 'opacity' in mat) {
                (mat as THREE.MeshBasicMaterial).transparent = enabled;
                (mat as THREE.MeshBasicMaterial).opacity = enabled ? 0.3 : 1.0;
              }
            });
          } else if ('transparent' in child.material && 'opacity' in child.material) {
            (child.material as THREE.MeshBasicMaterial).transparent = enabled;
            (child.material as THREE.MeshBasicMaterial).opacity = enabled ? 0.3 : 1.0;
          }
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  // Clipping plane for section views
  private clippingPlane: THREE.Plane | null = null;

  /**
   * Enable/disable clipping plane for section views
   */
  enableClippingPlane(enabled: boolean): void {
    console.log(`Setting clipping plane: ${enabled}`);

    if (enabled && !this.clippingPlane) {
      // Create a clipping plane that cuts through the middle of the model
      this.clippingPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
      this.renderer.localClippingEnabled = true;
    }

    if (this.ifcModelGroup) {
      this.ifcModelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if ('clippingPlanes' in mat) {
                (mat as THREE.MeshBasicMaterial).clippingPlanes = enabled && this.clippingPlane ? [this.clippingPlane] : [];
              }
            });
          } else if ('clippingPlanes' in child.material) {
            (child.material as THREE.MeshBasicMaterial).clippingPlanes = enabled && this.clippingPlane ? [this.clippingPlane] : [];
          }
        }
      });
    }

    if (!enabled) {
      this.renderer.localClippingEnabled = false;
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Zoom in
   */
  zoomIn(): void {
    this.camera.position.multiplyScalar(0.9);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Zoom out
   */
  zoomOut(): void {
    this.camera.position.multiplyScalar(1.1);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Fit camera to model (alias for existing method)
   */
  fitToModel(): void {
    this.fitCameraToModel();
  }

  /**
   * Apply transformation to elements
   */
  applyTransform(
    expressIds: number[],
    transform: {
      translation?: [number, number, number];
      rotation?: [number, number, number];
      scale?: [number, number, number];
    }
  ): void {
    const { translation = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] } = transform;

    expressIds.forEach(expressId => {
      const meshes = this.getMeshesForElement(expressId);
      meshes.forEach(mesh => {
        // Apply transformation
        mesh.position.add(new THREE.Vector3(...translation));
        mesh.rotation.x += rotation[0] * Math.PI / 180;
        mesh.rotation.y += rotation[1] * Math.PI / 180;
        mesh.rotation.z += rotation[2] * Math.PI / 180;
        mesh.scale.multiply(new THREE.Vector3(...scale));

        mesh.updateMatrix();
        mesh.updateMatrixWorld(true);
      });
    });
  }

  /**
   * Get all indexed element IDs
   */
  getIndexedElementIds(): number[] {
    return Array.from(this.expressIdToMeshes.keys());
  }

  /**
   * Get element count
   */
  getElementCount(): number {
    return this.expressIdToMeshes.size;
  }

  /**
   * Register event callback
   */
  on<K extends keyof ViewerEvents>(event: K, callback: (data: ViewerEvents[K]) => void): void {
    this.eventCallbacks[event] = callback;
  }

  /**
   * Emit event to registered callbacks
   */
  private emitEvent<K extends keyof ViewerEvents>(event: K, data: ViewerEvents[K]): void {
    const callback = this.eventCallbacks[event];
    if (callback) {
      callback(data);
    }
  }
}
