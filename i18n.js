export let translations = {};

export async function loadLanguage(lang = 'vi') {
  try {
    const res = await fetch(`i18n/${lang}.json`);
    if (res.ok) {
      translations = await res.json();
    } else {
      console.error('Could not load language', lang);
      translations = {};
    }
  } catch (err) {
    console.error('Language loading error', err);
    translations = {};
  }
}

export function t(key, params = {}) {
  let str = translations[key] || key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}
