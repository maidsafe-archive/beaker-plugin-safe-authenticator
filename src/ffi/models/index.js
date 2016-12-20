import ref from 'ref';
import StructType from 'ref-struct';
import Enum from 'enum';
import {
  refString,
  usize,
  u8Arr,
  u8Pointer,
  bool
} from './ref_types';

export const AppKeys = StructType({
  owner_key: u8Arr,
  enc_key: u8Arr,
  sign_pk: u8Arr,
  sign_sk: u8Arr,
  enc_pk: u8Arr,
  enc_sk: u8Arr
});

export const AppExchangeInfo = StructType({
  id: refString,
  scope: u8Pointer,
  scope_len: usize,
  scope_cap: usize,
  name: refString,
  vendor: refString
});

export const Permission = Enum({
  Read: 0,
  Insert: 1,
  Update: 2,
  Delete: 3,
  ManagePermissions: 4
});

export const AppInfo = StructType({
  info: new AppExchangeInfo(),
  keys: new AppKeys()
});

export const PermissionArray = StructType({
  ptr: ref.refType(new Permission()),
  len: usize,
  cap: usize
});

export const ContainerPermissions = StructType({
  cont_name: refString,
  access: new PermissionArray()
});

export const ContainerPermissionsArray = StructType({
  ptr: ref.refType(new ContainerPermissions()),
  len: usize,
  cap: usize
});

export const AuthReq = StructType({
  app: new AppExchangeInfo(),
  app_container: bool,
  containers: new ContainerPermissionsArray()
});

export const ContainersReq = StructType({
  app: new AppExchangeInfo(),
  containers: new ContainerPermissionsArray()
});
