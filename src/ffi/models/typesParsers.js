import ref from 'ref';
// import types from 'types';

export const parseFfiString = (ffiString) => {
  // if (!(ffiString instanceof types.FfiString)) {
  //   return;
  // }
  return ref.reinterpret(ffiString.ptr, ffiString.len).toString();
};

export const parseU8Str = (u8, size) => {
  if (size === 0) {
    return null;
  }
  return ref.reinterpret(u8, size).toString();
};

export const parseAppExchangeInfo = (appExchangeInfo) => {
  // if (!(appExchangeInfo instanceof types.AppExchangeInfo)) {
  //   return;
  // }
  return {
    id: parseFfiString(appExchangeInfo.id),
    scope: parseU8Str(appExchangeInfo.scope, appExchangeInfo.scope_len),
    name: parseFfiString(appExchangeInfo.name),
    vendor: parseFfiString(appExchangeInfo.vendor)
  }
};

export const parsePermissionArray = (permissionArray) => {
  const res = [];
  let i = 0;
  for (i = 0; i < permissionArray.len; i++) {
    res.push(permissionArray.ptr[i].key);
  }
  return res;
};

export const parseContainerPermissions = (containerPermissions) => {
  return {
    cont_name: parseFfiString(containerPermissions.cont_name),
    access: parsePermissionArray(containerPermissions.access)
  }
};

export const parseContainerPermissionsArray = (containerPermissionsArray) => {
  const res = [];
  let i = 0;
  for (i = 0; i < containerPermissionsArray.len; i++) {
    res.push(parseContainerPermissions(containerPermissionsArray.ptr[i]));
  }
  return res;
};

export const parseRegisteredApp = (registeredApp) => {
  return {
    app_id: parseFfiString(registeredApp.app_id),
    containers: parseContainerPermissionsArray(registeredApp.containers)
  }
};

export const parseRegisteredAppArray = (registeredAppArray) => {
  const res = [];
  let i = 0;
  for (i = 0; i < registeredAppArray.len; i++) {
    res.push(parseRegisteredApp(registeredAppArray[i]));
  }
  return res;
};

export const parseAuthReq = (authReq) => {
  return {
    app: parseAppExchangeInfo(authReq.app),
    app_container: authReq.app_container,
    containers: /*parseContainerPermissionsArray(authReq.containers)*/ [{ cont_name: '_public', access: ['Read'] }]
  };
};

export const parseContainerReq = (containersReq) => {
  return {
    app: parseAppExchangeInfo(containersReq.app),
    containers: parseContainerPermissionsArray(containersReq.containers)
  };
};
