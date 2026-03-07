const statusEl = document.getElementById('status');
const statusDotEl = document.getElementById('statusDot');
const countdownEl = document.getElementById('countdown');
const logEl = document.getElementById('log');

const intervalEl = document.getElementById('interval');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const autoStartEnabledEl = document.getElementById('autostartEnabled');
const checkUpdateBtn = document.getElementById('checkUpdateBtn');
const installUpdateBtn = document.getElementById('installUpdateBtn');
const updateStatusEl = document.getElementById('updateStatus');
const updateVersionEl = document.getElementById('updateVersion');

const scheduleEnabledEl = document.getElementById('scheduleEnabled');
const startTimeEl = document.getElementById('startTime');
const stopTimeEl = document.getElementById('stopTime');
const saveScheduleBtn = document.getElementById('saveScheduleBtn');

let currentState = null;

function appendLog(line) {
  logEl.textContent += `${line}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

function updateUpdateSection(state) {
  const updateState = state.update || { status: 'idle', version: null, error: null };
  updateStatusEl.textContent = `Status: ${updateState.status}`;
  updateVersionEl.textContent = updateState.version ? `Version: ${updateState.version}` : '';
  if (updateState.error) {
    appendLog(`Update error: ${updateState.error}`);
  }

  checkUpdateBtn.disabled = updateState.status === 'checking' || updateState.status === 'downloading';
  installUpdateBtn.disabled = updateState.status !== 'downloaded';
  checkUpdateBtn.classList.toggle('opacity-50', checkUpdateBtn.disabled);
  installUpdateBtn.classList.toggle('opacity-50', installUpdateBtn.disabled);
}

function renderState(state) {
  currentState = state;
  statusEl.textContent = state.running ? 'Running' : 'Stopped';
  statusDotEl.className = state.running ? 'h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.85)]' : 'h-2.5 w-2.5 rounded-full bg-slate-500';
  intervalEl.value = state.intervalSeconds;
  autoStartEnabledEl.checked = !!state.autoStartEnabled;
  scheduleEnabledEl.checked = !!state.schedule.enabled;
  startTimeEl.value = state.schedule.startTime;
  stopTimeEl.value = state.schedule.stopTime;
  startBtn.disabled = state.running;
  stopBtn.disabled = !state.running;
  startBtn.classList.toggle('opacity-50', state.running);
  startBtn.classList.toggle('cursor-not-allowed', state.running);
  stopBtn.classList.toggle('opacity-50', !state.running);
  stopBtn.classList.toggle('cursor-not-allowed', !state.running);
  updateUpdateSection(state);
}

function updateCountdown() {
  if (!currentState || !currentState.running || !currentState.nextTickAt) {
    countdownEl.textContent = '-';
    return;
  }

  const now = Date.now();
  const next = new Date(currentState.nextTickAt).getTime();
  const diff = Math.max(0, Math.floor((next - now) / 1000));
  countdownEl.textContent = `${diff}s`;
}

startBtn.addEventListener('click', async () => {
  const res = await window.presenceApi.start(Number(intervalEl.value));
  if (!res.ok) appendLog(`Start failed: ${res.message}`);
});

stopBtn.addEventListener('click', async () => {
  const res = await window.presenceApi.stop();
  if (!res.ok) appendLog(`Stop failed: ${res.message}`);
});

saveScheduleBtn.addEventListener('click', async () => {
  const res = await window.presenceApi.setSchedule({
    enabled: scheduleEnabledEl.checked,
    startTime: startTimeEl.value,
    stopTime: stopTimeEl.value
  });
  if (!res.ok) appendLog(`Schedule save failed: ${res.message}`);
});

autoStartEnabledEl.addEventListener('change', async () => {
  const res = await window.presenceApi.setAutoStart(autoStartEnabledEl.checked);
  if (!res.ok) appendLog(`Auto-start save failed: ${res.message}`);
});

checkUpdateBtn.addEventListener('click', async () => {
  const res = await window.presenceApi.checkForUpdates();
  if (!res.ok) appendLog(`Update check skipped: ${res.message}`);
});

installUpdateBtn.addEventListener('click', async () => {
  const res = await window.presenceApi.installUpdate();
  if (!res.ok) appendLog(`Install update failed: ${res.message}`);
});

window.presenceApi.onStateUpdate(renderState);
window.presenceApi.onLogAppend(appendLog);

(async function init() {
  const state = await window.presenceApi.getState();
  renderState(state);
  appendLog('Application initialized.');
  setInterval(updateCountdown, 1000);
})();
