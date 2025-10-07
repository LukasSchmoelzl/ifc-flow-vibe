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
  const [components, setComponents] = useState<OBC.Components | null>(null);
  const [fragments, setFragments] = useState<FRAGS.FragmentsModels | null>(null);
  const [world, setWorld] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let stats: Stats | null = null;

    const init = async () => {
      const comp = new OBC.Components();
      const worlds = comp.get(OBC.Worlds);
      
      const w = worlds.create<
        OBC.SimpleScene,
        OBC.SimpleCamera,
        OBC.SimpleRenderer
      >();

      w.scene = new OBC.SimpleScene(comp);
      w.renderer = new OBC.SimpleRenderer(comp, containerRef.current!);
      w.camera = new OBC.SimpleCamera(comp);

      comp.init();
      w.scene.setup();

      // Setup stats
      stats = new Stats();
      stats.showPanel(2);
      stats.dom.style.position = "absolute";
      stats.dom.style.left = "8px";
      stats.dom.style.top = "8px";
      stats.dom.style.zIndex = "10";
      containerRef.current?.appendChild(stats.dom);

      w.renderer.onBeforeUpdate.add(() => stats?.begin());
      w.renderer.onAfterUpdate.add(() => stats?.end());

      // Setup fragments
      const githubUrl = GITHUB_WORKER_URL;
      const fetchedUrl = await fetch(githubUrl);
      const workerBlob = await fetchedUrl.blob();
      const workerFile = new File([workerBlob], "worker.mjs", {
        type: "text/javascript",
      });
      const workerUrl = URL.createObjectURL(workerFile);
      const frags = new FRAGS.FragmentsModels(workerUrl);
      
      w.camera.controls.addEventListener("control", () => frags.update());

      setComponents(comp);
      setFragments(frags);
      setWorld(w);
      setIsReady(true);

      // Make available globally for IFC node
      (window as any).__fragmentsViewer = {
        components: comp,
        fragments: frags,
        world: w,
      };
    };

    init();

    return () => {
      if (stats?.dom) {
        containerRef.current?.removeChild(stats.dom);
      }
      components?.dispose();
      (window as any).__fragmentsViewer = null;
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    if (!world) return;

    const handleResize = () => {
      world.renderer?.resize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [world]);

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

