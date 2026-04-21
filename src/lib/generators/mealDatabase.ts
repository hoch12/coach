export interface Meal {
  id: string;
  nameEn: string;
  nameCs: string;
  category: "breakfast" | "lunch" | "dinner" | "snack";
  diets: string[]; // vegan, vegetarian, keto, paleo, omnivore
  proteinRatio: "high" | "moderate" | "low";
  budget: "tight" | "balanced" | "premium";
  prepTime: "quick" | "medium" | "long";
}

export const MEAL_DATABASE: Meal[] = [
  // BREAKFAST
  {
    id: "scrambled-eggs",
    nameEn: "Scrambled Eggs with Spinach & Toast",
    nameCs: "Míchaná vejce se špenátem a toastem",
    category: "breakfast",
    diets: ["omnivore", "vegetarian"],
    proteinRatio: "high",
    budget: "tight",
    prepTime: "quick"
  },
  {
    id: "oatmeal-protein",
    nameEn: "Protein Oatmeal with Berries",
    nameCs: "Ovesná kaše s proteinem a lesním ovocem",
    category: "breakfast",
    diets: ["omnivore", "vegetarian"],
    proteinRatio: "high",
    budget: "tight",
    prepTime: "quick"
  },
  {
    id: "tofu-scramble",
    nameEn: "Tofu Scramble with Turmeric",
    nameCs: "Tofu míchaná vajíčka s kurkumou",
    category: "breakfast",
    diets: ["vegan", "omnivore", "vegetarian"],
    proteinRatio: "high",
    budget: "balanced",
    prepTime: "quick"
  },
  {
    id: "greek-yogurt",
    nameEn: "Greek Yogurt with Walnuts & Honey",
    nameCs: "Řecký jogurt s vlašskými ořechy a medem",
    category: "breakfast",
    diets: ["omnivore", "vegetarian"],
    proteinRatio: "high",
    budget: "balanced",
    prepTime: "quick"
  },
  {
    id: "avocado-toast",
    nameEn: "Avocado Toast with Poached Egg",
    nameCs: "Avokádový toast se zastřeným vejcem",
    category: "breakfast",
    diets: ["omnivore", "vegetarian"],
    proteinRatio: "moderate",
    budget: "premium",
    prepTime: "medium"
  },
  {
    id: "keto-bacon-eggs",
    nameEn: "Crispy Bacon and Fried Eggs",
    nameCs: "Křupavá slanina a sázená vejce",
    category: "breakfast",
    diets: ["omnivore", "keto"],
    proteinRatio: "high",
    budget: "balanced",
    prepTime: "quick"
  },
  {
    id: "chia-pudding",
    nameEn: "Berry Chia Pudding",
    nameCs: "Chia pudink s lesním ovocem",
    category: "breakfast",
    diets: ["vegan", "omnivore", "vegetarian"],
    proteinRatio: "low",
    budget: "balanced",
    prepTime: "long" // due to soaking
  },

  // LUNCH
  {
    id: "chicken-rice-broccoli",
    nameEn: "Grilled Chicken, Brown Rice & Broccoli",
    nameCs: "Grilované kuře, hnědá rýže a brokolice",
    category: "lunch",
    diets: ["omnivore"],
    proteinRatio: "high",
    budget: "tight",
    prepTime: "medium"
  },
  {
    id: "lentil-dahl",
    nameEn: "Red Lentil Dahl with Basmati",
    nameCs: "Dahl z červené čočky s rýží",
    category: "lunch",
    diets: ["vegan", "vegetarian", "omnivore"],
    proteinRatio: "moderate",
    budget: "tight",
    prepTime: "medium"
  },
  {
    id: "beef-stir-fry",
    nameEn: "Lean Beef & Vegetable Stir-Fry",
    nameCs: "Stir-fry z libového hovězího se zeleninou",
    category: "lunch",
    diets: ["omnivore", "paleo"],
    proteinRatio: "high",
    budget: "balanced",
    prepTime: "quick"
  },
  {
    id: "salmon-quinoa",
    nameEn: "Pan-Seared Salmon & Quinoa Salad",
    nameCs: "Losos na pánvi s quinoa salátem",
    category: "lunch",
    diets: ["omnivore", "pescatarian"],
    proteinRatio: "high",
    budget: "premium",
    prepTime: "medium"
  },
  {
    id: "tofu-pokebowl",
    nameEn: "Tofu Poke Bowl with Edamame",
    nameCs: "Tofu Poke Bowl s edamame",
    category: "lunch",
    diets: ["vegan", "vegetarian", "omnivore"],
    proteinRatio: "moderate",
    budget: "balanced",
    prepTime: "medium"
  },
  {
    id: "tuna-wrap",
    nameEn: "Whole-Wheat Tuna & Avocado Wrap",
    nameCs: "Celozrnný wrap s tuňákem a avokádem",
    category: "lunch",
    diets: ["omnivore", "pescatarian"],
    proteinRatio: "high",
    budget: "tight",
    prepTime: "quick"
  },

  // DINNER
  {
    id: "turkey-meatballs",
    nameEn: "Turkey Meatballs with Zucchini Noodles",
    nameCs: "Krůtí kuličky s cuketovými špagetami",
    category: "dinner",
    diets: ["omnivore", "keto", "paleo"],
    proteinRatio: "high",
    budget: "balanced",
    prepTime: "medium"
  },
  {
    id: "black-bean-tacos",
    nameEn: "Black Bean Tacos with Salsa",
    nameCs: "Tacos s černými fazolemi a salsou",
    category: "dinner",
    diets: ["vegan", "vegetarian", "omnivore"],
    proteinRatio: "moderate",
    budget: "tight",
    prepTime: "quick"
  },
  {
    id: "steak-asparagus",
    nameEn: "Grilled Steak with Lemon Asparagus",
    nameCs: "Grilovaný steak s citrónovým chřestem",
    category: "dinner",
    diets: ["omnivore", "keto", "paleo"],
    proteinRatio: "high",
    budget: "premium",
    prepTime: "quick"
  },
  {
    id: "sweet-potato-curry",
    nameEn: "Sweet Potato & Chickpea Curry",
    nameCs: "Kari ze sladkých brambor a cizrny",
    category: "dinner",
    diets: ["vegan", "vegetarian", "omnivore"],
    proteinRatio: "moderate",
    budget: "tight",
    prepTime: "medium"
  },
  {
    id: "cod-papillote",
    nameEn: "Cod En Papillote with Veggies",
    nameCs: "Treska v papilotě se zeleninou",
    category: "dinner",
    diets: ["omnivore", "pescatarian"],
    proteinRatio: "high",
    budget: "balanced",
    prepTime: "medium"
  },

  // SNACKS
  {
    id: "protein-shake",
    nameEn: "Whey/Vegan Protein Shake",
    nameCs: "Proteinový šejk",
    category: "snack",
    diets: ["omnivore", "vegetarian", "vegan", "keto"],
    proteinRatio: "high",
    budget: "balanced",
    prepTime: "quick"
  },
  {
    id: "nuts-fruit",
    nameEn: "Mixed Nuts and an Apple",
    nameCs: "Směs ořechů a jablko",
    category: "snack",
    diets: ["omnivore", "vegetarian", "vegan", "paleo"],
    proteinRatio: "low",
    budget: "balanced",
    prepTime: "quick"
  },
  {
    id: "cottage-cheese",
    nameEn: "Cottage Cheese with Pineapple",
    nameCs: "Cottage sýr s ananasem",
    category: "snack",
    diets: ["omnivore", "vegetarian"],
    proteinRatio: "high",
    budget: "tight",
    prepTime: "quick"
  },
  // ADDITIONAL BREAKFAST
  { id: "pancakes-protein", nameEn: "High-Protein Banana Pancakes", nameCs: "Proteinoví banánové lívance", category: "breakfast", diets: ["omnivore", "vegetarian"], proteinRatio: "high", budget: "balanced", prepTime: "medium" },
  { id: "smoothie-green", nameEn: "Green Detox Smoothie", nameCs: "Zelené detox smoothie", category: "breakfast", diets: ["vegan", "vegetarian", "paleo"], proteinRatio: "low", budget: "balanced", prepTime: "quick" },
  { id: "omelette-veggie", nameEn: "Veggie Omelette with Feta", nameCs: "Zeleninová omeleta s fetou", category: "breakfast", diets: ["vegetarian", "omnivore"], proteinRatio: "high", budget: "balanced", prepTime: "quick" },
  { id: "bulletproof-coffee", nameEn: "Bulletproof Coffee (Keto)", nameCs: "Neprůstřelná káva (Keto)", category: "breakfast", diets: ["keto", "paleo"], proteinRatio: "low", budget: "premium", prepTime: "quick" },
  { id: "overnight-oats", nameEn: "Apple & Cinnamon Overnight Oats", nameCs: "Overnight oats s jablkem a skořicí", category: "breakfast", diets: ["vegan", "vegetarian", "omnivore"], proteinRatio: "moderate", budget: "tight", prepTime: "long" },

  // ADDITIONAL LUNCH
  { id: "turkey-chili", nameEn: "Turkey & Bean Chili", nameCs: "Krůtí chilli s fazolemi", category: "lunch", diets: ["omnivore"], proteinRatio: "high", budget: "tight", prepTime: "medium" },
  { id: "quinoa-salad-chickpea", nameEn: "Mediterranean Quinoa & Chickpea Salad", nameCs: "Středomořský quinoa salát s cizrnou", category: "lunch", diets: ["vegan", "vegetarian"], proteinRatio: "moderate", budget: "balanced", prepTime: "quick" },
  { id: "steak-salad", nameEn: "Grilled Steak & Blue Cheese Salad", nameCs: "Salát s grilovaným steakem a nivou", category: "lunch", diets: ["omnivore", "keto"], proteinRatio: "high", budget: "premium", prepTime: "medium" },
  { id: "shrimp-tacos", nameEn: "Grilled Shrimp Tacos with Slaw", nameCs: "Tacos s grilovanými krevetami", category: "lunch", diets: ["pescatarian", "omnivore"], proteinRatio: "high", budget: "premium", prepTime: "quick" },
  { id: "mushroom-risotto", nameEn: "Creamy Mushroom Risotto", nameCs: "Krémové houbové rizoto", category: "lunch", diets: ["vegetarian"], proteinRatio: "low", budget: "balanced", prepTime: "medium" },

  // ADDITIONAL DINNER
  { id: "zucchini-lasagna", nameEn: "Zucchini Lasagna (Low Carb)", nameCs: "Cuketové lasagne (Low Carb)", category: "dinner", diets: ["omnivore", "keto", "vegetarian"], proteinRatio: "moderate", budget: "balanced", prepTime: "long" },
  { id: "baked-cod-lemon", nameEn: "Lemon Herb Baked Cod", nameCs: "Treska pečená s citrónem a bylinkami", category: "dinner", diets: ["pescatarian", "omnivore", "paleo"], proteinRatio: "high", budget: "balanced", prepTime: "medium" },
  { id: "stuffed-peppers-vegan", nameEn: "Quinoa Stuffed Bell Peppers", nameCs: "Papriky plněné quinoou", category: "dinner", diets: ["vegan", "vegetarian"], proteinRatio: "moderate", budget: "tight", prepTime: "medium" },
  { id: "lamb-chops-rosemary", nameEn: "Rosemary Lamb Chops with Green Beans", nameCs: "Jehněčí kotlety na rozmarýnu", category: "dinner", diets: ["omnivore", "paleo", "keto"], proteinRatio: "high", budget: "premium", prepTime: "medium" },
  { id: "tempeh-stir-fry", nameEn: "Tempeh & Broccoli Stir-Fry", nameCs: "Stir-fry s tempehem a brokolicí", category: "dinner", diets: ["vegan", "vegetarian"], proteinRatio: "high", budget: "balanced", prepTime: "quick" },

  // ADDITIONAL SNACKS
  { id: "edamame-sea-salt", nameEn: "Steamed Edamame with Sea Salt", nameCs: "Edamame na páře se solí", category: "snack", diets: ["vegan", "vegetarian"], proteinRatio: "high", budget: "balanced", prepTime: "quick" },
  { id: "hummus-carrots", nameEn: "Hummus with Carrot Sticks", nameCs: "Hummus s mrkví", category: "snack", diets: ["vegan", "vegetarian", "omnivore"], proteinRatio: "moderate", budget: "tight", prepTime: "quick" },
  { id: "almonds-smoked", nameEn: "Smoked Almonds", nameCs: "Uzené mandle", category: "snack", diets: ["vegan", "vegetarian", "paleo", "keto"], proteinRatio: "moderate", budget: "balanced", prepTime: "quick" },
  { id: "greek-yogurt-seeds", nameEn: "Greek Yogurt with Chia & Flax", nameCs: "Řecký jogurt s chia a lněným semínkem", category: "snack", diets: ["vegetarian", "omnivore"], proteinRatio: "high", budget: "balanced", prepTime: "quick" },
  { id: "dark-chocolate-berries", nameEn: "Dark Chocolate (85%) & Raspberries", nameCs: "Hořká čokoláda a maliny", category: "snack", diets: ["vegan", "vegetarian", "omnivore", "paleo"], proteinRatio: "low", budget: "premium", prepTime: "quick" },
];
