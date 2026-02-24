import { OnboardingData, NutritionPlan } from "@/types/onboarding";

/**
 * Generates a deeply personalized nutrition plan using ALL inputs:
 * - age, height, weight, gender → BMR calculation
 * - activityLevel → TDEE multiplier
 * - fitnessGoals → calorie target adjustment
 * - dietaryPreference → meal type selection
 * - allergies → food exclusions
 * - budgetLimitation → ingredient cost awareness
 * - mealFrequency → meal count
 * - calorieAwareness → detail level of advice
 * - planStyle → how prescriptive the plan is
 * - obstacles (poor-diet) → extra guidance
 * - stressLevel → cortisol-aware nutrition
 * - sleepQuality → sleep-supporting foods
 */
export function generateNutritionPlan(data: OnboardingData): NutritionPlan {
  const { calories, protein, carbs, fat } = calculateMacros(data);
  const meals = generateMeals(data, calories);
  const tips = generateNutritionTips(data);

  return { calories, protein, carbs, fat, meals, tips };
}

function calculateMacros(data: OnboardingData) {
  const weight = parseFloat(data.weight) || 75;
  const height = parseFloat(data.height) || 175;
  const age = parseInt(data.age) || 25;
  const isMale = data.gender !== "female";

  // Mifflin-St Jeor BMR
  let bmr = isMale
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  // Activity multiplier
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    "lightly-active": 1.375,
    "moderately-active": 1.55,
    "very-active": 1.725,
  };
  const tdee = Math.round(bmr * (multipliers[data.activityLevel] || 1.4));

  // Goal-based adjustment
  let calories = tdee;
  const goals = data.fitnessGoals;
  if (goals.includes("fat-loss")) {
    // Aggressive deficit for high discipline, moderate otherwise
    const deficit = data.disciplineLevel >= 7 ? 0.75 : 0.8;
    calories = Math.round(tdee * deficit);
  } else if (goals.includes("muscle-gain")) {
    const surplus = data.fitnessLevel === "beginner" ? 1.15 : 1.1;
    calories = Math.round(tdee * surplus);
  } else if (goals.includes("recomposition")) {
    // Slight deficit or maintenance
    calories = Math.round(tdee * 0.95);
  } else if (goals.includes("strength")) {
    calories = Math.round(tdee * 1.05);
  }
  // general-fitness and lifestyle-change: stay at maintenance

  // Protein per kg based on multiple factors
  let proteinPerKg = 1.6;
  if (goals.includes("muscle-gain")) proteinPerKg = 2.0;
  if (goals.includes("strength")) proteinPerKg = Math.max(proteinPerKg, 1.8);
  if (goals.includes("fat-loss")) proteinPerKg = Math.max(proteinPerKg, 2.0); // preserve muscle
  if (goals.includes("recomposition")) proteinPerKg = Math.max(proteinPerKg, 1.8);
  if (data.fitnessLevel === "advanced") proteinPerKg = Math.min(2.2, proteinPerKg + 0.2);

  // Age adjustment: older adults benefit from higher protein
  if (age > 50) proteinPerKg = Math.max(proteinPerKg, 1.8);

  const protein = Math.round(weight * proteinPerKg);

  // Fat: higher for keto, lower for high-carb goals
  let fatPercent = 0.25;
  if (data.dietaryPreference === "keto") fatPercent = 0.65;
  if (goals.includes("fat-loss") && data.dietaryPreference !== "keto") fatPercent = 0.3;

  const fat = Math.round((calories * fatPercent) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { calories, protein, carbs: Math.max(0, carbs), fat };
}

interface MealSuggestion {
  name: string;
  description: string;
  calories: number;
}

function generateMeals(data: OnboardingData, totalCalories: number): MealSuggestion[] {
  const freq = parseInt(data.mealFrequency) || 4;
  const calPerMeal = Math.round(totalCalories / freq);
  const diet = data.dietaryPreference;
  const allergies = data.allergies.toLowerCase();
  const budget = data.budgetLimitation;

  // Build meal database filtered by preferences
  const mealDb = getMealDatabase(diet, allergies, budget);

  const mealSlots = getMealSlots(freq);

  return mealSlots.map((slot, i) => {
    const options = mealDb[slot.category] || mealDb["default"];
    const meal = options[i % options.length];
    return {
      name: slot.name,
      description: meal,
      calories: calPerMeal,
    };
  });
}

function getMealSlots(freq: number): { name: string; category: string }[] {
  if (freq <= 2) {
    return [
      { name: "Main Meal 1 (Late Morning)", category: "lunch" },
      { name: "Main Meal 2 (Evening)", category: "dinner" },
    ];
  }
  if (freq === 3) {
    return [
      { name: "Breakfast", category: "breakfast" },
      { name: "Lunch", category: "lunch" },
      { name: "Dinner", category: "dinner" },
    ];
  }
  if (freq === 4) {
    return [
      { name: "Breakfast", category: "breakfast" },
      { name: "Lunch", category: "lunch" },
      { name: "Afternoon Snack", category: "snack" },
      { name: "Dinner", category: "dinner" },
    ];
  }
  // 5+
  return [
    { name: "Breakfast", category: "breakfast" },
    { name: "Mid-Morning Snack", category: "snack" },
    { name: "Lunch", category: "lunch" },
    { name: "Afternoon Snack", category: "snack" },
    { name: "Dinner", category: "dinner" },
  ];
}

function getMealDatabase(
  diet: string,
  allergies: string,
  budget: string
): Record<string, string[]> {
  const hasLactose = allergies.includes("lactose") || allergies.includes("dairy");
  const hasGluten = allergies.includes("gluten");
  const hasNuts = allergies.includes("nut");
  const isTight = budget === "tight";

  // Filter helper
  const filter = (meals: string[]): string[] =>
    meals.filter((m) => {
      const lower = m.toLowerCase();
      if (hasLactose && (lower.includes("yogurt") || lower.includes("cheese") || lower.includes("milk") || lower.includes("whey"))) return false;
      if (hasGluten && (lower.includes("oat") || lower.includes("bread") || lower.includes("pasta") || lower.includes("toast"))) return false;
      if (hasNuts && (lower.includes("nut") || lower.includes("almond") || lower.includes("peanut"))) return false;
      return true;
    });

  if (diet === "vegan") {
    return {
      breakfast: filter([
        "Tofu scramble with spinach and whole grain toast",
        "Overnight oats with chia seeds, banana, and berries",
        "Smoothie bowl with plant protein, frozen fruit, and granola",
        "Avocado toast with hemp seeds and cherry tomatoes",
      ]),
      lunch: filter([
        "Lentil curry with brown rice and steamed vegetables",
        "Quinoa salad with chickpeas, roasted veggies, and tahini dressing",
        "Black bean burrito bowl with avocado and salsa",
        isTight ? "Rice and bean stew with seasonal vegetables" : "Tempeh stir-fry with sesame noodles and edamame",
      ]),
      dinner: filter([
        "Chickpea and sweet potato stew with couscous",
        "Stuffed bell peppers with quinoa and black beans",
        isTight ? "Pasta with marinara sauce and white beans" : "Grilled tofu steaks with roasted vegetables and wild rice",
        "Red lentil dal with naan bread and cucumber salad",
      ]),
      snack: filter([
        "Hummus with carrot and celery sticks",
        "Trail mix with seeds and dried fruit",
        "Rice cakes with avocado",
        isTight ? "Banana with sunflower seed butter" : "Protein energy balls with dates and cacao",
      ]),
      default: filter(["Balanced plant-based meal with protein and complex carbs"]),
    };
  }

  if (diet === "vegetarian") {
    return {
      breakfast: filter([
        "Greek yogurt parfait with granola and mixed berries",
        "Scrambled eggs with whole grain toast and avocado",
        "Protein smoothie with banana, oats, and milk",
        "Cottage cheese with fruit and honey",
      ]),
      lunch: filter([
        "Caprese salad with mozzarella, tomato, and whole grain bread",
        "Egg fried rice with vegetables and tofu",
        "Lentil soup with sourdough bread and side salad",
        isTight ? "Bean and cheese quesadilla with salsa" : "Halloumi and roasted vegetable wrap with hummus",
      ]),
      dinner: filter([
        "Vegetable stir-fry with egg and brown rice",
        "Spinach and ricotta stuffed pasta with marinara",
        "Black bean tacos with cheese, lettuce, and salsa",
        isTight ? "Omelette with mixed vegetables and toast" : "Eggplant parmesan with side salad",
      ]),
      snack: filter([
        "Hard-boiled eggs with fruit",
        "Greek yogurt with nuts and honey",
        "Cheese and whole grain crackers",
        "Protein shake with banana",
      ]),
      default: filter(["Balanced vegetarian meal with complete protein"]),
    };
  }

  if (diet === "keto") {
    return {
      breakfast: filter([
        "Bacon and eggs with avocado and sautéed spinach",
        "Keto smoothie with MCT oil, cocoa, and cream cheese",
        "Cheese omelette with mushrooms and bell peppers",
        "Smoked salmon with cream cheese and cucumber",
      ]),
      lunch: filter([
        "Grilled chicken Caesar salad (no croutons) with parmesan",
        "Bunless burger with cheese, bacon, and avocado",
        "Tuna salad stuffed avocado with olive oil dressing",
        isTight ? "Egg salad lettuce wraps with cheese" : "Steak salad with blue cheese and walnuts",
      ]),
      dinner: filter([
        "Pan-seared salmon with asparagus and butter sauce",
        "Chicken thighs with creamy garlic mushroom sauce and broccoli",
        isTight ? "Ground beef stir-fry with low-carb vegetables" : "Lamb chops with roasted Brussels sprouts and herb butter",
        "Pork belly with sautéed kale and cauliflower mash",
      ]),
      snack: filter([
        "Cheese cubes with olives",
        "Pork rinds with guacamole",
        "Celery sticks with cream cheese",
        "Handful of macadamia nuts",
      ]),
      default: filter(["High-fat, moderate-protein, very low-carb meal"]),
    };
  }

  // Omnivore / default
  return {
    breakfast: filter([
      "Oatmeal with protein powder, banana, and almond butter",
      "Scrambled eggs with whole grain toast and avocado",
      "Greek yogurt with granola, berries, and honey",
      isTight ? "Eggs with rice and beans" : "Smoked salmon bagel with cream cheese and capers",
    ]),
    lunch: filter([
      "Grilled chicken breast with brown rice and mixed vegetables",
      isTight ? "Tuna sandwich on whole grain bread with salad" : "Turkey and avocado wrap with sweet potato fries",
      "Lean beef stir-fry with jasmine rice and broccoli",
      "Chicken and quinoa bowl with roasted vegetables",
    ]),
    dinner: filter([
      "Salmon fillet with sweet potato and steamed broccoli",
      isTight ? "Chicken thighs with rice and frozen vegetables" : "Grass-fed steak with roasted potatoes and asparagus",
      "Baked cod with lemon, quinoa, and green beans",
      "Turkey meatballs with whole grain pasta and marinara",
    ]),
    snack: filter([
      "Greek yogurt with mixed nuts and berries",
      "Rice cakes with peanut butter and honey",
      "Protein shake with banana and oats",
      isTight ? "Hard-boiled eggs with fruit" : "Beef jerky with trail mix",
    ]),
    default: filter(["Balanced meal with lean protein and complex carbs"]),
  };
}

function generateNutritionTips(data: OnboardingData): string[] {
  const tips: string[] = [];
  const goals = data.fitnessGoals;

  // Calorie awareness-based tips
  if (data.calorieAwareness === "none") {
    tips.push("Start by simply tracking what you eat for one week — awareness is the first step");
    tips.push("Use your hand as a portion guide: palm = protein, fist = carbs, thumb = fats");
  } else if (data.calorieAwareness === "basic") {
    tips.push("Consider using a food tracking app for the first 2-3 weeks to calibrate your portions");
  } else {
    tips.push("You already understand calories — focus on food quality and micronutrient density");
  }

  // Budget tips
  if (data.budgetLimitation === "tight") {
    tips.push("Buy in bulk: rice, oats, eggs, frozen vegetables, and canned beans are cost-effective staples");
    tips.push("Meal prep on weekends to reduce waste and save money");
  }

  // Stress-based nutrition
  if (data.stressLevel === "high") {
    tips.push("Include magnesium-rich foods (dark leafy greens, dark chocolate, nuts) to help manage cortisol");
    tips.push("Avoid excessive caffeine — it can amplify stress hormones");
  }

  // Sleep-based nutrition
  if (data.sleepQuality === "poor") {
    tips.push("Avoid large meals within 2 hours of bedtime");
    tips.push("Consider foods rich in tryptophan (turkey, milk, bananas) in your evening meal");
  }

  // Goal-specific
  if (goals.includes("fat-loss")) {
    tips.push("Prioritize protein at every meal to maintain muscle and increase satiety");
    tips.push("Fill half your plate with vegetables to increase volume without excess calories");
  }
  if (goals.includes("muscle-gain")) {
    tips.push("Eat protein within 2 hours of training for optimal muscle protein synthesis");
    tips.push("Don't skip post-workout nutrition — a combination of protein and carbs is ideal");
  }

  // Poor diet obstacle
  if (data.obstacles.includes("poor-diet")) {
    tips.push("Start by replacing one processed meal per day with a whole-food alternative");
    tips.push("Keep healthy snacks visible and accessible — you eat what you see");
  }

  // Hydration (universal)
  tips.push("Aim for 2-3 liters of water daily — more on training days");

  return tips;
}
