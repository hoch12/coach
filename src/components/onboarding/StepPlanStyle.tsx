import { OnboardingData } from "@/types/onboarding";
import { Label } from "@/components/ui/label";
import { ListChecks, Shuffle, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
}

export function StepPlanStyle({ data, onChange }: Props) {
  const { t } = useLanguage();

  const styles = [
    {
      id: "simple",
      label: t('simplePlan', 'onboarding'),
      description: t('simplePlanDesc', 'onboarding'),
      icon: ListChecks,
    },
    {
      id: "structured",
      label: t('structuredStrict', 'onboarding'),
      description: t('structuredStrictDesc', 'onboarding'),
      icon: Target,
    },
    {
      id: "flexible",
      label: t('flexibleApproach', 'onboarding'),
      description: t('flexibleApproachDesc', 'onboarding'),
      icon: Shuffle,
    },
  ];

  return (
    <div className="space-y-6">
      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('planStructure', 'onboarding')}</Label>
      <div className="grid gap-4">
        {styles.map((style) => {
          const selected = data.planStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => onChange({ planStyle: style.id })}
              className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all ${
                selected
                  ? "bg-primary/10 border-primary shadow-lg shadow-primary/5 scale-[1.01]"
                  : "bg-secondary/40 border-border/50 hover:border-primary/40"
              }`}
            >
              <div className={`mt-0.5 p-3 rounded-xl ${selected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                <style.icon className="h-6 w-6" />
              </div>
              <div>
                <p className={`font-bold text-sm ${selected ? "text-primary" : "text-foreground"}`}>{style.label}</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{style.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
