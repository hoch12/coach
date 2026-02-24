import { OnboardingData } from "@/types/onboarding";
import { Target, Flame, RotateCw, Zap, Heart, Sparkles } from "lucide-react";

interface Props {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
}

const goals = [
  { id: "muscle-gain", label: "Muscle Gain", icon: Zap },
  { id: "fat-loss", label: "Fat Loss", icon: Flame },
  { id: "recomposition", label: "Recomposition", icon: RotateCw },
  { id: "strength", label: "Strength", icon: Target },
  { id: "general-fitness", label: "General Fitness", icon: Heart },
  { id: "lifestyle-change", label: "Lifestyle Change", icon: Sparkles },
];

export function StepGoals({ data, onChange }: Props) {
  const toggle = (id: string) => {
    const current = data.fitnessGoals;
    const next = current.includes(id)
      ? current.filter((g) => g !== id)
      : [...current, id];
    onChange({ fitnessGoals: next });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Select all that apply</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {goals.map((goal) => {
          const selected = data.fitnessGoals.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggle(goal.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                selected
                  ? "bg-primary/10 border-primary text-foreground"
                  : "bg-secondary border-border text-secondary-foreground hover:border-primary/40"
              }`}
            >
              <goal.icon className={`h-5 w-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
              <span className="font-medium text-sm">{goal.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
