import { shell } from 'electron';
export const parseResUrl = (url) => {
  const split = url.split(':');
  split[0] = split[0].toLocaleLowerCase().replace('==', '');
  return split.join(':');
};

export const openExternal = (uri) => {
  if (!uri || (uri.indexOf('safe') !== 0)) {
    return;
  }
  try {
    shell.openExternal(parseResUrl(uri));
  } catch (err) {
    console.error(err);
  }
};
