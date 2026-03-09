const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('presenceApi', {
  getAppInfo: () => ipcRenderer.invoke('app:info'),
  getState: () => ipcRenderer.invoke('state:get'),
  start: (intervalSeconds) => ipcRenderer.invoke('worker:start', intervalSeconds),
  stop: () => ipcRenderer.invoke('worker:stop'),
  setSchedule: (schedule) => ipcRenderer.invoke('schedule:set', schedule),
  setAutoStart: (enabled) => ipcRenderer.invoke('autostart:set', enabled),
  checkForUpdates: () => ipcRenderer.invoke('updates:check'),
  installUpdate: () => ipcRenderer.invoke('updates:install'),
  onStateUpdate: (handler) => ipcRenderer.on('state:update', (_event, state) => handler(state)),
  onLogAppend: (handler) => ipcRenderer.on('log:append', (_event, line) => handler(line))
});
