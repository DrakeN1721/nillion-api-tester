import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import isDev from 'electron-is-dev';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    icon: join(__dirname, 'assets', 'icon.png'),
    show: false,
    backgroundColor: '#0a0a0a'
  });

  // Load the app
  const startUrl = isDev
    ? 'http://localhost:4352'
    : `file://${join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Focus on window
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
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

// IPC handlers for UI communication
ipcMain.handle('save-file', async (event, data, filename) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, data);
      return { success: true, path: result.filePath };
    }
    return { success: false, canceled: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-pdf', async (event, pdfData, filename) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename,
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, Buffer.from(pdfData, 'base64'));
      return { success: true, path: result.filePath };
    }
    return { success: false, canceled: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-external', async (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('show-item-in-folder', async (event, path) => {
  shell.showItemInFolder(path);
});

// Create application menu
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Session',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          mainWindow.webContents.send('menu-new-session');
        }
      },
      {
        label: 'Export Session',
        accelerator: 'CmdOrCtrl+E',
        click: () => {
          mainWindow.webContents.send('menu-export-session');
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectall' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Tools',
    submenu: [
      {
        label: 'Test API Connection',
        accelerator: 'CmdOrCtrl+T',
        click: () => {
          mainWindow.webContents.send('menu-test-connection');
        }
      },
      {
        label: 'Clear Logs',
        accelerator: 'CmdOrCtrl+L',
        click: () => {
          mainWindow.webContents.send('menu-clear-logs');
        }
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About Nil AI Key Verification',
        click: () => {
          mainWindow.webContents.send('menu-about');
        }
      },
      {
        label: 'Nil AI Documentation',
        click: () => {
          shell.openExternal('https://docs.nillion.com/build/private-llms/quickstart');
        }
      }
    ]
  }
];

Menu.setApplicationMenu(Menu.buildFromTemplate(template));