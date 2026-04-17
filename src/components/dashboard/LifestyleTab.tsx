import { GeneratedPlan } from "@/types/onboarding";
import { Moon, Lightbulb, Flame, CheckCircle2, Shield, Heart, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  plan: GeneratedPlan;
}

export function LifestyleTab({ plan }: Props) {
  const { lifestyle } = plan;
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Sleep */}
      <SectionCard icon={Moon} title={t('sleepOptimization', 'tabs')}>
        <p className="text-sm text-muted-foreground leading-relaxed">{lifestyle.sleepAdvice}</p>
      </SectionCard>

      {/* Motivation */}
      <SectionCard icon={Flame} title={t('motivationStrategy', 'tabs')}>
        <p className="text-sm text-muted-foreground leading-relaxed">{lifestyle.motivationStrategy}</p>
      </SectionCard>

      {/* Stress Management */}
      {lifestyle.stressManagement.length > 0 && (
        <SectionCard icon={Shield} title={t('stressManagement', 'tabs')}>
          <BulletList items={lifestyle.stressManagement} />
        </SectionCard>
      )}

      {/* Daily Habits */}
      <SectionCard icon={CheckCircle2} title={t('dailyHabits', 'tabs')}>
        <NumberedList items={lifestyle.habits} />
      </SectionCard>

      {/* Discipline */}
      <SectionCard icon={Lightbulb} title={t('disciplineTips', 'tabs')}>
        <BulletList items={lifestyle.disciplineTips} />
      </SectionCard>

      {/* Recovery */}
      {lifestyle.recoveryProtocol.length > 0 && (
        <SectionCard icon={Heart} title={t('recoveryProtocol', 'tabs')}>
          <BulletList items={lifestyle.recoveryProtocol} />
        </SectionCard>
      )}

      {/* Weekly Checkpoints */}
      {lifestyle.weeklyCheckpoints.length > 0 && (
        <SectionCard icon={Calendar} title={t('weeklyCheckpoints', 'tabs')}>
          <NumberedList items={lifestyle.weeklyCheckpoints} />
        </SectionCard>
      )}

      {/* Mindset */}
      <div className="glass-card rounded-xl p-6 border-primary/20">
        <h3 className="font-display font-semibold mb-2 text-primary">{t('mindsetShift', 'tabs')}</h3>
        <p className="text-sm text-foreground leading-relaxed italic">"{lifestyle.mindsetShift}"</p>
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-display font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            {i + 1}
          </span>
          <p className="text-sm text-muted-foreground">{item}</p>
        </div>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="mt-0.5 text-primary">•</span>
          <p className="text-sm text-muted-foreground">{item}</p>
        </div>
      ))}
    </div>
  );
}
