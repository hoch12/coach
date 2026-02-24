import { OnboardingData } from "@/types/onboarding";
import { Label } from "@/components/ui/label";
import { ListChecks, Shuffle, Target } from "lucide-react";

interface Props {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
}

const styles = [
  {
    id: "simple",
    label: "Simple Plan",
    description: "Straightforward, easy to follow. Perfect for beginners.",
    icon: ListChecks,
  },
  {
    id: "structured",
    label: "Structured & Strict",
    description: "Detailed, disciplined approach with precise targets.",
    icon: Target,
  },
  {
    id: "flexible",
    label: "Flexible Approach",
    description: "Adaptable framework that fits around your lifestyle.",
    icon: Shuffle,
  },
];

export function StepPlanStyle({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Label>How should your plan be structured?</Label>
      <div className="grid gap-3">
        {styles.map((style) => {
          const selected = data.planStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => onChange({ planStyle: style.id })}
              className={`flex items-start gap-4 p-5 rounded-xl border text-left transition-all ${
                selected
                  ? "bg-primary/10 border-primary"
                  : "bg-secondary border-border hover:border-primary/40"
              }`}
            >
              <div className={`mt-0.5 p-2 rounded-lg ${selected ? "bg-primary/20" : "bg-muted"}`}>
                <style.icon className={`h-5 w-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="font-medium text-sm">{style.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{style.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
