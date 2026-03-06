const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('node:path');
const { spawn } = require('node:child_process');

let mainWindow;
let workerProcess = null;
let schedulerTimer = null;
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
    if (line.trim()) log(`Worker: ${line.trim()}`);
  }
}

function startWorker(intervalSeconds) {
  if (workerProcess) return { ok: false, message: 'Already running.' };
  if (!Number.isFinite(intervalSeconds) || intervalSeconds < 30 || intervalSeconds > 900) {
    return { ok: false, message: 'Interval must be between 30 and 900 seconds.' };
  }

  const scriptPath = path.join(app.getAppPath(), 'worker', 'presence_worker.ps1');
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
  createWindow();
  createTray();
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

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Keep app alive in tray on Windows/Linux.
  if (process.platform === 'darwin') app.quit();
});

app.on('before-quit', () => {
  isQuitting = true;
  if (schedulerTimer) clearInterval(schedulerTimer);
  if (workerProcess) workerProcess.kill();
  if (trayBlinkTimer) clearInterval(trayBlinkTimer);
  if (tray) tray.destroy();
});
