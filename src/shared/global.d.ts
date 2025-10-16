import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";

declare global {
  interface Window {
    __fragmentsViewer?: {
      components: OBC.Components;
      fragments: FRAGS.fragmentsModels;
      world: OBC.World;
    };
    __fragmentsModels?: Record<string, FRAGS.fragmentsModel>;
  }
}

export {};

