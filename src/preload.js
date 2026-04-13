const { contextBridge, ipcRenderer } = require('electron');

// Renderer process'ten main process'e güvenli erişim
contextBridge.exposeInMainWorld('electronAPI', {
  // App bilgileri
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getDbPath: () => ipcRenderer.invoke('get-db-path'),
  
  // Dialoglar
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Platform
  platform: process.platform
});
