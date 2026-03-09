const statusEl = document.getElementById('status');
const statusDotEl = document.getElementById('statusDot');
const countdownEl = document.getElementById('countdown');
const logEl = document.getElementById('log');
const logSectionEl = document.getElementById('logSection');
const toggleLogBtn = document.getElementById('toggleLogBtn');
const appVersionEl = document.getElementById('appVersion');

const tabDashboardBtn = document.getElementById('tabDashboardBtn');
const tabSettingsBtn = document.getElementById('tabSettingsBtn');
const tabDashboardEl = document.getElementById('tabDashboard');
const tabSettingsEl = document.getElementById('tabSettings');

const intervalEl = document.getElementById('interval');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const autoStartEnabledEl = document.getElementById('autostartEnabled');

const scheduleEnabledEl = document.getElementById('scheduleEnabled');
const startTimeEl = document.getElementById('startTime');
const stopTimeEl = document.getElementById('stopTime');
const saveScheduleBtn = document.getElementById('saveScheduleBtn');

let currentState = null;
let logsVisible = false;

function appendLog(line) {
  logEl.textContent += `${line}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

function setLogsVisible(visible) {
  logsVisible = !!visible;
  logSectionEl.classList.toggle('hidden', !logsVisible);
  toggleLogBtn.textContent = logsVisible ? 'Logs ausblenden' : 'Logs anzeigen';
}

function switchTab(tab) {
  const showDashboard = tab === 'dashboard';
  tabDashboardEl.classList.toggle('hidden', !showDashboard);
  tabSettingsEl.classList.toggle('hidden', showDashboard);

  tabDashboardBtn.className = showDashboard
    ? 'rounded-lg bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-800'
    : 'rounded-lg px-4 py-2 text-sm font-semibold text-slate-700';
  tabSettingsBtn.className = showDashboard
    ? 'rounded-lg px-4 py-2 text-sm font-semibold text-slate-700'
    : 'rounded-lg bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-800';
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
  if (state.update?.error) appendLog(`Update error: ${state.update.error}`);
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

toggleLogBtn.addEventListener('click', () => setLogsVisible(!logsVisible));
tabDashboardBtn.addEventListener('click', () => switchTab('dashboard'));
tabSettingsBtn.addEventListener('click', () => switchTab('settings'));

window.presenceApi.onStateUpdate(renderState);
window.presenceApi.onLogAppend(appendLog);

(async function init() {
  const info = await window.presenceApi.getAppInfo();
  appVersionEl.textContent = info?.version || '-';
  const state = await window.presenceApi.getState();
  renderState(state);
  setLogsVisible(false);
  switchTab('dashboard');
  setInterval(updateCountdown, 1000);
})();
