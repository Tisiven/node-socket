const path = require('path');
const { spawn } = require('child_process');

process.env.NODE_ENV = 'development';

spawn('fle', ['lib', '-w'], {
  stdio: 'inherit',
  cwd: path.resolve('server')
});

setTimeout(() => {
  spawn('nodemon', ['server/lib/index.js'], {
    stdio: 'inherit'
  });
}, 1000);

spawn('fle', ['dev'], {
  stdio: 'inherit'
});
