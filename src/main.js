const { app, BrowserWindow, ipcMain, Tray, Menu, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');

let mainWindow;
let workerProcess = null;
let schedulerTimer = null;
let updateCheckTimer = null;
let lastScheduleActionKey = null;
let tray = null;
let isQuitting = false;
let trayBlinkTimer = null;
let trayBlinkOn = true;
const startHidden = process.argv.includes('--hidden');

const state = {
  running: false,
  intervalSeconds: 240,
  nextTickAt: null,
  autoStartEnabled: false,
  update: {
    status: 'idle',
    version: null,
    error: null
  },
  schedule: {
    enabled: false,
    startTime: '08:30',
    stopTime: '17:30'
  }
};

function sendState() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('state:update', state);
  }
  refreshTrayMenu();
  refreshTrayIcon();
}

function log(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('log:append', `[${new Date().toLocaleTimeString()}] ${message}`);
  }
}

function setUpdateState(status, version = null, error = null) {
  state.update = { status, version, error };
  sendState();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 860,
    height: 680,
    show: !startHidden,
    icon: path.join(app.getAppPath(), 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      log('Window hidden to tray. Use tray icon to reopen.');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setAutoStart(enabled) {
  const on = !!enabled;
  try {
    if (process.platform === 'win32') {
      app.setLoginItemSettings({
        openAtLogin: on,
        path: process.execPath,
        args: ['--hidden']
      });
    }
    state.autoStartEnabled = on;
    sendState();
    log(`Auto-start ${on ? 'enabled' : 'disabled'}.`);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

function openMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
  }
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
}

function checkForUpdates() {
  if (!app.isPackaged) {
    const message = 'Updates are only available in installed builds.';
    log(message);
    return { ok: false, message };
  }

  autoUpdater.checkForUpdates().catch((error) => {
    const msg = error?.message || String(error);
    setUpdateState('error', null, msg);
    log(`Update check failed: ${msg}`);
  });

  return { ok: true };
}

function installDownloadedUpdate() {
  if (state.update.status !== 'downloaded') {
    return { ok: false, message: 'No downloaded update available.' };
  }

  log('Installing update and restarting app...');
  setImmediate(() => autoUpdater.quitAndInstall());
  return { ok: true };
}

function setupAutoUpdater() {
  if (!app.isPackaged) {
    setUpdateState('disabled');
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    setUpdateState('checking');
    log('Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    setUpdateState('downloading', info?.version || null);
    log(`Update available${info?.version ? `: v${info.version}` : ''}. Downloading...`);
  });

  autoUpdater.on('update-not-available', () => {
    setUpdateState('idle');
    log('No updates available.');
  });

  autoUpdater.on('update-downloaded', (info) => {
    setUpdateState('downloaded', info?.version || null);
    log(`Update downloaded${info?.version ? `: v${info.version}` : ''}. Restart to install.`);
  });

  autoUpdater.on('error', (error) => {
    const msg = error?.message || String(error);
    setUpdateState('error', null, msg);
    log(`Auto-update error: ${msg}`);
  });

  setTimeout(() => {
    checkForUpdates();
  }, 10000);

  updateCheckTimer = setInterval(() => {
    checkForUpdates();
  }, 6 * 60 * 60 * 1000);
}

function refreshTrayMenu() {
  if (!tray) return;
  const menu = Menu.buildFromTemplate([
    { label: `Status: ${state.running ? 'Running' : 'Stopped'}`, enabled: false },
    { type: 'separator' },
    {
      label: 'Start',
      enabled: !state.running,
      click: () => startWorker(state.intervalSeconds)
    },
    {
      label: 'Stop',
      enabled: state.running,
      click: () => stopWorker()
    },
    { type: 'separator' },
    { label: 'Check for Updates', click: () => checkForUpdates() },
    {
      label: 'Install Update and Restart',
      enabled: state.update.status === 'downloaded',
      click: () => installDownloadedUpdate()
    },
    { type: 'separator' },
    { label: 'Open', click: () => openMainWindow() },
    {
      label: 'Exit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(menu);
}

function refreshTrayIcon() {
  if (!tray) return;
  if (trayBlinkTimer) {
    clearInterval(trayBlinkTimer);
    trayBlinkTimer = null;
  }

  const runningPath = path.join(app.getAppPath(), 'build', 'tray-running.png');
  const runningBlinkPath = path.join(app.getAppPath(), 'build', 'tray-running-blink.png');
  const stoppedPath = path.join(app.getAppPath(), 'build', 'tray-stopped.png');

  if (!state.running) {
    tray.setImage(stoppedPath);
    return;
  }

  trayBlinkOn = true;
  tray.setImage(runningPath);
  trayBlinkTimer = setInterval(() => {
    trayBlinkOn = !trayBlinkOn;
    tray.setImage(trayBlinkOn ? runningPath : runningBlinkPath);
  }, 700);
}

function createTray() {
  if (tray) return;
  tray = new Tray(path.join(app.getAppPath(), 'build', 'tray-stopped.png'));
  tray.setToolTip('PresenceKeeper');
  tray.on('double-click', () => openMainWindow());
  refreshTrayMenu();
  refreshTrayIcon();
}

function createAppMenu() {
  const template = [
    {
      label: 'Help',
      submenu: [
        { label: `Version ${app.getVersion()}`, enabled: false },
        { type: 'separator' },
        { label: 'Check for Updates', click: () => checkForUpdates() },
        {
          label: 'Install Update and Restart',
          enabled: state.update.status === 'downloaded',
          click: () => installDownloadedUpdate()
        },
        { type: 'separator' },
        { label: 'Kontaktseite', click: () => shell.openExternal('https://landolsi.de') },
        { label: 'E-Mail schreiben', click: () => shell.openExternal('mailto:info@landolsi.de?subject=PresenceKeeper%20Support') },
        { type: 'separator' },
        { label: 'GitHub Repository', click: () => shell.openExternal('https://github.com/alandolsi/PresenceKeeper') }
      ]
    }
  ];
  const appMenu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(appMenu);
}

function shouldIgnoreWorkerBannerLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return true;
  return (
    /^Windows PowerShell$/i.test(trimmed) ||
    /^Copyright/i.test(trimmed) ||
    /^Installieren Sie die neueste PowerShell/i.test(trimmed) ||
    /^https?:\/\/aka\.ms\/PSWindows/i.test(trimmed)
  );
}

function parseWorkerLine(line) {
  try {
    const event = JSON.parse(line);
    if (event.type === 'tick' && event.nextTickAt) {
      state.nextTickAt = event.nextTickAt;
      sendState();
    }
    if (event.type === 'started') {
      log('Worker started.');
    }
    if (event.type === 'error') {
      log(`Worker error: ${event.message}`);
    }
  } catch {
    const trimmed = line.trim();
    if (!shouldIgnoreWorkerBannerLine(trimmed)) {
      log(`Worker: ${trimmed}`);
    }
  }
}

function resolveWorkerScriptPath() {
  const devPath = path.join(app.getAppPath(), 'worker', 'presence_worker.ps1');
  if (!app.isPackaged) {
    return devPath;
  }

  const unpackedPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'worker', 'presence_worker.ps1');
  if (fs.existsSync(unpackedPath)) {
    return unpackedPath;
  }

  // Fallback for unusual packaging/layout setups.
  return devPath;
}

function startWorker(intervalSeconds) {
  if (workerProcess) return { ok: false, message: 'Already running.' };
  if (!Number.isFinite(intervalSeconds) || intervalSeconds < 30 || intervalSeconds > 900) {
    return { ok: false, message: 'Interval must be between 30 and 900 seconds.' };
  }

  const scriptPath = resolveWorkerScriptPath();
  if (!fs.existsSync(scriptPath)) {
    return { ok: false, message: `Worker script not found: ${scriptPath}` };
  }
  workerProcess = spawn('powershell.exe', [
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', scriptPath,
    '-IntervalSeconds', String(intervalSeconds)
  ], { windowsHide: true });

  state.running = true;
  state.intervalSeconds = intervalSeconds;
  state.nextTickAt = null;
  sendState();
  log(`Started with interval ${intervalSeconds}s.`);

  workerProcess.stdout.on('data', (buf) => {
    const text = String(buf);
    text.split(/\r?\n/).forEach(parseWorkerLine);
  });

  workerProcess.stderr.on('data', (buf) => {
    log(`PowerShell stderr: ${String(buf).trim()}`);
  });

  workerProcess.on('exit', (code) => {
    workerProcess = null;
    state.running = false;
    state.nextTickAt = null;
    sendState();
    log(`Stopped (exit code ${code ?? 'unknown'}).`);
  });

  return { ok: true };
}

function stopWorker() {
  if (!workerProcess) return { ok: false, message: 'Not running.' };
  workerProcess.kill();
  return { ok: true };
}

function nowHHMM() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function scheduleLoop() {
  if (!state.schedule.enabled) return;

  const key = `${new Date().toDateString()}-${nowHHMM()}`;
  if (lastScheduleActionKey === key) return;

  const current = nowHHMM();
  if (current === state.schedule.startTime && !state.running) {
    lastScheduleActionKey = key;
    log(`Schedule start triggered at ${current}.`);
    startWorker(state.intervalSeconds);
  }

  if (current === state.schedule.stopTime && state.running) {
    lastScheduleActionKey = key;
    log(`Schedule stop triggered at ${current}.`);
    stopWorker();
  }
}

app.whenReady().then(() => {
  app.setAppUserModelId('de.landolsi.presencekeeper');
  if (process.platform === 'win32') {
    state.autoStartEnabled = app.getLoginItemSettings().openAtLogin;
  }
  createAppMenu();
  createWindow();
  createTray();
  setupAutoUpdater();
  schedulerTimer = setInterval(scheduleLoop, 1000);

  ipcMain.handle('state:get', () => state);

  ipcMain.handle('worker:start', (_event, intervalSeconds) => {
    return startWorker(Number(intervalSeconds));
  });

  ipcMain.handle('worker:stop', () => {
    return stopWorker();
  });

  ipcMain.handle('schedule:set', (_event, schedule) => {
    state.schedule = {
      enabled: !!schedule.enabled,
      startTime: schedule.startTime,
      stopTime: schedule.stopTime
    };
    sendState();
    log(`Schedule updated: ${state.schedule.enabled ? 'enabled' : 'disabled'} (${state.schedule.startTime} - ${state.schedule.stopTime}).`);
    return { ok: true };
  });

  ipcMain.handle('autostart:set', (_event, enabled) => {
    return setAutoStart(enabled);
  });

  ipcMain.handle('updates:check', () => {
    return checkForUpdates();
  });

  ipcMain.handle('updates:install', () => {
    return installDownloadedUpdate();
  });

  ipcMain.handle('app:info', () => {
    return { name: app.getName(), version: app.getVersion() };
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') app.quit();
});

app.on('before-quit', () => {
  isQuitting = true;
  if (schedulerTimer) clearInterval(schedulerTimer);
  if (updateCheckTimer) clearInterval(updateCheckTimer);
  if (workerProcess) workerProcess.kill();
  if (trayBlinkTimer) clearInterval(trayBlinkTimer);
  if (tray) tray.destroy();
});
