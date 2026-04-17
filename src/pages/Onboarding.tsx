import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { validateStepData } from "@/types/onboarding";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";

const getSteps = (t: any) => [
  { id: "personal", title: t('personalData', 'onboarding'), subtitle: t('tellUsAbout', 'onboarding') },
  { id: "goals", title: t('fitnessGoals', 'onboarding'), subtitle: t('whatAchieve', 'onboarding') },
  { id: "obstacles", title: t('obstaclesTitle', 'onboarding'), subtitle: t('obstaclesSubtitle', 'onboarding') },
  { id: "lifestyle", title: t('lifestyleTitle', 'onboarding'), subtitle: t('lifestyleSubtitle', 'onboarding') },
  { id: "nutrition", title: t('nutritionTitle', 'onboarding'), subtitle: t('nutritionSubtitle', 'onboarding') },
  { id: "plan-style", title: t('planPreference', 'onboarding'), subtitle: t('planStyleSubtitle', 'onboarding') },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("client_id");
  const { token, user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const STEPS = getSteps(t);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'trainer')) {
      if (!clientId) {
        navigate(user.role === 'admin' ? '/admin' : '/trainer');
      }
    }
  }, [user, navigate, clientId]);

  const [step, setStep] = useState(() => {
    if (clientId) return 0;
    const saved = localStorage.getItem("fitforge-onboarding-step");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [data, setData] = useState<OnboardingData>(() => {
    if (clientId) return defaultOnboardingData;
    const saved = localStorage.getItem("fitforge-onboarding-data");
    return saved ? JSON.parse(saved) : defaultOnboardingData;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load existing profile from backend on mount if we haven't modified local data yet
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const url = clientId 
          ? getApiUrl(`/api/admin/users/${clientId}/profile`) 
          : getApiUrl("/api/profile");
          
        const res = await fetch(url, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const profileData = await res.json();
          if (profileData && profileData.age) {
            // Use API data directly for specific profile editing
            setData({ ...defaultOnboardingData, ...profileData });
          }
        }
      } catch (e) {
        console.error("Failed to fetch profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token, clientId]);

  // Save changes to localStorage
  useEffect(() => {
    if (!clientId) {
      localStorage.setItem("fitforge-onboarding-step", step.toString());
    }
  }, [step, clientId]);

  useEffect(() => {
    if (!clientId) {
      localStorage.setItem("fitforge-onboarding-data", JSON.stringify(data));
    }
  }, [data, clientId]);

  const updateData = (partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const handleNext = () => {
    const validation = validateStepData(step, data);
    if (!validation.success) {
      toast.error(t(validation.message || 'error', 'onboarding'));
      return;
    }
    setStep(step + 1);
  };

  const handleFinish = async () => {
    const validation = validateStepData(step, data);
    if (!validation.success) {
      toast.error(t(validation.message || 'error', 'onboarding'));
      return;
    }

    const finalData: any = { ...data, appVersion: "1.3.0" };
    if (clientId) finalData.userId = parseInt(clientId, 10);
    const plan = generatePlan(finalData, language);

    // Save to our backend
    try {
      await fetch(getApiUrl("/api/profile"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(finalData)
      });

      await fetch(getApiUrl("/api/plan"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
           plan_data: plan,
           userId: clientId ? parseInt(clientId, 10) : undefined 
        })
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to save plan entirely, proceeding locally.");
    }

    if (clientId) {
      toast.success("Client plan saved.");
      navigate("/trainer");
    } else {
      // Store in localStorage for immediate visual sync if necessary
      localStorage.removeItem("fitforge-onboarding-step");
      localStorage.removeItem("fitforge-onboarding-data");
      localStorage.setItem("fitforge-plan", JSON.stringify(plan));
      navigate("/dashboard");
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><p>Loading your data...</p></div>;

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
      <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-display font-bold hidden sm:inline">Coach-E</span>
          </button>
          <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
            {t('step', 'onboarding')} {step + 1} {t('of', 'onboarding')} {STEPS.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-background/50 backdrop-blur rounded-lg p-1 mr-2 border border-border/50">
                <button 
                  onClick={() => setLanguage('en')} 
                  className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${language === 'en' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:text-primary'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('cs')} 
                  className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${language === 'cs' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:text-primary'}`}
                >
                  CS
                </button>
            </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => {
            logout();
            navigate("/login");
          }}>
            {t('logout', 'common')}
          </Button>
        </div>
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
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-2">
              {t('step', 'onboarding') || "Step"} {step + 1} / {STEPS.length}
            </div>
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
            {canPrev ? t('back', 'onboarding') : t('home', 'onboarding')}
          </Button>

          {canNext ? (
            <Button variant="hero" onClick={handleNext}>
              {t('continue', 'onboarding')}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="hero" onClick={handleFinish}>
              {t('generatePlan', 'onboarding')}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
