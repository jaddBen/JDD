// storage.js — localStorage wrapper for FitTrack
const Storage = (() => {
  const PREFIX = 'fittrack_';

  function key(k) { return PREFIX + k; }

  function get(k, def = null) {
    try {
      const val = localStorage.getItem(key(k));
      return val !== null ? JSON.parse(val) : def;
    } catch { return def; }
  }

  function set(k, val) {
    try { localStorage.setItem(key(k), JSON.stringify(val)); return true; }
    catch (e) { console.error('Storage error', e); return false; }
  }

  function remove(k) { localStorage.removeItem(key(k)); }

  function getArray(k) { return get(k, []); }

  function appendToArray(k, item) {
    const arr = getArray(k);
    arr.push(item);
    set(k, arr);
    return arr;
  }

  function updateArrayItem(k, id, updater) {
    const arr = getArray(k);
    const idx = arr.findIndex(i => i.id === id);
    if (idx !== -1) { arr[idx] = { ...arr[idx], ...updater }; set(k, arr); }
    return arr;
  }

  function deleteArrayItem(k, id) {
    const arr = getArray(k).filter(i => i.id !== id);
    set(k, arr);
    return arr;
  }

  function clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }

  return { get, set, remove, getArray, appendToArray, updateArrayItem, deleteArrayItem, clear };
})();

window.Storage = Storage;
