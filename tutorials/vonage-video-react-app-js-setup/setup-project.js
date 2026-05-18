const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectDir = path.join(__dirname, 'project');

// Install Node.js dependencies
console.log('Installing dependencies...');
execSync('yarn install --frozen-lockfile', {
  cwd: projectDir,
  stdio: 'inherit',
});

// Copy the backend environment example file if .env does not already exist
const envTarget = path.join(projectDir, 'backend', '.env');
const envExample = path.join(projectDir, 'backend', '.env.example');

if (!fs.existsSync(envTarget) && fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, envTarget);
  console.log('Created backend/.env from backend/.env.example');
}

console.log('Setup complete. Open backend/.env and fill in your Vonage credentials.');
