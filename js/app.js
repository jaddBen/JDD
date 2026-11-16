// app.js — Shared utilities, nav, and helpers
const App = (() => {
  function uuid() {
    return crypto.randomUUID ? crypto.randomUUID()
      : 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
  }

  function today() { return new Date().toISOString().slice(0, 10); }

  function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function formatDateTime(iso) {
    return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function $(sel, ctx = document) { return ctx.querySelector(sel); }
  function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

  function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function setActive(page) {
    $$('.nav-link').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === page);
    });
  }

  function getProfile() { return Storage.get('profile'); }

  function getWeightKg() {
    const p = getProfile();
    return p ? parseFloat(p.weight) * (p.weightUnit === 'lbs' ? 0.453592 : 1) : 70;
  }

  function getTodayWorkouts() {
    return Storage.getArray('workouts').filter(w => w.date === today());
  }

  function getTodayNutrition() {
    return Storage.getArray('nutrition').filter(n => n.date === today());
  }

  function getTodayBurned() {
    return getTodayWorkouts().reduce((s, w) => s + (w.caloriesBurned || 0), 0);
  }

  function getTodayConsumed() {
    return getTodayNutrition().reduce((s, n) => s + (n.calories || 0), 0);
  }

  function getTodayTDEE() {
    const p = getProfile();
    if (!p) return 2000;
    return CalorieEngine.tdee({
      weight: getWeightKg(),
      height: parseFloat(p.height) * (p.heightUnit === 'in' ? 2.54 : 1),
      age: parseInt(p.age),
      sex: p.sex || 'male',
      activity: p.activity || 'moderate',
    });
  }

  return { uuid, today, formatDate, formatDateTime, $, $$, showToast, setActive, getProfile, getWeightKg, getTodayWorkouts, getTodayNutrition, getTodayBurned, getTodayConsumed, getTodayTDEE };
})();

window.App = App;
