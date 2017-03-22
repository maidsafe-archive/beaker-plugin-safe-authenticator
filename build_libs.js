const exec = require('child_process').exec;
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
  cmd = 'npm run build-libs:mock';
} else {
  cmd = 'npm run build-libs:actual';
}

if (os.platform() === 'win32') {
  cmd += ' && npm run copy-binaries:win';
} else {
  cmd += ' && npm run copy-binaries:unix';
}

exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.warn(stdout);
  if (stderr) {
    console.warn(`Error: ${stderr}`);
  }
});
