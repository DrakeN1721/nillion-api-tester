import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  saveFile: (data, filename) => ipcRenderer.invoke('save-file', data, filename),
  savePDF: (pdfData, filename) => ipcRenderer.invoke('save-pdf', pdfData, filename),

  // External operations
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  showItemInFolder: (path) => ipcRenderer.invoke('show-item-in-folder', path),

  // Menu event listeners
  onMenuNewSession: (callback) => ipcRenderer.on('menu-new-session', callback),
  onMenuExportSession: (callback) => ipcRenderer.on('menu-export-session', callback),
  onMenuTestConnection: (callback) => ipcRenderer.on('menu-test-connection', callback),
  onMenuClearLogs: (callback) => ipcRenderer.on('menu-clear-logs', callback),
  onMenuAbout: (callback) => ipcRenderer.on('menu-about', callback),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});