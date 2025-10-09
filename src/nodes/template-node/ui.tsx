import { BaseNodeData } from "../node-types";

interface TemplateNodeData extends BaseNodeData {
  result?: any;
}

interface TemplateNodeUIProps {
  data: TemplateNodeData;
}

export function TemplateNodeUI({ data }: TemplateNodeUIProps) {
  return (
    <div className="p-3 text-xs">
      <div className="text-muted-foreground">
        {data.result ? `Result: ${data.result}` : "Template Node - Ready"}
      </div>
    </div>
  );
}

