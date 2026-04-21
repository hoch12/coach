import { OnboardingData, LifestylePlan } from "@/types/onboarding";

/**
 * Generates deeply personalized lifestyle recommendations using ALL inputs:
 * - sleepQuality → sleep optimization advice
 * - stressLevel → stress management strategies
 * - disciplineLevel → habit complexity
 * - motivationLevel → motivation strategy
 * - proactivity → action-oriented vs guided advice
 * - selfDevelopment → growth mindset content
 * - perfectionism → perfectionism management
 * - obstacles → targeted solutions
 * - advantages → leverage existing strengths
 * - activityLevel → daily movement advice
 * - age → age-appropriate recovery
 * - fitnessGoals → goal-aligned lifestyle
 * - planStyle → advice format
 */
export function generateLifestylePlan(data: OnboardingData, lang: string = 'en'): LifestylePlan {
  return {
    sleepAdvice: generateSleepAdvice(data, lang),
    habits: generateHabits(data, lang),
    motivationStrategy: generateMotivationStrategy(data, lang),
    disciplineTips: generateDisciplineTips(data, lang),
    mindsetShift: generateMindsetShift(data, lang),
    stressManagement: generateStressManagement(data, lang),
    recoveryProtocol: generateRecoveryProtocol(data, lang),
    weeklyCheckpoints: generateWeeklyCheckpoints(data, lang),
  };
}

function generateSleepAdvice(data: OnboardingData, lang: string): string {
  const age = parseInt(data.age) || 25;
  const isCs = lang === 'cs';

  if (data.sleepQuality === "poor") {
    let advice = isCs 
      ? "Spánek je váš hlavní nástroj pro regeneraci a potřebuje okamžitou pozornost. Nastavte si pevnou rutinu: žádné obrazovky 1 hodinu před spaním, udržujte pokoj chladný (18-20°C) a tmu. "
      : "Sleep is your #1 recovery tool and it needs immediate attention. Establish a non-negotiable bedtime routine: no screens 1 hour before bed, keep your room cool (18-20°C) and completely dark. ";
    if (data.stressLevel === "high") {
      advice += isCs ? "Vzhledem k vysokému stresu přidejte 10 minut dýchání nebo čtení. " : "Since your stress levels are high, add 10 minutes of guided breathing or journaling before bed. ";
    }
    if (age > 40) {
      advice += isCs ? "Ve vašem věku spánek silně ovlivňuje regeneraci. Zkuste 7-9 hodin konzistentně. " : "At your age, sleep quality directly impacts recovery and hormone balance — prioritize 7-9 hours consistently. ";
    }
    advice += isCs ? "Omezte kofein po 14:00." : "Consider limiting caffeine after 2 PM and avoiding heavy meals within 2 hours of bedtime.";
    return advice;
  }

  if (data.sleepQuality === "average") {
    let advice = isCs 
      ? "Váš spánek je průměrný, ale jde ho zlepšit. Snažte se spát 7-8 hodin a chdit spát i vstávat ve stejnou dobu i o víkendu. "
      : "Your sleep is decent but there's room for optimization. Aim for 7-8 hours consistently, going to bed and waking up at the same time daily — even on weekends. ";
    if (data.stressLevel !== "low") {
      advice += isCs ? "Krátká 5-minutová rutina na zklidnění pomůže. " : "A 5-minute wind-down routine (stretching, deep breathing) can significantly improve sleep quality. ";
    }
    if (data.fitnessGoals.includes("muscle-gain")) {
      advice += isCs ? "Kvalitní spánek buduje svaly. Berte to jako součást tréninku." : "Quality sleep is when most muscle repair happens — treat it as part of your training program.";
    }
    return advice;
  }

  // Good sleep
  let advice = isCs 
    ? "Excelentní spánkové návyky — tohle je vaše velká výhoda. Udržujte rutinu konzistentní. "
    : "Excellent sleep habits — this is a major advantage for your goals. Maintain your current routine and keep it consistent. ";
  if (data.fitnessGoals.includes("strength") || data.fitnessGoals.includes("buildMuscle")) {
    advice += isCs ? "Máte silnou kapacitu regenerace, zvládnete vyšší objem tréninku." : "Your recovery capacity is strong, which means you can handle slightly higher training volumes.";
  }
  return advice;
}

function generateHabits(data: OnboardingData, lang: string): string[] {
  const habits: string[] = [];
  const discipline = data.disciplineLevel;
  const planStyle = data.planStyle;
  const isCs = lang === 'cs';

  // Foundation habits based on discipline level
  if (discipline <= 3) {
    habits.push(isCs ? "Začněte s JEDNÍM denním návykem a ovládejte ho, než přidáte další – konzistence vítězí nad intenzitou" : "Start with ONE daily habit and master it before adding more — consistency beats intensity");
    habits.push(isCs ? "Používejte pravidlo 2 minut: pokud návyk trvá méně než 2 minuty, udělejte ho hned" : "Use the 2-minute rule: if a habit takes less than 2 minutes, do it immediately");
    habits.push(isCs ? "Nastavte si denní budík na trénink – berte ho jako schůzku, kterou nemůžete zrušit" : "Set a daily alarm for your workout — treat it like a meeting you can't cancel");
  } else if (discipline <= 6) {
    habits.push(isCs ? "Skládejte nové návyky na ty stávající (např. připravte si věci do fitka hned po vyčištění zubů)" : "Stack new habits onto existing ones (e.g., prepare gym clothes right after brushing teeth)");
    habits.push(isCs ? "Sledujte své tréninky v deníku nebo aplikaci – co se měří, to se řídí" : "Track your workouts in a journal or app — what gets measured gets managed");
  } else {
    habits.push(isCs ? "Vaše disciplína je vaše superschopnost – využijte ji ke sledování progresivního přetížení" : "Your discipline is your superpower — channel it into progressive overload tracking");
    habits.push(isCs ? "Nastavte si týdenní mikrocíle, které směřují k měsíčním milníkům" : "Set weekly micro-goals that build toward monthly milestones");
  }

  // Proactivity-based habits
  if (data.proactivity === "low") {
    habits.push(isCs ? "Připravte si vše večer předem: tašku do fitka, jídlo, oblečení – eliminujte ranní rozhodování" : "Prepare everything the night before: gym bag, meals, outfit — remove morning decisions");
    habits.push(isCs ? "Stanovte si přesné časy tréninků – vágní plány vedou k vynechaným lekcím" : "Set specific times for workouts — vague plans lead to skipped sessions");
  } else if (data.proactivity === "high") {
    habits.push(isCs ? "Využijte svou proaktivní povahu k přípravě jídla (meal prep) na 2-3 dny dopředu" : "Use your proactive nature to meal prep 2-3 days in advance");
    habits.push(isCs ? "Každý týden zhodnoťte a upravte svůj plán podle toho, jak vaše tělo reaguje" : "Review and adjust your plan weekly based on how your body responds");
  }

  // Self-development integration
  if (data.selfDevelopment === "high") {
    habits.push(isCs ? "Čtěte nebo poslouchejte 10 minut denně obsah o fitness/zdraví pro posílení svého závazku" : "Read or listen to 10 minutes of fitness/health content daily to reinforce your commitment");
    habits.push(isCs ? "Zapisujte si hladinu energie a náladu společně s tréninky, abyste identifikovali vzorce" : "Journal your energy levels and mood alongside workouts to identify patterns");
  } else if (data.selfDevelopment === "moderate") {
    habits.push(isCs ? "Sledujte jednoho fitness experta online pro konzistentní a praktické tipy" : "Follow one fitness educator online for consistent, practical tips");
  }

  // Obstacle-specific habits
  if (data.obstacles.includes("stress")) {
    habits.push(isCs ? "Naplánujte si 10 minut denní dekomprese (procházka, dýchání nebo strečink)" : "Schedule 10 minutes of daily decompression (walking, breathing, or stretching)");
  }
  if (data.obstacles.includes("poor-diet")) {
    habits.push(isCs ? "Nahraďte jedno nezdravé jídlo denně plánovanou alternativou – malé výhry se sčítají" : "Replace one unhealthy meal per day with a planned alternative — small wins compound");
  }
  if (data.obstacles.includes("inconsistent-routine")) {
    habits.push(isCs ? "Využijte nedělní plánování: naplánujte si všechny tréninky a časy na přípravu jídla" : "Use a weekly Sunday planning session: schedule all workouts and meal prep times");
  }

  // Activity level habits
  if (data.activityLevel === "sedentary") {
    habits.push(isCs ? "Přidejte 5 000+ kroků denně – použijte krokoměr a postupně zvyšujte" : "Add 5,000+ daily steps — use a step counter and gradually increase");
    habits.push(isCs ? "Každou hodinu při sedavé práci si udělejte 5minutovou přestávku na pohyb" : "Take a 5-minute movement break every hour during sedentary work");
  }

  // Advantage-based habits
  if (data.advantages.includes("previous-experience")) {
    habits.push(isCs ? "Využijte své zkušenosti: soustřeďte se na progresivní přetížení spíše než na neustálé změny rutin" : "Leverage your experience: focus on progressive overload rather than changing routines constantly");
  }

  habits.push(isCs ? "Zůstaňte hydratovaní – snažte se o 2-3 litry vody denně, v tréninkové dny více" : "Stay hydrated — aim for 2-3 liters of water daily, more on training days");

  // Location based habits
  if (data.workoutLocation === "outdoor") {
    habits.push(isCs ? "Naplánujte si tréninky podle předpovědi počasí a mějte připravenou 'mokrou variantu' doma" : "Schedule workouts based on weather forecasts and have a 'rainy day' backup at home");
    habits.push(isCs ? "Využijte čerstvého vzduchu pro prohloubení dýchání mezi sériemi" : "Utilize the fresh air to deepen your breathing between sets");
  } else if (data.workoutLocation === "home") {
    habits.push(isCs ? "Vytvořte si dedikovaný prostor pro cvičení – i malý kout pomůže mentálně přepnout do módu tréninku" : "Create a dedicated workout space — even a small corner helps mentally switch to 'training mode'");
  }

  // Simple plan: limit habits
  if (planStyle === "simple") return habits.slice(0, 4);
  if (planStyle === "structured" || data.proactivity === "high") return habits;
  return habits.slice(0, 6); // flexible
}

function generateMotivationStrategy(data: OnboardingData, lang: string): string {
  const motivation = data.motivationLevel;
  const goals = data.fitnessGoals;
  const isCs = lang === 'cs';

  if (motivation <= 3) {
    let strategy = isCs 
      ? "Vaše motivace je nízká, a to je v pořádku – budeme stavět na disciplíně, ne na pocitech. "
      : "Your motivation is low, and that's okay — we'll build on discipline, not feelings. ";
    strategy += isCs
      ? "Naplánujte si tréninky jako neměnné schůzky. Začněte tím, že se prostě dostavíte – i 15minutové cvičení se počítá. "
      : "Schedule workouts like non-negotiable appointments. Start with just showing up — even a 15-minute session counts. ";
    if (data.obstacles.includes("low-motivation")) {
      strategy += isCs
        ? "Najděte své 'proč': napište si 3 hlavní důvody, proč jste se na tuto cestu vydali, a čtěte si je každé ráno. "
        : "Find your 'why': write down your top 3 reasons for starting this journey and read them every morning. ";
    }
    if (data.advantages.includes("previous-experience")) {
      strategy += isCs
        ? "Už jste to jednou dokázali – vzpomeňte si, jak skvělý to byl pocit. Ta svalová paměť tam stále je."
        : "You've done this before — remember how good it felt. That muscle memory is still there.";
    } else {
      strategy += isCs
        ? "Soustřeďte se na prvních 21 dní – poté vás začne návyk sám posouvat vpřed."
        : "Focus on the first 21 days — after that, the habit will start carrying you forward.";
    }
    return strategy;
  }

  if (motivation <= 6) {
    let strategy = isCs
      ? "Máte mírnou motivaci – klíčem je budování hybnosti skrze malé výhry. "
      : "You have moderate motivation — the key is building momentum through small wins. ";
    strategy += isCs
      ? "Sledujte fotky pokroku měsíčně a oslavujte překonávání osobních rekordů. "
      : "Track progress photos monthly and celebrate hitting personal records. ";
    if (goals.includes("fat-loss")) {
      strategy += isCs
        ? "Nespoléhejte se jen na váhu – jako ukazatele pokroku používejte měření centimetrů a to, jak vám sedí oblečení. "
        : "Don't rely on the scale alone — use measurements and how clothes fit as progress markers. ";
    }
    if (goals.includes("muscle-gain") || goals.includes("strength")) {
      strategy += isCs
        ? "Veďte si tréninkový deník a snažte se překonat čísla z minulého týdne – progresivní přetížení je motivující. "
        : "Keep a training log and aim to beat last week's numbers — progressive overload is motivating. ";
    }
    strategy += isCs
      ? "Najděte si parťáka na trénink nebo komunitu pro vzájemnou odpovědnost."
      : "Find a training partner or community for accountability.";
    return strategy;
  }

  let strategy = isCs
    ? "Vaše motivace je vysoká – směřujte ji spíše do konzistence než do intenzity. "
    : "Your motivation is high — channel it into consistency rather than intensity. ";
  strategy += isCs
    ? "Každý týden si stanovte progresivní výzvy. Pamatujte, že stagnace je součástí procesu a není to signál k tomu, abyste vše hned měnili. "
    : "Set progressive challenges each week. Remember that plateaus are part of the process and not a sign to change everything. ";
  if (data.perfectionism === "high") {
    strategy += isCs
      ? "Dávejte pozor, aby perfekcionismus nevedl k vyhoření – 80% konzistence vítězí nad 100 % po dobu dvou týdnů."
      : "Be careful not to let perfectionism lead to burnout — 80% consistency beats 100% for two weeks.";
  } else {
    strategy += isCs
      ? "Využijte své odhodlání k ovládnutí formy a techniky dříve, než se začnete honit za těžkými váhami."
      : "Use your drive to master form and technique before chasing heavy weights.";
  }
  return strategy;
}

function generateDisciplineTips(data: OnboardingData, lang: string): string[] {
  const tips: string[] = [];
  const discipline = data.disciplineLevel;
  const isCs = lang === 'cs';

  // Core discipline tips
  tips.push(isCs ? "Považujte svůj tréninkový plán za neměnný – je to schůzka s vaším budoucím já" : "Treat your training schedule as non-negotiable — it's an appointment with your future self");

  if (discipline <= 4) {
    tips.push(isCs ? "Začněte s minimální účinnou dávkou: 2-3 sezení týdně, každé 30-40 minut" : "Start with the minimum effective dose: 2-3 sessions per week, 30-40 minutes each");
    tips.push(isCs ? "Odstraňte bariéry: připravte si tašku a oblečení do fitka už večer předem" : "Remove friction: prepare your gym bag and clothes the night before");
    tips.push(isCs ? "Používejte vizuální sledování sérií (streak tracker) – sledování dnů s odvedeným úsilím buduje hybnost" : "Use a visual streak tracker — seeing consecutive days of effort builds momentum");
  } else if (discipline <= 7) {
    tips.push(isCs ? "Prvních 4 týdnů sledujte plán přesně tak, jak je napsán – věřte procesu" : "Follow the plan exactly as written for the first 4 weeks — trust the process");
    tips.push(isCs ? "Odstraňte únavu z rozhodování: nezpochybňujte plán, prostě ho proveďte" : "Remove decision fatigue: don't question the plan, just execute");
    if (data.obstacles.includes("inconsistent-routine")) {
      tips.push(isCs ? "Ukalaďte tréninky do stabilního časového slotu – lidé cvičící ráno jsou o 90 % konzistentnější" : "Anchor workouts to a consistent time slot — morning exercisers are 90% more consistent");
    }
  } else {
    tips.push(isCs ? "Vaše disciplína je výjimečná – soustřeďte se na strategické dny odpočinku a odpočinkové týdny (deload weeks)" : "Your discipline is exceptional — focus on strategic rest days and deload weeks");
    tips.push(isCs ? "Směřujte svou konzistenci do sledování: zaznamenávejte každý trénink, jídlo a metriky regenerace" : "Channel your consistency into tracking: log every workout, meal, and recovery metric");
  }

  // Perfectionism management
  if (data.perfectionism === "high") {
    tips.push(isCs ? "Přijměte 80% konzistenci nad 100% perfekcionismus – hotové je vždy lepší než dokonalé" : "Embrace 80% consistency over 100% perfection — done always beats perfect");
    tips.push(isCs ? "'Špatný' trénink je nekonečně lepší než ten vynechaný" : "A 'bad' workout is infinitely better than a skipped one");
  } else if (data.perfectionism === "low") {
    tips.push(isCs ? "Tentokrát na sebe buďte přísnější – konzistence je povinná, ne volitelná" : "Hold yourself to a higher standard this time — consistency is non-negotiable, not optional");
  }

  // Plan style tips
  if (data.planStyle === "flexible") {
    tips.push(isCs ? "Flexibilní neznamená volitelný – splňte své týdenní cíle, i když se dny v týdnu posunou" : "Flexible doesn't mean optional — complete your weekly targets even if days shift around");
  }
  if (data.planStyle === "structured") {
    tips.push(isCs ? "Každou neděli večer si projděte svůj plán a mentálně se zavažte ke každému sezení" : "Review your plan every Sunday evening and mentally commit to each session");
  }

  return tips;
}

function generateMindsetShift(data: OnboardingData, lang: string): string {
  const goals = data.fitnessGoals;
  const isCs = lang === 'cs';

  if (goals.includes("lifestyle-change")) {
    return isCs
      ? "Neměníte jen své tělo – přebudováváte svou identitu. Každé malé rozhodnutí jíst lépe, trénovat tvrději nebo správně odpočívat je hlasem pro osobu, kterou se chcete stát. Toto není 12týdenní program – je to začátek toho, jak odteď žijete. Věřte procesu, buďte se sebou trpěliví a pamatujte: člověk, který se ukáže každý den, vždy vyhrává."
      : "You're not just changing your body — you're rebuilding your identity. Every small decision to eat better, train harder, or rest properly is a vote for the person you want to become. This isn't a 12-week program — it's the beginning of how you live from now on. Trust the process, be patient with yourself, and remember: the person who shows up every day always wins.";
  }

  if (goals.includes("fat-loss")) {
    return isCs
      ? "Ztráta tuku není trest – je to proces odhalování vnitřní síly. Zaměřte se na to, co získáváte: energii, sebevědomí, schopnosti. Váha bude kolísat, ale vaše návyky ne, pokud se odevzdáte systému. Měřte pokrok v měsících, ne ve dnech. Každé jídlo je volba a každý trénink je investice."
      : "Fat loss is not a punishment — it's a process of revealing the strength underneath. Focus on what you're gaining: energy, confidence, capability. The scale will fluctuate, but your habits won't if you commit to the system. Measure progress in months, not days. Every meal is a choice, and every workout is an investment.";
  }

  if (goals.includes("muscle-gain")) {
    return isCs
      ? "Budování svalů je hra o trpělivost. Vaše tělo se mění pomalu, ale mění se trvale, když jste konzistentní. Věřte progresivnímu přetížení, jezte dostatečně, abyste podpořili růst, a spěte, jako by to byla součást vašeho tréninku – protože je. Zrcadlo lže; tréninkový deník ne. Sledujte své výkony a fyzička bude následovat."
      : "Building muscle is the ultimate patience game. Your body changes slowly, but it changes permanently when you're consistent. Trust the progressive overload, eat enough to fuel growth, and sleep like it's part of your training — because it is. The mirror lies; the logbook doesn't. Track your lifts, and the physique will follow.";
  }

  if (goals.includes("strength")) {
    return isCs
      ? "Síla se buduje jedno opakování za druhým. Respektujte proces: zdokonalte svou formu, než se začnete honit za čísly. Každá těžká série učí váš nervový systém něco nového. Regenerace je místo, kde se síla skutečně buduje – trénujte tvrdě, odpočívejte ještě tvrději. Za šest měsíců budou váhy, které se dnes zdají nemožné, vaší rozcvičkou."
      : "Strength is built one rep at a time. Respect the process: perfect your form before chasing numbers. Every heavy set teaches your nervous system something new. Recovery is where strength is actually built — train hard, rest harder. In six months, weights that feel impossible today will be your warm-up.";
  }

  if (data.workoutLocation === "outdoor" || data.advantages.includes("outdoor-space")) {
    return isCs 
      ? "Pobyt venku je vaším největším spojencem. Kombinace pohybu a přirozeného světla drasticky zlepšuje cirkadiánní rytmus a hladinu energie. Vnímejte trénink jako formu svobody, ne jako povinnost v uzavřeném prostoru. Vaše tělo je navrženo k pohybu v přírodě – využijte toho k dosažení maximální mentální jasnosti."
      : "Training outdoors is your greatest ally. The combination of movement and natural light drastically improves your circadian rhythm and energy levels. View your training as a form of freedom, not a chore in a closed space. Your body is designed to move in nature — leverage this for maximum mental clarity.";
  }

  return isCs
    ? "Transformace je maraton, ne sprint. Soustřeďte se na proces, věřte systému a měřte pokrok v měsících, ne ve dnech. Každý trénink se počítá, na každém jídle záleží a každé dobré rozhodnutí se časem sčítá. Nemusíte být dokonalí – musíte být vytrvalí."
    : "Transformation is a marathon, not a sprint. Focus on the process, trust the system, and measure progress in months, not days. Every workout counts, every meal matters, and every good decision compounds over time. You don't need to be perfect — you need to be persistent.";
}

function generateStressManagement(data: OnboardingData, lang: string): string[] {
  const tips: string[] = [];
  const isCs = lang === 'cs';

  if (data.stressLevel === "high") {
    tips.push(isCs ? "Využijte trénink jako ventil stresu – upřednostněte komplexní cviky, které uvolňují napětí" : "Use training as a stress outlet — prioritize compound movements that release tension");
    tips.push(isCs ? "Praktikujte krabicové dýchání (4-4-4-4) před stresovými situacemi a před spaním" : "Practice box breathing (4-4-4-4) before stressful situations and before bed");
    tips.push(isCs ? "Omezte konzumaci zpráv a sociálních médií na vyhrazené časy" : "Limit news and social media consumption to designated times");
    tips.push(isCs ? "Zvažte 10minutovou denní procházku v přírodě – měřitelně snižuje kortizol" : "Consider a 10-minute daily walk in nature — it measurably reduces cortisol");
    if (data.selfDevelopment === "high") {
      tips.push(isCs ? "Vyzkoušejte psaní deníku nebo nácvik vděčnosti pro přerámování každodenních stresorů" : "Explore journaling or a gratitude practice to reframe daily stressors");
    }
  } else if (data.stressLevel === "moderate") {
    tips.push(isCs ? "Používejte své tréninky jako aktivní zvládání stresu – cvičení je osvědčený regulátor nálady" : "Use your workouts as active stress management — exercise is a proven mood regulator");
    tips.push(isCs ? "Vytvořte si jeden denní relaxační rituál: strečink, čtení nebo krátkou meditaci" : "Build one daily relaxation ritual: stretching, reading, or a brief meditation");
  } else {
    tips.push(isCs ? "Váš nízký stres je výhodou – směřujte tuto jasnost do soustředěného a cíleného tréninku" : "Your low stress is an advantage — channel that clarity into focused, intentional training");
  }

  return tips;
}

function generateRecoveryProtocol(data: OnboardingData, lang: string): string[] {
  const tips: string[] = [];
  const age = parseInt(data.age) || 25;
  const isCs = lang === 'cs';

  // Age-based recovery
  if (age > 45) {
    tips.push(isCs ? "Upřednostněte 10-15 min práce na mobilitě denně – zdraví kloubů je klíčové pro dlouhodobý trénink" : "Prioritize 10-15 min mobility work daily — joint health is critical for long-term training");
    tips.push(isCs ? "Zvažte deload týdny každých 3-4 týdnů pro zvládnutí kumulativní únavy" : "Consider deload weeks every 3-4 weeks to manage cumulative fatigue");
  } else if (age > 30) {
    tips.push(isCs ? "Zařaďte dedikovaný strečink po každém sezení – flexibilita s věkem klesá" : "Include dedicated stretching after every session — flexibility decreases with age");
    tips.push(isCs ? "Plánujte deload týden každých 4-6 týdnů" : "Plan a deload week every 4-6 weeks");
  } else {
    tips.push(isCs ? "Vaše regenerační kapacita je silná – využijte toho s konzistentní tréninkovou frekvencí" : "Your recovery capacity is strong — take advantage with consistent training frequency");
  }

  // Sleep quality based
  if (data.sleepQuality === "poor") {
    tips.push(isCs ? "Špatný spánek výrazně zhoršuje regeneraci – toto je vaše priorita č. 1 k nápravě" : "Poor sleep significantly impairs recovery — this is your #1 priority to fix");
  }

  // Activity level
  if (data.activityLevel === "very-active") {
    tips.push(isCs ? "Při vaší vysoké úrovni aktivity sledujte příznaky přetrénování: přetrvávající únava, pokles výkonu nebo změny nálady" : "With your high activity level, monitor for overtraining: persistent fatigue, decreased performance, or mood changes");
  }

  // Stress
  if (data.stressLevel === "high") {
    tips.push(isCs ? "Chronický stres zvyšuje kortizol a zhoršuje regeneraci – aktivní zvládání stresu je nezbytné" : "Chronic stress elevates cortisol and impairs recovery — active stress management is essential");
  }

  tips.push(isCs ? "Nikdy nevynechávejte jídlo po tréninku – je to klíčové okno pro regeneraci" : "Never skip post-workout nutrition — it's a critical recovery window");

  return tips;
}

function generateWeeklyCheckpoints(data: OnboardingData, lang: string): string[] {
  const checkpoints: string[] = [];
  const isCs = lang === 'cs';

  checkpoints.push(isCs ? "Zkontrolujte dokončené tréninky vs. plánované tréninky" : "Review completed workouts vs planned workouts");

  if (data.fitnessGoals.includes("fat-loss") || data.fitnessGoals.includes("recomposition")) {
    checkpoints.push(isCs ? "Sledujte týdenní průměrnou váhu (važte se denně, zprůměrujte 7 dní)" : "Track weekly average weight (weigh daily, average the 7 days)");
  }
  if (data.fitnessGoals.includes("muscle-gain") || data.fitnessGoals.includes("strength")) {
    checkpoints.push(isCs ? "Zaznamenávejte osobní rekordy a pokrok v progresivním přetížení" : "Log personal records and progressive overload progress");
  }

  checkpoints.push(isCs ? "Ohodnoťte svou hladinu energie (1-10) a v případě potřeby upravte intenzitu tréninku" : "Rate your energy level (1-10) and adjust training intensity if needed");

  if (data.obstacles.includes("poor-diet")) {
    checkpoints.push(isCs ? "Spočítejte si, kolik plánovaných vs. neplánovaných jídel jste tento týden měli" : "Count how many planned vs unplanned meals you had this week");
  }

  if (data.sleepQuality !== "good") {
    checkpoints.push(isCs ? "Sledujte průměrné hodiny spánku a zaznamenejte jakékoli zlepšení" : "Track average hours of sleep and note any improvements");
  }

  checkpoints.push(isCs ? "Identifikujte jednu věc, která se podařila, a jednu věc, kterou příští týden zlepšíte" : "Identify one thing that went well and one thing to improve next week");

  if (data.planStyle === "structured") {
    checkpoints.push(isCs ? "Porovnejte skutečné makroživiny vs. cílové makroživiny pro daný týden" : "Compare actual macros vs target macros for the week");
    checkpoints.push(isCs ? "Pořiďte týdenní fotku pokroku za konzistentního osvětlení" : "Take a weekly progress photo under consistent lighting");
  }

  return checkpoints;
}
