import ref from 'ref';
import ArrayType from 'ref-array';
import StructType from 'ref-struct';
import Enum from 'enum';

export const u8 = ref.types.uint8;
export const CString = ref.types.CString;
export const usize = ref.types.size_t;
export const bool = ref.types.bool;
export const int32 = ref.types.int32;
export const Void = ref.types.void;
export const Null = ref.NULL;

// Array types
export const u8Arr = ArrayType(u8);

// Pointer Types
export const u8Pointer = ref.refType(u8);
export const voidPointer = ref.refType(Void);
export const AppHandlePointer = ref.refType(voidPointer);

// Struct types
export const AppKeys = StructType({
  owner_key: u8Arr,
  enc_key: u8Arr,
  sign_pk: u8Arr,
  sign_sk: u8Arr,
  enc_pk: u8Arr,
  enc_sk: u8Arr
});

export const AppExchangeInfo = StructType({
  id: CString,
  scope: u8Pointer,
  scope_len: usize,
  scope_cap: usize,
  name: CString,
  vendor: CString
});

export const Permission = new Enum({
  Read: 0,
  Insert: 1,
  Update: 2,
  Delete: 3,
  ManagePermissions: 4
});

export const AppInfo = StructType({
  info: AppExchangeInfo,
  keys: AppKeys
});

export const PermissionArray = StructType({
  ptr: ref.refType(Permission),
  len: usize,
  cap: usize
});

export const ContainerPermissions = StructType({
  cont_name: CString,
  access: PermissionArray
});

export const ContainerPermissionsArray = StructType({
  ptr: ref.refType(ContainerPermissions),
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

export const FfiString = StructType({
  ptr: u8Pointer,
  len: usize,
  cap: usize
});
