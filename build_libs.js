const spawn = require('child_process').spawn;
const os = require('os');

let cmd = '';

const feature = process.argv.reduce((acc, arg) => {
  const arr = arg.split('=');
  if (!(arr.length === 2 && arr[0] === 'features')) {
    return '';
  }
  return arr[1];
}, '');

if (feature === 'mock-routing') {
  cmd = 'build-libs:mock';
} else {
  cmd = 'build-libs:actual';
}

const build = spawn('npm', ['run', cmd]);

build.stdout.on('data', (data) => {
  console.warn(data.toString());
});

build.stderr.on('data', (data) => {
  console.warn(data.toString());
});

build.on('exit', (code) => {
  console.warn(`Build Authenticator exited with code ${code}`);
  if (code !== 0) {
    return;
  }
  let copyCmd = '';
  if (os.platform() === 'win32') {
    copyCmd = 'copy-binaries:win';
  } else {
    copyCmd = 'copy-binaries:unix';
  }
  const copy = spawn('npm', ['run', copyCmd]);
  copy.stdout.on('data', (data) => {
    console.warn(data.toString());
  });

  copy.stderr.on('data', (data) => {
    console.warn(data.toString());
  });

  copy.on('exit', (c) => {
    console.warn(`Copy Authenticator exited with code ${c}`);
  });
});
