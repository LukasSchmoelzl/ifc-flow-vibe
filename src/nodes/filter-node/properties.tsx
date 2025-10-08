"use client"

import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { useEffect, useState } from "react"

const COMMON_PROPERTIES = [
  "Name",
  "GlobalId",
  "Description",
  "Tag",
  "ObjectType",
  "PredefinedType",
];

interface FilterEditorProps {
  properties: {
    property?: string;
    operator?: string;
    value?: string;
    [key: string]: any;
  };
  setProperties: (properties: any) => void;
  nodeId?: string;
}

export function FilterEditor({ properties, setProperties, nodeId }: FilterEditorProps) {
  const [availableProperties, setAvailableProperties] = useState<string[]>(COMMON_PROPERTIES);
  const [isLoadingProps, setIsLoadingProps] = useState(false);

  useEffect(() => {
    async function loadProperties() {
      if (!nodeId) return;

      setIsLoadingProps(true);
      try {
        const models = window.__fragmentsModels;
        if (!models) return;

        const modelIds = Object.keys(models);
        if (modelIds.length === 0) return;

        const model = models[modelIds[0]];
        const attributeNames = await model.getAttributeNames();
        
        const uniqueProps = Array.from(new Set([...COMMON_PROPERTIES, ...attributeNames]));
        setAvailableProperties(uniqueProps);
      } catch (error) {
        console.warn("Could not load properties:", error);
      } finally {
        setIsLoadingProps(false);
      }
    }

    loadProperties();
  }, [nodeId]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="property">Property</Label>
        <Select
          value={properties.property || ""}
          onValueChange={(value) => setProperties({ ...properties, property: value })}
          disabled={isLoadingProps}
        >
          <SelectTrigger id="property">
            <SelectValue placeholder={isLoadingProps ? "Loading properties..." : "Select property"} />
          </SelectTrigger>
          <SelectContent>
            {availableProperties.map((prop) => (
              <SelectItem key={prop} value={prop}>
                {prop}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="operator">Operator</Label>
        <Select
          value={properties.operator || "equals"}
          onValueChange={(value) => setProperties({ ...properties, operator: value })}
        >
          <SelectTrigger id="operator">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="startsWith">Starts With</SelectItem>
            <SelectItem value="endsWith">Ends With</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="value">Value</Label>
        <Input
          id="value"
          value={properties.value || ""}
          onChange={(e) => setProperties({ ...properties, value: e.target.value })}
          placeholder="Value to match"
        />
      </div>
    </div>
  )
}

