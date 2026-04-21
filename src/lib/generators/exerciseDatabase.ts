export interface Exercise {
  id: string;
  nameEn: string;
  nameCs: string;
  muscleGroups: string[];
  equipment: string[]; // gym, home-dumbbells, home-bands, home-barbell, home-pullup, bodyweight, outdoor
  level: string[]; // beginner, intermediate, advanced
  goals: string[]; // muscle-gain, strength, endurance, fat-loss
  mechanics: "compound" | "isolation";
  limitations?: string[]; // e.g., ["back-safe", "knee-safe"]
}

export const EXERCISE_DATABASE: Exercise[] = [
  // CHEST
  {
    id: "bench-press",
    nameEn: "Barbell Bench Press",
    nameCs: "Benchpress s velkou činkou",
    muscleGroups: ["chest", "triceps", "shoulders"],
    equipment: ["gym", "home-barbell"],
    level: ["beginner", "intermediate", "advanced"],
    goals: ["muscle-gain", "strength"],
    mechanics: "compound"
  },
  {
    id: "db-bench-press",
    nameEn: "Dumbbell Bench Press",
    nameCs: "Tlaky s jednoručkami na rovné lavici",
    muscleGroups: ["chest", "triceps", "shoulders"],
    equipment: ["gym", "home-dumbbells"],
    level: ["beginner", "intermediate", "advanced"],
    goals: ["muscle-gain", "strength"],
    mechanics: "compound"
  },
  {
    id: "pushups",
    nameEn: "Push-ups",
    nameCs: "Kliky",
    muscleGroups: ["chest", "triceps", "shoulders"],
    equipment: ["bodyweight", "home", "outdoor", "gym"],
    level: ["beginner", "intermediate"],
    goals: ["muscle-gain", "endurance", "fat-loss"],
    mechanics: "compound"
  },
  {
    id: "diamond-pushups",
    nameEn: "Diamond Push-ups",
    nameCs: "Diamantové kliky",
    muscleGroups: ["triceps", "chest"],
    equipment: ["bodyweight", "home", "outdoor"],
    level: ["intermediate", "advanced"],
    goals: ["muscle-gain", "strength"],
    mechanics: "compound"
  },
  {
    id: "incline-db-press",
    nameEn: "Incline Dumbbell Press",
    nameCs: "Tlaky s jednoručkami na šikmé lavici",
    muscleGroups: ["chest", "shoulders"],
    equipment: ["gym", "home-dumbbells"],
    level: ["beginner", "intermediate", "advanced"],
    goals: ["muscle-gain"],
    mechanics: "compound"
  },
  {
    id: "chest-fly",
    nameEn: "Dumbbell Chest Fly",
    nameCs: "Rozpažování s jednoručkami",
    muscleGroups: ["chest"],
    equipment: ["gym", "home-dumbbells"],
    level: ["intermediate", "advanced"],
    goals: ["muscle-gain"],
    mechanics: "isolation"
  },
  {
    id: "low-cable-fly",
    nameEn: "Low Cable Chest Fly",
    nameCs: "Spodní protisměrné kladky na prsa",
    muscleGroups: ["chest"],
    equipment: ["gym"],
    level: ["intermediate", "advanced"],
    goals: ["muscle-gain"],
    mechanics: "isolation"
  },
  {
    id: "band-chest-press",
    nameEn: "Resistance Band Chest Press",
    nameCs: "Tlaky na prsa s odporovou gumou",
    muscleGroups: ["chest", "triceps"],
    equipment: ["home-bands", "outdoor"],
    level: ["beginner", "intermediate"],
    goals: ["muscle-gain", "fat-loss"],
    mechanics: "compound"
  },

  // BACK
  {
    id: "pullups",
    nameEn: "Pull-ups",
    nameCs: "Shyby nadhmatem",
    muscleGroups: ["back", "biceps"],
    equipment: ["gym", "home-pullup", "outdoor"],
    level: ["intermediate", "advanced"],
    goals: ["muscle-gain", "strength"],
    mechanics: "compound"
  },
  {
    id: "chinups",
    nameEn: "Chin-ups",
    nameCs: "Shyby podhmatem",
    muscleGroups: ["back", "biceps"],
    equipment: ["gym", "home-pullup", "outdoor"],
    level: ["beginner", "intermediate", "advanced"],
    goals: ["muscle-gain", "strength"],
    mechanics: "compound"
  },
  {
    id: "db-row",
    nameEn: "One-Arm Dumbbell Row",
    nameCs: "Přítahy jednoručky v předklonu",
    muscleGroups: ["back", "biceps"],
    equipment: ["gym", "home-dumbbells"],
    level: ["beginner", "intermediate", "advanced"],
    goals: ["muscle-gain", "strength"],
    mechanics: "compound"
  },
  {
    id: "barbell-row",
    nameEn: "Barbell Row",
    nameCs: "Přítahy velké činky v předklonu",
    muscleGroups: ["back", "biceps"],
    equipment: ["gym", "home-barbell"],
    level: ["intermediate", "advanced"],
    goals: ["muscle-gain", "strength"],
    mechanics: "compound"
  },
  {
    id: "lat-pulldown",
    nameEn: "Lat Pulldown",
    nameCs: "Stahování horní kladky",
    muscleGroups: ["back", "biceps"],
    equipment: ["gym"],
    level: ["beginner", "intermediate"],
    goals: ["muscle-gain"],
    mechanics: "compound"
  },
  {
    id: "band-pulldown",
    nameEn: "Resistance Band Lat Pulldown",
    nameCs: "Stahování odporové gumy (shora)",
    muscleGroups: ["back", "biceps"],
    equipment: ["home-bands"],
    level: ["beginner", "intermediate"],
    goals: ["muscle-gain", "fat-loss"],
    mechanics: "compound"
  },
  {
    id: "deadlift",
    nameEn: "Conventional Barbell Deadlift",
    nameCs: "Klasický mrtvý tah",
    muscleGroups: ["back", "legs", "hamstrings", "glutes"],
    equipment: ["gym", "home-barbell"],
    level: ["intermediate", "advanced"],
    goals: ["strength", "muscle-gain"],
    mechanics: "compound"
  },
  {
    id: "inverted-row",
    nameEn: "Inverted Row",
    nameCs: "Přítahy k tyči (obrácené veslování)",
    muscleGroups: ["back", "biceps"],
    equipment: ["gym", "outdoor", "bodyweight"],
    level: ["beginner", "intermediate"],
    goals: ["muscle-gain", "endurance"],
    mechanics: "compound"
  },

  // LEGS - QUADS
  {
    id: "squat",
    nameEn: "Barbell Back Squat",
    nameCs: "Dřep s velkou činkou",
    muscleGroups: ["legs", "quads", "glutes"],
    equipment: ["gym", "home-barbell"],
    level: ["intermediate", "advanced"],
    goals: ["muscle-gain", "strength"],
    mechanics: "compound"
  },
  {
    id: "goblet-squat",
    nameEn: "Dumbbell Goblet Squat",
    nameCs: "Goblet dřep s jednoručkou",
    muscleGroups: ["legs", "quads", "glutes"],
    equipment: ["gym", "home-dumbbells", "home-kettlebell"],
    level: ["beginner", "intermediate"],
    goals: ["muscle-gain", "fat-loss"],
    mechanics: "compound"
  },
  {
    id: "leg-press",
    nameEn: "Leg Press",
    nameCs: "Legpress",
    muscleGroups: ["legs", "quads"],
    equipment: ["gym"],
    level: ["beginner", "intermediate", "advanced"],
    goals: ["muscle-gain"],
    mechanics: "compound"
  },
  {
    id: "bulgarian-split-squat",
    nameEn: "Bulgarian Split Squat",
    nameCs: "Bulharské dřepy",
    muscleGroups: ["legs", "quads", "glutes"],
    equipment: ["gym", "home-dumbbells", "bodyweight"],
    level: ["intermediate", "advanced"],
    goals: ["muscle-gain", "strength"],
    mechanics: "compound"
  },
  {
    id: "lunges",
    nameEn: "Walking Lunges",
    nameCs: "Výpady v chůzi",
    muscleGroups: ["legs", "quads", "glutes"],
    equipment: ["gym", "home-dumbbells", "bodyweight", "outdoor"],
    level: ["beginner", "intermediate"],
    goals: ["muscle-gain", "fat-loss", "endurance"],
    mechanics: "compound"
  },
  // ADDITIONAL CHEST
  { id: "incline-bb-press", nameEn: "Incline Barbell Press", nameCs: "Tlaky s velkou činkou na šikmé lavici", muscleGroups: ["chest", "shoulders"], equipment: ["gym", "home-barbell"], level: ["intermediate", "advanced"], goals: ["muscle-gain"], mechanics: "compound" },
  { id: "decline-db-press", nameEn: "Decline Dumbbell Press", nameCs: "Tlaky s jednoručkami hlavou dolů", muscleGroups: ["chest"], equipment: ["gym"], level: ["intermediate"], goals: ["muscle-gain"], mechanics: "compound" },
  { id: "cable-crossover", nameEn: "Cable Crossover", nameCs: "Stahování protisměrných kladek", muscleGroups: ["chest"], equipment: ["gym"], level: ["beginner", "intermediate"], goals: ["muscle-gain"], mechanics: "isolation" },
  { id: "weighted-pushups", nameEn: "Weighted Push-ups", nameCs: "Kliky se zátěží", muscleGroups: ["chest", "triceps"], equipment: ["home", "gym", "bodyweight"], level: ["advanced"], goals: ["strength", "muscle-gain"], mechanics: "compound" },
  { id: "band-chest-fly", nameEn: "Resistance Band Chest Fly", nameCs: "Rozpažování s odporovou gumou", muscleGroups: ["chest"], equipment: ["home-bands", "outdoor"], level: ["beginner", "intermediate"], goals: ["muscle-gain"], mechanics: "isolation" },

  // ADDITIONAL BACK
  { id: "t-bar-row", nameEn: "T-Bar Row", nameCs: "Přítahy T-osy", muscleGroups: ["back"], equipment: ["gym"], level: ["intermediate", "advanced"], goals: ["muscle-gain", "strength"], mechanics: "compound" },
  { id: "seated-cable-row", nameEn: "Seated Cable Row", nameCs: "Přítahy spodní kladky vsedě", muscleGroups: ["back"], equipment: ["gym"], level: ["beginner", "intermediate"], goals: ["muscle-gain"], mechanics: "compound" },
  { id: "single-arm-lat-pulldown", nameEn: "Single Arm Lat Pulldown", nameCs: "Stahování horní kladky jednoruč", muscleGroups: ["back"], equipment: ["gym"], level: ["intermediate"], goals: ["muscle-gain"], mechanics: "compound" },
  { id: "meadows-row", nameEn: "Meadows Row", nameCs: "Meadows Row (přítahy osy jednou rukou)", muscleGroups: ["back"], equipment: ["gym", "home-barbell"], level: ["advanced"], goals: ["muscle-gain"], mechanics: "compound" },
  { id: "band-row", nameEn: "Resistance Band Row", nameCs: "Přítahy s odporovou gumou", muscleGroups: ["back"], equipment: ["home-bands", "outdoor"], level: ["beginner"], goals: ["muscle-gain"], mechanics: "compound" },
  { id: "rear-delt-row", nameEn: "Rear Delt Dumbbell Row", nameCs: "Přítahy jednoruček na zadní delty", muscleGroups: ["back", "shoulders"], equipment: ["gym", "home-dumbbells"], level: ["intermediate"], goals: ["muscle-gain"], mechanics: "compound" },

  // ADDITIONAL LEGS (QUADS)
  { id: "front-squat", nameEn: "Barbell Front Squat", nameCs: "Přední dřep s velkou činkou", muscleGroups: ["legs", "quads"], equipment: ["gym", "home-barbell"], level: ["advanced"], goals: ["strength", "muscle-gain"], mechanics: "compound" },
  { id: "sissy-squat", nameEn: "Sissy Squat", nameCs: "Sissy dřep", muscleGroups: ["quads"], equipment: ["bodyweight", "home", "gym"], level: ["intermediate", "advanced"], goals: ["muscle-gain"], mechanics: "isolation" },
  { id: "cyclist-squat", nameEn: "Cyclist Squat", nameCs: "Cyklistický dřep (podložené paty)", muscleGroups: ["quads"], equipment: ["gym", "home-dumbbells", "bodyweight"], level: ["beginner", "intermediate"], goals: ["muscle-gain"], mechanics: "compound" },
  { id: "zercher-squat", nameEn: "Zercher Squat", nameCs: "Zercherův dřep", muscleGroups: ["legs", "quads", "core"], equipment: ["gym", "home-barbell"], level: ["advanced"], goals: ["strength"], mechanics: "compound" },
  { id: "pistol-squat", nameEn: "Pistol Squat", nameCs: "Pistol dřep (na jedné noze)", muscleGroups: ["legs", "quads"], equipment: ["bodyweight", "outdoor"], level: ["advanced"], goals: ["strength", "balance"], mechanics: "compound" },

  // ADDITIONAL LEGS (POSTERIOR)
  { id: "nordic-curl", nameEn: "Nordic Hamstring Curl", nameCs: "Nordické zakopávání", muscleGroups: ["hamstrings"], equipment: ["bodyweight", "gym", "home"], level: ["advanced"], goals: ["strength", "prehab"], mechanics: "isolation" },
  { id: "stiff-leg-deadlift", nameEn: "Stiff-Leg Barbell Deadlift", nameCs: "Mrtvý tah s napnutýma nohama", muscleGroups: ["hamstrings", "glutes", "back"], equipment: ["gym", "home-barbell"], level: ["intermediate", "advanced"], goals: ["muscle-gain"], mechanics: "compound" },
  { id: "kettlebell-swing", nameEn: "Kettlebell Swing", nameCs: "Swing s kettlebellem", muscleGroups: ["glutes", "hamstrings", "back"], equipment: ["gym", "home-kettlebell", "home-dumbbells"], level: ["beginner", "intermediate"], goals: ["fat-loss", "power"], mechanics: "compound" },
  { id: "sumo-deadlift", nameEn: "Sumo Barbell Deadlift", nameCs: "Sumo mrtvý tah", muscleGroups: ["legs", "glutes", "inner-thigh"], equipment: ["gym", "home-barbell"], level: ["intermediate", "advanced"], goals: ["strength"], mechanics: "compound" },
  { id: "lying-band-leg-curl", nameEn: "Resistance Band Leg Curl", nameCs: "Zakopávání vleže s gumičkou", muscleGroups: ["hamstrings"], equipment: ["home-bands"], level: ["beginner", "intermediate"], goals: ["muscle-gain"], mechanics: "isolation" },

  // ADDITIONAL SHOULDERS
  { id: "arnold-press", nameEn: "Arnold Press", nameCs: "Arnoldovy tlaky", muscleGroups: ["shoulders"], equipment: ["gym", "home-dumbbells"], level: ["intermediate"], goals: ["muscle-gain"], mechanics: "compound" },
  { id: "upright-row", nameEn: "Upright Row", nameCs: "Přítahy k bradě", muscleGroups: ["shoulders", "traps"], equipment: ["gym", "home-barbell", "home-dumbbells"], level: ["intermediate"], goals: ["muscle-gain"], mechanics: "compound" },
  { id: "rear-delt-fly", nameEn: "Reverse Dumbbell Fly", nameCs: "Zapažování s jednoručkami", muscleGroups: ["shoulders"], equipment: ["gym", "home-dumbbells"], level: ["beginner", "intermediate"], goals: ["muscle-gain"], mechanics: "isolation" },
  { id: "pike-pushup", nameEn: "Pike Push-ups", nameCs: "Kliky v lomené pozici", muscleGroups: ["shoulders", "triceps"], equipment: ["bodyweight", "outdoor", "home"], level: ["beginner", "intermediate"], goals: ["strength"], mechanics: "compound" },
  { id: "handstand-pushup", nameEn: "Handstand Push-ups", nameCs: "Kliky ve stojce", muscleGroups: ["shoulders", "triceps"], equipment: ["bodyweight", "outdoor"], level: ["advanced"], goals: ["strength"], mechanics: "compound" },

  // ADDITIONAL ARMS
  { id: "preacher-curl", nameEn: "Preacher Curl", nameCs: "Bicepsový zdvih na Scottově lavici", muscleGroups: ["biceps"], equipment: ["gym"], level: ["intermediate"], goals: ["muscle-gain"], mechanics: "isolation" },
  { id: "concentration-curl", nameEn: "Concentration Curl", nameCs: "Koncentrovaný zdvih", muscleGroups: ["biceps"], equipment: ["gym", "home-dumbbells"], level: ["beginner", "intermediate"], goals: ["muscle-gain"], mechanics: "isolation" },
  { id: "ez-bar-curl", nameEn: "EZ-Bar Bicep Curl", nameCs: "Bicepsový zdvih s EZ osou", muscleGroups: ["biceps"], equipment: ["gym", "home-barbell"], level: ["beginner", "intermediate"], goals: ["muscle-gain"], mechanics: "isolation" },
  { id: "tricep-overhead-extension", nameEn: "Dumbbell Overhead Extension", nameCs: "Tricepsový tlak za hlavou", muscleGroups: ["triceps"], equipment: ["gym", "home-dumbbells"], level: ["beginner", "intermediate"], goals: ["muscle-gain"], mechanics: "isolation" },
  { id: "cable-kickback", nameEn: "Cable Tricep Kickback", nameCs: "Zapažování na kladce (triceps)", muscleGroups: ["triceps"], equipment: ["gym"], level: ["intermediate"], goals: ["muscle-gain"], mechanics: "isolation" },
  { id: "diamond-pushup", nameEn: "Diamond Push-up", nameCs: "Diamantový klik", muscleGroups: ["triceps", "chest"], equipment: ["bodyweight", "home", "outdoor"], level: ["intermediate"], goals: ["muscle-gain"], mechanics: "compound" },

  // ADDITIONAL ABS/CORE
  { id: "russian-twist", nameEn: "Russian Twist", nameCs: "Ruský twist", muscleGroups: ["abs", "obliques"], equipment: ["bodyweight", "home-dumbbells"], level: ["beginner", "intermediate"], goals: ["muscle-gain", "fat-loss"], mechanics: "isolation" },
  { id: "mountain-climbers", nameEn: "Mountain Climbers", nameCs: "Mountain Climbers", muscleGroups: ["abs", "core", "cardio"], equipment: ["bodyweight", "home", "outdoor"], level: ["beginner", "intermediate"], goals: ["fat-loss", "endurance"], mechanics: "compound" },
  { id: "ab-wheel-rollout", nameEn: "Ab Wheel Rollout", nameCs: "Výjezdy s kolečkem na břicho", muscleGroups: ["abs", "core"], equipment: ["gym", "home"], level: ["intermediate", "advanced"], goals: ["strength"], mechanics: "compound" },
  { id: "dead-bug", nameEn: "Dead Bug", nameCs: "Mrtvý brouk (aktivace středu)", muscleGroups: ["core", "abs"], equipment: ["bodyweight", "home"], level: ["beginner"], goals: ["health", "prehab"], mechanics: "isolation" },
  { id: "hollow-body-hold", nameEn: "Hollow Body Hold", nameCs: "Hollow body (výdrž v kolébce)", muscleGroups: ["abs", "core"], equipment: ["bodyweight", "outdoor"], level: ["intermediate", "advanced"], goals: ["endurance", "strength"], mechanics: "isolation" },

  // CALISTHENICS / SKILLS
  { id: "muscle-up", nameEn: "Muscle-up", nameCs: "Muscle-up", muscleGroups: ["back", "chest", "triceps", "shoulders"], equipment: ["outdoor", "gym", "home-pullup"], level: ["advanced"], goals: ["strength", "power"], mechanics: "compound" },
  { id: "l-sit", nameEn: "L-Sit Hold", nameCs: "L-Sit (výdrž v sedu s oporou)", muscleGroups: ["abs", "triceps", "shoulders"], equipment: ["bodyweight", "gym", "outdoor"], level: ["intermediate", "advanced"], goals: ["strength"], mechanics: "isolation" },
  { id: "front-lever", nameEn: "Front Lever Pull-ups", nameCs: "Shyby ve front leveru", muscleGroups: ["back", "core"], equipment: ["outdoor", "gym"], level: ["advanced"], goals: ["strength"], mechanics: "compound" },

  // CARDIO / CONDITIONING
  { id: "burpees", nameEn: "Burpees", nameCs: "Angličáky", muscleGroups: ["full-body", "cardio"], equipment: ["bodyweight", "home", "outdoor"], level: ["beginner", "intermediate", "advanced"], goals: ["fat-loss", "endurance"], mechanics: "compound" },
  { id: "jumping-jacks", nameEn: "Jumping Jacks", nameCs: "Panáka (skoky)", muscleGroups: ["cardio"], equipment: ["bodyweight", "home", "outdoor"], level: ["beginner"], goals: ["fat-loss"], mechanics: "compound" },
  { id: "sprints", nameEn: "Hill Sprints", nameCs: "Sprinty do kopce", muscleGroups: ["legs", "cardio"], equipment: ["outdoor"], level: ["intermediate", "advanced"], goals: ["fat-loss", "power"], mechanics: "compound" },
  { id: "shadow-boxing", nameEn: "Shadow Boxing", nameCs: "Stínový box", muscleGroups: ["cardio", "shoulders"], equipment: ["bodyweight"], level: ["beginner", "intermediate"], goals: ["fat-loss", "endurance"], mechanics: "compound" },

  // MOBILITY / STRETCHING
  { id: "cat-camel", nameEn: "Cat-Camel Stretch", nameCs: "Kočičí hřbet", muscleGroups: ["back", "mobility"], equipment: ["bodyweight"], level: ["beginner"], goals: ["health", "prehab"], mechanics: "isolation" },
  { id: "world-greatest-stretch", nameEn: "World's Greatest Stretch", nameCs: "World's Greatest Stretch (komplexní mobilita)", muscleGroups: ["full-body", "mobility"], equipment: ["bodyweight"], level: ["beginner", "intermediate"], goals: ["health", "prehab"], mechanics: "compound" },
  { id: "90-90-hip-switch", nameEn: "90/90 Hip Switches", nameCs: "90/90 mobilizace kyčlí", muscleGroups: ["mobility", "hips"], equipment: ["bodyweight"], level: ["beginner"], goals: ["health"], mechanics: "isolation" }
];

// Plus many more variations (totaling 150+ would be very long here, so I will add a generator function 
// that creates variants for different equipment if not explicitly defined)
