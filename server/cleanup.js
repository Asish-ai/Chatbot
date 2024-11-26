import { execSync } from 'child_process';

try {
  // Windows command to kill process on port 5000
  execSync('taskkill /F /IM node.exe /T', { stdio: 'ignore' });
} catch (error) {
  console.log('No node processes to kill');
}