/* JDD Fitness — app shell, router, all views, Shortcuts ingestion. */
(function() {
  "use strict";

  const app = {
    route: "dashboard",
    currentDate: todayISO(),
    profile: Profile.load(),
    log: null,           // current day's log
    cache: {},           // working state per view
  };

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function toast(msg, kind) {
    let t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div"); t.id = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = "show " + (kind || "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.className = "", 2200);
  }

  /* ---------- Modal ---------- */
  function modal(html) {
    let bg = document.getElementById("modal-bg");
    if (!bg) {
      bg = document.createElement("div"); bg.id = "modal-bg"; bg.className = "modal-bg";
      bg.innerHTML = '<div class="modal"><div class="grip"></div><div id="modal-content"></div></div>';
      document.body.appendChild(bg);
      bg.addEventListener("click", (e) => { if (e.target === bg) bg.classList.remove("show"); });
    }
    document.getElementById("modal-content").innerHTML = html;
    bg.classList.add("show");
    return bg;
  }
  function closeModal() {
    const bg = document.getElementById("modal-bg");
    if (bg) bg.classList.remove("show");
  }

  /* ---------- Number helpers ---------- */
  const fmt = (n) => (n == null || isNaN(n)) ? "—" : Math.round(n).toLocaleString();
  const fmt1 = (n) => (n == null || isNaN(n)) ? "—" : n.toFixed(1);

  /* ---------- Load today's log ---------- */
  async function loadLog(date) {
    app.currentDate = date;
    app.log = await Store.getLog(date);
    return app.log;
  }
  async function saveLog() {
    await Store.saveLog(app.currentDate, app.log);
  }

  /* ---------- Date label ---------- */
  function updateDateLabel() {
    const el = document.getElementById("dateLabel");
    if (el) el.textContent = prettyDate(app.currentDate);
  }

  /* ---------- Router ---------- */
  function go(route) {
    app.route = route;
    document.querySelectorAll(".tab").forEach(t => {
      t.classList.toggle("active", t.dataset.route === route);
    });
    render();
  }

  async function render() {
    updateDateLabel();
    const view = document.getElementById("view");
    switch (app.route) {
      case "dashboard": view.innerHTML = viewDashboard(); afterDashboard(); break;
      case "workout":   view.innerHTML = viewWorkout();   afterWorkout();   break;
      case "food":      view.innerHTML = viewFood();      afterFood();      break;
      case "stats":     view.innerHTML = await viewStats(); afterStats();    break;
      case "settings":  view.innerHTML = viewSettings();  afterSettings();  break;
    }
    window.scrollTo(0, 0);
  }

  /* ============================================================
   * DASHBOARD
   * ============================================================ */
  function viewDashboard() {
    const p = app.profile;
    const target = Calories.target(p);
    const macros = Calories.macros(p, target);
    const foodTotals = Calories.sumFood(app.log.food || []);
    const burned = Calories.burnedTotal(app.log, p.weightKg);
    const remaining = (target + burned) - foodTotals.kcal;
    const eaten = foodTotals.kcal;
    const cap = Math.max(target + burned, eaten, 1);
    const pct = Math.min(100, Math.max(0, (eaten / cap) * 100));

    const C = 2 * Math.PI * 78;
    const ringOffset = C * (1 - Math.min(1, eaten / cap));

    const mP = Math.min(100, (foodTotals.p / macros.protein) * 100);
    const mC = Math.min(100, (foodTotals.c / macros.carbs) * 100);
    const mF = Math.min(100, (foodTotals.f / macros.fat) * 100);

    const health = app.log.health || {};
    const healthCount = Object.keys(health).length;

    return `
      <div class="hero">
        <div class="row" style="margin-bottom:4px">
          <div class="sec-h" style="margin:0">Calories</div>
          <button class="link" onclick="app.pickDate()">Change date</button>
        </div>
        <div class="ring-wrap">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="78" fill="none" stroke-width="12" class="ring-bg"/>
            <circle cx="90" cy="90" r="78" fill="none" stroke-width="12" class="ring-fg"
              stroke-dasharray="${C}" stroke-dashoffset="${ringOffset}"/>
          </svg>
          <div class="ring-center">
            <div class="big">${fmt(remaining)}</div>
            <div class="small">${remaining > 0 ? "kcal left" : "kcal over"}</div>
          </div>
        </div>
        <div class="hero-stats">
          <div class="hero-stat ok"><div class="v">${fmt(eaten)}</div><div class="l">eaten</div></div>
          <div class="hero-stat"><div class="v">${fmt(target)}</div><div class="l">goal</div></div>
          <div class="hero-stat ${burned>0?'ok':''}"><div class="v">${fmt(burned)}</div><div class="l">burned</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Macros</div>
        <div class="macros">
          <div class="macro p"><div class="v">${fmt(foodTotals.p)}/${macros.protein}g</div><div class="l">Protein</div><div class="pbar"><div style="width:${mP}%"></div></div></div>
          <div class="macro c"><div class="v">${fmt(foodTotals.c)}/${macros.carbs}g</div><div class="l">Carbs</div><div class="pbar"><div style="width:${mC}%"></div></div></div>
          <div class="macro f"><div class="v">${fmt(foodTotals.f)}/${macros.fat}g</div><div class="l">Fat</div><div class="pbar"><div style="width:${mF}%"></div></div></div>
        </div>
      </div>

      ${healthCount ? `
      <div class="banner">
        <div class="t">Health sync received</div>
        <div class="d">Steps ${fmt(health.steps||0)} · Distance ${fmt1(health.distanceKm||0)} km · ${fmt(health.caloriesBurned||0)} kcal · Sleep ${fmt1(health.sleepHours||0)} h</div>
      </div>` : ""}

      <div class="card">
        <div class="card-title">Today's log</div>
        ${ (app.log.food||[]).length ? listFoodToday() : `<div class="empty" style="padding:18px"><div class="t">No food logged yet.</div></div>` }
        ${ (app.log.workouts||[]).length ? listWorkoutsToday() : "" }
      </div>

      <div class="btn-row">
        <button class="btn ghost" onclick="app.go('food')">+ Add food</button>
        <button class="btn" onclick="app.go('workout')">+ Workout</button>
      </div>
      <div class="spacer"></div>
      <button class="btn ghost" onclick="app.openIngestModal()">Import from Apple Shortcuts</button>
    `;
  }

  function listFoodToday() {
    const items = (app.log.food||[]).slice().reverse();
    let h = items.map((f, idx) => {
      const i = (app.log.food||[]).length - 1 - idx;
      return `<li>
        <div>
          <div class="name">${f.n}</div>
          <div class="meta">${f.qty}${f.unit} · P${fmt(f.p)} C${fmt(f.c)} F${fmt(f.f)}</div>
        </div>
        <div class="flex">
          <span class="kcal">${fmt(f.kcal)}</span>
          <button class="link danger" onclick="app.deleteFood(${i})" style="margin-left:8px;font-size:18px">×</button>
        </div>
      </li>`;
    }).join("");
    return `<ul class="list">${h}</ul>`;
  }

  function listWorkoutsToday() {
    const ws = (app.log.workouts||[]).slice().reverse();
    let h = ws.map((w, idx) => {
      const i = (app.log.workouts||[]).length - 1 - idx;
      const sets = w.sets ? w.sets.length : 0;
      return `<li>
        <div>
          <div class="name">${w.name} <span class="muted" style="font-size:11px">${w.split||""}</span></div>
          <div class="meta">${w.duration||0} min · ${sets} sets · ${fmt(w.calories||0)} kcal</div>
        </div>
        <div class="flex">
          <button class="link" onclick="app.editWorkout(${i})">view</button>
          <button class="link danger" onclick="app.deleteWorkout(${i})" style="margin-left:8px;font-size:18px">×</button>
        </div>
      </li>`;
    }).join("");
    return `<div style="margin-top:10px"><div class="muted" style="font-size:12px;font-weight:600;margin-bottom:4px">WORKOUTS</div><ul class="list">${h}</ul></div>`;
  }

  function afterDashboard() {}

  /* ============================================================
   * WORKOUT VIEW — push/pull/legs + cardio + manual
   * ============================================================ */
  function viewWorkout() {
    return `
      <div class="sec-h">Workout</div>
      <div class="seg" id="wseg">
        <button data-split="push" class="active">Push</button>
        <button data-split="pull">Pull</button>
        <button data-split="legs">Legs</button>
        <button data-split="cardio">Cardio</button>
        <button data-split="manual">Manual</button>
      </div>
      <div id="wbody"></div>
    `;
  }
  function afterWorkout() {
    app.cache.wsplit = "push";
    document.querySelectorAll("#wseg button").forEach(b => {
      b.onclick = () => {
        app.cache.wsplit = b.dataset.split;
        document.querySelectorAll("#wseg button").forEach(x => x.classList.toggle("active", x === b));
        renderWorkoutBody();
      };
    });
    renderWorkoutBody();
  }
  function renderWorkoutBody() {
    const body = document.getElementById("wbody");
    const split = app.cache.wsplit;
    if (split === "manual") { body.innerHTML = manualWorkoutHTML(); return; }
    if (split === "cardio") { body.innerHTML = cardioHTML(); return; }
    body.innerHTML = exerciseListHTML(split);
  }
  function exerciseListHTML(split) {
    const list = window.EXERCISES[split] || [];
    let h = list.map((ex, i) => `
      <div class="ex-block tap" onclick="app.startExercise('${split}', ${i})">
        <div class="ex-head">
          <div><div class="name">${ex.n}</div><div class="tag">${ex.muscle} · ${ex.type}</div></div>
          <div class="muted" style="font-size:11px;text-align:right">${ex.sets}×${ex.reps}<br>${ex.rest}s rest</div>
        </div>
      </div>
    `).join("");
    h += `<button class="btn ghost" style="margin-top:8px" onclick="app.customExercise('${split}')">+ Custom exercise</button>`;
    return h;
  }
  function cardioHTML() {
    const list = window.EXERCISES.cardio || [];
    return `
      <div class="card">
        <div class="card-title">Cardio session</div>
        <label class="field"><span>Activity</span>
          <select id="cd-act">
            ${list.map((ex,i) => `<option value="${i}" data-met="${ex.met}">${ex.n}</option>`).join("")}
          </select>
        </label>
        <div class="input-row">
          <label class="field grow"><span>Duration (min)</span><input id="cd-dur" type="number" inputmode="decimal" placeholder="30"></label>
          <label class="field unit"><span>Distance (km)</span><input id="cd-dist" type="number" inputmode="decimal" placeholder="optional"></label>
        </div>
        <div class="hint" id="cd-hint"></div>
        <button class="btn" onclick="app.saveCardio()">Save cardio session</button>
      </div>
      <div class="card">
        <div class="card-title">Manual walk / run</div>
        <p class="muted" style="font-size:13px;margin:0 0 10px">Log steps or distance only — we estimate calories from your body weight and pace.</p>
        <div class="input-row">
          <label class="field grow"><span>Steps</span><input id="cd-steps" type="number" inputmode="numeric" placeholder="e.g. 8000"></label>
          <label class="field unit"><span>Distance (km)</span><input id="cd-mdist" type="number" inputmode="decimal" placeholder="optional"></label>
        </div>
        <label class="field"><span>Activity type</span>
          <select id="cd-mtype"><option value="walk">Walking (~5 km/h)</option><option value="run">Running (~9 km/h)</option></select>
        </label>
        <button class="btn ghost" onclick="app.saveManualWalkRun()">Save</button>
      </div>
    `;
  }
  function manualWorkoutHTML() {
    return `
      <div class="card">
        <div class="card-title">Manual workout</div>
        <label class="field"><span>Exercise name</span><input id="mw-name" placeholder="e.g. Calisthenics, Yoga, Climbing"></label>
        <div class="input-row">
          <label class="field grow"><span>Duration (min)</span><input id="mw-dur" type="number" inputmode="decimal"></label>
          <label class="field unit"><span>Calories burned</span><input id="mw-kcal" type="number" inputmode="numeric" placeholder="auto"></label>
        </div>
        <label class="field"><span>Notes</span><textarea id="mw-notes" rows="2" placeholder="optional"></textarea></label>
        <div class="hint">Leave calories blank to estimate using MET × body weight. Enter an estimated MET below.</div>
        <label class="field" style="margin-top:8px"><span>MET (1=rest, 6=moderate, 10+ vigorous)</span><input id="mw-met" type="number" inputmode="decimal" value="6" step="0.5"></label>
        <button class="btn" onclick="app.saveManualWorkout()">Save workout</button>
      </div>
    `;
  }

  /* Start exercise → modal with set logger */
  app.startExercise = function(split, idx) {
    const ex = window.EXERCISES[split][idx];
    let sets = JSON.parse(JSON.stringify(Array.from({length: ex.sets}, () => ({reps:"", weight:""}))));
    app.cache.wset = { ex, sets };

    let h = `<h3>${ex.n}</h3>
      <div class="muted" style="font-size:12px;margin-bottom:10px">${ex.muscle} · ${ex.type} · suggested ${ex.sets}×${ex.reps}</div>
      <div class="set-row" style="font-size:11px;color:var(--text-dim);font-weight:700">
        <div></div><div>Reps</div><div>Weight (kg)</div><div></div><div></div>
      </div>
      <div id="setlist"></div>
      <button class="btn ghost" style="margin:8px 0" onclick="app.addSetRow()">+ Add set</button>
      <label class="field"><span>Notes</span><textarea id="ex-notes" rows="2" placeholder="optional"></textarea></label>
      <div class="btn-row">
        <button class="btn ghost" onclick="app.closeModal()">Cancel</button>
        <button class="btn" onclick="app.saveExercise()">Save workout</button>
      </div>`;
    modal(h);
    renderSetRows();
  };
  function renderSetRows() {
    const c = app.cache.wset;
    if (!c) return;
    const el = document.getElementById("setlist");
    el.innerHTML = c.sets.map((s, i) => `
      <div class="set-row">
        <div class="set-n">${i+1}</div>
        <input type="number" inputmode="decimal" placeholder="${c.ex.reps}" value="${s.reps}" oninput="app.cache.wset.sets[${i}].reps=this.value">
        <input type="number" inputmode="decimal" placeholder="0" value="${s.weight}" oninput="app.cache.wset.sets[${i}].weight=this.value">
        <div class="set-n"></div>
        <button class="del-set" onclick="app.delSet(${i})">×</button>
      </div>
    `).join("");
  }
  app.addSetRow = function() {
    app.cache.wset.sets.push({reps:"", weight:""});
    renderSetRows();
  };
  app.delSet = function(i) {
    app.cache.wset.sets.splice(i, 1);
    renderSetRows();
  };
  app.saveExercise = async function() {
    const c = app.cache.wset;
    const sets = c.sets.filter(s => s.reps !== "" || s.weight !== "");
    // Estimate duration: ~45s working set + rest, rounded
    const perSet = (c.ex.rest || 60) + 30;
    const duration = Math.max(5, Math.round(sets.length * perSet / 60));
    const calories = Math.round(window.exCaloriesPerMin(c.ex.met, app.profile.weightKg) * duration);
    app.log.workouts = app.log.workouts || [];
    app.log.workouts.push({
      name: c.ex.n, split: app.cache.wsplit, muscle: c.ex.muscle,
      type: c.ex.type, met: c.ex.met,
      sets: sets.map(s => ({ reps: s.reps ? Number(s.reps) : null, weight: s.weight ? Number(s.weight) : null })),
      duration, calories,
      notes: (document.getElementById("ex-notes").value || "").trim(),
      ts: Date.now()
    });
    await saveLog();
    closeModal();
    toast(`Saved ${c.ex.n} · ${fmt(calories)} kcal`, "ok");
    render();
  };

  app.customExercise = function(split) {
    const ex = { n:"Custom", muscle:"", type:"compound", met:5, sets:3, reps:"8-12", rest:60 };
    app.cache.wset = { ex, sets: [{reps:"",weight:""}] };
    let h = `<h3>Custom exercise</h3>
      <label class="field"><span>Name</span><input id="cx-name" placeholder="e.g. Landmine Press"></label>
      <div class="input-row">
        <label class="field grow"><span>Muscle</span><input id="cx-muscle" placeholder="Chest"></label>
        <label class="field unit"><span>MET</span><input id="cx-met" type="number" inputmode="decimal" value="5" step="0.5"></label>
      </div>
      <div id="setlist"></div>
      <button class="btn ghost" style="margin:8px 0" onclick="app.addSetRow()">+ Add set</button>
      <label class="field"><span>Notes</span><textarea id="ex-notes" rows="2" placeholder="optional"></textarea></label>
      <div class="btn-row">
        <button class="btn ghost" onclick="app.closeModal()">Cancel</button>
        <button class="btn" onclick="app.saveCustomEx('${split}')">Save</button>
      </div>`;
    modal(h);
    renderSetRows();
  };
  app.saveCustomEx = async function(split) {
    const name = document.getElementById("cx-name").value.trim() || "Custom";
    const muscle = document.getElementById("cx-muscle").value.trim();
    const met = Number(document.getElementById("cx-met").value) || 5;
    const c = app.cache.wset;
    c.ex = { n:name, muscle, type:"compound", met, sets:c.sets.length, reps:"", rest:60 };
    const sets = c.sets.filter(s => s.reps !== "" || s.weight !== "");
    const perSet = 90;
    const duration = Math.max(5, Math.round(sets.length * perSet / 60));
    const calories = Math.round(window.exCaloriesPerMin(met, app.profile.weightKg) * duration);
    app.log.workouts = app.log.workouts || [];
    app.log.workouts.push({
      name, split, muscle, type:"compound", met,
      sets: sets.map(s => ({ reps: s.reps ? Number(s.reps) : null, weight: s.weight ? Number(s.weight) : null })),
      duration, calories,
      notes: (document.getElementById("ex-notes").value || "").trim(),
      ts: Date.now()
    });
    await saveLog();
    closeModal();
    toast("Saved "+name, "ok");
    render();
  };

  app.saveCardio = async function() {
    const sel = document.getElementById("cd-act");
    const i = Number(sel.value);
    const ex = window.EXERCISES.cardio[i];
    const dur = Number(document.getElementById("cd-dur").value) || 0;
    const dist = Number(document.getElementById("cd-dist").value) || null;
    if (!dur) { toast("Enter a duration", "err"); return; }
    const calories = Math.round(window.exCaloriesPerMin(ex.met, app.profile.weightKg) * dur);
    app.log.workouts = app.log.workouts || [];
    app.log.workouts.push({
      name: ex.n, split:"cardio", type:"cardio", met:ex.met,
      duration:dur, distanceKm:dist, calories, sets:[], ts: Date.now()
    });
    await saveLog();
    toast(`Saved · ${fmt(calories)} kcal`, "ok");
    document.getElementById("cd-dur").value = "";
    document.getElementById("cd-dist").value = "";
    render();
  };
  app.saveManualWalkRun = async function() {
    const steps = Number(document.getElementById("cd-steps").value) || 0;
    const dist = Number(document.getElementById("cd-mdist").value) || 0;
    const type = document.getElementById("cd-mtype").value;
    if (!steps && !dist) { toast("Enter steps or distance", "err"); return; }
    // ~0.7m stride → steps*0.0007 km
    const km = dist || steps * 0.0007;
    const pace = type === "run" ? 9.5 : 3.5; // MET
    const speed = type === "run" ? 9 : 5;    // km/h
    const dur = Math.max(1, Math.round((km / speed) * 60));
    const calories = Math.round(window.exCaloriesPerMin(pace, app.profile.weightKg) * dur);
    app.log.workouts = app.log.workouts || [];
    app.log.workouts.push({
      name: type === "run" ? "Running" : "Walking", split:"cardio", type:"cardio", met:pace,
      duration:dur, distanceKm:km, steps, calories, sets:[], ts: Date.now()
    });
    await saveLog();
    toast(`Saved · ${fmt(calories)} kcal · ${fmt1(km)} km`, "ok");
    document.getElementById("cd-steps").value = "";
    document.getElementById("cd-mdist").value = "";
    render();
  };
  app.saveManualWorkout = async function() {
    const name = document.getElementById("mw-name").value.trim() || "Workout";
    const dur = Number(document.getElementById("mw-dur").value) || 0;
    const met = Number(document.getElementById("mw-met").value) || 6;
    const notes = document.getElementById("mw-notes").value.trim();
    let kcal = Number(document.getElementById("mw-kcal").value) || 0;
    if (!dur) { toast("Enter duration", "err"); return; }
    if (!kcal) kcal = Math.round(window.exCaloriesPerMin(met, app.profile.weightKg) * dur);
    app.log.workouts = app.log.workouts || [];
    app.log.workouts.push({
      name, split:"manual", type:"manual", met, duration:dur, calories:kcal, notes, sets:[], ts: Date.now()
    });
    await saveLog();
    toast("Saved "+name, "ok");
    render();
  };

  app.editWorkout = function(i) {
    const w = app.log.workouts[i];
    let setsHTML = (w.sets||[]).length ? `<div class="card"><div class="card-title">Sets</div>
      <div class="set-row" style="font-size:11px;color:var(--text-dim);font-weight:700"><div></div><div>Reps</div><div>Weight</div><div></div><div></div></div>
      ${w.sets.map((s, idx) => `<div class="set-row"><div class="set-n">${idx+1}</div><input value="${s.reps||''}" readonly><input value="${s.weight||''}" readonly><div></div><div></div></div>`).join("")}
    </div>` : "";
    let h = `<h3>${w.name}</h3>
      <div class="muted" style="font-size:12px;margin-bottom:10px">${w.split||""} · ${w.muscle||w.type||""} · ${w.duration||0} min · ${fmt(w.calories||0)} kcal</div>
      ${setsHTML}
      ${w.notes ? `<div class="card"><div class="card-title">Notes</div><div>${w.notes}</div></div>` : ""}
      ${w.distanceKm ? `<div class="card"><div class="card-row"><span>Distance</span><span>${fmt1(w.distanceKm)} km</span></div>${w.steps?`<div class="card-row"><span>Steps</span><span>${fmt(w.steps)}</span></div>`:""}</div>`:""}
      <button class="btn danger" onclick="app.deleteWorkout(${i})">Delete workout</button>
      <button class="btn ghost" style="margin-top:8px" onclick="app.closeModal()">Close</button>`;
    modal(h);
  };
  app.deleteWorkout = async function(i) {
    app.log.workouts.splice(i, 1);
    await saveLog();
    closeModal();
    toast("Deleted", "ok");
    render();
  };

  /* ============================================================
   * FOOD VIEW
   * ============================================================ */
  function viewFood() {
    return `
      <div class="sec-h">Food</div>
      <div class="search">
        <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5 1.49-1.49-5-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.49 4.49 0 0 1 9.5 14z"/></svg>
        <input id="fsearch" placeholder="Search food…" oninput="app.filterFood()">
      </div>
      <div class="chips" id="fchips"></div>
      <div id="flist"></div>
      <div class="spacer"></div>
      <button class="btn ghost" onclick="app.addCustomFood()">+ Add custom food</button>
    `;
  }
  function afterFood() {
    app.cache.fcat = null;
    renderChips();
    app.filterFood();
  }
  function renderChips() {
    const el = document.getElementById("fchips");
    let h = `<button class="chip ${app.cache.fcat===null?'active':''}" onclick="app.setCat(null)">All</button>`;
    h += window.FOOD_CATEGORIES.map(c => `<button class="chip ${app.cache.fcat===c?'active':''}" onclick="app.setCat('${c}')">${c}</button>`).join("");
    el.innerHTML = h;
  }
  app.setCat = function(c) {
    app.cache.fcat = c;
    renderChips();
    app.filterFood();
  };
  app.filterFood = function() {
    const q = (document.getElementById("fsearch").value || "").toLowerCase().trim();
    const cat = app.cache.fcat;
    let list = window.FOODS;
    if (cat) list = list.filter(f => f.cat === cat);
    if (q) list = list.filter(f => f.n.toLowerCase().includes(q));
    const el = document.getElementById("flist");
    if (!list.length) { el.innerHTML = `<div class="empty"><div class="t">No results.</div></div>`; return; }
    const shown = list.slice(0, 60);
    const more = list.length - shown.length;
    el.innerHTML = `<ul class="list">${shown.map((f) => {
      const gi = window.FOODS.indexOf(f);
      return `<li class="tap" onclick="app.addFood(${gi})">
        <div><div class="name">${f.n}</div><div class="meta">${f.cat} · ${f.unit} · P${f.p} C${f.c} F${f.f}</div></div>
        <div class="kcal">${f.kcal} kcal</div>
      </li>`;
    }).join("")}</ul>${more>0 ? `<div class="center" style="padding:12px;color:var(--text-dim);font-size:12px">Showing 60 of ${list.length}. Refine your search or pick a category.</div>` : ""}`;
  };
  app.addFood = function(gi) {
    const f = window.FOODS[gi];
    app.cache.fadd = { gi, qty: 1, unit: f.unit };
    let h = `<h3>${f.n}</h3>
      <div class="muted" style="font-size:12px;margin-bottom:12px">${f.cat} · per ${f.unit}: ${f.kcal} kcal · P${f.p} C${f.c} F${f.f}g</div>
      <label class="field"><span>Quantity</span>
        <input id="af-qty" type="number" inputmode="decimal" value="1" step="0.5" min="0.1">
      </label>
      <label class="field"><span>Unit</span>
        <input id="af-unit" value="${f.unit}">
      </label>
      <div class="card" style="background:var(--bg-2)">
        <div class="card-row"><span>Calories</span><span id="af-kcal">${f.kcal}</span></div>
        <div class="card-row"><span>Protein</span><span id="af-p">${f.p}g</span></div>
        <div class="card-row"><span>Carbs</span><span id="af-c">${f.c}g</span></div>
        <div class="card-row"><span>Fat</span><span id="af-f">${f.f}g</span></div>
      </div>
      <div class="btn-row">
        <button class="btn ghost" onclick="app.closeModal()">Cancel</button>
        <button class="btn" onclick="app.saveFood()">Add</button>
      </div>`;
    modal(h);
    const upd = () => {
      const q = Math.max(0.1, Number(document.getElementById("af-qty").value) || 1);
      document.getElementById("af-kcal").textContent = fmt(f.kcal * q);
      document.getElementById("af-p").textContent = fmt1(f.p * q) + "g";
      document.getElementById("af-c").textContent = fmt1(f.c * q) + "g";
      document.getElementById("af-f").textContent = fmt1(f.f * q) + "g";
    };
    document.getElementById("af-qty").oninput = upd;
    document.getElementById("af-unit").oninput = () => app.cache.fadd.unit = document.getElementById("af-unit").value;
  };
  app.saveFood = async function() {
    const gi = app.cache.fadd.gi;
    const f = window.FOODS[gi];
    const qty = Math.max(0.1, Number(document.getElementById("af-qty").value) || 1);
    const unit = document.getElementById("af-unit").value || f.unit;
    app.log.food = app.log.food || [];
    app.log.food.push({
      n: f.n, qty, unit, ref: gi,
      kcal: f.kcal * qty, p: f.p * qty, c: f.c * qty, f: f.f * qty, ts: Date.now()
    });
    await saveLog();
    closeModal();
    toast(`Added ${f.n} · ${fmt(f.kcal*qty)} kcal`, "ok");
    render();
  };
  app.addCustomFood = function() {
    let h = `<h3>Custom food</h3>
      <label class="field"><span>Name</span><input id="cf-name" placeholder="e.g. Mom's lasagna"></label>
      <div class="input-row">
        <label class="field grow"><span>Quantity</span><input id="cf-qty" type="number" inputmode="decimal" value="1" step="0.5"></label>
        <label class="field unit"><span>Unit</span><input id="cf-unit" value="serving"></label>
      </div>
      <div class="input-row">
        <label class="field grow"><span>Calories</span><input id="cf-kcal" type="number" inputmode="numeric"></label>
        <label class="field"><span>Protein (g)</span><input id="cf-p" type="number" inputmode="decimal"></label>
      </div>
      <div class="input-row">
        <label class="field"><span>Carbs (g)</span><input id="cf-c" type="number" inputmode="decimal"></label>
        <label class="field"><span>Fat (g)</span><input id="cf-f" type="number" inputmode="decimal"></label>
      </div>
      <div class="btn-row">
        <button class="btn ghost" onclick="app.closeModal()">Cancel</button>
        <button class="btn" onclick="app.saveCustomFood()">Add</button>
      </div>`;
    modal(h);
  };
  app.saveCustomFood = async function() {
    const n = document.getElementById("cf-name").value.trim() || "Custom food";
    const qty = Math.max(0.1, Number(document.getElementById("cf-qty").value) || 1);
    const unit = document.getElementById("cf-unit").value.trim() || "serving";
    const kcal = Number(document.getElementById("cf-kcal").value) || 0;
    if (!kcal) { toast("Enter calories", "err"); return; }
    const p = Number(document.getElementById("cf-p").value) || 0;
    const c = Number(document.getElementById("cf-c").value) || 0;
    const f = Number(document.getElementById("cf-f").value) || 0;
    app.log.food = app.log.food || [];
    app.log.food.push({ n, qty, unit, kcal, p, c, f, custom:true, ts: Date.now() });
    await saveLog();
    closeModal();
    toast("Added "+n, "ok");
    render();
  };
  app.deleteFood = async function(i) {
    app.log.food.splice(i, 1);
    await saveLog();
    render();
  };

  /* ============================================================
   * STATS VIEW
   * ============================================================ */
  async function viewStats() {
    const all = await Store.allLogs();
    const days = lastN(7, all);
    const p = app.profile;
    const target = Calories.target(p);

    const series = days.map(d => {
      const l = all.find(x => x.date === d) || { food:[], workouts:[] };
      const eaten = Calories.sumFood(l.food||[]).kcal;
      const burned = Calories.burnedTotal(l, p.weightKg);
      return { date:d, eaten:Math.round(eaten), burned:Math.round(burned) };
    });

    const totalEaten = series.reduce((a,s)=>a+s.eaten,0);
    const totalBurned = series.reduce((a,s)=>a+s.burned,0);
    const avgEaten = series.length ? Math.round(totalEaten/series.length) : 0;
    const avgBurned = series.length ? Math.round(totalBurned/series.length) : 0;
    const avgDelta = avgEaten - (target - avgBurned);

    const maxV = Math.max(target+200, ...series.map(s=>s.eaten), 100);
    const chart = barChartHTML(series, target, maxV);

    const wks = lastN(30, all);
    const wkData = wks.map(d => {
      const l = all.find(x => x.date === d) || { food:[], workouts:[] };
      const eaten = Calories.sumFood(l.food||[]).kcal;
      const burned = Calories.burnedTotal(l, p.weightKg);
      return { date:d, net: Math.round(eaten - target + burned) };
    });
    const totalWorkouts = all.reduce((a,l)=>a+(l.workouts||[]).length,0);
    const totalFoodEntries = all.reduce((a,l)=>a+(l.food||[]).length,0);

    return `
      <div class="sec-h">Stats</div>
      <div class="card">
        <div class="card-title">Last 7 days</div>
        ${chart}
        <div class="hint" style="margin-top:8px">Bars = kcal eaten. Dashed line = daily goal (${fmt(target)} kcal, +burned).</div>
      </div>
      <div class="stat-grid">
        <div class="stat-card"><div class="v">${fmt(avgEaten)}</div><div class="l">avg eaten / day</div></div>
        <div class="stat-card"><div class="v">${fmt(avgBurned)}</div><div class="l">avg burned / day</div></div>
        <div class="stat-card"><div class="v">${fmt(totalWorkouts)}</div><div class="l">workouts (all time)</div></div>
        <div class="stat-card"><div class="v">${fmt(totalFoodEntries)}</div><div class="l">food entries (all time)</div></div>
      </div>
      <div class="spacer"></div>
      <div class="card">
        <div class="card-title">Net vs goal (30 days)</div>
        ${lineChartHTML(wkData)}
        <div class="hint">Net = eaten − goal + burned. Positive (red) = surplus. Negative (green) = deficit.</div>
      </div>
      <div class="card">
        <div class="card-title">BMR & TDEE</div>
        <div class="card-row"><span>BMR (Mifflin-St Jeor)</span><span>${fmt(Calories.bmr(p))} kcal</span></div>
        <div class="card-row"><span>TDEE (activity ×${p.activity})</span><span>${fmt(Calories.tdee(p))} kcal</span></div>
        <div class="card-row"><span>Goal target (${p.goal})</span><span>${fmt(target)} kcal</span></div>
      </div>
      <button class="btn ghost" onclick="app.exportData()">Export all data (JSON)</button>
      <button class="btn danger" style="margin-top:8px" onclick="app.confirmReset()">Reset all data</button>
    `;
  }
  function lastN(n, all) {
    const out = [];
    for (let i = n-1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      out.push(isoFrom(d));
    }
    return out;
  }
  function barChartHTML(series, target, maxV) {
    const w = 320, h = 150, pad = 26;
    const barW = (w - pad*2) / series.length * 0.6;
    const gap = (w - pad*2) / series.length;
    const yT = h - pad - (target / maxV) * (h - pad*2);
    let bars = series.map((s, i) => {
      const x = pad + i*gap + (gap-barW)/2;
      const bh = (s.eaten / maxV) * (h - pad*2);
      const y = h - pad - bh;
      return `<rect x="${x}" y="${y}" width="${barW}" height="${bh}" rx="3" fill="#6ee7ff" opacity="0.9"/>
              <text x="${x+barW/2}" y="${h-pad+12}" text-anchor="middle" font-size="9" fill="#9a9aae">${dayName(s.date)[0]}</text>`;
    }).join("");
    return `<svg viewBox="0 0 ${w} ${h}" class="chart">
      <line x1="${pad}" y1="${yT}" x2="${w-pad}" y2="${yT}" stroke="#b388ff" stroke-dasharray="4 3" stroke-width="1.5"/>
      ${bars}
    </svg>`;
  }
  function lineChartHTML(data) {
    const w = 320, h = 130, pad = 22;
    const vals = data.map(d => d.net);
    const maxV = Math.max(...vals, 0);
    const minV = Math.min(...vals, 0);
    const range = Math.max(1, maxV - minV);
    const stepX = (w - pad*2) / Math.max(1, data.length - 1);
    const y0 = h - pad - ((0 - minV) / range) * (h - pad*2);
    const pts = data.map((d, i) => {
      const x = pad + i*stepX;
      const y = h - pad - ((d.net - minV) / range) * (h - pad*2);
      return `${x},${y}`;
    }).join(" ");
    const labels = data.filter((_,i)=>i%5===0).map((d, idx) => {
      const x = pad + idx*5*stepX;
      return `<text x="${x}" y="${h-pad+12}" font-size="9" fill="#9a9aae" text-anchor="middle">${d.date.slice(5)}</text>`;
    }).join("");
    return `<svg viewBox="0 0 ${w} ${h}" class="chart">
      <line x1="${pad}" y1="${y0}" x2="${w-pad}" y2="${y0}" stroke="#2a2a38"/>
      <polyline points="${pts}" fill="none" stroke="#6ee7ff" stroke-width="2"/>
      ${labels}
    </svg>`;
  }
  function afterStats() {}

  app.exportData = async function() {
    const all = await Store.allLogs();
    const blob = new Blob([JSON.stringify({ profile: app.profile, logs: all }, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `jdd-fitness-export-${todayISO()}.json`;
    a.click();
    toast("Exported", "ok");
  };
  app.confirmReset = function() {
    let h = `<h3>Reset all data?</h3>
      <p class="muted" style="font-size:14px">This will delete all logs and reset your profile. This cannot be undone.</p>
      <div class="btn-row" style="margin-top:12px">
        <button class="btn ghost" onclick="app.closeModal()">Cancel</button>
        <button class="btn danger" onclick="app.resetAll()">Delete everything</button>
      </div>`;
    modal(h);
  };
  app.resetAll = async function() {
    const db = await dbOpen();
    await new Promise((res) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
      tx.oncomplete = res;
    });
    localStorage.removeItem("jdd.profile");
    app.profile = Profile.load();
    await loadLog(todayISO());
    closeModal();
    toast("All data reset", "ok");
    render();
  };

  /* ============================================================
   * SETTINGS VIEW
   * ============================================================ */
  function viewSettings() {
    const p = app.profile;
    return `
      <div class="sec-h">Profile</div>
      <div class="card">
        <label class="field"><span>Name</span><input id="p-name" value="${p.name}" placeholder="optional"></label>
        <label class="field"><span>Sex (BMR formula)</span>
          <select id="p-sex">
            <option value="male" ${p.sex==='male'?'selected':''}>Male</option>
            <option value="female" ${p.sex==='female'?'selected':''}>Female</option>
          </select>
        </label>
        <div class="input-row">
          <label class="field grow"><span>Age</span><input id="p-age" type="number" inputmode="numeric" value="${p.age}"></label>
          <label class="field grow"><span>Height (cm)</span><input id="p-h" type="number" inputmode="numeric" value="${p.heightCm}"></label>
          <label class="field grow"><span>Weight (kg)</span><input id="p-w" type="number" inputmode="decimal" value="${p.weightKg}"></label>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Goal</div>
        <label class="field"><span>Goal</span>
          <select id="p-goal">
            <option value="lose" ${p.goal==='lose'?'selected':''}>Lose fat (deficit)</option>
            <option value="maintain" ${p.goal==='maintain'?'selected':''}>Maintain</option>
            <option value="gain" ${p.goal==='gain'?'selected':''}>Gain muscle (surplus)</option>
          </select>
        </label>
        <div class="input-row" id="goal-extra">
          ${p.goal==='lose'
            ? `<label class="field grow"><span>Deficit %</span><input id="p-def" type="number" inputmode="numeric" value="${p.deficitPct}"></label>`
            : p.goal==='gain'
            ? `<label class="field grow"><span>Surplus %</span><input id="p-surp" type="number" inputmode="numeric" value="${p.surplusPct}"></label>`
            : `<div class="hint">No surplus or deficit — eat at maintenance.</div>`}
        </div>
      </div>

      <div class="card">
        <div class="card-title">Activity</div>
        <label class="field"><span>Activity level</span>
          <select id="p-act">
            <option value="1.2" ${p.activity==1.2?'selected':''}>Sedentary (little/no exercise)</option>
            <option value="1.375" ${p.activity==1.375?'selected':''}>Light (1-3 days/wk)</option>
            <option value="1.55" ${p.activity==1.55?'selected':''}>Moderate (3-5 days/wk)</option>
            <option value="1.725" ${p.activity==1.725?'selected':''}>Active (6-7 days/wk)</option>
            <option value="1.9" ${p.activity==1.9?'selected':''}>Very active (hard daily)</option>
          </select>
        </label>
      </div>

      <div class="card">
        <div class="card-title">Macro targets</div>
        <div class="input-row">
          <label class="field grow"><span>Protein (g/kg)</span><input id="p-prot" type="number" inputmode="decimal" step="0.1" value="${p.proteinPerKg}"></label>
          <label class="field grow"><span>Fat % of kcal</span><input id="p-fat" type="number" inputmode="numeric" value="${p.fatPct}"></label>
        </div>
        <div class="hint">Carbs fill the remaining calories. Defaults: 1.8 g/kg protein, 25% fat.</div>
      </div>

      <button class="btn" onclick="app.saveProfile()">Save profile</button>

      <div class="spacer"></div>
      <div class="card">
        <div class="card-title">Apple Shortcuts integration</div>
        <p class="muted" style="font-size:13px;margin:0 0 8px">Your app can receive Health data from an Apple Shortcut via a URL like:</p>
        <code style="display:block;font-size:11px;word-break:break-all;background:var(--bg-2);padding:8px;border-radius:8px;border:1px solid var(--border)">${location.origin}${location.pathname}?steps=8500&calories=420&distanceKm=6.2&sleepHours=7.5&date=${todayISO()}</code>
        <p class="muted" style="font-size:12px;margin-top:8px">Open <b>Settings → Shortcuts guide</b> in the menu below for the full step-by-step.</p>
        <button class="btn ghost" onclick="app.openShortcutsGuide()">Read full Shortcuts guide</button>
        <button class="btn ghost" style="margin-top:8px" onclick="app.testIngest()">Test URL ingestion now</button>
      </div>

      <div class="card">
        <div class="card-title">Data</div>
        <div class="card-row"><span>Workouts (all time)</span><span id="st-w">—</span></div>
        <div class="card-row"><span>Food entries (all time)</span><span id="st-f">—</span></div>
        <div class="card-row"><span>Last sync</span><span id="st-sync">${app.profile.lastSync ? new Date(app.profile.lastSync).toLocaleString() : "never"}</span></div>
      </div>

      <p class="muted center" style="font-size:11px;margin-top:8px">JDD Fitness v1.0 · data stored locally on device</p>
    `;
  }
  function afterSettings() {
    document.getElementById("p-goal").onchange = function() {
      const v = this.value;
      const ex = document.getElementById("goal-extra");
      const p = app.profile;
      ex.innerHTML = v==='lose'
        ? `<label class="field grow"><span>Deficit %</span><input id="p-def" type="number" inputmode="numeric" value="${p.deficitPct}"></label>`
        : v==='gain'
        ? `<label class="field grow"><span>Surplus %</span><input id="p-surp" type="number" inputmode="numeric" value="${p.surplusPct}"></label>`
        : `<div class="hint">No surplus or deficit — eat at maintenance.</div>`;
    };
    Store.allLogs().then(all => {
      const w = all.reduce((a,l)=>a+(l.workouts||[]).length,0);
      const f = all.reduce((a,l)=>a+(l.food||[]).length,0);
      document.getElementById("st-w").textContent = w;
      document.getElementById("st-f").textContent = f;
    });
  }
  app.saveProfile = function() {
    const p = app.profile;
    p.name = document.getElementById("p-name").value.trim();
    p.sex = document.getElementById("p-sex").value;
    p.age = Math.max(10, Number(document.getElementById("p-age").value) || 30);
    p.heightCm = Math.max(100, Number(document.getElementById("p-h").value) || 175);
    p.weightKg = Math.max(30, Number(document.getElementById("p-w").value) || 75);
    p.goal = document.getElementById("p-goal").value;
    if (p.goal === "lose") p.deficitPct = clampPct(Number(document.getElementById("p-def").value));
    if (p.goal === "gain") p.surplusPct = clampPct(Number(document.getElementById("p-surp").value));
    p.activity = Number(document.getElementById("p-act").value);
    p.proteinPerKg = Math.max(0.5, Number(document.getElementById("p-prot").value) || 1.8);
    p.fatPct = clampPct(Number(document.getElementById("p-fat").value));
    Profile.save(p);
    app.profile = p;
    toast("Profile saved", "ok");
    render();
  };
  function clampPct(n) { n = Number(n) || 0; return Math.max(0, Math.min(50, n)); }

  app.openShortcutsGuide = function() {
    modal(SHORTCUTS_GUIDE_HTML());
  };
  app.openIngestModal = function() {
    let h = `<h3>Import from Apple Shortcuts</h3>
      <p class="muted" style="font-size:13px">If you opened this app from a Shortcut that passed health data in the URL, it was applied automatically. You can also paste a URL below to import manually.</p>
      <label class="field"><span>Shortcuts URL</span>
        <textarea id="ing-url" rows="3" placeholder="https://your-site.../?steps=8500&calories=420&distanceKm=6.2"></textarea>
      </label>
      <div class="btn-row">
        <button class="btn ghost" onclick="app.closeModal()">Cancel</button>
        <button class="btn" onclick="app.applyIngestUrl()">Import</button>
      </div>`;
    modal(h);
  };
  app.applyIngestUrl = async function() {
    const url = document.getElementById("ing-url").value.trim();
    if (!url) { toast("Paste a URL", "err"); return; }
    const ok = await ingestFromURL(url);
    if (ok) { closeModal(); toast("Imported", "ok"); render(); }
    else toast("No data found in URL", "err");
  };
  app.testIngest = async function() {
    const url = `${location.origin}${location.pathname}?steps=8500&calories=420&distanceKm=6.2&sleepHours=7.5&date=${todayISO()}&source=test`;
    const ok = await ingestFromURL(url);
    if (ok) { toast("Test data imported", "ok"); render(); }
  };

  /* ============================================================
   * SHORTCUTS INGESTION
   * URL params: steps, calories, caloriesBurned, distanceKm, sleepHours,
   *   weightKg, date (YYYY-MM-DD), workouts (JSON array)
   * ============================================================ */
  async function ingestFromURL(urlStr) {
    let u;
    try { u = new URL(urlStr); } catch { return false; }
    const q = u.searchParams;
    const date = q.get("date") || todayISO();
    if (date !== app.currentDate) await loadLog(date);

    const health = app.log.health || {};
    let changed = false;
    const steps = q.get("steps");          if (steps != null) { health.steps = Number(steps); changed = true; }
    const cal = q.get("calories") || q.get("caloriesBurned"); if (cal != null) { health.caloriesBurned = Number(cal); changed = true; }
    const dist = q.get("distanceKm") || q.get("distance");  if (dist != null) { health.distanceKm = Number(dist); changed = true; }
    const sleep = q.get("sleepHours") || q.get("sleep");    if (sleep != null) { health.sleepHours = Number(sleep); changed = true; }
    const wkg = q.get("weightKg");        if (wkg != null) { app.profile.weightKg = Number(wkg); Profile.save(app.profile); changed = true; }
    const wk = q.get("workouts");
    if (wk) {
      try {
        const arr = JSON.parse(decodeURIComponent(wk));
        if (Array.isArray(arr) && arr.length) {
          app.log.workouts = app.log.workouts || [];
          arr.forEach(w => app.log.workouts.push(Object.assign({ ts: Date.now(), split:"shortcuts", sets:[] }, w)));
          changed = true;
        }
      } catch {}
    }
    if (changed) {
      health.lastSync = Date.now();
      app.log.health = health;
      app.profile.lastSync = Date.now();
      Profile.save(app.profile);
      await saveLog();
      if (date !== app.currentDate) await loadLog(app.currentDate);
    }
    return changed;
  }

  /* ============================================================
   * DATE PICKER
   * ============================================================ */
  app.pickDate = function() {
    const today = todayISO();
    let days = [];
    for (let i = 0; i <= 13; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(isoFrom(d));
    }
    let h = `<h3>Choose day</h3>
      <div class="day-pills">${days.map(d => `
        <div class="day-pill ${d===app.currentDate?'active':''} ${d===today?'today':''}" onclick="app.setDate('${d}')">
          <div class="d">${dayName(d)}</div><div class="n">${Number(d.split('-')[2])}</div>
        </div>`).join("")}</div>
      <button class="btn ghost" onclick="app.closeModal()">Close</button>`;
    modal(h);
  };
  app.setDate = async function(d) {
    await loadLog(d);
    closeModal();
    render();
  };

  /* expose */
  app.go = go;
  app.closeModal = closeModal;
  app.toast = toast;
  app.loadLog = loadLog;
  app.saveLog = saveLog;
  app.render = render;
  window.app = app;

  /* ---------- SHORTCUTS GUIDE (inline) ---------- */
  const SHORTCUTS_GUIDE_HTML = () => `<h3>Apple Shortcuts — full setup</h3>
    <div style="font-size:13px;line-height:1.6">
      <p><b>What this does:</b> Apple's Shortcuts app reads your Health data (steps, calories, distance, sleep) and opens this web app with that data in the URL. The app reads the URL and adds it to your log for today. It's 100% free, no app-store account needed.</p>

      <p><b>Step 1 — Open your hosted URL.</b> After deploying on GitHub Pages, your URL is <code>https://&lt;your-username&gt;.github.io/JDD/</code>. Add it to your iPhone home screen (Safari → Share → Add to Home Screen) so it behaves like an app.</p>

      <p><b>Step 2 — Create the Shortcut.</b> Open the <b>Shortcuts</b> app → tap <b>+</b> in the top-right to make a new shortcut.</p>

      <p><b>Step 3 — Add these action blocks</b> (tap <i>+ Add Action</i>, search the name):</p>
      <ol style="padding-left:18px;margin:8px 0">
        <li><b>Find Health Samples</b> → Type = <i>Steps</i>, and tap the + inside the block to limit to "Today".</li>
        <li><b>Get Statistics</b> → choose <i>Sum</i>, input = the steps from above. (This gives total steps today.)</li>
        <li>Repeat for <b>Find Health Samples</b> → <i>Active Energy</i> → Sum. (This is your active calories burned.)</li>
        <li>Repeat for <b>Find Health Samples</b> → <i>Walking + Running Distance</i> → Sum.</li>
        <li>Repeat for <b>Find Health Samples</b> → <i>Sleep Analysis</i> → Sum of <i>Minutes Asleep</i>. Divide by 60 for hours.</li>
      </ol>

      <p><b>Step 4 — Build the URL.</b> Add a <b>Text</b> action and type your site base, then add variables. Easiest: use a <b>URL</b> action with query parameters.</p>
      <p>Add a <b>URL</b> action, set the base to your site, then tap it and use "Add variable" / "Query Parameter" for each. The final URL should look like:</p>
      <pre style="white-space:pre-wrap;word-break:break-all;background:var(--bg-2);padding:10px;border-radius:8px;border:1px solid var(--border);font-size:11px">https://your-username.github.io/JDD/?steps=[Steps]&calories=[ActiveEnergy]&distanceKm=[Distance]&sleepHours=[Sleep/60]</pre>

      <p><b>Step 5 — Open the URL.</b> Add action <b>Open URLs</b> and pass the URL from step 4. The web app will open and silently ingest the data; you'll see a "Health sync received" banner on Home.</p>

      <p><b>Step 6 — Automate it.</b> In the Shortcuts app, go to <b>Automation</b> tab → <b>+</b> → choose a trigger:
      <i>Time of Day</i> (e.g. 10pm), or <i>Arrive</i> at home, or <i>After</i> a workout completes. Set it to <b>Run immediately</b> and pick your shortcut. Done.</p>

      <p><b>Optional — send workouts too.</b> If you want to push a structured workout, add a <b>Text</b> action containing JSON and URL-encode it as the <code>workouts</code> parameter. Example: <code>{"name":"Run","duration":30,"calories":320}</code>. The app stores it under today's workouts.</p>

      <p><b>Troubleshooting.</b> First time, iOS will ask permission to read Health data — tap <b>Allow</b>. If the URL doesn't open, make sure your site is live and you used the right username. The <i>Test URL ingestion</i> button in Settings sends a sample payload to confirm it works.</p>

      <p><b>Parameters the app understands:</b> <code>steps, calories / caloriesBurned, distanceKm / distance, sleepHours / sleep, weightKg, date (YYYY-MM-DD), workouts (URL-encoded JSON array)</code>.</p>

      <button class="btn ghost" style="margin-top:8px" onclick="app.closeModal()">Close</button>
    </div>`;

  /* ---------- Boot ---------- */
  (async function init() {
    /* Auto-ingest any URL params on first load (e.g. opened from a Shortcut) */
    const hadParams = location.search && /[?&](steps|calories|distanceKm|distance|sleepHours|sleep|workouts|weightKg)=/.test(location.search);
    if (hadParams) {
      await loadLog(todayISO());
      await ingestFromURL(location.href);
      /* Clean the URL so refresh doesn't re-apply */
      history.replaceState({}, "", location.pathname);
      toast("Health data imported", "ok");
    } else {
      await loadLog(todayISO());
    }
    document.querySelectorAll(".tab").forEach(t => {
      t.addEventListener("click", () => go(t.dataset.route));
    });
    go("dashboard");
  })();

})();
