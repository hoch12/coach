import { z } from "zod";

// Onboarding form data types
export interface OnboardingData {
  // Personal Data
  age: string;
  height: string;
  weight: string;
  bodyFat: string;
  bodyType: string;
  gender: string;
  fitnessLevel: string;
  healthLimitations: string;
  trainingFrequency: string;
  trainingDuration: string;

  // Goals
  fitnessGoals: string[];

  // Obstacles
  obstacles: string[];

  // Advantages
  advantages: string[];

  // Lifestyle
  disciplineLevel: number;
  motivationLevel: number;
  sleepQuality: string;
  activityLevel: string;
  stressLevel: string;
  proactivity: string;
  selfDevelopment: string;
  perfectionism: string;

  // Nutrition
  dietaryPreference: string;
  allergies: string;
  budgetLimitation: string;
  eatingHabits: string;
  mealFrequency: string;
  calorieAwareness: string;
  favoriteFoods: string;
  dislikedFoods: string;

  // Plan preference
  planStyle: string;

  // Track the application version generated with
  appVersion?: string;
}

export const defaultOnboardingData: OnboardingData = {
  age: "",
  height: "",
  weight: "",
  bodyFat: "",
  bodyType: "",
  gender: "",
  fitnessLevel: "",
  healthLimitations: "",
  trainingFrequency: "3-4 days",
  trainingDuration: "45-60",
  fitnessGoals: [],
  obstacles: [],
  advantages: [],
  disciplineLevel: 5,
  motivationLevel: 5,
  sleepQuality: "",
  activityLevel: "",
  stressLevel: "",
  proactivity: "",
  selfDevelopment: "",
  perfectionism: "",
  dietaryPreference: "",
  allergies: "",
  budgetLimitation: "",
  eatingHabits: "",
  mealFrequency: "",
  calorieAwareness: "",
  favoriteFoods: "",
  dislikedFoods: "",
  planStyle: "",
  appVersion: "1.3.0",
};

// Generated plan types
export interface TrainingDay {
  day: string;
  focus: string;
  exercises: { name: string; sets: number; reps: string; rest: string }[];
}

export interface NutritionPlan {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: { name: string; description: string; calories: number }[];
  tips: string[];
}

export interface LifestylePlan {
  sleepAdvice: string;
  habits: string[];
  motivationStrategy: string;
  disciplineTips: string[];
  mindsetShift: string;
  stressManagement: string[];
  recoveryProtocol: string[];
  weeklyCheckpoints: string[];
}

export interface GeneratedPlan {
  trainingSplit: TrainingDay[];
  nutrition: NutritionPlan;
  lifestyle: LifestylePlan;
}

export const step0Schema = z.object({
  age: z.coerce.number().min(10, "errAgeMin").max(120, "errAgeMax"),
  height: z.coerce.number().min(80, "errHeightMin").max(250, "errHeightMax"),
  weight: z.coerce.number().min(30, "errWeightMin").max(300, "errWeightMax"),
  bodyFat: z.string().optional(),
  gender: z.string().min(1, "errSelectGender"),
  fitnessLevel: z.string().min(1, "errSelectFitnessLevel"),
  healthLimitations: z.string().max(300, "errLongDescription"),
});

export const step1Schema = z.object({
  fitnessGoals: z.array(z.string()).min(1, "errSelectGoal"),
});

export const step2Schema = z.object({
  obstacles: z.array(z.string()),
  advantages: z.array(z.string()),
});

export const step3Schema = z.object({
  disciplineLevel: z.number().min(1).max(10),
  motivationLevel: z.number().min(1).max(10),
  sleepQuality: z.string().min(1, "errSelectSleepQuality"),
  activityLevel: z.string().min(1, "errSelectActivityLevel"),
  stressLevel: z.string().min(1, "errSelectStressLevel"),
  proactivity: z.string().min(1, "errSelectProactivity"),
  selfDevelopment: z.string().max(150, "errInputTooLong"),
  perfectionism: z.string().max(150, "errInputTooLong"),
  trainingFrequency: z.string().optional().default("3-4 days"),
  trainingDuration: z.string().optional().default("45-60"),
});

export const step4Schema = z.object({
  dietaryPreference: z.string().min(1, "errSelectDietaryPref"),
  allergies: z.string().max(150, "errLongDescription"),
  budgetLimitation: z.string().min(1, "errSelectBudget"),
  eatingHabits: z.string().min(1, "errSelectEatingHabits"),
  mealFrequency: z.string().min(1, "errSelectMealFreq"),
  calorieAwareness: z.string().min(1, "errSelectCalorieAwareness"),
  favoriteFoods: z.string().max(150, "errLongDescription"),
  dislikedFoods: z.string().max(150, "errLongDescription"),
});

export const step5Schema = z.object({
  planStyle: z.string().min(1, "errSelectPlanStyle"),
});

export const validateStepData = (step: number, data: any) => {
  try {
    switch (step) {
      case 0: step0Schema.parse(data); break;
      case 1: step1Schema.parse(data); break;
      case 2: step2Schema.parse(data); break;
      case 3: step3Schema.parse(data); break;
      case 4: step4Schema.parse(data); break;
      case 5: step5Schema.parse(data); break;
    }
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    return { success: false, message: "Invalid input" };
  }
};
