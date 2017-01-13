import ref from 'ref';
import ArrayType from 'ref-array';
import * as types from './types';

export const parseArray = (type, arrayBuf) => {
  if (arrayBuf.len === 0) {
    return [];
  }
  const arrPtr = ref.reinterpret(arrayBuf.ptr, type.size * arrayBuf.len);
  const ArrType = ArrayType(type);
  return ArrType(arrPtr);
};

export const parseFfiString = (ffiString) => {
  if (!(ffiString instanceof types.FfiString)) {
    return;
  }
  if (ffiString.len === 0) {
    return null;
  }
  return ref.reinterpret(ffiString.ptr, ffiString.len).toString();
};

export const parseU8Str = (u8, size) => {
  if (size === 0) {
    return null;
  }
  return ref.reinterpret(u8, size).toString();
};

export const parseAppExchangeInfo = (appExchangeInfo) => {
  if (!(appExchangeInfo instanceof types.AppExchangeInfo)) {
    return;
  }
  return {
    id: parseFfiString(appExchangeInfo.id),
    scope: parseU8Str(appExchangeInfo.scope, appExchangeInfo.scope_len),
    name: parseFfiString(appExchangeInfo.name),
    vendor: parseFfiString(appExchangeInfo.vendor)
  };
};

export const parsePermissionArray = (permissionArray) => {
  const res = [];
  let i = 0;
  const permissions = parseArray(types.Permission, permissionArray);
  for (i = 0; i < permissions.length; i++) {
    res.push(permissions[i].key);
  }
  return res;
};

export const parseContainerPermissions = (containerPermissions) => {
  if (!(containerPermissions instanceof types.ContainerPermissions)) {
    return;
  }
  return {
    cont_name: parseFfiString(containerPermissions.cont_name),
    access: parsePermissionArray(containerPermissions.access)
  };
};

export const parseContainerPermissionsArray = (containerPermissionsArray) => {
  const res = [];
  let i = 0;
  const contArr = parseArray(types.ContainerPermissions, containerPermissionsArray);
  for (i = 0; i < contArr.length; i++) {
    res.push(parseContainerPermissions(contArr[i]));
  }
  return res;
};

export const parseRegisteredApp = (registeredApp) => {
  if (!(registeredApp instanceof types.RegisteredApp)) {
    return;
  }
  return {
    app_id: parseAppExchangeInfo(registeredApp.app_id),
    containers: parseContainerPermissionsArray(registeredApp.containers)
  };
};

export const parseRegisteredAppArray = (registeredAppArray, len) => {
  const res = [];
  let i = 0;
  const registeredApps = parseArray(types.RegisteredApp, {
    ptr: registeredAppArray,
    len
  });
  for (i = 0; i < registeredApps.length; i++) {
    res.push(parseRegisteredApp(registeredApps[i]));
  }
  return res;
};

export const parseAuthReq = (authReq) => {
  if (!(authReq instanceof types.AuthReq)) {
    return;
  }
  return {
    app: parseAppExchangeInfo(authReq.app),
    app_container: authReq.app_container,
    containers: parseContainerPermissionsArray(authReq.containers)
  };
};

export const parseContainerReq = (containersReq) => {
  if (!(containersReq instanceof types.ContainersReq)) {
    return;
  }
  return {
    app: parseAppExchangeInfo(containersReq.app),
    containers: parseContainerPermissionsArray(containersReq.containers)
  };
};
