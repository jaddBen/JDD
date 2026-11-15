// calories.js — Calorie Engine (BMR, TDEE, MET, macros)
const CalorieEngine = (() => {

  // Mifflin-St Jeor BMR
  function bmr({ weight, height, age, sex }) {
    // weight kg, height cm, age years, sex 'male'|'female'
    const base = 10 * weight + 6.25 * height - 5 * age;
    return sex === 'male' ? base + 5 : base - 161;
  }

  const ACTIVITY_MULTIPLIERS = {
    sedentary:    1.2,
    light:        1.375,
    moderate:     1.55,
    active:       1.725,
    very_active:  1.9,
  };

  function tdee(profile) {
    return Math.round(bmr(profile) * (ACTIVITY_MULTIPLIERS[profile.activity] || 1.2));
  }

  // MET values for common activities
  const MET_VALUES = {
    walking:        { label: '🚶 Walking (avg pace)',    met: 3.5 },
    walking_brisk:  { label: '🚶 Walking (brisk)',       met: 4.5 },
    running:        { label: '🏃 Running (5 mph)',       met: 8.0 },
    running_fast:   { label: '🏃 Running (7+ mph)',      met: 11.5 },
    cycling:        { label: '🚴 Cycling (moderate)',    met: 6.8 },
    cycling_fast:   { label: '🚴 Cycling (vigorous)',    met: 10.0 },
    swimming:       { label: '🏊 Swimming (freestyle)',  met: 7.0 },
    weight_training:{ label: '🏋️ Weight Training',      met: 5.0 },
    yoga:           { label: '🧘 Yoga',                  met: 2.5 },
    hiit:           { label: '⚡ HIIT',                  met: 9.0 },
    elliptical:     { label: '🔄 Elliptical',            met: 5.0 },
    jump_rope:      { label: '🪢 Jump Rope',             met: 11.0 },
    basketball:     { label: '🏀 Basketball',            met: 6.5 },
    soccer:         { label: '⚽ Soccer',                met: 7.0 },
    tennis:         { label: '🎾 Tennis',                met: 7.3 },
    dancing:        { label: '💃 Dancing',               met: 5.0 },
    custom:         { label: '✏️ Custom',                met: 0   },
  };

  // Calories burned = MET × weight(kg) × duration(hours)
  function caloriesBurned({ activityKey, customMet, weightKg, durationMin }) {
    const met = activityKey === 'custom'
      ? (parseFloat(customMet) || 0)
      : (MET_VALUES[activityKey]?.met || 0);
    return Math.round(met * weightKg * (durationMin / 60));
  }

  // Distance-based calorie estimate for walking/running
  // Uses rough 65-80 kcal/km for running, 50-60 for walking (weight-adjusted)
  function caloriesFromDistance({ type, distanceKm, weightKg }) {
    const factor = type === 'running' ? 1.036 : 0.57; // kcal/kg/km
    return Math.round(factor * weightKg * distanceKm);
  }

  // Balance: surplus (+) or deficit (-)
  function netBalance({ tdeeVal, burnedKcal, consumedKcal }) {
    return (tdeeVal + burnedKcal) - consumedKcal;
  }

  function goalSummary(net, goal) {
    if (goal === 'lose') {
      if (net > 0) return { label: 'Calorie Surplus ⚠️', color: 'orange', delta: net };
      return { label: 'Calorie Deficit ✅', color: 'green', delta: Math.abs(net) };
    }
    if (goal === 'gain') {
      if (net < 0) return { label: 'Calorie Deficit ⚠️', color: 'orange', delta: Math.abs(net) };
      return { label: 'Calorie Surplus ✅', color: 'green', delta: net };
    }
    // maintain
    if (Math.abs(net) < 100) return { label: 'Balanced ✅', color: 'green', delta: net };
    return { label: net > 0 ? 'Surplus' : 'Deficit', color: 'blue', delta: net };
  }

  return { bmr, tdee, MET_VALUES, ACTIVITY_MULTIPLIERS, caloriesBurned, caloriesFromDistance, netBalance, goalSummary };
})();

window.CalorieEngine = CalorieEngine;
