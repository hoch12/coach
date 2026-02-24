import { OnboardingData, GeneratedPlan } from "@/types/onboarding";
import { generateTrainingSplit } from "./generators/trainingGenerator";
import { generateNutritionPlan } from "./generators/nutritionGenerator";
import { generateLifestylePlan } from "./generators/lifestyleGenerator";

/**
 * Main plan generation engine.
 * Delegates to specialized generators that use ALL onboarding data
 * for deeply personalized output.
 */
export function generatePlan(data: OnboardingData): GeneratedPlan {
  const trainingSplit = generateTrainingSplit(data);
  const nutrition = generateNutritionPlan(data);
  const lifestyle = generateLifestylePlan(data);
  return { trainingSplit, nutrition, lifestyle };
}
