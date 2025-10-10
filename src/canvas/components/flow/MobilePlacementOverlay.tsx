"use client";

interface MobilePlacementOverlayProps {
  isVisible: boolean;
  nodeLabel: string;
}

export function MobilePlacementOverlay({ isVisible, nodeLabel }: MobilePlacementOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
        <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
        <span className="text-sm font-medium">
          Tap to place {nodeLabel}
        </span>
      </div>

      {/* Crosshair indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          <div className="w-8 h-0.5 bg-primary/60 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <div className="w-8 h-0.5 bg-primary/60 absolute -left-4 top-1/2 transform -translate-y-1/2" />
          <div className="w-0.5 h-8 bg-primary/60 absolute left-1/2 top-4 transform -translate-x-1/2" />
          <div className="w-0.5 h-8 bg-primary/60 absolute left-1/2 -top-4 transform -translate-x-1/2" />
          <div className="w-3 h-3 border-2 border-primary bg-primary/20 rounded-full absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
}

