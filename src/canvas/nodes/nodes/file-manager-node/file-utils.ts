// File Manager Utilities

const SUPPORTED_EXTENSIONS = ['.ifc', '.frag', '.ids'];

export const validateFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  return SUPPORTED_EXTENSIONS.some(ext => fileName.endsWith(ext));
};

export const getFileType = (filename: string): 'ifc' | 'frag' | 'ids' | 'unknown' => {
  const extension = filename.toLowerCase().split('.').pop();
  switch (extension) {
    case 'ifc': return 'ifc';
    case 'frag': return 'frag';
    case 'ids': return 'ids';
    default: return 'unknown';
  }
};

export const getFileCategory = (fileType: string): 'model' | 'specification' => {
  switch (fileType) {
    case 'ifc':
    case 'frag':
      return 'model';
    case 'ids':
      return 'specification';
    default:
      return 'model';
  }
};

export const generateModelId = (filename: string): string => {
  return `${filename.replace(/\.(frag|ifc|ids)$/, '')}_${Date.now()}`;
};

export const ensureArrayBuffer = (bytes: ArrayBuffer | Uint8Array): ArrayBuffer => {
  if (bytes instanceof ArrayBuffer) {
    return bytes;
  }
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
};

export const convertIfcToFragment = async (bytes: ArrayBuffer): Promise<ArrayBuffer> => {
  console.log('🔧 Converting IFC to Fragment...');
  
  try {
    const { IfcImporter } = await import('@thatopen/fragments');
    
    const serializer = new IfcImporter();
    serializer.wasm = {
      absolute: true,
      path: "/assets/wasm/",
    };
    
    const typedArray = new Uint8Array(bytes);
    const fragmentBytes = await serializer.process({ bytes: typedArray, raw: true });
    
    console.log('✅ IFC converted to Fragment');
    return fragmentBytes as unknown as ArrayBuffer;
  } catch (error) {
    console.error('❌ IFC conversion failed:', error);
    throw new Error(`IFC conversion failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

