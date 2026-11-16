/* JDD Fitness — calorie & macro math.
 * Mifflin-St Jeor BMR; TDEE = BMR * activity; goal target applies deficit/surplus.
 * Protein g/kg, fat % of kcal, carbs = remainder. */

const Calories = {
  bmr(p) {
    const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
    return p.sex === "female" ? base - 161 : base + 5;
  },
  tdee(p) {
    return this.bmr(p) * p.activity;
  },
  target(p) {
    const t = this.tdee(p);
    if (p.goal === "lose")  return Math.round(t * (1 - p.deficitPct/100));
    if (p.goal === "gain")  return Math.round(t * (1 + p.surplusPct/100));
    return Math.round(t);
  },
  macros(p, targetKcal) {
    const protein = Math.round(p.weightKg * p.proteinPerKg);
    const fat = Math.round(targetKcal * p.fatPct/100 / 9);
    const proteinKcal = protein * 4;
    const fatKcal = fat * 9;
    const carbs = Math.max(0, Math.round((targetKcal - proteinKcal - fatKcal) / 4));
    return { protein, carbs, fat, targetKcal };
  },
  /* Sum food entries [{kcal,p,c,f}] → totals */
  sumFood(entries) {
    return entries.reduce((a, e) => ({
      kcal: a.kcal + (e.kcal||0),
      p: a.p + (e.p||0),
      c: a.c + (e.c||0),
      f: a.f + (e.f||0)
    }), { kcal:0, p:0, c:0, f:0 });
  },
  /* Sum workout + health calories burned for the day */
  burnedTotal(log, bodyweightKg) {
    let total = 0;
    (log.workouts||[]).forEach(w => {
      if (w.calories != null) { total += w.calories; return; }
      // estimate from duration and met if not stored
      if (w.met && w.duration) total += Math.round(window.exCaloriesPerMin(w.met, bodyweightKg) * w.duration);
    });
    if (log.health && log.health.caloriesBurned) total += log.health.caloriesBurned;
    return total;
  }
};
