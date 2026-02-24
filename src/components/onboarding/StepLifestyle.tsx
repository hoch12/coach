import { OnboardingData } from "@/types/onboarding";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

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
        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
          value === item.id
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
  return (
    <div className="space-y-7">
      {/* Discipline slider */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <Label>Discipline Level</Label>
          <span className="text-sm text-primary font-medium">{data.disciplineLevel}/10</span>
        </div>
        <Slider
          value={[data.disciplineLevel]}
          onValueChange={([v]) => onChange({ disciplineLevel: v })}
          min={1} max={10} step={1}
          className="w-full"
        />
      </div>

      {/* Motivation slider */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <Label>Motivation Level</Label>
          <span className="text-sm text-primary font-medium">{data.motivationLevel}/10</span>
        </div>
        <Slider
          value={[data.motivationLevel]}
          onValueChange={([v]) => onChange({ motivationLevel: v })}
          min={1} max={10} step={1}
        />
      </div>

      {/* Sleep */}
      <div className="space-y-3">
        <Label>Sleep Quality</Label>
        {selectOptions(
          [{ id: "poor", label: "Poor" }, { id: "average", label: "Average" }, { id: "good", label: "Good" }],
          data.sleepQuality,
          (id) => onChange({ sleepQuality: id })
        )}
      </div>

      {/* Activity */}
      <div className="space-y-3">
        <Label>Daily Activity Level</Label>
        {selectOptions(
          [
            { id: "sedentary", label: "Sedentary" },
            { id: "lightly-active", label: "Lightly Active" },
            { id: "moderately-active", label: "Moderately Active" },
            { id: "very-active", label: "Very Active" },
          ],
          data.activityLevel,
          (id) => onChange({ activityLevel: id })
        )}
      </div>

      {/* Stress */}
      <div className="space-y-3">
        <Label>Stress Level</Label>
        {selectOptions(
          [{ id: "low", label: "Low" }, { id: "moderate", label: "Moderate" }, { id: "high", label: "High" }],
          data.stressLevel,
          (id) => onChange({ stressLevel: id })
        )}
      </div>

      {/* Self-development */}
      <div className="space-y-3">
        <Label>Interest in Self-Development</Label>
        {selectOptions(
          [{ id: "low", label: "Low" }, { id: "moderate", label: "Moderate" }, { id: "high", label: "High" }],
          data.selfDevelopment,
          (id) => onChange({ selfDevelopment: id })
        )}
      </div>

      {/* Perfectionism */}
      <div className="space-y-3">
        <Label>Perfectionism Tendency</Label>
        {selectOptions(
          [{ id: "low", label: "Low" }, { id: "moderate", label: "Moderate" }, { id: "high", label: "High" }],
          data.perfectionism,
          (id) => onChange({ perfectionism: id })
        )}
      </div>
    </div>
  );
}
