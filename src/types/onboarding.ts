// Onboarding form data types
export interface OnboardingData {
  // Personal Data
  age: string;
  height: string;
  weight: string;
  gender: string;
  fitnessLevel: string;
  healthLimitations: string;

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

  // Plan preference
  planStyle: string;
}

export const defaultOnboardingData: OnboardingData = {
  age: "",
  height: "",
  weight: "",
  gender: "",
  fitnessLevel: "",
  healthLimitations: "",
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
  planStyle: "",
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
}

export interface LifestylePlan {
  sleepAdvice: string;
  habits: string[];
  motivationStrategy: string;
  disciplineTips: string[];
  mindsetShift: string;
}

export interface GeneratedPlan {
  trainingSplit: TrainingDay[];
  nutrition: NutritionPlan;
  lifestyle: LifestylePlan;
}
