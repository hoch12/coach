import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingData, defaultOnboardingData } from "@/types/onboarding";
import { StepPersonal } from "@/components/onboarding/StepPersonal";
import { StepGoals } from "@/components/onboarding/StepGoals";
import { StepObstacles } from "@/components/onboarding/StepObstacles";
import { StepLifestyle } from "@/components/onboarding/StepLifestyle";
import { StepNutrition } from "@/components/onboarding/StepNutrition";
import { StepPlanStyle } from "@/components/onboarding/StepPlanStyle";
import { generatePlan } from "@/lib/planGenerator";

const STEPS = [
  { id: "personal", title: "Personal Data", subtitle: "Tell us about yourself" },
  { id: "goals", title: "Your Goals", subtitle: "What do you want to achieve?" },
  { id: "obstacles", title: "Obstacles & Advantages", subtitle: "What helps or holds you back?" },
  { id: "lifestyle", title: "Lifestyle & Mindset", subtitle: "Your daily patterns" },
  { id: "nutrition", title: "Nutrition", subtitle: "Your eating habits" },
  { id: "plan-style", title: "Plan Preference", subtitle: "How should we structure your plan?" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData);

  const updateData = (partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const handleFinish = () => {
    const plan = generatePlan(data);
    // Store in localStorage for the dashboard
    localStorage.setItem("fitforge-onboarding", JSON.stringify(data));
    localStorage.setItem("fitforge-plan", JSON.stringify(plan));
    navigate("/dashboard");
  };

  const canNext = step < STEPS.length - 1;
  const canPrev = step > 0;

  const renderStep = () => {
    switch (step) {
      case 0: return <StepPersonal data={data} onChange={updateData} />;
      case 1: return <StepGoals data={data} onChange={updateData} />;
      case 2: return <StepObstacles data={data} onChange={updateData} />;
      case 3: return <StepLifestyle data={data} onChange={updateData} />;
      case 4: return <StepNutrition data={data} onChange={updateData} />;
      case 5: return <StepPlanStyle data={data} onChange={updateData} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="font-display font-bold">FitForge</span>
        </button>
        <span className="text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </span>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          {/* Step Title */}
          <motion.div
            key={`title-${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
              {STEPS[step].title}
            </h1>
            <p className="text-muted-foreground">{STEPS[step].subtitle}</p>
          </motion.div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-5 border-t border-border/50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => canPrev ? setStep(step - 1) : navigate("/")}
            className="text-muted-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {canPrev ? "Back" : "Home"}
          </Button>

          {canNext ? (
            <Button variant="hero" onClick={() => setStep(step + 1)}>
              Continue
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="hero" onClick={handleFinish}>
              Generate My Plan
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
