/* JDD Fitness — Push/Pull/Legs exercise database.
 * Each exercise: name, muscle group, type (compound/isolation),
 * met = MET value (used to estimate calories burned per minute per kg).
 * Default set/rep scheme and rest in seconds are suggestions. */
window.EXERCISES = {
  push: [
    // --- Chest ---
    { n:"Barbell Bench Press",       muscle:"Chest",    type:"compound", met:6.0, sets:4, reps:"6-8",  rest:120 },
    { n:"Dumbbell Bench Press",      muscle:"Chest",    type:"compound", met:6.0, sets:4, reps:"8-10", rest:90  },
    { n:"Incline Bench Press",       muscle:"Upper Chest", type:"compound", met:6.0, sets:4, reps:"6-8", rest:120 },
    { n:"Decline Bench Press",       muscle:"Lower Chest", type:"compound", met:6.0, sets:3, reps:"8-10", rest:90 },
    { n:"Dumbbell Flyes",            muscle:"Chest",    type:"isolation", met:4.0, sets:3, reps:"12-15",rest:60  },
    { n:"Cable Crossover",           muscle:"Chest",    type:"isolation", met:4.0, sets:3, reps:"12-15",rest:60  },
    { n:"Push-Up",                   muscle:"Chest",    type:"compound", met:8.0, sets:3, reps:"AMRAP",rest:60  },
    { n:"Weighted Dip",              muscle:"Chest/Triceps", type:"compound", met:8.0, sets:3, reps:"8-10", rest:90 },
    // --- Shoulders ---
    { n:"Overhead Press (barbell)",  muscle:"Shoulders", type:"compound", met:5.0, sets:4, reps:"6-8",  rest:120 },
    { n:"Dumbbell Shoulder Press",   muscle:"Shoulders", type:"compound", met:5.0, sets:4, reps:"8-10", rest:90  },
    { n:"Arnold Press",              muscle:"Shoulders", type:"compound", met:5.0, sets:3, reps:"10-12",rest:60  },
    { n:"Lateral Raise",             muscle:"Side Delts",type:"isolation", met:3.5, sets:4, reps:"12-15",rest:45  },
    { n:"Cable Lateral Raise",       muscle:"Side Delts",type:"isolation", met:3.5, sets:3, reps:"15-20",rest:45  },
    { n:"Front Raise",               muscle:"Front Delts",type:"isolation",met:3.5, sets:3, reps:"12-15",rest:45  },
    { n:"Face Pull",                 muscle:"Rear Delts",type:"isolation", met:3.5, sets:3, reps:"15-20",rest:45  },
    { n:"Reverse Pec Deck",          muscle:"Rear Delts",type:"isolation", met:3.5, sets:3, reps:"12-15",rest:45  },
    { n:"Upright Row",               muscle:"Shoulders/Traps", type:"compound", met:4.5, sets:3, reps:"10-12",rest:60 },
    { n:"Shrugs (dumbbell)",         muscle:"Traps",    type:"isolation", met:3.5, sets:4, reps:"12-15",rest:45  },
    // --- Triceps ---
    { n:"Triceps Pushdown",          muscle:"Triceps",  type:"isolation", met:4.0, sets:4, reps:"10-12",rest:45  },
    { n:"Skull Crushers",            muscle:"Triceps",  type:"isolation", met:4.0, sets:3, reps:"10-12",rest:60  },
    { n:"Overhead Triceps Extension",muscle:"Triceps",  type:"isolation", met:4.0, sets:3, reps:"10-12",rest:60  },
    { n:"Close-Grip Bench Press",    muscle:"Triceps",  type:"compound", met:5.0, sets:3, reps:"8-10", rest:90  },
    { n:"Triceps Kickback",          muscle:"Triceps",  type:"isolation", met:3.0, sets:3, reps:"12-15",rest:45  },
    { n:"Bench Dip",                 muscle:"Triceps",  type:"compound", met:5.0, sets:3, reps:"AMRAP",rest:60  }
  ],
  pull: [
    // --- Back (vertical) ---
    { n:"Pull-Up",                   muscle:"Lats",     type:"compound", met:8.0, sets:4, reps:"AMRAP",rest:90  },
    { n:"Weighted Pull-Up",          muscle:"Lats",     type:"compound", met:8.0, sets:4, reps:"6-8",  rest:120 },
    { n:"Lat Pulldown",              muscle:"Lats",     type:"compound", met:5.0, sets:4, reps:"8-12", rest:90  },
    { n:"Chin-Up",                   muscle:"Lats/Biceps", type:"compound", met:8.0, sets:3, reps:"AMRAP",rest:90 },
    // --- Back (horizontal) ---
    { n:"Barbell Row",               muscle:"Back",     type:"compound", met:6.0, sets:4, reps:"6-8",  rest:120 },
    { n:"Dumbbell Row",              muscle:"Back",     type:"compound", met:6.0, sets:4, reps:"8-10", rest:90  },
    { n:"Seated Cable Row",          muscle:"Back",     type:"compound", met:5.0, sets:4, reps:"10-12",rest:60  },
    { n:"T-Bar Row",                 muscle:"Back",     type:"compound", met:6.0, sets:3, reps:"8-10", rest:90  },
    { n:"Pendlay Row",               muscle:"Back",     type:"compound", met:6.0, sets:3, reps:"6-8",  rest:90  },
    { n:"Meadows Row",               muscle:"Back",     type:"compound", met:6.0, sets:3, reps:"10-12",rest:60  },
    { n:"Chest-Supported Row",       muscle:"Back",     type:"compound", met:5.0, sets:3, reps:"10-12",rest:60  },
    { n:"Straight-Arm Pulldown",     muscle:"Lats",     type:"isolation", met:4.0, sets:3, reps:"12-15",rest:45  },
    // --- Rear delts & traps ---
    { n:"Barbell Shrug",             muscle:"Traps",    type:"isolation", met:3.5, sets:4, reps:"12-15",rest:45  },
    { n:"Farmer's Walk",             muscle:"Traps/Core",type:"compound", met:6.0, sets:3, reps:"30s", rest:60  },
    // --- Biceps ---
    { n:"Barbell Curl",              muscle:"Biceps",   type:"isolation", met:4.0, sets:4, reps:"8-10", rest:60  },
    { n:"Dumbbell Curl",             muscle:"Biceps",   type:"isolation", met:4.0, sets:3, reps:"10-12",rest:45  },
    { n:"Hammer Curl",               muscle:"Biceps/Brachialis", type:"isolation", met:4.0, sets:3, reps:"10-12",rest:45 },
    { n:"Preacher Curl",             muscle:"Biceps",   type:"isolation", met:4.0, sets:3, reps:"10-12",rest:60  },
    { n:"Cable Curl",                muscle:"Biceps",   type:"isolation", met:4.0, sets:3, reps:"12-15",rest:45  },
    { n:"Concentration Curl",        muscle:"Biceps",   type:"isolation", met:3.5, sets:3, reps:"12-15",rest:45  },
    { n:"Incline Dumbbell Curl",     muscle:"Biceps",   type:"isolation", met:4.0, sets:3, reps:"10-12",rest:45  },
    { n:"Reverse Curl",             muscle:"Brachialis",type:"isolation", met:3.5, sets:3, reps:"12-15",rest:45  },
    // --- Forearms ---
    { n:"Wrist Curl",                muscle:"Forearms", type:"isolation", met:3.0, sets:3, reps:"15-20",rest:45  },
    { n:"Reverse Wrist Curl",        muscle:"Forearms", type:"isolation", met:3.0, sets:3, reps:"15-20",rest:45  }
  ],
  legs: [
    // --- Quads ---
    { n:"Barbell Back Squat",        muscle:"Quads/Glutes", type:"compound", met:6.0, sets:4, reps:"6-8",  rest:150 },
    { n:"Front Squat",               muscle:"Quads",    type:"compound", met:6.0, sets:4, reps:"6-8",  rest:120 },
    { n:"Goblet Squat",              muscle:"Quads",    type:"compound", met:5.0, sets:3, reps:"10-12",rest:90  },
    { n:"Hack Squat",                muscle:"Quads",    type:"compound", met:6.0, sets:4, reps:"8-10", rest:120 },
    { n:"Leg Press",                 muscle:"Quads",    type:"compound", met:5.0, sets:4, reps:"10-12",rest:90  },
    { n:"Leg Extension",             muscle:"Quads",    type:"isolation", met:3.5, sets:3, reps:"12-15",rest:45  },
    { n:"Walking Lunge",             muscle:"Quads/Glutes", type:"compound", met:5.5, sets:3, reps:"12 each",rest:60 },
    { n:"Bulgarian Split Squat",     muscle:"Quads/Glutes", type:"compound", met:5.5, sets:3, reps:"10 each",rest:60 },
    { n:"Step-Up",                   muscle:"Quads/Glutes", type:"compound", met:5.0, sets:3, reps:"12 each",rest:60 },
    { n:"Sissy Squat",               muscle:"Quads",    type:"isolation", met:4.0, sets:3, reps:"12-15",rest:45  },
    // --- Hamstrings ---
    { n:"Romanian Deadlift",         muscle:"Hamstrings", type:"compound", met:6.0, sets:4, reps:"8-10", rest:90  },
    { n:"Lying Leg Curl",            muscle:"Hamstrings", type:"isolation", met:3.5, sets:3, reps:"12-15",rest:45  },
    { n:"Seated Leg Curl",           muscle:"Hamstrings", type:"isolation", met:3.5, sets:3, reps:"12-15",rest:45  },
    { n:"Stiff-Leg Deadlift",        muscle:"Hamstrings", type:"compound", met:6.0, sets:3, reps:"8-10", rest:90  },
    { n:"Good Morning",              muscle:"Hamstrings/Lower Back", type:"compound", met:5.0, sets:3, reps:"10-12",rest:90 },
    { n:"Nordic Curl",               muscle:"Hamstrings", type:"compound", met:6.0, sets:3, reps:"AMRAP",rest:60  },
    // --- Glutes ---
    { n:"Hip Thrust",                muscle:"Glutes",   type:"compound", met:5.0, sets:4, reps:"8-12", rest:90  },
    { n:"Glute Bridge",              muscle:"Glutes",   type:"compound", met:4.0, sets:3, reps:"12-15",rest:60  },
    { n:"Cable Kickback",            muscle:"Glutes",   type:"isolation", met:3.5, sets:3, reps:"12-15",rest:45  },
    { n:"Banded Hip Abduction",      muscle:"Glutes",   type:"isolation", met:3.0, sets:3, reps:"15-20",rest:45  },
    // --- Calves ---
    { n:"Standing Calf Raise",       muscle:"Calves",   type:"isolation", met:3.5, sets:4, reps:"12-15",rest:45  },
    { n:"Seated Calf Raise",          muscle:"Calves",   type:"isolation", met:3.5, sets:3, reps:"15-20",rest:45  },
    { n:"Donkey Calf Raise",         muscle:"Calves",   type:"isolation", met:3.5, sets:3, reps:"15-20",rest:45  },
    // --- Core ---
    { n:"Plank",                     muscle:"Core",     type:"isolation", met:4.0, sets:3, reps:"60s", rest:45  },
    { n:"Hanging Leg Raise",         muscle:"Core",     type:"compound", met:5.0, sets:3, reps:"12-15",rest:60  },
    { n:"Cable Crunch",              muscle:"Core",     type:"isolation", met:3.5, sets:3, reps:"15-20",rest:45  },
    { n:"Russian Twist",             muscle:"Core",     type:"isolation", met:4.0, sets:3, reps:"20",  rest:45  },
    { n:"Ab Wheel Rollout",          muscle:"Core",     type:"compound", met:5.0, sets:3, reps:"10-12",rest:60  },
    { n:"Bicycle Crunch",            muscle:"Core",     type:"isolation", met:5.0, sets:3, reps:"20",  rest:45  },
    { n:"Lying Leg Raise",           muscle:"Core",     type:"isolation", met:4.0, sets:3, reps:"15-20",rest:45  },
    { n:"Mountain Climber",          muscle:"Core",     type:"compound", met:8.0, sets:3, reps:"30s", rest:30  }
  ],
  cardio: [
    { n:"Walking (4.8 km/h)",         muscle:"Cardio",   type:"cardio", met:3.5, sets:1, reps:"30-60 min",rest:0 },
    { n:"Brisk Walk (5.6 km/h)",      muscle:"Cardio",   type:"cardio", met:4.3, sets:1, reps:"30-60 min",rest:0 },
    { n:"Running (8 km/h)",           muscle:"Cardio",   type:"cardio", met:8.0, sets:1, reps:"20-45 min",rest:0 },
    { n:"Running (10 km/h)",          muscle:"Cardio",   type:"cardio", met:9.8, sets:1, reps:"20-45 min",rest:0 },
    { n:"Running (12 km/h)",          muscle:"Cardio",   type:"cardio", met:11.5,sets:1, reps:"15-40 min",rest:0 },
    { n:"Sprinting",                  muscle:"Cardio",   type:"cardio", met:15.0,sets:1, reps:"intervals",rest:0 },
    { n:"Cycling (moderate)",         muscle:"Cardio",   type:"cardio", met:7.0, sets:1, reps:"30-60 min",rest:0 },
    { n:"Cycling (vigorous)",         muscle:"Cardio",   type:"cardio", met:10.0,sets:1, reps:"30-60 min",rest:0 },
    { n:"Stationary Bike",            muscle:"Cardio",   type:"cardio", met:6.8, sets:1, reps:"20-45 min",rest:0 },
    { n:"Rowing (moderate)",          muscle:"Cardio",   type:"cardio", met:7.0, sets:1, reps:"20-40 min",rest:0 },
    { n:"Rowing (vigorous)",          muscle:"Cardio",   type:"cardio", met:12.0,sets:1, reps:"10-30 min",rest:0 },
    { n:"Jump Rope",                  muscle:"Cardio",   type:"cardio", met:12.3,sets:1, reps:"10-30 min",rest:0 },
    { n:"Swimming (moderate)",        muscle:"Cardio",   type:"cardio", met:7.0, sets:1, reps:"20-45 min",rest:0 },
    { n:"Swimming (vigorous)",        muscle:"Cardio",   type:"cardio", met:10.0,sets:1, reps:"20-45 min",rest:0 },
    { n:"Stair Climber",              muscle:"Cardio",   type:"cardio", met:8.8, sets:1, reps:"15-30 min",rest:0 },
    { n:"Elliptical (moderate)",      muscle:"Cardio",   type:"cardio", met:5.0, sets:1, reps:"30-60 min",rest:0 },
    { n:"HIIT",                       muscle:"Cardio",   type:"cardio", met:10.0,sets:1, reps:"15-30 min",rest:0 },
    { n:"Hiking (uphill)",            muscle:"Cardio",   type:"cardio", met:6.0, sets:1, reps:"30-90 min",rest:0 },
    { n:"Boxing (heavy bag)",         muscle:"Cardio",   type:"cardio", met:9.0, sets:1, reps:"15-30 min",rest:0 },
    { n:"Dance Cardio",              muscle:"Cardio",   type:"cardio", met:6.0, sets:1, reps:"30-60 min",rest:0 }
  ]
};

/* MET-based calories burned per minute = MET * 3.5 * bodyweightKg / 200 */
window.exCaloriesPerMin = function(met, bodyweightKg) {
  return met * 3.5 * (bodyweightKg || 70) / 200;
};
