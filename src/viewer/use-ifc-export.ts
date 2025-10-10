import { useEffect } from "react";
import { useToast } from "@/src/hooks/use-toast";

export function useIfcExport() {
  const { toast } = useToast();

  useEffect(() => {
    const handleExportComplete = async (event: CustomEvent) => {
      const { model, exportFileName, originalFileName } = event.detail;

      try {
        const originalFile = await (await fetch(originalFileName)).blob();
        if (!originalFile) {
          toast({
            title: "Export Error",
            description: "Original IFC file not found. Please reload the file and try again.",
            variant: "destructive",
          });
          return;
        }

        const arrayBuffer = await originalFile.arrayBuffer();
        const worker = new Worker("/ifcWorker.js");

        worker.onmessage = (e) => {
          if (e.data.type === "ifcExported") {
            const blob = new Blob([e.data.data], { type: "application/x-step" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = e.data.fileName || exportFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast({
              title: "Export Successful",
              description: `IFC file exported as ${e.data.fileName || exportFileName}`,
            });

            worker.terminate();
          } else if (e.data.type === "error") {
            toast({
              title: "Export Error",
              description: e.data.message || "Failed to export IFC file",
              variant: "destructive",
            });
            worker.terminate();
          }
        };

        worker.postMessage(
          {
            action: "exportIfc",
            model: model,
            fileName: exportFileName,
            arrayBuffer: arrayBuffer,
            messageId: Date.now().toString(),
          },
          [arrayBuffer]
        );
      } catch (error) {
        console.error("Error exporting IFC:", error);
        toast({
          title: "Export Error",
          description: error instanceof Error ? error.message : "Failed to export IFC file",
          variant: "destructive",
        });
      }
    };

    const eventListenerWrapper = (event: Event) => {
      handleExportComplete(event as CustomEvent);
    };

    window.addEventListener("ifc:export", eventListenerWrapper);

    return () => {
      window.removeEventListener("ifc:export", eventListenerWrapper);
    };
  }, [toast]);
}

