import ref from 'ref';
import ArrayType from 'ref-array';
import StructType from 'ref-struct';
import Enum from 'enum';

export const u8 = ref.types.uint8;
export const u32 = ref.types.uint32;
export const usize = ref.types.size_t;
export const bool = ref.types.bool;
export const int32 = ref.types.int32;
export const Void = ref.types.void;
export const Null = ref.NULL;

// Pointer Types
export const u8Pointer = ref.refType(u8);
export const u32Pointer = ref.refType(u32);
export const voidPointer = ref.refType(Void);
export const AppHandlePointer = ref.refType(voidPointer);

// Struct types and Array types
export const u8ArrayType = ArrayType(u8);

export const FfiString = StructType({
  ptr: u8Pointer,
  len: usize,
  cap: usize
});

export const ffiStringPointer = ref.refType(FfiString);

export const AppKeys = StructType({
  owner_key: u8ArrayType,
  enc_key: u8ArrayType,
  sign_pk: u8ArrayType,
  sign_sk: u8ArrayType,
  enc_pk: u8ArrayType,
  enc_sk: u8ArrayType
});

export const AppExchangeInfo = StructType({
  id: FfiString,
  scope: u8Pointer,
  scope_len: usize,
  scope_cap: usize,
  name: FfiString,
  vendor: FfiString
});

export const Permission = new Enum({
  Read: 0,
  Insert: 1,
  Update: 2,
  Delete: 3,
  ManagePermissions: 4
});

export const PermissionArrayType = ArrayType(Permission);

export const AppInfo = StructType({
  info: AppExchangeInfo,
  keys: AppKeys
});

export const PermissionArray = StructType({
  ptr: PermissionArrayType,
  len: usize,
  cap: usize
});

export const ContainerPermissions = StructType({
  cont_name: FfiString,
  access: PermissionArray
});

export const ContainersPermissionArrayType = ArrayType(ContainerPermissions);

export const ContainerPermissionsArray = StructType({
  ptr: ContainersPermissionArrayType,
  len: usize,
  cap: usize
});

export const AuthReq = StructType({
  app: AppExchangeInfo,
  app_container: bool,
  containers: ContainerPermissionsArray
});

export const ContainersReq = StructType({
  app: AppExchangeInfo,
  containers: ContainerPermissionsArray
});
