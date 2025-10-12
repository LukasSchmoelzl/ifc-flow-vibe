// Canvas Domain Export
// Note: The main app composition is now in app/page.tsx
// This domain only exports its core canvas functionality

export { FlowCanvas } from "./ui/flow-canvas";
export { useCanvasStore } from "./state/store";
export * from "./state/actions";
