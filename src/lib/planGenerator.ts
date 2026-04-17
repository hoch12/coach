import { OnboardingData, GeneratedPlan } from "@/types/onboarding";
import { generateTrainingSplit } from "./generators/trainingGenerator";
import { generateNutritionPlan } from "./generators/nutritionGenerator";
import { generateLifestylePlan } from "./generators/lifestyleGenerator";

/**
 * Main plan generation engine.
 * Delegates to specialized generators that use ALL onboarding data
 * for deeply personalized output.
 */
export function generatePlan(data: OnboardingData, lang: string = 'en'): GeneratedPlan {
  const trainingSplit = generateTrainingSplit(data, lang);
  const nutrition = generateNutritionPlan(data, lang);
  const lifestyle = generateLifestylePlan(data, lang);
  return { trainingSplit, nutrition, lifestyle };
}
