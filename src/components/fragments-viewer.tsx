"use client";

import { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as THREE from "three";
import * as FRAGS from "@thatopen/fragments";
import Stats from "stats.js";

// Constants
const GITHUB_WORKER_URL = "https://thatopen.github.io/engine_fragment/resources/worker.mjs";
const WASM_PATH = "https://unpkg.com/web-ifc@0.0.69/";

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
    let comp: OBC.Components | null = null;
    const container = containerRef.current;

    const init = async () => {
      try {
        comp = new OBC.Components();
        const worlds = comp.get(OBC.Worlds);
        
        const w = worlds.create<
          OBC.SimpleScene,
          OBC.SimpleCamera,
          OBC.SimpleRenderer
        >();

        w.scene = new OBC.SimpleScene(comp);
        w.renderer = new OBC.SimpleRenderer(comp, container);
        w.camera = new OBC.SimpleCamera(comp);
        
        w.scene.setup();
        comp.init();

        // Setup stats
        stats = new Stats();
        stats.showPanel(2);
        stats.dom.style.position = "absolute";
        stats.dom.style.left = "8px";
        stats.dom.style.top = "8px";
        stats.dom.style.zIndex = "10";
        container.appendChild(stats.dom);

        w.renderer.onBeforeUpdate.add(() => stats?.begin());
        w.renderer.onAfterUpdate.add(() => stats?.end());

        // Setup fragments
        const fetchedUrl = await fetch(GITHUB_WORKER_URL);
        const workerBlob = await fetchedUrl.blob();
        const workerFile = new File([workerBlob], "worker.mjs", {
          type: "text/javascript",
        });
        const workerUrl = URL.createObjectURL(workerFile);
        const frags = new FRAGS.FragmentsModels(workerUrl);
        
        w.camera.controls.addEventListener("control", () => frags.update());

        setIsReady(true);

        (window as any).__fragmentsViewer = {
          components: comp,
          fragments: frags,
          world: w,
        };
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
      comp?.dispose();
      (window as any).__fragmentsViewer = null;
      isInitialized.current = false;
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const viewer = (window as any).__fragmentsViewer;
      viewer?.world?.renderer?.resize();
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

