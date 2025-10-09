const { app, BrowserWindow, Menu, ipcMain, dialog, shell, screen } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');

// Import keytar for secure credential storage
let keytar;
try {
  keytar = require('keytar');
} catch (error) {
  console.warn('⚠️  Keytar not available, secure storage will use fallback method:', error.message);
}

let mainWindow;

function createWindow() {
  // Get screen dimensions for proper centering
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  const windowWidth = 1400;
  const windowHeight = 1000;

  // Calculate center position
  const x = Math.floor((screenWidth - windowWidth) / 2);
  const y = Math.floor((screenHeight - windowHeight) / 2);

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 1200,
    minHeight: 800,
    x: x,
    y: y,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, 'preload.cjs')
    },
    titleBarStyle: 'default',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
    backgroundColor: '#0a0a0a'
  });

  // Load the app
  const startUrl = isDev
    ? 'http://localhost:4352'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "connect-src 'self' https://nilai-a779.nillion.network; " +
          "img-src 'self' data: blob:; " +
          "style-src 'self' 'unsafe-inline'; " +
          "font-src 'self' data:; " +
          "object-src 'none'; " +
          "base-uri 'self';"
        ]
      }
    });
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Set zoom to exactly 100%
    mainWindow.webContents.setZoomFactor(1.0);

    // Focus on window (DevTools can be toggled via View menu)
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

// Validation helper for IPC inputs
function validateIPCInput(data, type) {
  if (type === 'string' && typeof data !== 'string') {
    throw new Error('Invalid input: expected string');
  }
  if (type === 'object' && (typeof data !== 'object' || data === null)) {
    throw new Error('Invalid input: expected object');
  }
  if (type === 'buffer' && !Buffer.isBuffer(Buffer.from(data))) {
    throw new Error('Invalid input: expected buffer data');
  }
  return true;
}

// IPC handlers for UI communication
ipcMain.handle('save-file', async (event, data, filename) => {
  try {
    // Validate inputs
    validateIPCInput(data, 'string');
    validateIPCInput(filename, 'string');

    // Sanitize filename to prevent path traversal
    const sanitizedFilename = path.basename(filename);

    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: sanitizedFilename,
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
    // Validate inputs
    validateIPCInput(pdfData, 'string');
    validateIPCInput(filename, 'string');

    // Sanitize filename to prevent path traversal
    const sanitizedFilename = path.basename(filename);

    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: sanitizedFilename,
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
  // Validate URL is a string and starts with http/https
  validateIPCInput(url, 'string');

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('Invalid URL: must start with http:// or https://');
  }

  shell.openExternal(url);
});

ipcMain.handle('show-item-in-folder', async (event, filePath) => {
  validateIPCInput(filePath, 'string');

  // Verify the path exists before trying to show it
  if (fs.existsSync(filePath)) {
    shell.showItemInFolder(filePath);
  } else {
    throw new Error('File path does not exist');
  }
});

// Secure storage IPC handlers (keychain integration)
ipcMain.handle('save-secure-data', async (event, service, account, password) => {
  try {
    validateIPCInput(service, 'string');
    validateIPCInput(account, 'string');
    validateIPCInput(password, 'string');

    if (!keytar) {
      throw new Error('Keychain not available on this system');
    }

    await keytar.setPassword(service, account, password);
    return true;
  } catch (error) {
    console.error('Failed to save to keychain:', error);
    throw error;
  }
});

ipcMain.handle('get-secure-data', async (event, service, account) => {
  try {
    validateIPCInput(service, 'string');
    validateIPCInput(account, 'string');

    if (!keytar) {
      throw new Error('Keychain not available on this system');
    }

    const password = await keytar.getPassword(service, account);
    return password;
  } catch (error) {
    console.error('Failed to retrieve from keychain:', error);
    throw error;
  }
});

ipcMain.handle('delete-secure-data', async (event, service, account) => {
  try {
    validateIPCInput(service, 'string');
    validateIPCInput(account, 'string');

    if (!keytar) {
      throw new Error('Keychain not available on this system');
    }

    const success = await keytar.deletePassword(service, account);
    return success;
  } catch (error) {
    console.error('Failed to delete from keychain:', error);
    throw error;
  }
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