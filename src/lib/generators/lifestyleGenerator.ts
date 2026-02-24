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
export function generateLifestylePlan(data: OnboardingData): LifestylePlan {
  return {
    sleepAdvice: generateSleepAdvice(data),
    habits: generateHabits(data),
    motivationStrategy: generateMotivationStrategy(data),
    disciplineTips: generateDisciplineTips(data),
    mindsetShift: generateMindsetShift(data),
    stressManagement: generateStressManagement(data),
    recoveryProtocol: generateRecoveryProtocol(data),
    weeklyCheckpoints: generateWeeklyCheckpoints(data),
  };
}

function generateSleepAdvice(data: OnboardingData): string {
  const age = parseInt(data.age) || 25;

  if (data.sleepQuality === "poor") {
    let advice = "Sleep is your #1 recovery tool and it needs immediate attention. ";
    advice += "Establish a non-negotiable bedtime routine: ";
    advice += "no screens 1 hour before bed, keep your room cool (18-20°C) and completely dark. ";
    if (data.stressLevel === "high") {
      advice += "Since your stress levels are high, add 10 minutes of guided breathing or journaling before bed. ";
    }
    if (age > 40) {
      advice += "At your age, sleep quality directly impacts recovery and hormone balance — prioritize 7-9 hours consistently. ";
    }
    advice += "Consider limiting caffeine after 2 PM and avoiding heavy meals within 2 hours of bedtime.";
    return advice;
  }

  if (data.sleepQuality === "average") {
    let advice = "Your sleep is decent but there's room for optimization. ";
    advice += "Aim for 7-8 hours consistently, going to bed and waking up at the same time daily — even on weekends. ";
    if (data.stressLevel !== "low") {
      advice += "A 5-minute wind-down routine (stretching, deep breathing) can significantly improve sleep quality. ";
    }
    if (data.fitnessGoals.includes("muscle-gain")) {
      advice += "Quality sleep is when most muscle repair happens — treat it as part of your training program.";
    }
    return advice;
  }

  // Good sleep
  let advice = "Excellent sleep habits — this is a major advantage for your goals. ";
  advice += "Maintain your current routine and keep it consistent. ";
  if (data.fitnessGoals.includes("strength") || data.fitnessGoals.includes("muscle-gain")) {
    advice += "Your recovery capacity is strong, which means you can handle slightly higher training volumes.";
  }
  return advice;
}

function generateHabits(data: OnboardingData): string[] {
  const habits: string[] = [];
  const discipline = data.disciplineLevel;
  const planStyle = data.planStyle;

  // Foundation habits based on discipline level
  if (discipline <= 3) {
    habits.push("Start with ONE daily habit and master it before adding more — consistency beats intensity");
    habits.push("Use the 2-minute rule: if a habit takes less than 2 minutes, do it immediately");
    habits.push("Set a daily alarm for your workout — treat it like a meeting you can't cancel");
  } else if (discipline <= 6) {
    habits.push("Stack new habits onto existing ones (e.g., prepare gym clothes right after brushing teeth)");
    habits.push("Track your workouts in a journal or app — what gets measured gets managed");
  } else {
    habits.push("Your discipline is your superpower — channel it into progressive overload tracking");
    habits.push("Set weekly micro-goals that build toward monthly milestones");
  }

  // Proactivity-based habits
  if (data.proactivity === "low") {
    habits.push("Prepare everything the night before: gym bag, meals, outfit — remove morning decisions");
    habits.push("Set specific times for workouts — vague plans lead to skipped sessions");
  } else if (data.proactivity === "high") {
    habits.push("Use your proactive nature to meal prep 2-3 days in advance");
    habits.push("Review and adjust your plan weekly based on how your body responds");
  }

  // Self-development integration
  if (data.selfDevelopment === "high") {
    habits.push("Read or listen to 10 minutes of fitness/health content daily to reinforce your commitment");
    habits.push("Journal your energy levels and mood alongside workouts to identify patterns");
  } else if (data.selfDevelopment === "moderate") {
    habits.push("Follow one fitness educator online for consistent, practical tips");
  }

  // Obstacle-specific habits
  if (data.obstacles.includes("stress")) {
    habits.push("Schedule 10 minutes of daily decompression (walking, breathing, or stretching)");
  }
  if (data.obstacles.includes("poor-diet")) {
    habits.push("Replace one unhealthy meal per day with a planned alternative — small wins compound");
  }
  if (data.obstacles.includes("inconsistent-routine")) {
    habits.push("Use a weekly Sunday planning session: schedule all workouts and meal prep times");
  }

  // Activity level habits
  if (data.activityLevel === "sedentary") {
    habits.push("Add 5,000+ daily steps — use a step counter and gradually increase");
    habits.push("Take a 5-minute movement break every hour during sedentary work");
  }

  // Advantage-based habits
  if (data.advantages.includes("previous-experience")) {
    habits.push("Leverage your experience: focus on progressive overload rather than changing routines constantly");
  }

  // Universal
  habits.push("Stay hydrated — aim for 2-3 liters of water daily, more on training days");

  // Simple plan: limit habits
  if (planStyle === "simple") return habits.slice(0, 4);
  if (planStyle === "structured") return habits;
  return habits.slice(0, 6); // flexible
}

function generateMotivationStrategy(data: OnboardingData): string {
  const motivation = data.motivationLevel;
  const goals = data.fitnessGoals;

  if (motivation <= 3) {
    let strategy = "Your motivation is low, and that's okay — we'll build on discipline, not feelings. ";
    strategy += "Schedule workouts like non-negotiable appointments. Start with just showing up — even a 15-minute session counts. ";
    if (data.obstacles.includes("low-motivation")) {
      strategy += "Find your 'why': write down your top 3 reasons for starting this journey and read them every morning. ";
    }
    if (data.advantages.includes("previous-experience")) {
      strategy += "You've done this before — remember how good it felt. That muscle memory is still there.";
    } else {
      strategy += "Focus on the first 21 days — after that, the habit will start carrying you forward.";
    }
    return strategy;
  }

  if (motivation <= 6) {
    let strategy = "You have moderate motivation — the key is building momentum through small wins. ";
    strategy += "Track progress photos monthly and celebrate hitting personal records. ";
    if (goals.includes("fat-loss")) {
      strategy += "Don't rely on the scale alone — use measurements and how clothes fit as progress markers. ";
    }
    if (goals.includes("muscle-gain") || goals.includes("strength")) {
      strategy += "Keep a training log and aim to beat last week's numbers — progressive overload is motivating. ";
    }
    strategy += "Find a training partner or community for accountability.";
    return strategy;
  }

  let strategy = "Your motivation is high — channel it into consistency rather than intensity. ";
  strategy += "Set progressive challenges each week. Remember that plateaus are part of the process and not a sign to change everything. ";
  if (data.perfectionism === "high") {
    strategy += "Be careful not to let perfectionism lead to burnout — 80% consistency beats 100% for two weeks.";
  } else {
    strategy += "Use your drive to master form and technique before chasing heavy weights.";
  }
  return strategy;
}

function generateDisciplineTips(data: OnboardingData): string[] {
  const tips: string[] = [];
  const discipline = data.disciplineLevel;

  // Core discipline tips
  tips.push("Treat your training schedule as non-negotiable — it's an appointment with your future self");

  if (discipline <= 4) {
    tips.push("Start with the minimum effective dose: 2-3 sessions per week, 30-40 minutes each");
    tips.push("Remove friction: prepare your gym bag and clothes the night before");
    tips.push("Use a visual streak tracker — seeing consecutive days of effort builds momentum");
  } else if (discipline <= 7) {
    tips.push("Follow the plan exactly as written for the first 4 weeks — trust the process");
    tips.push("Remove decision fatigue: don't question the plan, just execute");
    if (data.obstacles.includes("inconsistent-routine")) {
      tips.push("Anchor workouts to a consistent time slot — morning exercisers are 90% more consistent");
    }
  } else {
    tips.push("Your discipline is exceptional — focus on strategic rest days and deload weeks");
    tips.push("Channel your consistency into tracking: log every workout, meal, and recovery metric");
  }

  // Perfectionism management
  if (data.perfectionism === "high") {
    tips.push("Embrace 80% consistency over 100% perfection — done always beats perfect");
    tips.push("A 'bad' workout is infinitely better than a skipped one");
  } else if (data.perfectionism === "low") {
    tips.push("Hold yourself to a higher standard this time — consistency is non-negotiable, not optional");
  }

  // Plan style tips
  if (data.planStyle === "flexible") {
    tips.push("Flexible doesn't mean optional — complete your weekly targets even if days shift around");
  }
  if (data.planStyle === "structured") {
    tips.push("Review your plan every Sunday evening and mentally commit to each session");
  }

  return tips;
}

function generateMindsetShift(data: OnboardingData): string {
  const goals = data.fitnessGoals;

  if (goals.includes("lifestyle-change")) {
    return "You're not just changing your body — you're rebuilding your identity. Every small decision to eat better, train harder, or rest properly is a vote for the person you want to become. This isn't a 12-week program — it's the beginning of how you live from now on. Trust the process, be patient with yourself, and remember: the person who shows up every day always wins.";
  }

  if (goals.includes("fat-loss")) {
    return "Fat loss is not a punishment — it's a process of revealing the strength underneath. Focus on what you're gaining: energy, confidence, capability. The scale will fluctuate, but your habits won't if you commit to the system. Measure progress in months, not days. Every meal is a choice, and every workout is an investment.";
  }

  if (goals.includes("muscle-gain")) {
    return "Building muscle is the ultimate patience game. Your body changes slowly, but it changes permanently when you're consistent. Trust the progressive overload, eat enough to fuel growth, and sleep like it's part of your training — because it is. The mirror lies; the logbook doesn't. Track your lifts, and the physique will follow.";
  }

  if (goals.includes("strength")) {
    return "Strength is built one rep at a time. Respect the process: perfect your form before chasing numbers. Every heavy set teaches your nervous system something new. Recovery is where strength is actually built — train hard, rest harder. In six months, weights that feel impossible today will be your warm-up.";
  }

  return "Transformation is a marathon, not a sprint. Focus on the process, trust the system, and measure progress in months, not days. Every workout counts, every meal matters, and every good decision compounds over time. You don't need to be perfect — you need to be persistent.";
}

function generateStressManagement(data: OnboardingData): string[] {
  const tips: string[] = [];

  if (data.stressLevel === "high") {
    tips.push("Use training as a stress outlet — prioritize compound movements that release tension");
    tips.push("Practice box breathing (4-4-4-4) before stressful situations and before bed");
    tips.push("Limit news and social media consumption to designated times");
    tips.push("Consider a 10-minute daily walk in nature — it measurably reduces cortisol");
    if (data.selfDevelopment === "high") {
      tips.push("Explore journaling or a gratitude practice to reframe daily stressors");
    }
  } else if (data.stressLevel === "moderate") {
    tips.push("Use your workouts as active stress management — exercise is a proven mood regulator");
    tips.push("Build one daily relaxation ritual: stretching, reading, or a brief meditation");
  } else {
    tips.push("Your low stress is an advantage — channel that clarity into focused, intentional training");
  }

  return tips;
}

function generateRecoveryProtocol(data: OnboardingData): string[] {
  const tips: string[] = [];
  const age = parseInt(data.age) || 25;

  // Age-based recovery
  if (age > 45) {
    tips.push("Prioritize 10-15 min mobility work daily — joint health is critical for long-term training");
    tips.push("Consider deload weeks every 3-4 weeks to manage cumulative fatigue");
  } else if (age > 30) {
    tips.push("Include dedicated stretching after every session — flexibility decreases with age");
    tips.push("Plan a deload week every 4-6 weeks");
  } else {
    tips.push("Your recovery capacity is strong — take advantage with consistent training frequency");
  }

  // Sleep quality based
  if (data.sleepQuality === "poor") {
    tips.push("Poor sleep significantly impairs recovery — this is your #1 priority to fix");
  }

  // Activity level
  if (data.activityLevel === "very-active") {
    tips.push("With your high activity level, monitor for overtraining: persistent fatigue, decreased performance, or mood changes");
  }

  // Stress
  if (data.stressLevel === "high") {
    tips.push("Chronic stress elevates cortisol and impairs recovery — active stress management is essential");
  }

  tips.push("Never skip post-workout nutrition — it's a critical recovery window");

  return tips;
}

function generateWeeklyCheckpoints(data: OnboardingData): string[] {
  const checkpoints: string[] = [];

  checkpoints.push("Review completed workouts vs planned workouts");

  if (data.fitnessGoals.includes("fat-loss") || data.fitnessGoals.includes("recomposition")) {
    checkpoints.push("Track weekly average weight (weigh daily, average the 7 days)");
  }
  if (data.fitnessGoals.includes("muscle-gain") || data.fitnessGoals.includes("strength")) {
    checkpoints.push("Log personal records and progressive overload progress");
  }

  checkpoints.push("Rate your energy level (1-10) and adjust training intensity if needed");

  if (data.obstacles.includes("poor-diet")) {
    checkpoints.push("Count how many planned vs unplanned meals you had this week");
  }

  if (data.sleepQuality !== "good") {
    checkpoints.push("Track average hours of sleep and note any improvements");
  }

  checkpoints.push("Identify one thing that went well and one thing to improve next week");

  if (data.planStyle === "structured") {
    checkpoints.push("Compare actual macros vs target macros for the week");
    checkpoints.push("Take a weekly progress photo under consistent lighting");
  }

  return checkpoints;
}
