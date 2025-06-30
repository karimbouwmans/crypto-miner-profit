const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.svg'),
    title: 'Crypto Miner Profit Calculator'
  });

  mainWindow.loadFile('index.html');

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers voor data opslag
ipcMain.handle('save-settings', (event, settings) => {
  store.set('settings', settings);
  return true;
});

ipcMain.handle('load-settings', () => {
  return store.get('settings', {});
});

ipcMain.handle('save-mining-data', (event, data) => {
  const existing = store.get('mining-data', []);
  existing.push({ ...data, timestamp: Date.now() });
  store.set('mining-data', existing);
  return true;
});

ipcMain.handle('load-mining-data', () => {
  return store.get('mining-data', []);
}); 