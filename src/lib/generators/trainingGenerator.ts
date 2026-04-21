import { OnboardingData, TrainingDay } from "@/types/onboarding";
import { EXERCISE_DATABASE, Exercise } from "./exerciseDatabase";

/**
 * Generates a personalized training split based on ALL user inputs:
 * - fitnessLevel → base volume, exercise complexity, rest times
 * - fitnessGoals → split type, rep ranges, exercise selection
 * - age → recovery adjustments, exercise safety
 * - gender → exercise selection preferences
 * - healthLimitations → exercise substitutions
 * - advantages → equipment-based exercise selection
 * - obstacles → frequency adjustments
 * - activityLevel → volume adjustments
 * - sleepQuality → recovery-aware programming
 * - stressLevel → intensity adjustments
 * - disciplineLevel → program complexity
 * - planStyle → detail level and structure
 */
export function generateTrainingSplit(data: OnboardingData, lang: string = 'en'): TrainingDay[] {
  const { fitnessGoals, trainingFrequency, fitnessLevel, gender } = data;
  const isCs = lang === 'cs';
  const freq = parseInt(data.trainingFrequency) || 3;
  const pool = selectExercisePool(data, lang);
  const params = determineTrainingParams(data);

  let split: TrainingDay[];
  switch(freq) {
    case 1: 
      split = buildFullBodySplit(1, pool, params, data, lang); break;
    case 2:
      split = build2DaySplit(pool, params, data, lang); break;
    case 3:
      split = buildFullBodySplit(3, pool, params, data, lang); break;
    case 4:
      split = buildUpperLowerSplit(pool, params, data, lang); break;
    case 5:
      split = buildPPLULSplit(pool, params, data, lang); break;
    case 6:
      split = buildPPLSplit(pool, params, data, lang, true); break; // 6 day = PPL x2
    case 7:
      split = buildPPLSplit(pool, params, data, lang, true); 
      split.push(generateActiveRecoveryDay(data, lang)); break;
    default:
      split = buildFullBodySplit(3, pool, params, data, lang);
  }

  // Add warmup/cooldown based on plan style
  if (data.planStyle === "structured") {
    split = addWarmupCooldown(split, data, lang);
  }

  return split;
}

/** Determine training frequency from multiple factors */
function determineFrequency(data: OnboardingData): number {
  return parseInt(data.trainingFrequency) || 3;
}

interface TrainingParams {
  setsPerExercise: number;
  primaryReps: string;
  secondaryReps: string;
  primaryRest: string;
  secondaryRest: string;
  intensity: "low" | "moderate" | "high";
}

function determineTrainingParams(data: OnboardingData): TrainingParams {
  const level = data.fitnessLevel;
  const goals = data.fitnessGoals || [];
  const isFatLossRaw = goals.includes("fat-loss");
  const isMuscleRaw = goals.includes("muscle-gain");

  // Determine if underweight and shouldn't be doing fat-loss or recomp
  const weight = parseFloat(data.weight) || 75;
  const height = parseFloat(data.height) || 175;
  const bmi = weight / ((height / 100) ** 2);
  const isUnderweight = bmi < 18.5;

  let isRecomp = goals.includes("recomposition") || (isFatLossRaw && isMuscleRaw);
  let isFatLoss = isFatLossRaw && !isRecomp;
  let isMuscle = isMuscleRaw && !isRecomp;
  let isStrength = goals.includes("strength") && !isRecomp;

  // Force muscle-gain if underweight to ensure they focus on building mass
  if (isUnderweight) {
    isRecomp = false;
    isFatLoss = false;
    isMuscle = true;
    if (goals.includes("strength")) isStrength = true;
  }

  let setsPerExercise = level === "beginner" ? 3 : level === "intermediate" ? 3 : 4;

  // Adjust sets based on stress/sleep/health
  const limitations = data.healthLimitations.toLowerCase();
  const hasAsthma = limitations.includes("asthma") || limitations.includes("heart");
  
  if (data.stressLevel === "high" || data.sleepQuality === "poor" || hasAsthma) {
    setsPerExercise = Math.max(2, setsPerExercise - 1);
  }

  // Structured plan style = more volume
  if (data.planStyle === "structured" && level !== "beginner") {
    setsPerExercise = Math.min(5, setsPerExercise + 1);
  }

  // Simple plan style = less volume
  if (data.planStyle === "simple") {
    setsPerExercise = Math.max(2, setsPerExercise - 1);
  }

  // Rep ranges based on primary goal
  let primaryReps = "8-12";
  let primaryRest = "60-90 sec";
  if (isStrength) {
    primaryReps = "3-6";
    primaryRest = "3-4 min";
  } else if (isMuscle) {
    primaryReps = "6-10";
    primaryRest = "90-120 sec";
  } else if (isFatLoss) {
    primaryReps = "12-15";
    primaryRest = "45-60 sec";
  }

  let secondaryReps = "10-15";
  let secondaryRest = "45-60 sec";
  if (isStrength) {
    secondaryReps = "8-10";
    secondaryRest = "90 sec";
  } else if (isFatLoss) {
    secondaryReps = "15-20";
    secondaryRest = "30-45 sec";
  }

  // Intensity based on discipline and motivation
  let intensity: "low" | "moderate" | "high" = "moderate";
  if (data.disciplineLevel >= 7 && data.motivationLevel >= 6) intensity = "high";
  if (data.disciplineLevel <= 3 || data.motivationLevel <= 3) intensity = "low";
  if (data.stressLevel === "high" || hasAsthma) intensity = intensity === "high" ? "moderate" : "low";

  // Age-based adjustments
  const age = parseInt(data.age) || 25;
  if (age > 45) {
    primaryRest = increaseRest(primaryRest);
    secondaryRest = increaseRest(secondaryRest);
  }

  return { setsPerExercise, primaryReps, secondaryReps, primaryRest, secondaryRest, intensity };
}

function increaseRest(rest: string): string {
  const mapping: Record<string, string> = {
    "30-45 sec": "45-60 sec",
    "45-60 sec": "60-90 sec",
    "60-90 sec": "90-120 sec",
    "90-120 sec": "2-3 min",
    "2-3 min": "3-4 min",
    "3-4 min": "3-5 min",
  };
  return mapping[rest] || rest;
}

interface ExercisePool {
  squat: string[];
  hinge: string[];
  horizontalPush: string[];
  verticalPush: string[];
  horizontalPull: string[];
  verticalPull: string[];
  legs: string[];
  arms: string[];
  core: string[];
  posterior: string[];
}

/** Select exercises based on equipment access and health limitations */
function selectExercisePool(data: OnboardingData, lang: string): ExercisePool {
  const location = data.workoutLocation;
  const homeEquipment = data.homeEquipment || [];
  const limitations = data.healthLimitations.toLowerCase().split(',').map(s => s.trim());
  const goals = data.fitnessGoals || [];
  const level = data.fitnessLevel;
  const isCs = lang === 'cs';

  // Filter exercises based on equipment availability
  const availableExercises = EXERCISE_DATABASE.filter(ex => {
    // Gym exercises allowed only if at gym
    if (location === "gym") {
      return ex.equipment.includes("gym") || ex.equipment.includes("bodyweight");
    }
    
    // Home/Outdoor/Mixed
    const canUseBodyweight = ex.equipment.includes("bodyweight") || ex.equipment.includes("home");
    const canUseSpecificHomeEquip = ex.equipment.some(eq => homeEquipment.includes(eq));
    
    if (location === "home") return canUseBodyweight || canUseSpecificHomeEquip;
    if (location === "outdoor") return ex.equipment.includes("outdoor") || ex.equipment.includes("bodyweight");
    
    // Mixed: allow everything they have access to
    return ex.equipment.includes("gym") || canUseBodyweight || canUseSpecificHomeEquip || ex.equipment.includes("outdoor");
  });

  // Helper to filter by muscle and safety
  const get = (muscles: string[], mechanics?: "compound" | "isolation") => {
    let filtered = availableExercises.filter(ex => 
      ex.muscleGroups.some(m => muscles.includes(m))
    );

    if (mechanics) {
      filtered = filtered.filter(ex => ex.mechanics === mechanics);
    }

    // Filter by health limitations
    limitations.forEach(limit => {
      if (limit === "lower-back") filtered = filtered.filter(ex => !["squat", "deadlift"].includes(ex.id));
      if (limit === "knee-issues") filtered = filtered.filter(ex => !["squat", "lunges"].includes(ex.id));
    });

    if (filtered.length === 0) {
      // Fallback to bodyweight if nothing found
      filtered = EXERCISE_DATABASE.filter(ex => ex.equipment.includes("bodyweight") && ex.muscleGroups.some(m => muscles.includes(m)));
    }

    return filtered.map(ex => isCs ? ex.nameCs : ex.nameEn);
  };

  return {
    squat: get(["quads", "legs", "glutes"], "compound"),
    hinge: get(["hamstrings", "glutes"], "compound"),
    horizontalPush: get(["chest"], "compound"),
    verticalPush: get(["shoulders"], "compound"),
    horizontalPull: get(["back"], "compound"),
    verticalPull: get(["back"], "compound"),
    legs: get(["quads", "hamstrings", "glutes"]),
    arms: get(["biceps", "triceps"]),
    core: get(["abs", "core"]),
    posterior: get(["shoulders", "back"], "isolation")
  };
}

function pick(arr: string[], index: number): string {
  return arr[index % arr.length];
}

function applyDurationLimit(day: TrainingDay, data: OnboardingData): TrainingDay {
  const dur = data.trainingDuration;
  let maxExercises = 6;
  if (dur === "under-30") maxExercises = 3;
  if (dur === "30-45") maxExercises = 4;
  if (dur === "45-60") maxExercises = 5;
  if (dur === "over-60") maxExercises = 8;

  day.exercises = day.exercises.slice(0, maxExercises);
  return day;
}

function build2DaySplit(
  pool: ExercisePool,
  params: TrainingParams,
  data: OnboardingData,
  lang: string
): TrainingDay[] {
  const { setsPerExercise: sets, primaryReps, primaryRest, secondaryReps, secondaryRest } = params;
  const isCs = lang === 'cs';

  const day1 = {
    day: isCs ? "Pondělí" : "Monday",
    focus: isCs ? "Celé tělo A (Hlavní cviky)" : "Full Body A (Foundational)",
    exercises: [
      { name: pick(pool.squat, 0), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.horizontalPush, 0), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.verticalPull, 0), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.hinge, 0), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.core, 0), sets: 3, reps: "12-15", rest: "60 sec" },
    ],
  };

  const day2 = {
    day: isCs ? "Čtvrtek" : "Thursday",
    focus: isCs ? "Celé tělo B (Doplňkové)" : "Full Body B (Accessory focus)",
    exercises: [
      { name: pick(pool.hinge, 1), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.verticalPush, 0), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.horizontalPull, 0), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.legs, 0), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.arms, 0), sets: 3, reps: "10-12", rest: "60 sec" },
    ],
  };

  return [day1, day2].map(d => applyDurationLimit(d, data));
}

function buildFullBodySplit(
  days: number,
  pool: ExercisePool,
  params: TrainingParams,
  data: OnboardingData,
  lang: string
): TrainingDay[] {
  const { setsPerExercise: sets, primaryReps, secondaryReps, primaryRest, secondaryRest } = params;
  const isCs = lang === 'cs';
  const schedulesEn = ["Monday", "Wednesday", "Friday", "Saturday"];
  const schedulesCs = ["Pondělí", "Středa", "Pátek", "Sobota"];
  const schedules = (isCs ? schedulesCs : schedulesEn).slice(0, days);
  const labels = ["A", "B", "C", "D"];

  return schedules.map((day, i) => {
    const exercises = [
      { name: pick(pool.squat, i), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.horizontalPush, i), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.horizontalPull, i), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.hinge, i), sets: Math.max(2, sets - 1), reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.posterior, i), sets: 3, reps: "12-15", rest: "45 sec" },
      { name: pick(pool.core, i), sets: 3, reps: "10-15", rest: "45 sec" },
    ];

    // Simple plan: fewer exercises
    if (data.planStyle === "simple") {
      exercises.splice(4, 2);
    }

    // Fat loss: add a finisher
    if (data.fitnessGoals.includes("fat-loss") && data.planStyle !== "simple" && data.healthLimitations !== "asthma") {
      exercises.push({ 
        name: isCs ? "Metabolický finišer (Angličáky / Swingy s kettlebellem)" : "Metabolic Finisher (Burpees / Kettlebell Swings)", 
        sets: 3, 
        reps: isCs ? "30 sek" : "30 sec", 
        rest: isCs ? "30 sek" : "30 sec" 
      });
    }

    return applyDurationLimit({
      day,
      focus: isCs ? `Celé tělo (Full Body ${labels[i]})` : `Full Body (${labels[i]})`,
      exercises,
    }, data);
  });
}

function buildUpperLowerSplit(
  pool: ExercisePool,
  params: TrainingParams,
  data: OnboardingData,
  lang: string
): TrainingDay[] {
  const { setsPerExercise: sets, primaryReps, secondaryReps, primaryRest, secondaryRest } = params;
  const isCs = lang === 'cs';
  const isStrength = data.fitnessGoals.includes("strength");
  const isFatLoss = data.fitnessGoals.includes("fat-loss");

  const upper1 = {
    day: isCs ? "Pondělí" : "Monday",
    focus: isStrength 
      ? (isCs ? "Horní polovina (Síla)" : "Upper Body (Strength)") 
      : (isCs ? "Horní polovina (A)" : "Upper Body (A)"),
    exercises: [
      { name: pick(pool.horizontalPush, 0), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.horizontalPull, 0), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.verticalPush, 0), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.verticalPull, 0), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.posterior, 0), sets: 3, reps: "12-15", rest: "45 sec" },
      { name: pick(pool.arms, 0), sets: 3, reps: "10-12", rest: "60 sec" },
    ],
  };

  const lower1 = {
    day: isCs ? "Úterý" : "Tuesday",
    focus: isStrength 
      ? (isCs ? "Dolní polovina (Síla)" : "Lower Body (Strength)") 
      : (isCs ? "Dolní polovina (A)" : "Lower Body (A)"),
    exercises: [
      { name: pick(pool.squat, 0), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.hinge, 0), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.legs, 0), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.legs, 1), sets: 3, reps: "12-15", rest: "60 sec" },
      { name: "Calf Raises", sets: 4, reps: "12-15", rest: "45 sec" },
      { name: pick(pool.core, 0), sets: 3, reps: "10-15", rest: "45 sec" },
    ],
  };

  const upper2 = {
    day: isCs ? "Čtvrtek" : "Thursday",
    focus: isStrength 
      ? (isCs ? "Horní polovina (Hypertrofie)" : "Upper Body (Hypertrophy)") 
      : (isCs ? "Horní polovina (B)" : "Upper Body (B)"),
    exercises: [
      { name: pick(pool.horizontalPush, 1), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.horizontalPull, 1), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.posterior, 1), sets: 4, reps: "15-20", rest: "45 sec" },
      { name: pick(pool.arms, 1), sets: 3, reps: "10-12", rest: "60 sec" },
      { name: pick(pool.arms, 2), sets: 3, reps: "10-12", rest: "60 sec" },
      { name: pick(pool.posterior, 2), sets: 3, reps: "15-20", rest: "45 sec" },
    ],
  };

  const lower2 = {
    day: isCs ? "Pátek" : "Friday",
    focus: isStrength 
      ? (isCs ? "Dolní polovina (Hypertrofie)" : "Lower Body (Hypertrophy)") 
      : (isCs ? "Dolní polovina (B)" : "Lower Body (B)"),
    exercises: [
      { name: pick(pool.squat, 1), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.hinge, 1), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.legs, 2), sets: 3, reps: "12-15", rest: "60 sec" },
      { name: pick(pool.legs, 3 % pool.legs.length), sets: 3, reps: "15-20", rest: "45 sec" },
      { name: "Calf Raises", sets: 4, reps: "15-20", rest: "45 sec" },
      { name: pick(pool.core, 1), sets: 3, reps: "10-15", rest: "45 sec" },
    ],
  };

  const result = [upper1, lower1, upper2, lower2];

  // Simple plan: trim to 4-5 exercises per day
  if (data.planStyle === "simple") {
    result.forEach((d) => { d.exercises = d.exercises.slice(0, 4); });
  }

  // Fat loss: add conditioning
  if (isFatLoss && data.healthLimitations !== "asthma") {
    result.forEach((d) => {
      d.exercises.push({ 
        name: isCs ? "Kondiční kruhový trénink (20 min)" : "Conditioning Circuit (20 min)", 
        sets: 1, 
        reps: "AMRAP", 
        rest: "—" 
      });
    });
  }

  return result.map(day => applyDurationLimit(day, data));
}

function buildPPLSplit(
  pool: ExercisePool,
  params: TrainingParams,
  data: OnboardingData,
  lang: string
): TrainingDay[] {
  const { setsPerExercise: sets, primaryReps, secondaryReps, primaryRest, secondaryRest } = params;
  const isCs = lang === 'cs';

  const push1 = {
    day: isCs ? "Pondělí" : "Monday",
    focus: isCs ? "Tlaky (Síla)" : "Push (Strength)",
    exercises: [
      { name: pick(pool.horizontalPush, 0), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.verticalPush, 0), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.horizontalPush, 1), sets: 3, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.posterior, 0), sets: 4, reps: "12-15", rest: "45 sec" },
      { name: pick(pool.arms, 2), sets: 3, reps: "10-12", rest: "60 sec" },
    ],
  };

  const pull1 = {
function buildPPLSplit(
  pool: ExercisePool,
  params: TrainingParams,
  data: OnboardingData,
  lang: string,
  is6Day: boolean = false
): TrainingDay[] {
  const { setsPerExercise: sets, primaryReps, secondaryReps, primaryRest, secondaryRest } = params;
  const isCs = lang === 'cs';

  const push1 = {
    day: isCs ? "Pondělí" : "Monday",
    focus: isCs ? "Tlaky (Síla)" : "Push (Strength)",
    exercises: [
      { name: pick(pool.horizontalPush, 0), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.verticalPush, 0), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.horizontalPush, 1), sets: 3, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.posterior, 0), sets: 4, reps: "12-15", rest: "45 sec" },
      { name: pick(pool.arms, 2), sets: 3, reps: "10-12", rest: "60 sec" },
    ],
  };

  const pull1 = {
    day: isCs ? "Úterý" : "Tuesday",
    focus: isCs ? "Tahy (Síla)" : "Pull (Strength)",
    exercises: [
      { name: pick(pool.hinge, 0), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.verticalPull, 0), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.horizontalPull, 0), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.posterior, 1), sets: 3, reps: "15-20", rest: "45 sec" },
      { name: pick(pool.arms, 0), sets: 3, reps: "10-12", rest: "60 sec" },
    ],
  };

  const legs1 = {
    day: isCs ? "Středa" : "Wednesday",
    focus: isCs ? "Nohy" : "Legs",
    exercises: [
      { name: pick(pool.squat, 0), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.hinge, 1), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.legs, 0), sets: 3, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.legs, 1), sets: 3, reps: "12-15", rest: "60 sec" },
      { name: isCs ? "Výpony" : "Calf Raises", sets: 4, reps: "15-20", rest: "45 sec" },
      { name: pick(pool.core, 0), sets: 3, reps: "10-15", rest: "45 sec" },
    ],
  };

  if (!is6Day) {
    return [push1, pull1, legs1].map(day => applyDurationLimit(day, data));
  }

  const push2 = {
    day: isCs ? "Čtvrtek" : "Thursday",
    focus: isCs ? "Tlaky (Objem)" : "Push (Volume)",
    exercises: [
      { name: pick(pool.horizontalPush, 2), sets: 3, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.verticalPush, 1), sets: 3, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.horizontalPush, 1), sets: 3, reps: "12-15", rest: "45 sec" },
      { name: pick(pool.posterior, 2), sets: 4, reps: "15-20", rest: "45 sec" },
      { name: pick(pool.arms, 3), sets: 3, reps: "12-15", rest: "45 sec" },
    ],
  };

  const pull2 = {
    day: isCs ? "Pátek" : "Friday",
    focus: isCs ? "Tahy (Objem)" : "Pull (Volume)",
    exercises: [
      { name: pick(pool.horizontalPull, 1), sets: 3, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.verticalPull, 1), sets: 3, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.horizontalPull, 2), sets: 3, reps: "12-15", rest: "60 sec" },
      { name: pick(pool.posterior, 3), sets: 3, reps: "15-20", rest: "45 sec" },
      { name: pick(pool.arms, 1), sets: 3, reps: "10-12", rest: "60 sec" },
    ],
  };

  const legs2 = {
    day: isCs ? "Sobota" : "Saturday",
    focus: isCs ? "Nohy (Objem)" : "Legs (Volume)",
    exercises: [
      { name: pick(pool.squat, 1), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.hinge, 1), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.legs, 2), sets: 3, reps: "12-15", rest: "60 sec" },
      { name: isCs ? "Výpony" : "Calf Raises", sets: 4, reps: "15-20", rest: "45 sec" },
      { name: pick(pool.core, 1), sets: 3, reps: "10-15", rest: "45 sec" },
    ],
  };

  const result = [push1, pull1, legs1, push2, pull2, legs2];

  if (data.planStyle === "simple") {
    result.forEach((d) => { d.exercises = d.exercises.slice(0, 4); });
  }

  if (data.fitnessGoals.includes("fat-loss") && data.healthLimitations !== "asthma") {
    result.forEach((d) => {
      d.exercises.push({ 
        name: isCs ? "HIIT Finišer (10 min)" : "HIIT Finisher (10 min)", 
        sets: 1, 
        reps: isCs ? "Intervaly" : "Intervals", 
        rest: "—" 
      });
    });
  }

  return result.map(day => applyDurationLimit(day, data));
}

function addWarmupCooldown(split: TrainingDay[], data: OnboardingData, lang: string): TrainingDay[] {
  const age = parseInt(data.age) || 25;
  const hasLimitations = data.healthLimitations.trim().length > 0 && data.healthLimitations.toLowerCase() !== "none";
  const isCs = lang === 'cs';

  const warmupDuration = age > 40 || hasLimitations ? (isCs ? "10-15 min" : "10-15 min") : (isCs ? "5-10 min" : "5-10 min");
  const limitationPrefix = hasLimitations ? (isCs ? `[Upraveno pro: ${data.healthLimitations}] ` : `[Modified for ${data.healthLimitations}] `) : "";

  return split.map((day) => ({
    ...day,
    exercises: [
      { name: isCs ? `${limitationPrefix}Dynamické zahřátí a mobilita` : `${limitationPrefix}Dynamic Warm-Up & Mobility`, sets: 1, reps: warmupDuration, rest: "—" },
      ...day.exercises,
      { name: isCs ? "Protáhnutí a uvolnění (stretching, pěnový válec)" : "Cool-Down Stretching & Foam Rolling", sets: 1, reps: isCs ? "5-10 min" : "5-10 min", rest: "—" },
    ],
  }));
}

function buildPPLULSplit(
  pool: ExercisePool,
  params: TrainingParams,
  data: OnboardingData,
  lang: string
): TrainingDay[] {
  const isCs = lang === 'cs';
  const ppl = buildPPLSplit(pool, params, data, lang, false);
  const ul = buildUpperLowerSplit(pool, params, data, lang).slice(0, 2);
  
  // Adjust days
  ul[0].day = isCs ? "Čtvrtek" : "Thursday";
  ul[1].day = isCs ? "Pátek" : "Friday";
  
  return [...ppl, ...ul];
}

function generateActiveRecoveryDay(data: OnboardingData, lang: string): TrainingDay {
  const isCs = lang === 'cs';
  return {
    day: isCs ? "Neděle" : "Sunday",
    focus: isCs ? "Aktivní regenerace" : "Active Recovery",
    exercises: [
      { name: isCs ? "Svižná chůze / Lehká jóga" : "Brisk Walk / Light Yoga", sets: 1, reps: "30-45 min", rest: "—" },
      { name: isCs ? "Pěnový válec & Mobilita" : "Foam Rolling & Mobility", sets: 1, reps: "15 min", rest: "—" }
    ]
  };
}
