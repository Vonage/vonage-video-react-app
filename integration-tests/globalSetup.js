/* eslint-disable @typescript-eslint/no-require-imports */
const startElectronApp = require('./electronHelper');

module.exports = async () => {
  const isElectronProject = process.argv.some((arg) => arg.includes('--project=Electron'));

  if (isElectronProject) {
    const projectType = process.env.PROJECT_TYPE || 'Electron';
    process.env.PROJECT_TYPE = projectType;
    const electronApp = await startElectronApp();
    // Wait for the first window and ensure it is fully loaded
    const window = await electronApp.waitForEvent('window');
    await window.waitForSelector('button:text("Join")');

    process.env.ELECTRON_APP_PID = electronApp.process().pid;
  }
};
