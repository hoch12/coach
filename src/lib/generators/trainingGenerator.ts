import { OnboardingData, TrainingDay } from "@/types/onboarding";

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
export function generateTrainingSplit(data: OnboardingData): TrainingDay[] {
  const freq = determineFrequency(data);
  const exercises = selectExercisePool(data);
  const params = determineTrainingParams(data);

  let split: TrainingDay[];
  if (freq <= 3) {
    split = buildFullBodySplit(freq, exercises, params, data);
  } else if (freq === 4) {
    split = buildUpperLowerSplit(exercises, params, data);
  } else {
    split = buildPPLSplit(exercises, params, data);
  }

  // Add warmup/cooldown based on plan style
  if (data.planStyle === "structured") {
    split = addWarmupCooldown(split, data);
  }

  // Add cardio recommendations based on goals
  split = addCardioRecommendations(split, data);

  return split;
}

/** Determine training frequency from multiple factors */
function determineFrequency(data: OnboardingData): number {
  let days = 3;

  // Base from fitness level
  if (data.fitnessLevel === "intermediate") days = 4;
  if (data.fitnessLevel === "advanced") days = 5;

  // Time constraints reduce frequency
  if (data.obstacles.includes("lack-of-time")) days = Math.max(2, days - 1);
  if (data.obstacles.includes("inconsistent-routine")) days = Math.max(2, days - 1);

  // Time flexibility increases it
  if (data.advantages.includes("time-flexibility") && days < 5) days += 1;

  // High stress or poor sleep → less volume
  if (data.stressLevel === "high" && days > 3) days -= 1;
  if (data.sleepQuality === "poor" && days > 3) days -= 1;

  // Age adjustments for recovery
  const age = parseInt(data.age) || 25;
  if (age > 50 && days > 4) days = 4;
  if (age > 60 && days > 3) days = 3;

  // Lifestyle change / general fitness don't need high frequency
  if (
    data.fitnessGoals.length === 1 &&
    (data.fitnessGoals.includes("lifestyle-change") || data.fitnessGoals.includes("general-fitness"))
  ) {
    days = Math.min(days, 3);
  }

  return Math.max(2, Math.min(6, days));
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
  const goals = data.fitnessGoals;
  const isStrength = goals.includes("strength");
  const isMuscle = goals.includes("muscle-gain");
  const isFatLoss = goals.includes("fat-loss");
  const isRecomp = goals.includes("recomposition");

  let setsPerExercise = level === "beginner" ? 3 : level === "intermediate" ? 3 : 4;

  // Adjust sets based on stress/sleep
  if (data.stressLevel === "high" || data.sleepQuality === "poor") {
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
  } else if (isRecomp) {
    primaryReps = "8-12";
    primaryRest = "60-90 sec";
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
  if (data.stressLevel === "high") intensity = intensity === "high" ? "moderate" : intensity;

  // Age-based adjustments
  const age = parseInt(data.age) || 25;
  if (age > 45) {
    primaryRest = increaseRest(primaryRest);
    if (isStrength) primaryReps = "4-6"; // slightly higher minimum
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
function selectExercisePool(data: OnboardingData): ExercisePool {
  const hasGym = data.advantages.includes("gym-access");
  const hasHome = data.advantages.includes("home-equipment");
  const limitations = data.healthLimitations.toLowerCase();
  const hasBackIssue = limitations.includes("back") || limitations.includes("spine");
  const hasKneeIssue = limitations.includes("knee");
  const hasShoulderIssue = limitations.includes("shoulder");

  // Base pool depends on equipment
  if (hasGym) {
    return {
      squat: hasKneeIssue
        ? ["Leg Press (limited ROM)", "Box Squat", "Wall Sit"]
        : ["Barbell Squat", "Front Squat", "Goblet Squat", "Hack Squat"],
      hinge: hasBackIssue
        ? ["Cable Pull-Through", "Hip Thrust", "Glute Bridge"]
        : ["Romanian Deadlift", "Conventional Deadlift", "Trap Bar Deadlift"],
      horizontalPush: hasShoulderIssue
        ? ["Floor Press", "Chest Press Machine", "Push-Ups"]
        : ["Bench Press", "Incline Dumbbell Press", "Dumbbell Bench Press"],
      verticalPush: hasShoulderIssue
        ? ["Landmine Press", "Neutral Grip DB Press", "High Incline Press"]
        : ["Overhead Press", "Arnold Press", "Seated DB Press"],
      horizontalPull: ["Barbell Row", "Cable Row", "Dumbbell Row", "Chest-Supported Row"],
      verticalPull: hasShoulderIssue
        ? ["Neutral Grip Lat Pulldown", "Cable Pullover"]
        : ["Pull-Ups", "Lat Pulldown", "Chin-Ups"],
      legs: hasKneeIssue
        ? ["Hip Thrust", "Glute Kickback", "Calf Raises"]
        : ["Walking Lunges", "Bulgarian Split Squat", "Leg Press", "Step-Ups"],
      arms: ["Barbell Curls", "Tricep Pushdowns", "Hammer Curls", "Overhead Tricep Extension", "Cable Curls"],
      core: hasBackIssue
        ? ["Dead Bug", "Bird Dog", "Pallof Press", "McGill Curl-Up"]
        : ["Hanging Leg Raises", "Ab Wheel Rollout", "Cable Crunches", "Plank"],
      posterior: ["Face Pulls", "Rear Delt Flyes", "Band Pull-Aparts", "Lateral Raises"],
    };
  } else if (hasHome) {
    return {
      squat: hasKneeIssue
        ? ["Wall Sit", "Partial Bodyweight Squat"]
        : ["Goblet Squat", "Bodyweight Squat", "Pistol Squat Progression"],
      hinge: hasBackIssue
        ? ["Glute Bridge", "Single Leg Glute Bridge"]
        : ["Dumbbell RDL", "Single Leg Deadlift", "Good Mornings"],
      horizontalPush: hasShoulderIssue
        ? ["Floor Press", "Incline Push-Ups"]
        : ["Push-Ups", "Dumbbell Press", "Diamond Push-Ups"],
      verticalPush: hasShoulderIssue
        ? ["Landmine Press", "Neutral Grip Press"]
        : ["Dumbbell Shoulder Press", "Pike Push-Ups"],
      horizontalPull: ["Dumbbell Row", "Resistance Band Row", "Inverted Row"],
      verticalPull: ["Doorway Pull-Ups", "Resistance Band Pulldown", "Dumbbell Pullover"],
      legs: hasKneeIssue
        ? ["Glute Bridge", "Calf Raises"]
        : ["Lunges", "Step-Ups", "Jump Squats"],
      arms: ["Dumbbell Curls", "Tricep Dips (chair)", "Concentration Curls"],
      core: hasBackIssue
        ? ["Dead Bug", "Bird Dog", "Side Plank"]
        : ["Plank", "Bicycle Crunches", "Mountain Climbers", "V-Ups"],
      posterior: ["Band Pull-Aparts", "Reverse Flyes", "YTW Raises"],
    };
  } else {
    // Bodyweight only
    return {
      squat: hasKneeIssue
        ? ["Wall Sit", "Assisted Squat"]
        : ["Bodyweight Squat", "Jump Squat", "Pistol Squat Progression"],
      hinge: hasBackIssue
        ? ["Glute Bridge", "Single Leg Glute Bridge"]
        : ["Single Leg Deadlift", "Good Mornings", "Glute Bridge"],
      horizontalPush: hasShoulderIssue
        ? ["Incline Push-Ups", "Kneeling Push-Ups"]
        : ["Push-Ups", "Diamond Push-Ups", "Wide Push-Ups"],
      verticalPush: hasShoulderIssue
        ? ["Incline Push-Ups"]
        : ["Pike Push-Ups", "Decline Push-Ups", "Handstand Hold"],
      horizontalPull: ["Inverted Row (table)", "Resistance Band Row", "Superman"],
      verticalPull: ["Doorway Pull-Ups", "Towel Rows", "Superman Y-Raises"],
      legs: hasKneeIssue
        ? ["Glute Bridge", "Calf Raises"]
        : ["Lunges", "Step-Ups", "Bulgarian Split Squat (chair)"],
      arms: ["Diamond Push-Ups", "Chin-Up Hold", "Tricep Dips (chair)"],
      core: hasBackIssue
        ? ["Dead Bug", "Bird Dog", "Side Plank"]
        : ["Plank", "Mountain Climbers", "Bicycle Crunches", "Leg Raises"],
      posterior: ["YTW Raises", "Superman", "Reverse Snow Angels"],
    };
  }
}

function pick(arr: string[], index: number): string {
  return arr[index % arr.length];
}

function buildFullBodySplit(
  days: number,
  pool: ExercisePool,
  params: TrainingParams,
  data: OnboardingData
): TrainingDay[] {
  const { setsPerExercise: sets, primaryReps, secondaryReps, primaryRest, secondaryRest } = params;
  const schedules = ["Monday", "Wednesday", "Friday", "Saturday"].slice(0, days);
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
    if (data.fitnessGoals.includes("fat-loss") && data.planStyle !== "simple") {
      exercises.push({ name: "Metabolic Finisher (Burpees / Kettlebell Swings)", sets: 3, reps: "30 sec", rest: "30 sec" });
    }

    return {
      day,
      focus: `Full Body (${labels[i]})`,
      exercises,
    };
  });
}

function buildUpperLowerSplit(
  pool: ExercisePool,
  params: TrainingParams,
  data: OnboardingData
): TrainingDay[] {
  const { setsPerExercise: sets, primaryReps, secondaryReps, primaryRest, secondaryRest } = params;
  const isStrength = data.fitnessGoals.includes("strength");
  const isFatLoss = data.fitnessGoals.includes("fat-loss");

  const upper1 = {
    day: "Monday",
    focus: isStrength ? "Upper Body (Strength)" : "Upper Body (A)",
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
    day: "Tuesday",
    focus: isStrength ? "Lower Body (Strength)" : "Lower Body (A)",
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
    day: "Thursday",
    focus: isStrength ? "Upper Body (Hypertrophy)" : "Upper Body (B)",
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
    day: "Friday",
    focus: isStrength ? "Lower Body (Hypertrophy)" : "Lower Body (B)",
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
  if (isFatLoss) {
    result.forEach((d) => {
      d.exercises.push({ name: "Conditioning Circuit (20 min)", sets: 1, reps: "AMRAP", rest: "—" });
    });
  }

  return result;
}

function buildPPLSplit(
  pool: ExercisePool,
  params: TrainingParams,
  data: OnboardingData
): TrainingDay[] {
  const { setsPerExercise: sets, primaryReps, secondaryReps, primaryRest, secondaryRest } = params;

  const push1 = {
    day: "Monday",
    focus: "Push (Strength)",
    exercises: [
      { name: pick(pool.horizontalPush, 0), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.verticalPush, 0), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.horizontalPush, 1), sets: 3, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.posterior, 0), sets: 4, reps: "12-15", rest: "45 sec" },
      { name: pick(pool.arms, 2), sets: 3, reps: "10-12", rest: "60 sec" },
    ],
  };

  const pull1 = {
    day: "Tuesday",
    focus: "Pull (Strength)",
    exercises: [
      { name: pick(pool.hinge, 0), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.verticalPull, 0), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.horizontalPull, 0), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.posterior, 1), sets: 3, reps: "15-20", rest: "45 sec" },
      { name: pick(pool.arms, 0), sets: 3, reps: "10-12", rest: "60 sec" },
    ],
  };

  const legs1 = {
    day: "Wednesday",
    focus: "Legs",
    exercises: [
      { name: pick(pool.squat, 0), sets, reps: primaryReps, rest: primaryRest },
      { name: pick(pool.hinge, 1), sets: sets - 1, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.legs, 0), sets: 3, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.legs, 1), sets: 3, reps: "12-15", rest: "60 sec" },
      { name: "Calf Raises", sets: 4, reps: "15-20", rest: "45 sec" },
      { name: pick(pool.core, 0), sets: 3, reps: "10-15", rest: "45 sec" },
    ],
  };

  const push2 = {
    day: "Thursday",
    focus: "Push (Volume)",
    exercises: [
      { name: pick(pool.horizontalPush, 2), sets: 3, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.verticalPush, 1), sets: 3, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.horizontalPush, 1), sets: 3, reps: "12-15", rest: "45 sec" },
      { name: pick(pool.posterior, 2), sets: 4, reps: "15-20", rest: "45 sec" },
      { name: pick(pool.arms, 3 % pool.arms.length), sets: 3, reps: "12-15", rest: "45 sec" },
    ],
  };

  const pull2 = {
    day: "Friday",
    focus: "Pull (Volume)",
    exercises: [
      { name: pick(pool.horizontalPull, 1), sets: 3, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.verticalPull, 1), sets: 3, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.horizontalPull, 2), sets: 3, reps: "12-15", rest: "60 sec" },
      { name: pick(pool.posterior, 3 % pool.posterior.length), sets: 3, reps: "15-20", rest: "45 sec" },
      { name: pick(pool.arms, 1), sets: 3, reps: "10-12", rest: "60 sec" },
    ],
  };

  const result = [push1, pull1, legs1, push2, pull2];

  if (data.planStyle === "simple") {
    result.forEach((d) => { d.exercises = d.exercises.slice(0, 4); });
  }

  if (data.fitnessGoals.includes("fat-loss")) {
    result.forEach((d) => {
      d.exercises.push({ name: "HIIT Finisher (10 min)", sets: 1, reps: "Intervals", rest: "—" });
    });
  }

  return result;
}

function addWarmupCooldown(split: TrainingDay[], data: OnboardingData): TrainingDay[] {
  const age = parseInt(data.age) || 25;
  const hasLimitations = data.healthLimitations.trim().length > 0 && data.healthLimitations.toLowerCase() !== "none";

  const warmupDuration = age > 40 || hasLimitations ? "10-15 min" : "5-10 min";

  return split.map((day) => ({
    ...day,
    exercises: [
      { name: `Dynamic Warm-Up & Mobility (${warmupDuration})`, sets: 1, reps: "Full routine", rest: "—" },
      ...day.exercises,
      { name: "Cool-Down Stretching & Foam Rolling", sets: 1, reps: "5-10 min", rest: "—" },
    ],
  }));
}

function addCardioRecommendations(split: TrainingDay[], data: OnboardingData): TrainingDay[] {
  const goals = data.fitnessGoals;
  const isFatLoss = goals.includes("fat-loss");
  const isGeneral = goals.includes("general-fitness");
  const isLifestyle = goals.includes("lifestyle-change");

  if (!isFatLoss && !isGeneral && !isLifestyle) return split;

  // Add rest-day cardio recommendation
  const usedDays = new Set(split.map((d) => d.day));
  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const restDays = allDays.filter((d) => !usedDays.has(d));

  if (restDays.length > 0) {
    const cardioDay = restDays[0];
    let cardioType = "30-min brisk walk or light cycling";
    if (isFatLoss) cardioType = "30-45 min LISS cardio (walking, cycling, swimming)";
    if (isGeneral) cardioType = "30 min mixed cardio (cycling, jogging, swimming)";

    // Add up to 2 cardio days
    const cardioDays = restDays.slice(0, isFatLoss ? 2 : 1);
    cardioDays.forEach((day) => {
      split.push({
        day,
        focus: "Active Recovery / Cardio",
        exercises: [
          { name: cardioType, sets: 1, reps: "Continuous", rest: "—" },
          { name: "Stretching & Mobility Work", sets: 1, reps: "10-15 min", rest: "—" },
        ],
      });
    });

    // Sort by day order
    const dayOrder: Record<string, number> = {};
    allDays.forEach((d, i) => { dayOrder[d] = i; });
    split.sort((a, b) => dayOrder[a.day] - dayOrder[b.day]);
  }

  return split;
}
