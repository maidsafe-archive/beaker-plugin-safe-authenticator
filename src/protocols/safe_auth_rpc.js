/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
import { shell } from 'electron';
/* eslint-enable import/extensions */
import i18n from 'i18n';
import clientManager from '../ffi/client_manager';

class SafeAuthRpc {
  static manifest = {
    allowApp: 'promise'
  };

  static channelName = 'safeAuthRpc';

  /* eslint-disable class-methods-use-this */
  allowApp(url) {
    if (!url) {
      return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('URL'))));
    }
    /* eslint-enable class-methods-use-this */
    const authData = url.split(':'); // url = scheme:action:appId:payload
    return clientManager.authoriseApp(authData[3])
      .then((res) => {
        shell.openExternal(res);
        return res;
      });
  }
}

const safeAuthRpc = new SafeAuthRpc();
export default safeAuthRpc;
