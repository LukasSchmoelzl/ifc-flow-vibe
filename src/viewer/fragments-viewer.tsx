"use client";

import { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as THREE from "three";
import * as FRAGS from "@thatopen/fragments";
import Stats from "stats.js";

// Constants
const GITHUB_WORKER_URL = "https://thatopen.github.io/engine_fragment/resources/worker.mjs";
// Use web-ifc version 0.0.72 (worked before restructuring)
const WASM_PATH = "https://unpkg.com/web-ifc@0.0.72/";

interface FragmentsViewerProps {
  onModelLoad?: (model: FRAGS.FragmentsModel) => void;
  className?: string;
}

export function FragmentsViewer({ onModelLoad, className = "" }: FragmentsViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!containerRef.current || isInitialized.current) return;
    isInitialized.current = true;

    let stats: Stats | null = null;
    let components: OBC.Components | null = null;
    const container = containerRef.current;

    const init = async () => {
      try {
        components = new OBC.Components();
        const worlds = components.get(OBC.Worlds);
        
        const world = worlds.create<
          OBC.SimpleScene,
          OBC.SimpleCamera,
          OBC.SimpleRenderer
        >();

        world.scene = new OBC.SimpleScene(components);
        world.renderer = new OBC.SimpleRenderer(components, container);
        world.camera = new OBC.SimpleCamera(components);
        
        components.init();
        world.scene.setup();

        const grids = components.get(OBC.Grids);
        const grid = grids.create(world);

        stats = new Stats();
        stats.showPanel(2);
        stats.dom.style.position = "absolute";
        stats.dom.style.left = "8px";
        stats.dom.style.top = "8px";
        stats.dom.style.zIndex = "10";
        container.appendChild(stats.dom);

        world.renderer.onBeforeUpdate.add(() => stats?.begin());
        world.renderer.onAfterUpdate.add(() => stats?.end());

        const fetchedUrl = await fetch(GITHUB_WORKER_URL);
        const workerBlob = await fetchedUrl.blob();
        const workerFile = new File([workerBlob], "worker.mjs", {
          type: "text/javascript",
        });
        const workerUrl = URL.createObjectURL(workerFile);
        const fragments = new FRAGS.FragmentsModels(workerUrl);
        
        world.camera.controls.addEventListener("control", () => fragments.update());

        setIsReady(true);

        window.__fragmentsViewer = {
          components,
          fragments,
          world,
        };
        window.__fragmentsModels = {};
      } catch (error) {
        console.error("Failed to initialize Fragments viewer:", error);
        setIsReady(true);
      }
    };

    init();

    return () => {
      if (stats?.dom && container.contains(stats.dom)) {
        container.removeChild(stats.dom);
      }
      components?.dispose();
      window.__fragmentsViewer = undefined;
      window.__fragmentsModels = {};
      isInitialized.current = false;
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const viewer = window.__fragmentsViewer;
      if (viewer?.world?.renderer) {
        viewer.world.renderer.resize(new THREE.Vector2());
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={containerRef} 
        className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Initializing 3D Viewer...</p>
          </div>
        </div>
      )}
    </div>
  );
}

