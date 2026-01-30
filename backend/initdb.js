// Simple initialization script that can be run as a Railway deployment command
import { spawn } from 'child_process';

console.log('🚀 Starting database initialization...\n');

const runScript = (script) => {
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['run', script], { stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code !== 0) reject(new Error(`${script} failed with code ${code}`));
      else resolve();
    });
  });
};

(async () => {
  try {
    await runScript('db:init');
    await runScript('db:add-culture-quest');
    await runScript('db:add-levio');
    await runScript('db:create-test-user');
    console.log('\n✅ Database fully initialized!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    process.exit(1);
  }
})();
