const statusEl = document.getElementById('status');
const statusDotEl = document.getElementById('statusDot');
const countdownEl = document.getElementById('countdown');
const logEl = document.getElementById('log');
const logSectionEl = document.getElementById('logSection');
const toggleLogBtn = document.getElementById('toggleLogBtn');

const tabDashboardBtn = document.getElementById('tabDashboardBtn');
const tabSettingsBtn = document.getElementById('tabSettingsBtn');
const tabDashboardEl = document.getElementById('tabDashboard');
const tabSettingsEl = document.getElementById('tabSettings');
const languageSelectEl = document.getElementById('languageSelect');

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
let currentLocale = 'en';

const I18N = {
  en: {
    titleControlCenter: 'Control Center',
    subtitleApp: 'Modern desktop activity scheduler for Windows',
    tabDashboard: 'Dashboard',
    tabSettings: 'Settings',
    runtimeTitle: 'Runtime',
    runtimeSubtitle: 'Manual start/stop with live countdown',
    statusLabel: 'Status',
    statusRunning: 'Running',
    statusStopped: 'Stopped',
    nextTickLabel: 'Next tick',
    start: 'Start',
    stop: 'Stop',
    runtimeHint: 'Round controls with instant response and schedule fallback.',
    eventLogTitle: 'Event Log',
    logsShow: 'Show logs',
    logsHide: 'Hide logs',
    generalTitle: 'General',
    generalSubtitle: 'System and behavior options',
    intervalLabel: 'Interval (seconds)',
    languageLabel: 'Language',
    autostartLabel: 'Start PresenceKeeper with Windows login',
    dailyScheduleTitle: 'Daily Schedule',
    dailyScheduleSubtitle: 'Automatic runtime window',
    enableScheduleLabel: 'Enable schedule',
    startTimeLabel: 'Start time',
    stopTimeLabel: 'Stop time',
    saveScheduleLabel: 'Save Schedule',
    secondsSuffix: 's',
    startFailed: 'Start failed',
    stopFailed: 'Stop failed',
    scheduleSaveFailed: 'Schedule save failed',
    autoStartSaveFailed: 'Auto-start save failed',
    languageSaveFailed: 'Language save failed',
    updateError: 'Update error'
  },
  de: {
    titleControlCenter: 'Steuerzentrale',
    subtitleApp: 'Moderne Windows-Desktop-App für Aktivitätsplanung',
    tabDashboard: 'Dashboard',
    tabSettings: 'Einstellungen',
    runtimeTitle: 'Laufzeit',
    runtimeSubtitle: 'Manuelles Start/Stopp mit Live-Countdown',
    statusLabel: 'Status',
    statusRunning: 'Aktiv',
    statusStopped: 'Gestoppt',
    nextTickLabel: 'Nächster Tick',
    start: 'Start',
    stop: 'Stopp',
    runtimeHint: 'Runde Steuerung mit sofortiger Reaktion und Scheduler-Fallback.',
    eventLogTitle: 'Ereignisprotokoll',
    logsShow: 'Logs anzeigen',
    logsHide: 'Logs ausblenden',
    generalTitle: 'Allgemein',
    generalSubtitle: 'System- und Verhaltensoptionen',
    intervalLabel: 'Intervall (Sekunden)',
    languageLabel: 'Sprache',
    autostartLabel: 'PresenceKeeper beim Windows-Login starten',
    dailyScheduleTitle: 'Tagesplanung',
    dailyScheduleSubtitle: 'Automatisches Laufzeitfenster',
    enableScheduleLabel: 'Zeitplan aktivieren',
    startTimeLabel: 'Startzeit',
    stopTimeLabel: 'Stoppzeit',
    saveScheduleLabel: 'Zeitplan speichern',
    secondsSuffix: 's',
    startFailed: 'Start fehlgeschlagen',
    stopFailed: 'Stopp fehlgeschlagen',
    scheduleSaveFailed: 'Zeitplan speichern fehlgeschlagen',
    autoStartSaveFailed: 'Autostart speichern fehlgeschlagen',
    languageSaveFailed: 'Sprache speichern fehlgeschlagen',
    updateError: 'Update-Fehler'
  },
  fr: {
    titleControlCenter: 'Centre de contrôle',
    subtitleApp: 'Application Windows moderne pour planifier l’activité',
    tabDashboard: 'Tableau de bord',
    tabSettings: 'Paramètres',
    runtimeTitle: 'Exécution',
    runtimeSubtitle: 'Démarrage/arrêt manuel avec compte à rebours',
    statusLabel: 'Statut',
    statusRunning: 'Actif',
    statusStopped: 'Arrêté',
    nextTickLabel: 'Prochain tick',
    start: 'Démarrer',
    stop: 'Arrêter',
    runtimeHint: 'Commandes rondes avec réponse immédiate et secours planifié.',
    eventLogTitle: 'Journal des événements',
    logsShow: 'Afficher les logs',
    logsHide: 'Masquer les logs',
    generalTitle: 'Général',
    generalSubtitle: 'Options système et comportement',
    intervalLabel: 'Intervalle (secondes)',
    languageLabel: 'Langue',
    autostartLabel: 'Démarrer PresenceKeeper avec Windows',
    dailyScheduleTitle: 'Planification quotidienne',
    dailyScheduleSubtitle: 'Fenêtre d’exécution automatique',
    enableScheduleLabel: 'Activer la planification',
    startTimeLabel: 'Heure de début',
    stopTimeLabel: 'Heure d’arrêt',
    saveScheduleLabel: 'Enregistrer la planification',
    secondsSuffix: 's',
    startFailed: 'Échec du démarrage',
    stopFailed: 'Échec de l’arrêt',
    scheduleSaveFailed: 'Échec de l’enregistrement de la planification',
    autoStartSaveFailed: 'Échec de l’enregistrement du démarrage auto',
    languageSaveFailed: 'Échec de l’enregistrement de la langue',
    updateError: 'Erreur de mise à jour'
  }
};

function t(key) {
  return I18N[currentLocale]?.[key] || I18N.en[key] || key;
}

function appendLog(line) {
  logEl.textContent += `${line}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

function applyTranslations() {
  document.documentElement.lang = currentLocale;
  document.getElementById('titleControlCenter').textContent = t('titleControlCenter');
  document.getElementById('subtitleApp').textContent = t('subtitleApp');
  document.getElementById('runtimeTitle').textContent = t('runtimeTitle');
  document.getElementById('runtimeSubtitle').textContent = t('runtimeSubtitle');
  document.getElementById('statusLabel').textContent = t('statusLabel');
  document.getElementById('nextTickLabel').textContent = t('nextTickLabel');
  document.getElementById('runtimeHint').textContent = t('runtimeHint');
  document.getElementById('eventLogTitle').textContent = t('eventLogTitle');
  document.getElementById('generalTitle').textContent = t('generalTitle');
  document.getElementById('generalSubtitle').textContent = t('generalSubtitle');
  document.getElementById('intervalLabel').textContent = t('intervalLabel');
  document.getElementById('languageLabel').textContent = t('languageLabel');
  document.getElementById('autostartLabel').textContent = t('autostartLabel');
  document.getElementById('dailyScheduleTitle').textContent = t('dailyScheduleTitle');
  document.getElementById('dailyScheduleSubtitle').textContent = t('dailyScheduleSubtitle');
  document.getElementById('enableScheduleLabel').textContent = t('enableScheduleLabel');
  document.getElementById('startTimeLabel').textContent = t('startTimeLabel');
  document.getElementById('stopTimeLabel').textContent = t('stopTimeLabel');
  document.getElementById('saveScheduleLabel').textContent = t('saveScheduleLabel');
  startBtn.textContent = t('start');
  stopBtn.textContent = t('stop');
  tabDashboardBtn.textContent = t('tabDashboard');
  tabSettingsBtn.textContent = t('tabSettings');
  statusEl.textContent = currentState?.running ? t('statusRunning') : t('statusStopped');
  setLogsVisible(logsVisible);
}

function setLogsVisible(visible) {
  logsVisible = !!visible;
  logSectionEl.classList.toggle('hidden', !logsVisible);
  toggleLogBtn.textContent = logsVisible ? t('logsHide') : t('logsShow');
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
  currentLocale = state.locale || currentLocale;
  languageSelectEl.value = currentLocale;
  applyTranslations();
  statusEl.textContent = state.running ? t('statusRunning') : t('statusStopped');
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
  if (state.update?.error) appendLog(`${t('updateError')}: ${state.update.error}`);
}

function updateCountdown() {
  if (!currentState || !currentState.running || !currentState.nextTickAt) {
    countdownEl.textContent = '-';
    return;
  }

  const now = Date.now();
  const next = new Date(currentState.nextTickAt).getTime();
  const diff = Math.max(0, Math.floor((next - now) / 1000));
  countdownEl.textContent = `${diff}${t('secondsSuffix')}`;
}

startBtn.addEventListener('click', async () => {
  const res = await window.presenceApi.start(Number(intervalEl.value));
  if (!res.ok) appendLog(`${t('startFailed')}: ${res.message}`);
});

stopBtn.addEventListener('click', async () => {
  const res = await window.presenceApi.stop();
  if (!res.ok) appendLog(`${t('stopFailed')}: ${res.message}`);
});

saveScheduleBtn.addEventListener('click', async () => {
  const res = await window.presenceApi.setSchedule({
    enabled: scheduleEnabledEl.checked,
    startTime: startTimeEl.value,
    stopTime: stopTimeEl.value
  });
  if (!res.ok) appendLog(`${t('scheduleSaveFailed')}: ${res.message}`);
});

autoStartEnabledEl.addEventListener('change', async () => {
  const res = await window.presenceApi.setAutoStart(autoStartEnabledEl.checked);
  if (!res.ok) appendLog(`${t('autoStartSaveFailed')}: ${res.message}`);
});

languageSelectEl.addEventListener('change', async () => {
  const locale = languageSelectEl.value;
  const res = await window.presenceApi.setLocale(locale);
  if (!res.ok) {
    appendLog(`${t('languageSaveFailed')}: ${res.message}`);
    languageSelectEl.value = currentLocale;
    return;
  }
  currentLocale = locale;
  applyTranslations();
});

toggleLogBtn.addEventListener('click', () => setLogsVisible(!logsVisible));
tabDashboardBtn.addEventListener('click', () => switchTab('dashboard'));
tabSettingsBtn.addEventListener('click', () => switchTab('settings'));

window.presenceApi.onStateUpdate(renderState);
window.presenceApi.onLogAppend(appendLog);

(async function init() {
  const state = await window.presenceApi.getState();
  renderState(state);
  setLogsVisible(false);
  switchTab('dashboard');
  setInterval(updateCountdown, 1000);
})();
