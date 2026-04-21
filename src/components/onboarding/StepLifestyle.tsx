import { OnboardingData } from "@/types/onboarding";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
}

const selectOptions = (
  items: { id: string; label: string }[],
  value: string,
  onSelect: (id: string) => void
) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => (
      <button
        key={item.id}
        onClick={() => onSelect(item.id)}
        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${value === item.id
          ? "bg-primary/10 border-primary text-foreground"
          : "bg-secondary border-border text-secondary-foreground hover:border-primary/40"
          }`}
      >
        {item.label}
      </button>
    ))}
  </div>
);

export function StepLifestyle({ data, onChange }: Props) {
  const { t } = useLanguage();

  return (
    <div className="space-y-10">
      {/* Training Frequency */}
      <div className="space-y-4">
        {selectOptions(
          [
            { id: "1", label: t('freq1', 'onboarding') },
            { id: "2", label: t('freq2', 'onboarding') },
            { id: "3", label: t('freq3', 'onboarding') },
            { id: "4", label: t('freq4', 'onboarding') },
            { id: "5", label: t('freq5', 'onboarding') },
            { id: "6", label: t('freq6', 'onboarding') },
            { id: "7", label: t('freq7', 'onboarding') },
          ],
          data.trainingFrequency,
          (id) => onChange({ trainingFrequency: id })
        )}
      </div>

      {/* Home Equipment - Only show if Home or Mixed is selected */}
      {(data.workoutLocation === "home" || data.workoutLocation === "mixed") && (
        <div className="space-y-4">
          <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('homeEquipment', 'onboarding')}</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "homeNone", key: "homeNone" },
              { id: "homeDumbbells", key: "homeDumbbells" },
              { id: "homeBands", key: "homeBands" },
              { id: "homeBarbell", key: "homeBarbell" },
              { id: "homePullup", key: "homePullup" },
              { id: "homeKettlebell", key: "homeKettlebell" },
              { id: "homeBench", key: "homeBench" },
            ].map((item) => {
              const isSelected = data.homeEquipment.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    let next;
                    if (item.id === "homeNone") {
                      next = ["homeNone"];
                    } else {
                      next = data.homeEquipment.filter(i => i !== "homeNone");
                      if (isSelected) {
                        next = next.filter(i => i !== item.id);
                      } else {
                        next.push(item.id);
                      }
                    }
                    if (next.length === 0) next = ["homeNone"];
                    onChange({ homeEquipment: next });
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isSelected
                    ? "bg-primary/10 border-primary text-foreground"
                    : "bg-secondary border-border text-secondary-foreground hover:border-primary/40"
                    }`}
                >
                  {t(item.key, 'onboarding')}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Training Duration */}
      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('preferredDuration', 'onboarding')}</Label>
        {selectOptions(
          [
            { id: "under-30", label: t('under30', 'onboarding') },
            { id: "30-45", label: t('30-45', 'onboarding') },
            { id: "45-60", label: t('45-60', 'onboarding') },
            { id: "over-60", label: t('over60', 'onboarding') },
          ],
          data.trainingDuration,
          (id) => onChange({ trainingDuration: id })
        )}
      </div>

      {/* Workout Location */}
      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('workoutLocation', 'onboarding')}</Label>
        {selectOptions(
          [
            { id: "gym", label: t('gym', 'onboarding') },
            { id: "home", label: t('home', 'onboarding') },
            { id: "outdoor", label: t('outdoor', 'onboarding') },
            { id: "mixed", label: t('mixed', 'onboarding') },
          ],
          data.workoutLocation,
          (id) => onChange({ workoutLocation: id })
        )}
      </div>

      {/* Discipline slider */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('disciplineLevel', 'onboarding')}</Label>
          <span className="text-sm text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">{data.disciplineLevel}/10</span>
        </div>
        <Slider
          value={[data.disciplineLevel]}
          onValueChange={([v]) => onChange({ disciplineLevel: v })}
          min={1} max={10} step={1}
          className="w-full"
        />
      </div>

      {/* Motivation slider */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('motivationLevel', 'onboarding')}</Label>
          <span className="text-sm text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">{data.motivationLevel}/10</span>
        </div>
        <Slider
          value={[data.motivationLevel]}
          onValueChange={([v]) => onChange({ motivationLevel: v })}
          min={1} max={10} step={1}
        />
      </div>

      {/* Sleep */}
      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('sleepQuality', 'onboarding')}</Label>
        {selectOptions(
          [{ id: "poor", label: t('poor', 'onboarding') }, { id: "average", label: t('average', 'onboarding') }, { id: "good", label: t('good', 'onboarding') }],
          data.sleepQuality,
          (id) => onChange({ sleepQuality: id })
        )}
      </div>

      {/* Activity */}
      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('activityLevel', 'onboarding')}</Label>
        {selectOptions(
          [
            { id: "sedentary", label: t('sedentary', 'onboarding') },
            { id: "lightly-active", label: t('lightActive', 'onboarding') },
            { id: "moderately-active", label: t('modActive', 'onboarding') },
            { id: "very-active", label: t('veryActive', 'onboarding') },
          ],
          data.activityLevel,
          (id) => onChange({ activityLevel: id })
        )}
      </div>

      {/* Stress */}
      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('stressLevel', 'onboarding')}</Label>
        {selectOptions(
          [{ id: "low", label: t('low', 'onboarding') }, { id: "moderate", label: t('moderate', 'onboarding') }, { id: "high", label: t('high', 'onboarding') }],
          data.stressLevel,
          (id) => onChange({ stressLevel: id })
        )}
      </div>

      {/* Proactivity */}
      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('proactivityLevel', 'onboarding')}</Label>
        {selectOptions(
          [{ id: "low", label: t('low', 'onboarding') }, { id: "moderate", label: t('moderate', 'onboarding') }, { id: "high", label: t('high', 'onboarding') }],
          data.proactivity,
          (id) => onChange({ proactivity: id })
        )}
      </div>

      {/* Self-development */}
      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('selfDevelopment', 'onboarding')}</Label>
        {selectOptions(
          [{ id: "low", label: t('low', 'onboarding') }, { id: "moderate", label: t('moderate', 'onboarding') }, { id: "high", label: t('high', 'onboarding') }],
          data.selfDevelopment,
          (id) => onChange({ selfDevelopment: id })
        )}
      </div>

      {/* Perfectionism */}
      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('perfectionismLevel', 'onboarding')}</Label>
        {selectOptions(
          [{ id: "low", label: t('low', 'onboarding') }, { id: "moderate", label: t('moderate', 'onboarding') }, { id: "high", label: t('high', 'onboarding') }],
          data.perfectionism,
          (id) => onChange({ perfectionism: id })
        )}
      </div>
    </div>
  );
}
