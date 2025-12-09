// eslint-disable-next-line @typescript-eslint/no-require-imports
const { app, BrowserWindow } = require('electron');

const baseUrl = 'http://127.0.0.1:3345';
const createWindow = () => {
  const electronWindow = new BrowserWindow({
    width: 1512,
    height: 824,
    webPreferences: {
      sandbox: false,
    },
  });
  electronWindow.loadURL(baseUrl);
};

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
