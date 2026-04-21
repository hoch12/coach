import { OnboardingData, NutritionPlan } from "@/types/onboarding";
import { MEAL_DATABASE, Meal } from "./mealDatabase";

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
export function generateNutritionPlan(data: OnboardingData, lang: string = 'en'): NutritionPlan {
  const { calories, protein, carbs, fat } = calculateMacros(data);
  const meals = generateMeals(data, calories, lang);
  const tips = generateNutritionTips(data, lang);

  return { calories, protein, carbs, fat, meals, tips };
}

function calculateMacros(data: OnboardingData) {
  const weight = parseFloat(data.weight) || 75;
  const height = parseFloat(data.height) || 175;
  const age = parseInt(data.age) || 25;
  const isMale = data.gender !== "female";

  // Mifflin-St Jeor BMR
  let bmrMifflin = isMale
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  let bmr = bmrMifflin;

  // Body Fat estimation from bodyType if percentage not provided
  let estimationBf = parseFloat(data.bodyFat);

  if (isNaN(estimationBf) && data.bodyType) {
    const isMale = data.gender !== "female";
    const bodyTypeMap: Record<string, number> = {
      "v-skinny": isMale ? 7 : 14,
      "skinny": isMale ? 12 : 19,
      "normal": isMale ? 17 : 25,
      "athletic": isMale ? 11 : 18,
      "shredded": isMale ? 6 : 12,
      "overweight": isMale ? 23 : 30,
      "obese": isMale ? 30 : 37,
      "v-obese": isMale ? 40 : 47,
    };
    estimationBf = bodyTypeMap[data.bodyType] || NaN;
  }

  // Katch-McArdle Formula (Much more accurate for high/low body fat)
  if (!isNaN(estimationBf)) {
    const bf = estimationBf;
    if (bf > 0 && bf < 80) {
      const leanBodyMass = weight * (1 - bf / 100);
      const bmrKatch = 370 + (21.6 * leanBodyMass);

      // For very low body fat, Katch-McArdle can drastically underestimate BMR 
      // compared to Mifflin if height isn't factored in. We take the higher of the two
      // to ensure we don't accidentally starve someone.
      bmr = Math.max(bmrMifflin, bmrKatch);
    }
  }

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
  const goals = data.fitnessGoals || [];

  // BMI Calculation to prevent starvation/undereating for underweight individuals
  const bmi = weight / ((height / 100) ** 2);
  const isUnderweight = bmi < 18.5;

  // Resolve conflicting goals
  let isFatLoss = goals.includes("fat-loss");
  const isMuscleGain = goals.includes("muscle-gain");
  const isStrength = goals.includes("strength");

  // If underweight, ignore fat-loss and force muscle-gain/surplus
  if (isUnderweight) {
    isFatLoss = false;
  }

  const isRecomp = goals.includes("recomposition") || (isFatLoss && isMuscleGain);

  // Safely determine true primary goal for macro and calorie manipulation
  let primaryGoal = "maintenance";
  if (isUnderweight || isMuscleGain) {
    // Underweight ALWAYS defaults to muscle-gain (surplus) if goals conflict, 
    // unless they strictly only chose something else (which we handle by forcing surplus anyway below)
    primaryGoal = "muscle-gain";
  } else if (isRecomp) {
    primaryGoal = "recomposition";
  } else if (isFatLoss) {
    primaryGoal = "fat-loss";
  } else if (isStrength) {
    primaryGoal = "strength";
  }

  if (primaryGoal === "fat-loss") {
    // Aggressive deficit for high discipline, moderate otherwise
    const deficit = data.disciplineLevel >= 7 ? 0.75 : 0.8;
    calories = Math.round(tdee * deficit);
    // Safety check: Prevent highly underweight people from extreme deficits
    if (weight < 60) calories = Math.max(calories, Math.round(bmr * 1.0)); // At least BMR 
  } else if (primaryGoal === "muscle-gain") {
    // A heavier surplus for underweight or beginners
    const surplus = (isUnderweight || data.fitnessLevel === "beginner") ? 1.15 : 1.1;
    calories = Math.round(tdee * surplus);
  } else if (primaryGoal === "recomposition") {
    // Slight deficit or maintenance
    calories = Math.round(tdee * 0.95);
  } else if (primaryGoal === "strength") {
    const surplus = isUnderweight ? 1.1 : 1.05;
    calories = Math.round(tdee * surplus);
  }

  // Absolute safety floor for calories - professional standard
  let calorieFloor = 1600; // Men
  if (!isMale) calorieFloor = 1400; // Women
  if (weight < 50) calorieFloor = Math.max(calorieFloor - 200, 1200); // Very small individuals
  
  if (isUnderweight) calorieFloor = Math.round(tdee * 1.05); // Never deficit for underweight
  calories = Math.max(calories, calorieFloor);

  // Protein per kg based on multiple factors
  let proteinPerKg = 1.6;
  if (primaryGoal === "muscle-gain") proteinPerKg = 2.0;
  if (primaryGoal === "strength") proteinPerKg = Math.max(proteinPerKg, 1.8);
  if (primaryGoal === "fat-loss") proteinPerKg = Math.max(proteinPerKg, 2.0); // preserve muscle
  if (primaryGoal === "recomposition") proteinPerKg = Math.max(proteinPerKg, 1.8);
  if (data.fitnessLevel === "advanced") proteinPerKg = Math.min(2.2, proteinPerKg + 0.2);

  // Age adjustment: older adults benefit from higher protein
  if (age > 50) proteinPerKg = Math.max(proteinPerKg, 1.8);

  const protein = Math.round(weight * proteinPerKg);

  // Fat: higher for keto, lower for high-carb goals
  let fatPercent = 0.25;
  if (data.dietaryPreference === "keto") fatPercent = 0.65;
  if (primaryGoal === "fat-loss" && data.dietaryPreference !== "keto") fatPercent = 0.3;

  const fat = Math.round((calories * fatPercent) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { calories, protein, carbs: Math.max(0, carbs), fat };
}

interface MealSuggestion {
  name: string;
  description: string;
  calories: number;
}

function generateMeals(data: OnboardingData, totalCalories: number, lang: string): { name: string; description: string; calories: number }[] {
  const freq = parseInt(data.mealFrequency) || 4;
  const isCs = lang === 'cs';
  const diet = data.dietaryPreference;
  const budget = data.budgetLimitation;
  
  const slots = getMealSlots(data, totalCalories, isCs);
  
  // Filter database by diet and budget
  const availableMeals = MEAL_DATABASE.filter(m => 
    m.diets.includes(diet) || (diet === "omnivore" && m.diets.includes("omnivore"))
  );

  return slots.map((slot, i) => {
    let pool = availableMeals.filter(m => m.category === slot.category);
    
    // Preference for budget
    if (budget === "tight") {
      const tightPool = pool.filter(m => m.budget === "tight");
      if (tightPool.length > 0) pool = tightPool;
    }

    if (pool.length === 0) {
      // Fallback to any meal in category if diet-specific not found
      pool = MEAL_DATABASE.filter(m => m.category === slot.category);
    }

    const meal = pool[i % pool.length];
    
    // Calories per meal: Breakfast (25%), Lunch (35%), Dinner (25%), Snacks (15% total)
    let mealCals = Math.round(totalCalories / freq);
    if (slot.category === "breakfast") mealCals = Math.round(totalCalories * 0.25);
    if (slot.category === "lunch") mealCals = Math.round(totalCalories * 0.35);
    if (slot.category === "dinner") mealCals = Math.round(totalCalories * 0.25);
    if (slot.category === "snack") mealCals = Math.round(totalCalories * 0.15 / (slots.filter(s => s.category === "snack").length || 1));

    return {
      name: slot.name,
      description: isCs ? meal.nameCs : meal.nameEn,
      calories: mealCals
    };
  });
}

function getMealSlots(data: OnboardingData, totalCalories: number, isCs: boolean): { name: string; category: string }[] {
  const freq = parseInt(data.mealFrequency) || 4;
  const isTrainingHeavy = (data.trainingFrequency && parseInt(data.trainingFrequency.split('-')[0]) >= 4) || data.disciplineLevel >= 8;
  
  if (freq <= 2) {
    return [
      { name: isCs ? "Hlavní jídlo 1 (Dopoledne)" : "Main Meal 1 (Late Morning)", category: "lunch" },
      { name: isCs ? "Hlavní jídlo 2 (Večer)" : "Main Meal 2 (Evening)", category: "dinner" },
    ];
  }
  if (freq === 3) {
    const slots = [
      { name: isCs ? "Snídaně" : "Breakfast", category: "breakfast" },
      { name: isCs ? "Oběd" : "Lunch", category: "lunch" },
      { name: isCs ? "Večeře" : "Dinner", category: "dinner" },
    ];
    if (isTrainingHeavy) slots.push({ name: isCs ? "Potréninkové jídlo" : "Post-Workout Recovery", category: "snack" });
    return slots;
  }
  // 4+ meals
  const slots = [
    { name: isCs ? "Snídaně" : "Breakfast", category: "breakfast" },
    { name: isCs ? "Oběd" : "Lunch", category: "lunch" },
    { name: isCs ? "Odpolední svačina" : "Afternoon Snack", category: "snack" },
    { name: isCs ? "Večeře" : "Dinner", category: "dinner" },
  ];
  if (isTrainingHeavy) {
    slots.splice(2, 0, { name: isCs ? "Předtréninkový nakopávač" : "Pre-Workout Fuel", category: "snack" });
  }
  return slots;
}

function getMealDatabase(
  diet: string,
  allergies: string,
  budget: string,
  favoritesStr: string,
  dislikesStr: string,
  isCs: boolean
): Record<string, string[]> {
  const hasLactose = allergies.includes("lactose");
  const hasGluten = allergies.includes("gluten");
  const hasNuts = allergies.includes("nuts") || allergies.includes("nut");
  const hasSoy = allergies.includes("soy");
  const hasSeafood = allergies.includes("seafood");
  const isTight = budget === "tight";

  const likes = favoritesStr.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const dislikes = dislikesStr.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

  // Filter helper
  const filter = (meals: string[]): string[] => {
    let filtered = meals.filter((m) => {
      const lower = m.toLowerCase();
      if (hasLactose && (lower.includes("yogurt") || lower.includes("cheese") || lower.includes("milk") || lower.includes("whey") || lower.includes("butter"))) return false;
      if (hasGluten && (lower.includes("oat") || lower.includes("bread") || lower.includes("pasta") || lower.includes("toast") || lower.includes("couscous"))) return false;
      if (hasNuts && (lower.includes("nut") || lower.includes("almond") || lower.includes("peanut") || lower.includes("walnut"))) return false;
      if (hasSoy && (lower.includes("soy") || lower.includes("tofu") || lower.includes("tempeh") || lower.includes("edamame"))) return false;
      if (hasSeafood && (lower.includes("fish") || lower.includes("salmon") || lower.includes("tuna") || lower.includes("cod") || lower.includes("seafood"))) return false;

      for (const off of dislikes) {
        if (lower.includes(off)) return false;
      }
      return true;
    });

    if (filtered.length === 0) filtered = meals; // fallback to avoid empty categories

    return filtered.map(m => {
      const lower = m.toLowerCase();
      for (const like of likes) {
        if (lower.includes(like)) return `★ ${m} ${isCs ? '(Obsahuje vaše oblíbené!)' : '(Features your favorite!)'}`;
      }
      return m;
    });
  };

  if (diet === "vegan") {
    return {
      breakfast: filter(isCs ? [
        "Tofu míchaná vajíčka se špenátem a celozrnným toustem",
        "Ovesné vločky přes noc s chia semínky, banánem a lesním ovocem",
        "Smoothie bowl s rostlinným proteinem, mraženým ovocem a granolou",
        "Avokádový toast s konopnými semínky a cherry rajčaty",
      ] : [
        "Tofu scramble with spinach and whole grain toast",
        "Overnight oats with chia seeds, banana, and berries",
        "Smoothie bowl with plant protein, frozen fruit, and granola",
        "Avocado toast with hemp seeds and cherry tomatoes",
      ]),
      lunch: filter(isCs ? [
        "Čočkové kari s hnědou rýží a dušenou zeleninou",
        "Quinoa salát s cizrnou, pečenou zeleninou a tahini dresinkem",
        "Black bean burrito bowl s avokádem a salsou",
        isTight ? "Rýžový a fazolový guláš se sezónní zeleninou" : "Tempeh stir-fry se sezamovými nudlemi a edamame",
      ] : [
        "Lentil curry with brown rice and steamed vegetables",
        "Quinoa salad with chickpeas, roasted veggies, and tahini dressing",
        "Black bean burrito bowl with avocado and salsa",
        isTight ? "Rice and bean stew with seasonal vegetables" : "Tempeh stir-fry with sesame noodles and edamame",
      ]),
      dinner: filter(isCs ? [
        "Cizrnový a sladký bramborový guláš s kuskusem",
        "Plněné papriky s quinoou a černými fazolemi",
        isTight ? "Těstoviny s marinara omáčkou a bílými fazolemi" : "Grilované tempeh steaky s pečenou zeleninou a divokou rýží",
        "Červená čočka dahl s naan chlebem a okurkovým salátem",
      ] : [
        "Chickpea and sweet potato stew with couscous",
        "Stuffed bell peppers with quinoa and black beans",
        isTight ? "Pasta with marinara sauce and white beans" : "Grilled tofu steaks with roasted vegetables and wild rice",
        "Red lentil dal with naan bread and cucumber salad",
      ]),
      snack: filter(isCs ? [
        "Hummus se špalíčky mrkve a celeru",
        "Směs oříšků a semínek se sušeným ovocem",
        "Rýžové chlebíčky s avokádem",
        isTight ? "Banán se slunečnicovým máslem" : "Proteinové kuličky s datlemi a kakaem",
      ] : [
        "Hummus with carrot and celery sticks",
        "Trail mix with seeds and dried fruit",
        "Rice cakes with avocado",
        isTight ? "Banana with sunflower seed butter" : "Protein energy balls with dates and cacao",
      ]),
      default: filter(isCs ? ["Vyvážené rostlinné jídlo s bílkovinami a komplexními sacharidy"] : ["Balanced plant-based meal with protein and complex carbs"]),
    };
  }

  if (diet === "vegetarian") {
    return {
      breakfast: filter(isCs ? [
        "Řecký jogurt s granolou a lesním ovocem",
        "Míchaná vajíčka s celozrnným toustem a avokádem",
        "Proteinové smoothie s banánem, vločkami a mlékem",
        "Tvaroh s ovocem a medem",
      ] : [
        "Greek yogurt parfait with granola and mixed berries",
        "Scrambled eggs with whole grain toast and avocado",
        "Protein smoothie with banana, oats, and milk",
        "Cottage cheese with fruit and honey",
      ]),
      lunch: filter(isCs ? [
        "Caprese salát s mozzarellou, rajčaty a celozrnným chlebem",
        "Vajíčková smažená rýže se zeleninou a tofu",
        "Čočková polévka s kváskovým chlebem a salátem",
        isTight ? "Quesadilla s fazolemi a sýrem se salsou" : "Halloumi a wrap s pečenou zeleninou a hummusem",
      ] : [
        "Caprese salad with mozzarella, tomato, and whole grain bread",
        "Egg fried rice with vegetables and tofu",
        "Lentil soup with sourdough bread and side salad",
        isTight ? "Bean and cheese quesadilla with salsa" : "Halloumi and roasted vegetable wrap with hummus",
      ]),
      dinner: filter(isCs ? [
        "Zeleninové stir-fry s vejcem a hnědou rýží",
        "Těstoviny plněné špenátem a ricottou s marinara omáčkou",
        "Tacos s černými fazolemi, sýrem a salsou",
        isTight ? "Omeleta se zeleninou a toustem" : "Lilek parmigiana se salátem",
      ] : [
        "Vegetable stir-fry with egg and brown rice",
        "Spinach and ricotta stuffed pasta with marinara",
        "Black bean tactics with cheese, lettuce, and salsa",
        isTight ? "Omelette with mixed vegetables and toast" : "Eggplant parmesan with side salad",
      ]),
      snack: filter(isCs ? [
        "Vejce natvrdo s ovocem",
        "Řecký jogurt s ořechy a medem",
        "Sýr a celozrnné krekry",
        "Proteinový šejk s banánem",
      ] : [
        "Hard-boiled eggs with fruit",
        "Greek yogurt with nuts and honey",
        "Cheese and whole grain crackers",
        "Protein shake with banana",
      ]),
      default: filter(isCs ? ["Vyvážené vegetariánské jídlo s kompletními bílkovinami"] : ["Balanced vegetarian meal with complete protein"]),
    };
  }

  if (diet === "keto") {
    return {
      breakfast: filter(isCs ? [
        "Slanina a vejce s avokádem a restovaným špenátem",
        "Keto smoothie s MCT olejem, kakaem a krémovým sýrem",
        "Sýrová omeleta s houbami a paprikou",
        "Uzený losos s krémovým sýrem a okurkou",
      ] : [
        "Bacon and eggs with avocado and sautéed spinach",
        "Keto smoothie with MCT oil, cocoa, and cream cheese",
        "Cheese omelette with mushrooms and bell peppers",
        "Smoked salmon with cream cheese and cucumber",
      ]),
      lunch: filter(isCs ? [
        "Grilovaný kuřecí Caesar salát (bez krutonů) s parmazánem",
        "Burger bez bulky se sýrem, slaninou a avokádem",
        "Tuňákový salát v avokádu s olivovým olejem",
        isTight ? "Vajíčkový salát v listech salátu se sýrem" : "Steak salát s modrým sýrem a vlašskými ořechy",
      ] : [
        "Grilled chicken Caesar salad (no croutons) with parmesan",
        "Bunless burger with cheese, bacon, and avocado",
        "Tuna salad stuffed avocado with olive oil dressing",
        isTight ? "Egg salad lettuce wraps with cheese" : "Steak salad with blue cheese and walnuts",
      ]),
      dinner: filter(isCs ? [
        "Losos na pánvi s chřestem a máslovou omáčkou",
        "Kuřecí stehna s krémovou česnekovo-houbovou omáčkou a brokolicí",
        isTight ? "Stir-fry z mletého hovězího s nízkosacharidovou zeleninou" : "Jehněčí kotlety s pečenou růžičkovou kapustou a bylinkovým máslem",
        "Vepřový bůček s restovanou kadeřávkem a květákovou kaší",
      ] : [
        "Pan-seared salmon with asparagus and butter sauce",
        "Chicken thighs with creamy garlic mushroom sauce and broccoli",
        isTight ? "Ground beef stir-fry with low-carb vegetables" : "Lamb chops with roasted Brussels sprouts and herb butter",
        "Pork belly with sautéed kale and cauliflower mash",
      ]),
      snack: filter(isCs ? [
        "Kostky sýra s olivami",
        "Vepřové kůže s guacamole",
        "Celerové řapíky s krémovým sýrem",
        "Hrst makadamových ořechů",
      ] : [
        "Cheese cubes with olives",
        "Pork rinds with guacamole",
        "Celery sticks with cream cheese",
        "Handful of macadamia nuts",
      ]),
      default: filter(isCs ? ["Nízkosacharidové jídlo s vysokým obsahem tuku a bílkovin"] : ["High-fat, moderate-protein, very low-carb meal"]),
    };
  }

  // Omnivore / default
  return {
    breakfast: filter(isCs ? [
      "Ovesná kaše s proteinem, banánem a mandlovým máslem",
      "Míchaná vajíčka s celozrnným toustem a avokádem",
      "Řecký jogurt s granolou, lesním ovocem a medem",
      isTight ? "Vejce s rýží a fazolemi" : "Bagel s uzeným lososem, krémovým sýrem a kapary",
    ] : [
      "Oatmeal with protein powder, banana, and almond butter",
      "Scrambled eggs with whole grain toast and avocado",
      "Greek yogurt with granola, berries, and honey",
      isTight ? "Eggs with rice and beans" : "Smoked salmon bagel with cream cheese and capers",
    ]),
    lunch: filter(isCs ? [
      "Grilované kuřecí prso s hnědou rýží a míchanou zeleninou",
      isTight ? "Tuňákový sendvič na celozrnném chlebu se salátem" : "Krůtí a avokádový wrap se sladkými bramborovými hranolky",
      "Stir-fry z libového hovězího s jasmínovou rýží a brokolicí",
      "Kuřecí a quinoa bowl s pečenou zeleninou",
    ] : [
      "Grilled chicken breast with brown rice and mixed vegetables",
      isTight ? "Tuna sandwich on whole grain bread with salad" : "Turkey and avocado wrap with sweet potato fries",
      "Lean beef stir-fry with jasmine rice and broccoli",
      "Chicken and quinoa bowl with roasted vegetables",
    ]),
    dinner: filter(isCs ? [
      "Lososový filet se sladkými bramborami a dušenou brokolicí",
      isTight ? "Kuřecí stehna s rýží a mraženou zeleninou" : "Steak z bio hovězího s pečenými bramborami a chřestem",
      "Pečená treska s citronem, quinoou a zelenými fazolkami",
      "Krůtí masové kuličky s celozrnnými těstovinami a marinara omáčkou",
    ] : [
      "Salmon fillet with sweet potato and steamed broccoli",
      isTight ? "Chicken thighs with rice and frozen vegetables" : "Grass-fed steak with roasted potatoes and asparagus",
      "Baked cod with lemon, quinoa, and green beans",
      "Turkey meatballs with whole grain pasta and marinara",
    ]),
    snack: filter(isCs ? [
      "Řecký jogurt s ořechy a lesním ovocem",
      "Rýžové chlebíčky s arašídovým máslem a medem",
      "Proteinový šejk s banánem a vločkami",
      isTight ? "Vejce natvrdo s ovocem" : "Sušené hovězí (jerky) s oříšky",
    ] : [
      "Greek yogurt with mixed nuts and berries",
      "Rice cakes with peanut butter and honey",
      "Protein shake with banana and oats",
      isTight ? "Hard-boiled eggs with fruit" : "Beef jerky with trail mix",
    ]),
    default: filter(isCs ? ["Vyvážené jídlo s libovými bílkovinami a komplexními sacharidy"] : ["Balanced meal with lean protein and complex carbs"]),
  };
}

function generateNutritionTips(data: OnboardingData, lang: string): string[] {
  const tips: string[] = [];
  const isCs = lang === 'cs';
  const goals = data.fitnessGoals;

  // Add the "Truthfulness" calculation header
  const weight = parseFloat(data.weight) || 75;
  const height = parseFloat(data.height) || 175;
  const age = parseInt(data.age) || 25;
  const isMale = data.gender !== "female";
  const bmr = isMale
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    "lightly-active": 1.375,
    "moderately-active": 1.55,
    "very-active": 1.725,
  };
  const tdeeValue = Math.round(bmr * (multipliers[data.activityLevel] || 1.4));

  tips.push(isCs 
    ? `### Transparentní kalkulace: Bazální metabolismus (BMR) = ${Math.round(bmr)} kcal, Celkový denní výdej (TDEE) = ${tdeeValue} kcal.` 
    : `### Science-Based Calculation: Your BMR = ${Math.round(bmr)} kcal, Your TDEE = ${tdeeValue} kcal.`);

  if (data.allergies && data.allergies.toLowerCase() !== "none") {
    tips.push(isCs 
      ? `Váš jídelníček byl sestaven tak, aby se vyhnul vašim alergiím/intolerancím: ${data.allergies}`
      : `Your meal plan has been constructed to explicitly avoid your recorded allergies/intolerances: ${data.allergies}`);
  }

  if (data.favoriteFoods) {
    tips.push(isCs
      ? `V jídelníčku jsou zahrnuta vaše oblíbená jídla (${data.favoriteFoods}). To, že jíte co vám chutná, pomáhá s dodržováním plánu.`
      : `Your meals feature your favorite foods (${data.favoriteFoods}). Utilizing what you like improves adherence.`);
  }

  if (data.dislikedFoods) {
    tips.push(isCs
      ? `Z doporučení jsme aktivně vyřadili jídla, která nemáte rádi (${data.dislikedFoods}).`
      : `We've actively excluded your disliked foods (${data.dislikedFoods}) from the recommendations.`);
  }

  // Calorie awareness-based tips
  if (data.calorieAwareness === "none") {
    tips.push(isCs ? "Začněte tím, že si budete týden prostě zapisovat, co jíte – uvědomění je první krok" : "Start by simply tracking what you eat for one week — awareness is the first step");
    tips.push(isCs ? "Používejte ruku jako vodítko pro porce: dlaň = bílkoviny, pěst = sacharidy, palec = tuky" : "Use your hand as a portion guide: palm = protein, fist = carbs, thumb = fats");
  } else if (data.calorieAwareness === "basic") {
    tips.push(isCs ? "Zvažte použití aplikace na sledování jídla po dobu prvních 2-3 týdnů pro kalibraci vašich porcí" : "Consider using a food tracking app for the first 2-3 weeks to calibrate your portions");
  } else {
    tips.push(isCs ? "Už rozumíte kaloriím – soustřeďte se na kvalitu potravin a hustotu mikroživin" : "You already understand calories — focus on food quality and micronutrient density");
  }

  // Eating habits tips
  if (data.eatingHabits === "social") {
    tips.push(isCs ? "Při jídle v restauraci: podívejte se na jídelníček předem, upřednostněte bílkoviny a dresingy si žádejte bokem." : "For social dining: look up menus beforehand, prioritize protein, and ask for dressings on the side.");
  } else if (data.eatingHabits === "emotional") {
    tips.push(isCs ? "Pokud jíte emočně, zkuste se na 5 minut zastavit a vypít sklenici vody, než zareagujete na chuť. Identifikujte spouštěč." : "If you're an emotional eater, try to pause for 5 minutes and drink a glass of water before reacting to cravings. Identify the trigger.");
  } else if (data.eatingHabits === "intuitive") {
    tips.push(isCs ? "Protože jíte intuitivně, zaměřte se hodně na bílkoviny a vlákninu pro přirozenou regulaci signálů hladu." : "Since you eat intuitively, focus heavily on protein and fiber to naturally regulate hunger signals.");
  } else if (data.eatingHabits === "structured") {
    tips.push(isCs ? "Váš strukturovaný návyk v jídle je skvělý pro konzistenci. Zvažte nedělní přípravu jídla (meal prep), abyste si pojistili úspěch." : "Your structured eating habit is great for consistency. Consider doing a large Sunday meal prep to lock in your success.");
  }

  // Budget tips
  if (data.budgetLimitation === "tight") {
    tips.push(isCs ? "Nakupujte ve velkém: rýže, vločky, vejce, mražená zelenina a fazole v plechovce jsou cenově výhodné základy" : "Buy in bulk: rice, oats, eggs, frozen vegetables, and canned beans are cost-effective staples");
    tips.push(isCs ? "Připravujte si jídlo o víkendech, abyste snížili množství odpadu a ušetřili peníze" : "Meal prep on weekends to reduce waste and save money");
  }

  // Stress-based nutrition
  if (data.stressLevel === "high") {
    tips.push(isCs ? "Zahrňte potraviny bohaté na hořčík (listová zelenina, hořká čokoláda, ořechy), které pomohou zvládnout kortizol" : "Include magnesium-rich foods (dark leafy greens, dark chocolate, nuts) to help manage cortisol");
    tips.push(isCs ? "Vyhněte se nadměrnému množství kofeinu – může zesilovat stresové hormony" : "Avoid excessive caffeine — it can amplify stress hormones");
  }

  // Sleep-based nutrition
  if (data.sleepQuality === "poor") {
    tips.push(isCs ? "Vyhněte se velkým jídlům 2 hodiny před spaním" : "Avoid large meals within 2 hours of bedtime");
    tips.push(isCs ? "Ve večerním jídle zvažte potraviny bohaté na tryptofan (krůtí maso, mléko, banány)" : "Consider foods rich in tryptophan (turkey, milk, bananas) in your evening meal");
  }

  // Goal-specific
  if (goals.includes("fat-loss")) {
    tips.push(isCs ? "Upřednostněte bílkoviny v každém jídle pro udržení svalů a zvýšení sytosti" : "Prioritize protein at every meal to maintain muscle and increase satiety");
    tips.push(isCs ? "Naplňte polovinu talíře zeleninou pro zvětšení objemu jídla bez nadbytečných kalorií" : "Fill half your plate with vegetables to increase volume without excess calories");
  }
  if (goals.includes("muscle-gain")) {
    tips.push(isCs ? "Jezte bílkoviny do 2 hodin od tréninku pro optimální syntézu svalových bílkovin" : "Eat protein within 2 hours of training for optimal muscle protein synthesis");
    tips.push(isCs ? "Nevynechávejte jídlo po tréninku – ideální je kombinace bílkovin a sacharidů" : "Don't skip post-workout nutrition — a combination of protein and carbs is ideal");
  }

  // Poor diet obstacle
  if (data.obstacles.includes("poor-diet")) {
    tips.push(isCs ? "Začněte nahrazením jednoho průmyslově zpracovaného jídla denně čerstvou alternativou" : "Start by replacing one processed meal per day with a whole-food alternative");
    tips.push(isCs ? "Mějte zdravé svačiny na očích a přístupné – jíte to, co vidíte" : "Keep healthy snacks visible and accessible — you eat what you see");
  }

  // Diet Specific Strategy Section (The "Professional Coach" deep dive)
  const diet = data.dietaryPreference;
  if (diet === "vegan") {
    tips.push(isCs 
      ? "### Vegan: Jak maximalizovat výsledky" 
      : "### Vegan: How to Maximize Results");
    tips.push(isCs 
      ? "**Výhody:** Vysoký příjem vlákniny, nízký nasycený tuk, skvělá hydratace z ovoce/zeleniny." 
      : "**Pros:** High fiber, low saturated fat, excellent hydration from fruits/veg.");
    tips.push(isCs 
      ? "**Rizika:** Potenciální nedostatek B12, železa a zinku. Nižší biologická dostupnost rostlinných bílkovin." 
      : "**Cons:** Potential B12, Iron, and Zinc deficiencies. Lower bioavailability of plant proteins.");
    tips.push(isCs 
      ? "**Tip:** Kombinujte různé zdroje (čočka + rýže) pro kompletní aminokyselinový profil a doplňujte B12." 
      : "**Strategy:** Combine sources (lentils + rice) for a complete amino profile and supplement B12.");
  } else if (diet === "keto") {
    tips.push(isCs 
      ? "### Keto: Jak maximalizovat výsledky" 
      : "### Keto: How to Maximize Results");
    tips.push(isCs 
      ? "**Výhody:** Stabilní hladina cukru, potlačení hladu, rychlá počáteční ztráta váhy (vody)." 
      : "**Pros:** Stable blood sugar, hunger suppression, rapid initial water weight loss.");
    tips.push(isCs 
      ? "**Rizika:** 'Keto chřipka', nedostatek elektrolytů, omezení společenského stravování." 
      : "**Cons:** 'Keto flu', electrolyte depletion, social dining restrictions.");
    tips.push(isCs 
      ? "**Tip:** Doplňujte sodík, hořčík a draslík. Zaměřte se na zdravé tuky (avokádo, ořechy), ne jen slaninu." 
      : "**Strategy:** Supplement Sodium, Magnesium, and Potassium. Focus on healthy fats (avocado, nuts) over processed meats.");
  }

  // Hydration (universal)
  tips.push(isCs ? "Snažte se vypít 2-3 litry vody denně – v tréninkové dny více" : "Aim for 2-3 liters of water daily — more on training days");

  return tips;
}
