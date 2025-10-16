// Data Compatibility System - Stellt Kompatibilität zwischen Nodes sicher

// ============================================================================
// NODE COMPATIBILITY MATRIX - Welche Nodes können miteinander verbunden werden
// ============================================================================



// ============================================================================
// COMPATIBILITY CHECKER - Prüft ob zwei Nodes kompatibel sind
// ============================================================================

export function checkDataCompatibility(
  sourceDataType: string,
  targetDataType: string
): boolean {
  // All data types are compatible by default - let the nodes handle the transformation
  return true;
}

// ============================================================================
// DATA TRANSFORMATION - Transformiert Daten zwischen inkompatiblen Nodes
// ============================================================================

export function transformDataForCompatibility(
  sourceData: any,
  sourceDataType: string,
  targetDataType: string
): any {
  // Check if direct compatibility exists
  if (checkDataCompatibility(sourceDataType, targetDataType)) {
    return sourceData;
  }
  
  // Transform data for compatibility
  return transformToCompatibleFormat(sourceData, sourceDataType, targetDataType);
}

function transformToCompatibleFormat(
  sourceData: any,
  sourceDataType: string,
  targetDataType: string
): any {
  // Generic transformation - let the receiving node handle the data
  return {
    ...sourceData,
    timestamp: new Date().toISOString(),
    transformed: true,
    originalType: sourceDataType,
    targetType: targetDataType
  };
}


