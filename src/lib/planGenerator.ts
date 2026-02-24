import { OnboardingData, GeneratedPlan, TrainingDay } from "@/types/onboarding";

/**
 * Rule-based plan generation engine.
 * Generates personalized training, nutrition, and lifestyle plans
 * based on collected onboarding data.
 */
export function generatePlan(data: OnboardingData): GeneratedPlan {
  const trainingSplit = generateTrainingSplit(data);
  const nutrition = generateNutritionPlan(data);
  const lifestyle = generateLifestylePlan(data);
  return { trainingSplit, nutrition, lifestyle };
}

function generateTrainingSplit(data: OnboardingData): TrainingDay[] {
  const level = data.fitnessLevel;
  const goals = data.fitnessGoals;

  // Determine training frequency based on experience
  let daysPerWeek = 3;
  if (level === "intermediate") daysPerWeek = 4;
  if (level === "advanced") daysPerWeek = 5;

  // Adjust for time constraints
  if (data.obstacles.includes("lack-of-time")) {
    daysPerWeek = Math.max(2, daysPerWeek - 1);
  }

  const isStrengthFocused = goals.includes("strength") || goals.includes("muscle-gain");
  const isFatLoss = goals.includes("fat-loss");

  // Build training split based on days and goals
  if (daysPerWeek <= 3) {
    return buildFullBodySplit(daysPerWeek, isStrengthFocused, level);
  } else if (daysPerWeek === 4) {
    return buildUpperLowerSplit(isStrengthFocused, isFatLoss, level);
  } else {
    return buildPPLSplit(isStrengthFocused, level);
  }
}

function buildFullBodySplit(days: number, strength: boolean, level: string): TrainingDay[] {
  const setsPerExercise = level === "beginner" ? 3 : 4;
  const reps = strength ? "5-8" : "8-12";
  const rest = strength ? "2-3 min" : "60-90 sec";
  const schedule = ["Monday", "Wednesday", "Friday"].slice(0, days);

  return schedule.map((day, i) => ({
    day,
    focus: "Full Body" + (i === 1 ? " (B)" : i === 2 ? " (C)" : " (A)"),
    exercises: [
      { name: i % 2 === 0 ? "Barbell Squat" : "Romanian Deadlift", sets: setsPerExercise, reps, rest },
      { name: i % 2 === 0 ? "Bench Press" : "Overhead Press", sets: setsPerExercise, reps, rest },
      { name: "Barbell Row", sets: setsPerExercise, reps, rest },
      { name: i % 2 === 0 ? "Lunges" : "Leg Press", sets: 3, reps: "10-12", rest: "60 sec" },
      { name: "Face Pulls", sets: 3, reps: "12-15", rest: "60 sec" },
      { name: "Plank", sets: 3, reps: "30-45 sec", rest: "45 sec" },
    ],
  }));
}

function buildUpperLowerSplit(strength: boolean, fatLoss: boolean, level: string): TrainingDay[] {
  const sets = level === "beginner" ? 3 : 4;
  const reps = strength ? "5-8" : fatLoss ? "12-15" : "8-12";
  const rest = strength ? "2-3 min" : "60-90 sec";

  return [
    {
      day: "Monday", focus: "Upper Body (Strength)",
      exercises: [
        { name: "Bench Press", sets, reps: "5-8", rest: "2-3 min" },
        { name: "Barbell Row", sets, reps: "5-8", rest: "2-3 min" },
        { name: "Overhead Press", sets: 3, reps: "8-10", rest: "90 sec" },
        { name: "Pull-Ups", sets: 3, reps: "6-10", rest: "90 sec" },
        { name: "Lateral Raises", sets: 3, reps: "12-15", rest: "60 sec" },
        { name: "Tricep Dips", sets: 3, reps: "10-12", rest: "60 sec" },
      ],
    },
    {
      day: "Tuesday", focus: "Lower Body (Strength)",
      exercises: [
        { name: "Barbell Squat", sets, reps: "5-8", rest: "2-3 min" },
        { name: "Romanian Deadlift", sets, reps: "6-8", rest: "2-3 min" },
        { name: "Leg Press", sets: 3, reps: "10-12", rest: "90 sec" },
        { name: "Walking Lunges", sets: 3, reps: "10 each", rest: "60 sec" },
        { name: "Calf Raises", sets: 4, reps: "12-15", rest: "60 sec" },
        { name: "Hanging Leg Raises", sets: 3, reps: "10-12", rest: "60 sec" },
      ],
    },
    {
      day: "Thursday", focus: "Upper Body (Hypertrophy)",
      exercises: [
        { name: "Incline Dumbbell Press", sets: 3, reps, rest },
        { name: "Cable Rows", sets: 3, reps, rest },
        { name: "Dumbbell Lateral Raises", sets: 4, reps: "12-15", rest: "45 sec" },
        { name: "Bicep Curls", sets: 3, reps: "10-12", rest: "60 sec" },
        { name: "Overhead Tricep Extension", sets: 3, reps: "10-12", rest: "60 sec" },
        { name: "Face Pulls", sets: 3, reps: "15-20", rest: "45 sec" },
      ],
    },
    {
      day: "Friday", focus: "Lower Body (Hypertrophy)",
      exercises: [
        { name: "Front Squat", sets: 3, reps, rest },
        { name: "Hip Thrusts", sets: 3, reps: "10-12", rest: "90 sec" },
        { name: "Leg Extensions", sets: 3, reps: "12-15", rest: "60 sec" },
        { name: "Leg Curls", sets: 3, reps: "12-15", rest: "60 sec" },
        { name: "Calf Raises", sets: 4, reps: "15-20", rest: "45 sec" },
        { name: "Ab Wheel Rollout", sets: 3, reps: "8-12", rest: "60 sec" },
      ],
    },
  ];
}

function buildPPLSplit(strength: boolean, level: string): TrainingDay[] {
  const sets = level === "advanced" ? 4 : 3;
  return [
    {
      day: "Monday", focus: "Push",
      exercises: [
        { name: "Bench Press", sets, reps: "5-8", rest: "2-3 min" },
        { name: "Overhead Press", sets: 3, reps: "8-10", rest: "90 sec" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "60 sec" },
        { name: "Lateral Raises", sets: 4, reps: "12-15", rest: "45 sec" },
        { name: "Tricep Pushdowns", sets: 3, reps: "10-12", rest: "60 sec" },
      ],
    },
    {
      day: "Tuesday", focus: "Pull",
      exercises: [
        { name: "Deadlift", sets, reps: "5-6", rest: "3 min" },
        { name: "Pull-Ups", sets: 3, reps: "6-10", rest: "90 sec" },
        { name: "Barbell Row", sets: 3, reps: "8-10", rest: "90 sec" },
        { name: "Face Pulls", sets: 3, reps: "15-20", rest: "45 sec" },
        { name: "Barbell Curls", sets: 3, reps: "10-12", rest: "60 sec" },
      ],
    },
    {
      day: "Wednesday", focus: "Legs",
      exercises: [
        { name: "Barbell Squat", sets, reps: "5-8", rest: "2-3 min" },
        { name: "Romanian Deadlift", sets: 3, reps: "8-10", rest: "90 sec" },
        { name: "Leg Press", sets: 3, reps: "10-12", rest: "90 sec" },
        { name: "Walking Lunges", sets: 3, reps: "10 each", rest: "60 sec" },
        { name: "Calf Raises", sets: 4, reps: "15-20", rest: "45 sec" },
      ],
    },
    {
      day: "Thursday", focus: "Push (Volume)",
      exercises: [
        { name: "Dumbbell Bench Press", sets: 3, reps: "10-12", rest: "60 sec" },
        { name: "Arnold Press", sets: 3, reps: "10-12", rest: "60 sec" },
        { name: "Cable Flyes", sets: 3, reps: "12-15", rest: "45 sec" },
        { name: "Lateral Raises", sets: 4, reps: "15-20", rest: "45 sec" },
        { name: "Overhead Tricep Extension", sets: 3, reps: "12-15", rest: "45 sec" },
      ],
    },
    {
      day: "Friday", focus: "Pull (Volume)",
      exercises: [
        { name: "Cable Rows", sets: 3, reps: "10-12", rest: "60 sec" },
        { name: "Lat Pulldown", sets: 3, reps: "10-12", rest: "60 sec" },
        { name: "Dumbbell Rows", sets: 3, reps: "10-12", rest: "60 sec" },
        { name: "Rear Delt Flyes", sets: 3, reps: "15-20", rest: "45 sec" },
        { name: "Hammer Curls", sets: 3, reps: "10-12", rest: "60 sec" },
      ],
    },
  ];
}

function generateNutritionPlan(data: OnboardingData) {
  const weight = parseFloat(data.weight) || 75;
  const height = parseFloat(data.height) || 175;
  const age = parseInt(data.age) || 25;
  const isMale = data.gender !== "female";

  // Mifflin-St Jeor BMR
  let bmr = isMale
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  // Activity multiplier
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    "lightly-active": 1.375,
    "moderately-active": 1.55,
    "very-active": 1.725,
  };
  const multiplier = activityMultipliers[data.activityLevel] || 1.4;
  let tdee = Math.round(bmr * multiplier);

  // Goal adjustments
  let calories = tdee;
  if (data.fitnessGoals.includes("fat-loss")) {
    calories = Math.round(tdee * 0.8); // 20% deficit
  } else if (data.fitnessGoals.includes("muscle-gain")) {
    calories = Math.round(tdee * 1.1); // 10% surplus
  }

  // Macro split
  const proteinPerKg = data.fitnessGoals.includes("muscle-gain") ? 2.0 : 1.6;
  const protein = Math.round(weight * proteinPerKg);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  // Generate meals based on frequency
  const freq = parseInt(data.mealFrequency) || 4;
  const calPerMeal = Math.round(calories / freq);
  const mealNames = ["Breakfast", "Lunch", "Dinner", "Snack", "Pre-Workout", "Post-Workout"];

  const mealSuggestions: Record<string, string> = {
    Breakfast: "Oatmeal with protein powder, banana, and almond butter",
    Lunch: "Grilled chicken breast with brown rice and mixed vegetables",
    Dinner: "Salmon fillet with sweet potato and steamed broccoli",
    Snack: "Greek yogurt with mixed nuts and berries",
    "Pre-Workout": "Rice cakes with peanut butter and honey",
    "Post-Workout": "Protein shake with banana and oats",
  };

  const meals = mealNames.slice(0, freq).map((name) => ({
    name,
    description: mealSuggestions[name] || "Balanced meal with protein and complex carbs",
    calories: calPerMeal,
  }));

  return { calories, protein, carbs, fat, meals };
}

function generateLifestylePlan(data: OnboardingData) {
  const sleepAdvice =
    data.sleepQuality === "poor"
      ? "Prioritize 7-9 hours of sleep. Establish a consistent bedtime routine: no screens 1 hour before bed, keep room cool and dark."
      : data.sleepQuality === "average"
        ? "Aim for 7-8 hours consistently. Consider a wind-down routine 30 minutes before bed."
        : "Great sleep habits! Maintain your current routine and aim for consistency.";

  const habits: string[] = [];
  if (data.disciplineLevel < 5) habits.push("Start with one small daily habit and build from there");
  if (data.stressLevel === "high") habits.push("Include 10 minutes of daily meditation or deep breathing");
  habits.push("Track your workouts in a journal or app");
  habits.push("Prepare meals in advance for 2-3 days");
  if (data.obstacles.includes("low-motivation")) habits.push("Set weekly micro-goals instead of long-term ones");
  habits.push("Stay hydrated – aim for 2-3 liters of water daily");

  const motivationStrategy =
    data.motivationLevel < 4
      ? "Focus on discipline over motivation. Schedule workouts like appointments. Start with just showing up – even a 15-minute session counts."
      : data.motivationLevel < 7
        ? "Build momentum with small wins. Track progress photos monthly. Find a training partner for accountability."
        : "Channel your motivation into consistency. Set progressive challenges each week. Remember that plateaus are part of the process.";

  const disciplineTips = [
    "Treat your training schedule as non-negotiable",
    "Prepare your gym bag the night before",
    "Remove decision fatigue – follow the plan exactly",
    data.perfectionism === "high"
      ? "Embrace 80% consistency over 100% perfection – done beats perfect"
      : "Focus on showing up consistently, even when it's not perfect",
  ];

  const mindsetShift =
    "Transformation is a marathon, not a sprint. Focus on the process, trust the system, and measure progress in months, not days. Every workout counts, every meal matters, and every good decision compounds over time.";

  return { sleepAdvice, habits, motivationStrategy, disciplineTips, mindsetShift };
}
