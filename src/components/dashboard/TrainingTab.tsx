import { GeneratedPlan } from "@/types/onboarding";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  plan: GeneratedPlan;
}

export function TrainingTab({ plan }: Props) {
  const { t, tPlan } = useLanguage();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-display font-semibold mb-4">{t('weeklySplit', 'tabs')}</h2>
      <div className="grid gap-4">
        {plan.trainingSplit.map((day) => (
          <div key={day.day} className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-primary/5 border-b border-border/50">
              <div>
                <span className="font-display font-semibold text-sm">{tPlan(day.day)}</span>
                <span className="ml-3 text-xs text-primary font-medium">{day.focus}</span>
              </div>
              <span className="text-xs text-muted-foreground">{day.exercises.length} {t('exercises', 'tabs')}</span>
            </div>
            <div className="divide-y divide-border/30">
              {day.exercises.map((ex, i) => (
                <div key={i} className="flex items-start justify-between px-5 py-3 gap-4">
                  <span className="text-sm font-medium leading-tight flex-1">{ex.name}</span>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{ex.sets} × {ex.reps}</span>
                    <span className="hidden sm:inline">{t('rest', 'tabs')}: {ex.rest}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
