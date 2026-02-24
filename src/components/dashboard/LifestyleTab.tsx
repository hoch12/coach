import { GeneratedPlan } from "@/types/onboarding";
import { Moon, Lightbulb, Flame, CheckCircle2 } from "lucide-react";

interface Props {
  plan: GeneratedPlan;
}

export function LifestyleTab({ plan }: Props) {
  const { lifestyle } = plan;

  return (
    <div className="space-y-6">
      {/* Sleep */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Moon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-display font-semibold">Sleep Optimization</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{lifestyle.sleepAdvice}</p>
      </div>

      {/* Motivation */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-display font-semibold">Motivation Strategy</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{lifestyle.motivationStrategy}</p>
      </div>

      {/* Daily habits */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-display font-semibold">Daily Habits</h3>
        </div>
        <div className="space-y-3">
          {lifestyle.habits.map((habit, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <p className="text-sm text-muted-foreground">{habit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Discipline */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-display font-semibold">Discipline Tips</h3>
        </div>
        <div className="space-y-3">
          {lifestyle.disciplineTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-0.5 text-primary">•</span>
              <p className="text-sm text-muted-foreground">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mindset */}
      <div className="glass-card rounded-xl p-6 border-primary/20">
        <h3 className="font-display font-semibold mb-2 text-primary">Mindset Shift</h3>
        <p className="text-sm text-foreground leading-relaxed italic">"{lifestyle.mindsetShift}"</p>
      </div>
    </div>
  );
}
