const path = require('path');
const { spawn } = require('child_process');

process.env.NODE_ENV = 'production';

spawn('fle', ['lib'], {
  stdio: 'inherit',
  cwd: path.resolve('server')
});

spawn('fle', ['build', '-r'], {
  stdio: 'inherit'
});
