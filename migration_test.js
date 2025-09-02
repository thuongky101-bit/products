const fs = require('fs');

// Load the storage data from JSON instead of a script module
const data = JSON.parse(fs.readFileSync('storage.json', 'utf8'));

console.log('Loaded version:', data.version);
console.log('Preset:', data.settings.preset);
console.log('Topic count:', data.topics.length);
