/* JDD Fitness — data store. localStorage for settings, IndexedDB for logs.
 * Logs are keyed by ISO date (YYYY-MM-DD). */

const DB_NAME = "jdd-fit";
const DB_VER = 1;
const STORE = "logs";

const dbOpen = () => new Promise((resolve, reject) => {
  const req = indexedDB.open(DB_NAME, DB_VER);
  req.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(STORE)) {
      db.createObjectStore(STORE, { keyPath: "date" });
    }
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const Store = {
  async getLog(date) {
    const db = await dbOpen();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const r = tx.objectStore(STORE).get(date);
      r.onsuccess = () => resolve(r.result || { date, food: [], workouts: [], health: {} });
      r.onerror = () => reject(r.error);
    });
  },
  async saveLog(date, log) {
    log.date = date;
    const db = await dbOpen();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(log);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
  async allLogs() {
    const db = await dbOpen();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const r = tx.objectStore(STORE).getAll();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => reject(r.error);
    });
  },
  async deleteLog(date) {
    const db = await dbOpen();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(date);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
};

/* Profile / settings in localStorage */
const Profile = {
  defaults: {
    name: "",
    sex: "male",            // male | female
    age: 30,
    heightCm: 175,
    weightKg: 75,
    goal: "maintain",        // lose | maintain | gain
    activity: 1.55,          // PAL factor
    deficitPct: 20,          // for "lose"
    surplusPct: 15,          // for "gain"
    proteinPerKg: 1.8,       // g/kg of body weight
    fatPct: 25,             // % of total kcal as fat
    units: "metric",         // metric | imperial
    shortcutUrl: "",        // last known shortcut URL (for reference)
    lastSync: null
  },
  load() {
    try {
      return Object.assign({}, this.defaults, JSON.parse(localStorage.getItem("jdd.profile") || "{}"));
    } catch { return Object.assign({}, this.defaults); }
  },
  save(p) {
    localStorage.setItem("jdd.profile", JSON.stringify(p));
  }
};

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const isoFrom = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const prettyDate = (iso) => {
  const [y, m, dd] = iso.split("-").map(Number);
  const d = new Date(y, m-1, dd);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};
const dayName = (iso) => {
  const [y, m, dd] = iso.split("-").map(Number);
  return new Date(y, m-1, dd).toLocaleDateString(undefined, { weekday: "short" });
};
