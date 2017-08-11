import ArrayType from 'ref-array';
import * as types from './types';

export const constructAppExchangeInfo = (appInfo) => (
  new types.AppExchangeInfo({
    id: appInfo.id,
    scope: appInfo.scope,
    name: appInfo.name,
    vendor: appInfo.vendor
  })
);

export const constructPermissionArray = (permissions) => {
  const PermArray = ArrayType(types.Permission);
  const permArray = new PermArray(permissions.length);

  permissions.forEach((perm, i) => {
    permArray[i] = types.Permission.get(perm);
  });
  return permArray;
};

export const constructContainerPermission = (contPerm) => (
  new types.ContainerPermissions({
    cont_name: contPerm.cont_name,
    access: constructPermissionArray(contPerm.access).buffer,
    access_len: contPerm.access_len,
    access_cap: contPerm.access_len
  })
);

export const constructContainerArray = (containers) => {
  const ContArray = ArrayType(types.ContainerPermissions);
  const contArray = new ContArray(containers.length);

  containers.forEach((cont, i) => {
    contArray[i] = constructContainerPermission(cont);
  });
  return contArray;
};

export const constructAuthReq = (authReq) => (
  new types.AuthReq({
    app: constructAppExchangeInfo(authReq.app),
    app_container: authReq.app_container,
    containers: constructContainerArray(authReq.containers).buffer,
    containers_len: authReq.containers_len,
    containers_cap: authReq.containers_cap
  })
);

export const constructContainerReq = (contReq) => (
  new types.ContainersReq({
    app: constructAppExchangeInfo(contReq.app),
    containers: constructContainerArray(contReq.containers).buffer,
    containers_len: contReq.containers_len,
    containers_cap: contReq.containers_cap
  })
);

const constructPermissionSet = (perms) => (
  new types.PermissionSet({
    insert: perms.insert,
    update: perms.update,
    delete: perms.delete,
    manage_permissions: perms.manage_permissions
  })
);

const constructShareMData = (mdata) => (
  new types.ShareMData({
    type_tag: mdata.type_tag,
    name: types.XorName(Buffer.from(mdata.name, 'hex')),
    perms: constructPermissionSet(mdata.perms)
  })
);

const constructShareMDataArray = (mdatas) => {
  const MDataArray = ArrayType(types.ShareMData);
  const mdataArray = new MDataArray(mdatas.length);

  mdatas.forEach((mdata, i) => {
    mdataArray[i] = constructShareMData(mdata);
  });
  return mdataArray;
};

export const constructSharedMdataReq = (sharedMdataReq) => (
  new types.ShareMDataReq({
    app: constructAppExchangeInfo(sharedMdataReq.app),
    mdata: constructShareMDataArray(sharedMdataReq.mdata).buffer,
    mdata_len: sharedMdataReq.mdata_len
  })
);
