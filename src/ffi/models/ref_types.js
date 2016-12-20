import ref from 'ref';
import ArrayType from 'ref-array';

export const u8 = ref.types.uint8;
export const refString = ref.types.string;
export const usize = ref.types.size_t;
export const bool = ref.types.bool;

// Array types
export const u8Arr = ArrayType(u8);

// Pointer Types
export const u8Pointer = ref.refType(u8);
