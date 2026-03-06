const statusEl = document.getElementById('status');
const statusDotEl = document.getElementById('statusDot');
const countdownEl = document.getElementById('countdown');
const logEl = document.getElementById('log');

const intervalEl = document.getElementById('interval');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

const scheduleEnabledEl = document.getElementById('scheduleEnabled');
const startTimeEl = document.getElementById('startTime');
const stopTimeEl = document.getElementById('stopTime');
const saveScheduleBtn = document.getElementById('saveScheduleBtn');

let currentState = null;

function appendLog(line) {
  logEl.textContent += `${line}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

function renderState(state) {
  currentState = state;
  statusEl.textContent = state.running ? 'Running' : 'Stopped';
  statusDotEl.className = state.running ? 'h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.85)]' : 'h-2.5 w-2.5 rounded-full bg-slate-500';
  intervalEl.value = state.intervalSeconds;
  scheduleEnabledEl.checked = !!state.schedule.enabled;
  startTimeEl.value = state.schedule.startTime;
  stopTimeEl.value = state.schedule.stopTime;
  startBtn.disabled = state.running;
  stopBtn.disabled = !state.running;
  startBtn.classList.toggle('opacity-50', state.running);
  startBtn.classList.toggle('cursor-not-allowed', state.running);
  stopBtn.classList.toggle('opacity-50', !state.running);
  stopBtn.classList.toggle('cursor-not-allowed', !state.running);
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

window.presenceApi.onStateUpdate(renderState);
window.presenceApi.onLogAppend(appendLog);

(async function init() {
  const state = await window.presenceApi.getState();
  renderState(state);
  appendLog('Application initialized.');
  setInterval(updateCountdown, 1000);
})();
