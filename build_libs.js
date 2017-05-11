const spawn = require('child_process').spawn;
const os = require('os');

const osPlatform = os.platform();

const features = process.argv.reduce((acc, arg) => {
  const arr = arg.split('=');
  if (!(arr.length === 2 && arr[0] === 'features')) {
    return '';
  }
  return arr[1];
}, '');

const cmd = `build-libs:${(features === 'mock-routing') ? 'mock' : 'actual'}`;

const runSpawn = (title, cmdStr) => (
  new Promise((resolve) => {
    cmdStr = cmdStr.split(' ');
    if (osPlatform === 'win32') {
      cmdStr[0] += '.cmd';
    }
    const build = spawn(cmdStr[0], cmdStr.slice(1));

    build.stdout.on('data', (data) => {
      console.warn(data.toString());
    });

    build.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    build.on('close', (code) => {
      console.warn(`${title} exited with code ${code}`);
      if (code !== 0) {
        process.exit(code);
        return;
      }
      resolve();
    });
  })
);

runSpawn('Build Authenticator', `npm run ${cmd}`)
  .then(() => {
    const copyCmd = `copy-binaries:${(osPlatform === 'win32') ? 'win' : 'unix'}`;
    runSpawn('Copy Authenticator files', `npm run ${copyCmd}`);
  });
