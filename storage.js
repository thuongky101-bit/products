const LS_KEY = 'pomodoro_data_v11'; // Cập nhật phiên bản để tránh xung đột

const localStore = typeof localStorage !== 'undefined' ? localStorage : (() => {
  let store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; }
  };
})();

const uid = (p='id') => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const defaultData = () => ({
  version: 11,
  settings: {
    apiKey: "",
    currentView: 'timer', // Thêm trạng thái view mới
    preset: 'A',
    autoStartNext: true,
    soundOn: true,
    volume: 0.8,
    soundTheme: 'beep',
    theme: 'default',
    cyclesA: 4,
    longBreakIntervalA: 4,
    cyclesB: 4,
    longBreakIntervalB: 4,
    durations: { A_work: 25, A_short: 5, A_long: 15, B_work: 50, B_short: 10, B_long: 30 },
    selectedTopicId: '',
    selectedSubtopicId: '',
    collapsedTopics: {},
    customBg: '', // lưu id hoặc URL
    customSounds: { work_end: '', break_end: '', long_end: '' }, // lưu id hoặc URL
    youtubeUrl: '',
    youtubeVolume: 80,
    useYtThumbnailAsBg: true,
    panelOpacity: 0.85
  },
  topics: [ {
    id: uid('t'),
    name: 'Chủ đề mẫu',
    subtopics: [ {
      id: uid('s'),
      name: 'Subtopic mẫu',
      tasks: [],
      generalNotes: [],
      summaries: [],
      chatHistory: [],
      stats: { totalMinutes: 0, sessionsCompleted: 0, tasksCompleted: 0 },
      sessions: [],
      timerState: {
        state: 'idle',
        remaining: 0,
        segmentTotal: 0,
        cycleIndex: 0
      }
    } ]
  } ]
});

// Chuyển đổi dữ liệu từ các phiên bản cũ sang cấu trúc mới
function migrateData(oldData) {
  const data = defaultData();
  if (oldData.settings) data.settings = { ...data.settings, ...oldData.settings };
  if (oldData.topics) data.topics = oldData.topics;
  return data;
}

let data = null;

function load() {
  try {
    const raw = localStore.getItem(LS_KEY);
    data = raw ? JSON.parse(raw) : defaultData();
  } catch (e) {
    console.error("Lỗi parse JSON, thử dùng bản sao lưu:", e);
    try {
      const backup = localStore.getItem(LS_KEY + '_backup');
      data = backup ? JSON.parse(backup) : defaultData();
    } catch (err) {
      console.error("Không thể đọc bản sao lưu:", err);
      data = defaultData();
    }
  }

  if (!data.version || data.version < 11) {
    data = migrateData(data);
  }

  const set = data.settings;
  if (set.currentView === undefined) set.currentView = 'timer';
  if (set.preset === '4x25') set.preset = 'A';
  if (set.preset === '2x50' || set.preset === '4x50') set.preset = 'B';

  if (set.cyclesA === undefined) set.cyclesA = set.longBreakInterval || 4;
  if (set.longBreakIntervalA === undefined) set.longBreakIntervalA = set.longBreakInterval || 4;
  if (set.cyclesB === undefined) set.cyclesB = set.longBreakInterval || 4;
  if (set.longBreakIntervalB === undefined) set.longBreakIntervalB = set.longBreakInterval || 4;
  delete set.longBreakInterval;

  save();
  return data;
}

function save() {
  try {
    const current = localStore.getItem(LS_KEY);
    if (current) localStore.setItem(LS_KEY + '_backup', current);
    localStore.setItem(LS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Không thể lưu dữ liệu:', e);
    if (typeof toast === 'function') toast('Lưu thất bại: không đủ bộ nhớ.');
  }
}

function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  const ts = new Date();
  const pad = n => `${n}`.padStart(2, '0');
  a.href = URL.createObjectURL(blob);
  a.download = `pomodoro_backup_${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importData(file) {
  const text = await file.text();
  const obj = JSON.parse(text);
  if (!obj.version || !obj.settings || !Array.isArray(obj.topics)) {
    throw new Error('Tệp không đúng định dạng');
  }
  data = obj;
  save();
  return data;
}

export { data, load, save, exportData as export, importData as import };
