const spawn = require('child_process').spawn;
const os = require('os');

const osPlatform = os.platform();
let params = {};

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

const parseCmdParams = () => {
  const argv = process.argv;
  const features = argv.filter((e) => (e.indexOf('--features') !== -1))
    .toString()
    .split('=')
    .slice(1)
    .toString();
  const cleanLibs = (argv.indexOf('--clean') !== -1);
  params = {
    features,
    cleanLibs
  };
};

const cleanLibs = () => {
  const cmd = 'npm run clean-libs';
  if (!params.cleanLibs) {
    return Promise.resolve(true);
  }
  return runSpawn('Cleaning native modules', cmd);
};

const buildAuthenticator = () => {
  const cmd = `npm run build-libs:${(params.features === 'mock-routing') ? 'mock' : 'actual'}`;
  return runSpawn('Build Authenticator', cmd);
};

const copyLibs = () => {
  const cmd = `npm run copy-binaries:${(osPlatform === 'win32') ? 'win' : 'unix'}`;
  return runSpawn('Copy Authenticator files', cmd);
};

parseCmdParams();
cleanLibs()
  .then(() => buildAuthenticator())
  .then(() => copyLibs());
