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

// Load storage module code (strip ES module exports)
let code = fs.readFileSync('storage.js', 'utf8');
code = code.replace(/export\s+{[^}]+};?/g, '');
vm.runInContext(code, context);

// Simulate old data (version 10)
const oldData = {
  version: 10,
  settings: { preset: '4x25', longBreakInterval: 3, customBg: 'old.jpg' },
  topics: [{ id: 't_old', name: 'Old Topic', subtopics: [] }]
};
localStorage.setItem('pomodoro_data_v11', JSON.stringify(oldData));

// Load and migrate
const result = context.load();

console.log('Migrated version:', result.version);
console.log('Preset after migrate:', result.settings.preset);
console.log('Custom background:', result.settings.customBg);
console.log('Topic count:', result.topics.length);
