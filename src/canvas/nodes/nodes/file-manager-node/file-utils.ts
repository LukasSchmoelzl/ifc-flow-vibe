// File Manager Utilities - IFC files only

export const validateFile = (file: File): boolean => {
  return file.name.toLowerCase().endsWith('.ifc');
};

export const getFileExtension = (filename: string): string => {
  const extension = filename.toLowerCase().split('.').pop();
  return extension || '';
};
