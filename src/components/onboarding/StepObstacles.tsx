import { OnboardingData } from "@/types/onboarding";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
}

const getObstacleOptions = (t: any) => [
  { id: "lack-of-time", label: t('lackOfTime', 'onboarding') },
  { id: "low-motivation", label: t('lowMotivation', 'onboarding') },
  { id: "stress", label: t('highStress', 'onboarding') },
  { id: "inconsistent-routine", label: t('inconsistentRoutine', 'onboarding') },
  { id: "poor-diet", label: t('poorDiet', 'onboarding') },
  { id: "other", label: t('otherLimitations', 'onboarding') },
];

const getAdvantageOptions = (t: any) => [
  { id: "gym-access", label: t('gymAccess', 'onboarding') },
  { id: "home-equipment", label: t('homeEquipment', 'onboarding') },
  { id: "time-flexibility", label: t('timeFlexibility', 'onboarding') },
  { id: "previous-experience", label: t('prevExperience', 'onboarding') },
];

function MultiSelect({ items, selected, onToggle }: {
  items: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = selected.includes(item.id);
        return (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              active
                ? "bg-primary/10 border-primary text-foreground"
                : "bg-secondary border-border text-secondary-foreground hover:border-primary/40"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function StepObstacles({ data, onChange }: Props) {
  const { t } = useLanguage();
  const obstacleOptions = getObstacleOptions(t);
  const advantageOptions = getAdvantageOptions(t);

  const toggleObstacle = (id: string) => {
    const next = data.obstacles.includes(id)
      ? data.obstacles.filter((o) => o !== id)
      : [...data.obstacles, id];
    onChange({ obstacles: next });
  };

  const toggleAdvantage = (id: string) => {
    const next = data.advantages.includes(id)
      ? data.advantages.filter((a) => a !== id)
      : [...data.advantages, id];
    onChange({ advantages: next });
  };

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('obstaclesFace', 'onboarding')}</Label>
        <MultiSelect items={obstacleOptions} selected={data.obstacles} onToggle={toggleObstacle} />
      </div>
      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('advantagesHave', 'onboarding')}</Label>
        <MultiSelect items={advantageOptions} selected={data.advantages} onToggle={toggleAdvantage} />
      </div>
    </div>
  );
}
