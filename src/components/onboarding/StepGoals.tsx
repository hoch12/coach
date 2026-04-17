import { OnboardingData } from "@/types/onboarding";
import { Target, Flame, RotateCw, Zap, Heart, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
}

const goals = [
  { id: "muscle-gain", key: "buildMuscle", icon: Zap },
  { id: "fat-loss", key: "loseFat", icon: Flame },
  { id: "recomposition", key: "stayHealthy", icon: RotateCw },
  { id: "strength", key: "getStronger", icon: Target },
  { id: "general-fitness", key: "improveEndurance", icon: Heart },
  { id: "lifestyle-change", key: "stayHealthy", icon: Sparkles },
];

export function StepGoals({ data, onChange }: Props) {
  const { t } = useLanguage();
  const toggle = (id: string) => {
    const current = data.fitnessGoals;
    const next = current.includes(id)
      ? current.filter((g) => g !== id)
      : [...current, id];
    onChange({ fitnessGoals: next });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{t('selectAllApply', 'onboarding') || "Select all that apply"}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {goals.map((goal) => {
          const selected = data.fitnessGoals.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggle(goal.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                selected
                  ? "bg-primary/10 border-primary text-foreground scale-[1.01]"
                  : "bg-secondary border-border text-secondary-foreground hover:border-primary/40"
              }`}
            >
              <goal.icon className={`h-5 w-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
              <span className="font-medium text-sm">{t(goal.key, 'onboarding')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
