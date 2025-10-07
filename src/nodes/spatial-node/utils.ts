import type { IfcElement } from "@/src/lib/ifc-utils"
import * as THREE from "three";

export function spatialQuery(
  elements: IfcElement[],
  referenceElements: IfcElement[],
  queryType = "contained",
  distance = 1.0,
): IfcElement[] {
  console.log("Spatial query:", queryType, distance);

  if (!elements || elements.length === 0) {
    console.warn("No elements for spatial query");
    return [];
  }

  if (!referenceElements || referenceElements.length === 0) {
    console.warn("No reference elements for spatial query");
    return [];
  }

  switch (queryType) {
    case "contained":
      return elements.slice(0, Math.floor(elements.length * 0.7));

    case "containing":
      return elements.slice(0, Math.floor(elements.length * 0.3));

    case "intersecting":
      return elements.slice(0, Math.floor(elements.length * 0.5));

    case "touching":
      return elements.slice(0, Math.floor(elements.length * 0.2));

    case "within-distance":
      const ratio = Math.min(1, distance / 5);
      return elements.slice(0, Math.floor(elements.length * ratio));

    default:
      return elements;
  }
}

// Relationship query functions
export function queryRelationships(
  elements: IfcElement[],
  relationType = "containment",
  direction = "outgoing",
): IfcElement[] {
  console.log("Relationship query:", relationType, direction)

  // Mock implementation - would use actual IFC relationship data
  // Just return a subset of elements as a simulation
  const ratioMap: Record<string, number> = {
    containment: 0.6,
    aggregation: 0.4,
    voiding: 0.2,
    material: 0.8,
    "space-boundary": 0.3,
  }

  const ratio = ratioMap[relationType] || 0.5
  return elements.slice(0, Math.floor(elements.length * ratio))
}

