import { spawn } from 'child_process';

console.log('🚀 Starting Tiny Houses Fullstack Server (Express API + Vite Frontend)...');

const server = spawn('node', ['server/index.js'], { stdio: 'inherit', shell: true });
const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });

process.on('SIGINT', () => {
  server.kill();
  vite.kill();
  process.exit();
});
