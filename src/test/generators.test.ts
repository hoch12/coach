import { describe, it, expect } from "vitest";
import { generateNutritionPlan } from "../lib/generators/nutritionGenerator";
import { generateTrainingSplit } from "../lib/generators/trainingGenerator";
import { OnboardingData } from "../types/onboarding";

// Helper to get minimal onboarding data
const getBaseData = (): OnboardingData => ({
    age: "25",
    height: "180",
    weight: "50", // Extreme underweight
    gender: "male",
    bodyFat: "1", // Impossible but testing the Katch-McArdle logic
    fitnessLevel: "beginner",
    activityLevel: "sedentary",
    fitnessGoals: ["fat-loss", "muscle-gain", "strength"], // Conflicting goals
    dietaryPreference: "omnivore",
    allergies: "none",
    budgetLimitation: "flexible",
    mealFrequency: "3",
    favoriteFoods: "",
    dislikedFoods: "",
    calorieAwareness: "basic",
    planStyle: "structured",
    obstacles: [],
    healthLimitations: "none",
    advantages: ["gym-access"],
    motivationLevel: 5,
    disciplineLevel: 5,
    stressLevel: "low",
    sleepQuality: "good",
    eatingHabits: "structured",
    proactivity: "high",
    selfDevelopment: "high",
    perfectionism: "low",
    trainingFrequency: "1-2 days",
    trainingDuration: "45-60",
});

describe("Generator Logic for Underweight Profiles", () => {
    it("should not give a crazy low BMR for 50kg 180cm 1% BF", () => {
        const data = getBaseData();
        const plan = generateNutritionPlan(data);

        // With 50kg, 180cm, 25yr male:
        // Mifflin = 10*50 + 6.25*180 - 5*25 + 5 = 500 + 1125 - 125 + 5 = 1505
        // Katch (1% BF): LBM = 49.5, BMR = 370 + 21.6 * 49.5 = 1439
        // Max should be 1505.
        // Sedentary (1.2) * 1505 = 1806
        // Since underweight, forces muscle-gain -> surplus of 1.15 (beginner/underweight)
        // Calories ~ 2077

        expect(plan.calories).toBeGreaterThan(2000);
    });

    it("should enforce muscle-gain training plan for underweight user despite conflicting goals", () => {
        const data = getBaseData();
        const split = generateTrainingSplit(data);

        // The frequency function should see 1-2 days and return 2 days
        expect(split.length).toBe(2);

        // Rep ranges should be primary 3-6 because of strength goal priority over muscle-gain
        // The first exercise (index 0) is a warm-up because of structured plan, so we check index 1
        const primaryExercise = split[0].exercises[1];
        expect(primaryExercise.reps).toBe("3-6");
    });
    it("should respect the 'missing-knee' complication by avoiding bilateral standing leg exercises", () => {
        const data = getBaseData();
        data.healthLimitations = "missing-knee";
        data.advantages = ["gym-access"]; // To hit gym branch

        const split = generateTrainingSplit(data);

        let isMissingKneeRespected = true;
        for (const day of split) {
            for (const ex of day.exercises) {
                if (ex.name.includes("Barbell Squat") || ex.name.includes("Walking Lunges") || ex.name.includes("Jump Squats")) {
                    isMissingKneeRespected = false;
                }
            }
        }

        expect(isMissingKneeRespected).toBe(true);
    });

    it("should exclude soy and seafood meals for users with corresponding allergies", () => {
        const data = getBaseData();
        data.allergies = "soy, seafood";

        const plan = generateNutritionPlan(data);
        const stringifiedMeals = JSON.stringify(plan.meals).toLowerCase();

        expect(stringifiedMeals.includes("tofu")).toBe(false);
        expect(stringifiedMeals.includes("tempeh")).toBe(false);
        expect(stringifiedMeals.includes("salmon")).toBe(false);
        expect(stringifiedMeals.includes("tuna")).toBe(false);
    });
});
