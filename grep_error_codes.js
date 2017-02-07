import path from 'path';
import childProcess from 'child_process';
import fse from 'fs-extra';

// const targetErrorFilePath = path.resolve(__dirname, 'native', 'safe_authenticator', 'src', 'errors.rs');
const targetErrorFilePath = path.resolve('/Users/shankar/Dev/Libs/safe_core/safe_authenticator/src', 'errors.rs');
const destErrorFilePath = path.resolve(__dirname, 'src', 'ffi', 'error_code_lookup.json');
const matchText = 'pub const ERR_';

const transformGrepResult = (grepStr) => {
  const resultObj = {};

  const formatErrMessage = (err) => {
    const msg = err.replace(/(ERR_)|(_)/g, ' ').trim();
    return msg.charAt(0).toUpperCase() + msg.substring(1).toLowerCase();
  };

  grepStr
    .split('\n')
    .slice(0, -1)
    .map((err) =>
      err.replace('pub const', '')
        .trim()
        .replace(/^(\w+).*?(-\d+);/, '$1,$2')
        .split(',')
    )
    .forEach((item) => {
      resultObj[item[1]] = formatErrMessage(item[0]);
    });
  fse.writeJsonSync(destErrorFilePath, resultObj);
};

const spawn = childProcess.spawn('grep', ['-i', matchText, targetErrorFilePath]);

let buf = '';

spawn.stdout.on('data', (data) => {
  buf += data;
});

spawn.on('exit', () => {
  transformGrepResult(buf);
});
