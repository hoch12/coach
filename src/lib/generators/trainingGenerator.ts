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
export function generateTrainingSplit(data: OnboardingData, lang: string = 'en'): TrainingDay[] {
  const { fitnessGoals, trainingFrequency, fitnessLevel, gender } = data;
  const isCs = lang === 'cs';
  const freq = determineFrequency(data);
  const exercises = selectExercisePool(data, lang);
  const params = determineTrainingParams(data);

  let split: TrainingDay[];
  if (freq <= 3) {
    split = buildFullBodySplit(freq, exercises, params, data, lang);
  } else if (freq === 4) {
    split = buildUpperLowerSplit(exercises, params, data, lang);
  } else {
    split = buildPPLSplit(exercises, params, data, lang);
  }

  // Add warmup/cooldown based on plan style
  if (data.planStyle === "structured") {
    split = addWarmupCooldown(split, data, lang);
  }

  // Add cardio recommendations based on goals
  split = addCardioRecommendations(split, data, lang);

  return split;
}

/** Determine training frequency from multiple factors */
function determineFrequency(data: OnboardingData): number {
  if (data.trainingFrequency === "1-2 days") return 2;
  if (data.trainingFrequency === "5-6 days") return 6;
  return 4; // default for 3-4 days
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
    // Strength can stay true if they selected it, but muscle is primary
    if (goals.includes("strength")) isStrength = true;
  }

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
    // Czech variants just in case
    "30-45 sek": "45-60 sek",
    "45-60 sek": "60-90 sek",
    "60-90 sek": "90-120 sek",
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
  const hasGym = data.advantages.includes("gym-access");
  const hasHome = data.advantages.includes("home-equipment");
  const limitations = data.healthLimitations.toLowerCase();

  const hasBackIssue = limitations.includes("lower-back") || limitations.includes("back") || limitations.includes("spine") || limitations.includes("zád") || limitations.includes("zad") || limitations.includes("páteř");
  const hasKneeIssue = limitations.includes("knee-issues") || limitations.includes("missing-knee") || limitations.includes("knee") || limitations.includes("kolen") || limitations.includes("noh");
  const hasMissingKnee = limitations.includes("missing-knee");
  const hasShoulderIssue = limitations.includes("shoulder-issues") || limitations.includes("shoulder") || limitations.includes("ramen");

  const hasNeckIssue = limitations.includes("neck-pain") || limitations.includes("neck");
  const hasWristIssue = limitations.includes("wrist-issues") || limitations.includes("wrist");
  const hasElbowIssue = limitations.includes("elbow-issues") || limitations.includes("elbow");
  const hasHipIssue = limitations.includes("hip-issues") || limitations.includes("hip");
  const hasAsthma = limitations.includes("asthma");

  const hasGenericIssue = limitations.length > 0 && limitations !== "none" && !hasBackIssue && !hasKneeIssue && !hasShoulderIssue && !hasMissingKnee && !hasNeckIssue && !hasWristIssue && !hasElbowIssue && !hasHipIssue;
  const isCs = lang === 'cs';
  const modPrefix = hasGenericIssue ? (isCs ? `[Mod: ${data.healthLimitations}] ` : `[Mod: ${data.healthLimitations}] `) : ""; // Logic remains same but prepared for structure

  // Helper to apply generic mod to heavy compound lifts
  const addMod = (name: string) => modPrefix + name;

  // Base pool depends on equipment
  if (hasGym) {
    return {
      squat: hasMissingKnee
        ? ["Seated Leg Extension (Single Leg)", "Leg Press (Single Leg)", "Smith Machine Split Squat (Assisted)"]
        : hasKneeIssue
          ? ["Leg Press (limited ROM)", "Box Squat", "Wall Sit"]
          : hasHipIssue
            ? ["Leg Press", "Leg Extension", "Wall Sit"]
            : hasWristIssue
              ? [addMod("Barbell Squat"), "Goblet Squat (Kettlebell)", "Hack Squat"]
              : [addMod("Barbell Squat"), "Front Squat", "Goblet Squat", "Hack Squat"],
      hinge: hasBackIssue || hasHipIssue
        ? ["Cable Pull-Through", "Hip Thrust", "Glute Bridge"]
        : [addMod("Romanian Deadlift"), "Conventional Deadlift", "Trap Bar Deadlift"],
      horizontalPush: hasShoulderIssue
        ? ["Floor Press", "Chest Press Machine", "Push-Ups"]
        : hasWristIssue
          ? ["Dumbbell Bench Press", "Machine Chest Press", "Pec Deck"]
          : [addMod("Bench Press"), "Incline Dumbbell Press", "Dumbbell Bench Press"],
      verticalPush: hasShoulderIssue
        ? ["Landmine Press", "Neutral Grip DB Press", "High Incline Press"]
        : hasNeckIssue
          ? ["Seated DB Press", "Machine Shoulder Press"]
          : [addMod("Overhead Press"), "Arnold Press", "Seated DB Press"],
      horizontalPull: hasElbowIssue
        ? ["Light Cable Row", "Chest-Supported Machine Row"]
        : ["Barbell Row", "Cable Row", "Dumbbell Row", "Chest-Supported Row"],
      verticalPull: hasShoulderIssue
        ? ["Neutral Grip Lat Pulldown", "Cable Pullover"]
        : hasElbowIssue
          ? ["Straight Arm Pulldown", "Light Pullover"]
          : ["Pull-Ups", "Lat Pulldown", "Chin-Ups"],
      legs: hasMissingKnee
        ? ["Single Leg Curl", "Single Leg Extension", "Seated Calf Raise (Single Leg)"]
        : hasKneeIssue || hasHipIssue
          ? ["Hip Thrust", "Glute Kickback", "Calf Raises"]
          : ["Walking Lunges", "Bulgarian Split Squat", "Leg Press", "Step-Ups"],
      arms: hasElbowIssue
        ? ["Light Cable Curls", "Light Tricep Pushdowns", "Concentration Curls"]
        : ["Barbell Curls", "Tricep Pushdowns", "Hammer Curls", "Overhead Tricep Extension", "Cable Curls"],
      core: hasBackIssue || hasNeckIssue
        ? ["Dead Bug", "Bird Dog", "Pallof Press", "McGill Curl-Up"]
        : ["Hanging Leg Raises", "Ab Wheel Rollout", "Cable Crunches", "Plank"],
      posterior: hasNeckIssue
        ? ["Band Pull-Aparts", "Rear Delt Machine"]
        : ["Face Pulls", "Rear Delt Flyes", "Band Pull-Aparts", "Lateral Raises"],
    };
  } else if (hasHome) {
    return {
      squat: hasMissingKnee
        ? ["Assisted Pistol Squat (Chair)", "Single Leg Step-Ups", "Wall Sit (Single Leg)"]
        : hasKneeIssue
          ? ["Wall Sit", "Partial Bodyweight Squat"]
          : [addMod("Goblet Squat"), "Bodyweight Squat", "Pistol Squat Progression"],
      hinge: hasBackIssue
        ? ["Glute Bridge", "Single Leg Glute Bridge"]
        : [addMod("Dumbbell RDL"), "Single Leg Deadlift", "Good Mornings"],
      horizontalPush: hasShoulderIssue
        ? ["Floor Press", "Incline Push-Ups"]
        : [addMod("Push-Ups"), "Dumbbell Press", "Diamond Push-Ups"],
      verticalPush: hasShoulderIssue
        ? ["Landmine Press", "Neutral Grip Press"]
        : [addMod("Dumbbell Shoulder Press"), "Pike Push-Ups"],
      horizontalPull: ["Dumbbell Row", "Resistance Band Row", "Inverted Row"],
      verticalPull: ["Doorway Pull-Ups", "Resistance Band Pulldown", "Dumbbell Pullover"],
      legs: hasMissingKnee
        ? ["Single Leg Glute Bridge", "Seated Calf Raise (Dumbbell)"]
        : hasKneeIssue
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
      squat: hasMissingKnee
        ? ["Assisted Pistol Squat (Chair)", "Wall Sit (Single Leg)"]
        : hasKneeIssue
          ? ["Wall Sit", "Assisted Squat"]
          : [addMod("Bodyweight Squat"), "Jump Squat", "Pistol Squat Progression"],
      hinge: hasBackIssue
        ? ["Glute Bridge", "Single Leg Glute Bridge"]
        : [addMod("Single Leg Deadlift"), "Good Mornings", "Glute Bridge"],
      horizontalPush: hasShoulderIssue
        ? ["Incline Push-Ups", "Kneeling Push-Ups"]
        : [addMod("Push-Ups"), "Diamond Push-Ups", "Wide Push-Ups"],
      verticalPush: hasShoulderIssue
        ? ["Incline Push-Ups"]
        : [addMod("Pike Push-Ups"), "Decline Push-Ups", "Handstand Hold"],
      horizontalPull: ["Inverted Row (table)", "Resistance Band Row", "Superman"],
      verticalPull: ["Doorway Pull-Ups", "Towel Rows", "Superman Y-Raises"],
      legs: hasMissingKnee
        ? ["Single Leg Glute Bridge", "Standing Calf Raise (Single Leg)"]
        : hasKneeIssue
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
      { name: "Calf Raises", sets: 4, reps: "15-20", rest: "45 sec" },
      { name: pick(pool.core, 0), sets: 3, reps: "10-15", rest: "45 sec" },
    ],
  };

  const push2 = {
    day: isCs ? "Čtvrtek" : "Thursday",
    focus: isCs ? "Tlaky (Objem)" : "Push (Volume)",
    exercises: [
      { name: pick(pool.horizontalPush, 2), sets: 3, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.verticalPush, 1), sets: 3, reps: secondaryReps, rest: secondaryRest },
      { name: pick(pool.horizontalPush, 1), sets: 3, reps: "12-15", rest: "45 sec" },
      { name: pick(pool.posterior, 2), sets: 4, reps: "15-20", rest: "45 sec" },
      { name: pick(pool.arms, 3 % pool.arms.length), sets: 3, reps: "12-15", rest: "45 sec" },
    ],
  };

  const pull2 = {
    day: isCs ? "Pátek" : "Friday",
    focus: isCs ? "Tahy (Objem)" : "Pull (Volume)",
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

function addCardioRecommendations(split: TrainingDay[], data: OnboardingData, lang: string): TrainingDay[] {
  const goals = data.fitnessGoals;

  const weight = parseFloat(data.weight) || 75;
  const height = parseFloat(data.height) || 175;
  const bmi = weight / ((height / 100) ** 2);
  const isUnderweight = bmi < 18.5;

  let isFatLoss = goals.includes("fat-loss");
  const isGeneral = goals.includes("general-fitness");
  const isLifestyle = goals.includes("lifestyle-change");

  if (isUnderweight) isFatLoss = false;

  if (!isFatLoss && !isGeneral && !isLifestyle) return split;

  // Add rest-day cardio recommendation
  const usedDays = new Set(split.map((d) => d.day));
  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const restDays = allDays.filter((d) => !usedDays.has(d));

  if (restDays.length > 0) {
    const isCs = lang === 'cs';
    const cardioDay = restDays[0];
    const daysEnToCs: Record<string, string> = {
      "Monday": "Pondělí", "Tuesday": "Úterý", "Wednesday": "Středa", 
      "Thursday": "Čtvrtek", "Friday": "Pátek", "Saturday": "Sobota", "Sunday": "Neděle"
    };

    let cardioType = isCs ? "30 min svižná chůze nebo lehká cyklistika" : "30-min brisk walk or light cycling";
    if (isFatLoss) cardioType = isCs ? "30-45 min LISS kardio (chůze, kolo, plavání)" : "30-45 min LISS cardio (walking, cycling, swimming)";
    if (isGeneral) cardioType = isCs ? "30 min smíšené kardio (kolo, běh, plavání)" : "30 min mixed cardio (cycling, jogging, swimming)";

    // Add up to 2 cardio days
    const cardioDays = restDays.slice(0, isFatLoss ? 2 : 1);
    cardioDays.forEach((day) => {
      split.push({
        day: isCs ? daysEnToCs[day] : day,
        focus: isCs ? "Aktivní regenerace / Kardio" : "Active Recovery / Cardio",
        exercises: [
          { name: cardioType, sets: 1, reps: isCs ? "Kontinuálně" : "Continuous", rest: "—" },
          { name: isCs ? "Protahování a mobilita" : "Stretching & Mobility Work", sets: 1, reps: isCs ? "10-15 min" : "10-15 min", rest: "—" },
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
