import ref from 'ref';
import ArrayType from 'ref-array';
import * as types from './types';

export const parseArray = (type, arrayBuf, len) => {
  if (len === 0) {
    return [];
  }
  const arrPtr = ref.reinterpret(arrayBuf, type.size * len);
  const ArrType = ArrayType(type);
  return ArrType(arrPtr);
};

export const parseAppExchangeInfo = (appExchangeInfo) => {
  if (!(appExchangeInfo instanceof types.AppExchangeInfo)) {
    return;
  }
  return {
    id: appExchangeInfo.id,
    scope: appExchangeInfo.scope,
    name: appExchangeInfo.name,
    vendor: appExchangeInfo.vendor
  };
};

export const parsePermissionArray = (permissionArray, len) => {
  const res = [];
  let i = 0;
  const permissions = parseArray(types.Permission, permissionArray, len);
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
    cont_name: containerPermissions.cont_name,
    access: parsePermissionArray(containerPermissions.access, containerPermissions.access_len),
    access_len: containerPermissions.access_len,
    access_cap: containerPermissions.access_cap
  };
};

export const parseContainerPermissionsArray = (containerPermissionsArray, len) => {
  const res = [];
  let i = 0;
  const contArr = parseArray(types.ContainerPermissions, containerPermissionsArray, len);
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
    app_info: parseAppExchangeInfo(registeredApp.app_info),
    containers: parseContainerPermissionsArray(registeredApp.containers,
      registeredApp.containers_len),
    containers_len: registeredApp.containers_len,
    containers_cap: registeredApp.containers_cap
  };
};

export const parseRegisteredAppArray = (registeredAppArray, len) => {
  const res = [];
  let i = 0;
  const registeredApps = parseArray(types.RegisteredApp, registeredAppArray, len);
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
    containers: parseContainerPermissionsArray(authReq.containers, authReq.containers_len),
    containers_len: authReq.containers_len,
    containers_cap: authReq.containers_cap
  };
};

export const parseContainerReq = (containersReq) => {
  if (!(containersReq instanceof types.ContainersReq)) {
    return;
  }
  return {
    app: parseAppExchangeInfo(containersReq.app),
    containers: parseContainerPermissionsArray(containersReq.containers,
      containersReq.containers_len),
    containers_len: containersReq.containers_len,
    containers_cap: containersReq.containers_cap
  };
};

const parseXorName = (name) => (
  types.XorName(ref.reinterpret(name[0], 32))
);

const parsePermissionSet = (permissionSet) => {
  if (!(permissionSet instanceof types.PermissionSet)) {
    return;
  }
  return {
    insert: types.PermissionModifier[permissionSet.insert].key,
    update: types.PermissionModifier[permissionSet.update].key,
    delete: types.PermissionModifier[permissionSet.delete].key,
    manage_permissions: types.PermissionModifier[permissionSet.manage_permissions].key
  };
};

const parseShareMData = (shareMData) => {
  if (!(shareMData instanceof types.ShareMData)) {
    return;
  }
  return {
    type_tag: shareMData.type_tag,
    name: parseXorName(shareMData.name),
    metadata_key: shareMData.metadata_key,
    perms: parsePermissionSet(shareMData.perms)
  };
};


export const parseShareMDataReq = (shareMDataReq) => {
  if (!(shareMDataReq instanceof types.ShareMDataReq)) {
    return;
  }
  return {
    app: parseAppExchangeInfo(shareMDataReq.app),
    mdata: parseShareMData(shareMDataReq.mdata),
    mdata_len: shareMDataReq.mdata_len
  };
};
