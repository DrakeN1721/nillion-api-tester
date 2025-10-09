const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // File operations
  saveFile: (data, filename) => ipcRenderer.invoke('save-file', data, filename),
  savePDF: (pdfData, filename) => ipcRenderer.invoke('save-pdf', pdfData, filename),

  // External operations
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  showItemInFolder: (path) => ipcRenderer.invoke('show-item-in-folder', path),

  // Secure storage operations (keychain)
  saveSecureData: (service, account, password) => ipcRenderer.invoke('save-secure-data', service, account, password),
  getSecureData: (service, account) => ipcRenderer.invoke('get-secure-data', service, account),
  deleteSecureData: (service, account) => ipcRenderer.invoke('delete-secure-data', service, account),

  // Menu event listeners
  onMenuNewSession: (callback) => ipcRenderer.on('menu-new-session', callback),
  onMenuExportSession: (callback) => ipcRenderer.on('menu-export-session', callback),
  onMenuTestConnection: (callback) => ipcRenderer.on('menu-test-connection', callback),
  onMenuClearLogs: (callback) => ipcRenderer.on('menu-clear-logs', callback),
  onMenuAbout: (callback) => ipcRenderer.on('menu-about', callback),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Legacy support for 'electronAPI' (deprecated, use 'electron' instead)
contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (data, filename) => ipcRenderer.invoke('save-file', data, filename),
  savePDF: (pdfData, filename) => ipcRenderer.invoke('save-pdf', pdfData, filename),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  showItemInFolder: (path) => ipcRenderer.invoke('show-item-in-folder', path),
  onMenuNewSession: (callback) => ipcRenderer.on('menu-new-session', callback),
  onMenuExportSession: (callback) => ipcRenderer.on('menu-export-session', callback),
  onMenuTestConnection: (callback) => ipcRenderer.on('menu-test-connection', callback),
  onMenuClearLogs: (callback) => ipcRenderer.on('menu-clear-logs', callback),
  onMenuAbout: (callback) => ipcRenderer.on('menu-about', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});