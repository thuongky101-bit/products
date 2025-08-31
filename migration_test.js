const fs = require('fs');
const vm = require('vm');

// Mock localStorage
const localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = val; }
};

// Stub functions used in evaluated code
const context = {
  console,
  localStorage,
  toast: () => {},
  uid: (p='id') => `${p}_test`
};
vm.createContext(context);

// Extract the relevant part of pomodoro.html containing defaultData, migrateData and store
const html = fs.readFileSync('pomodoro.html', 'utf8');
const start = html.indexOf('const LS_KEY');
const end = html.indexOf('function showInputModal');
const snippet = html.slice(start, end);
vm.runInContext(snippet, context);

// Simulate old data (version 10)
const oldData = {
  version: 10,
  settings: { preset: '4x25', longBreakInterval: 3, customBg: 'old.jpg' },
  topics: [{ id: 't_old', name: 'Old Topic', subtopics: [] }]
};
localStorage.setItem('pomodoro_data_v11', JSON.stringify(oldData));

// Load and migrate
const store = vm.runInContext('store', context);
const result = store.load();

console.log('Migrated version:', result.version);
console.log('Preset after migrate:', result.settings.preset);
console.log('Custom background:', result.settings.customBg);
console.log('Topic count:', result.topics.length);
