import { OnboardingData } from "@/types/onboarding";
import { Label } from "@/components/ui/label";

interface Props {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
}

const obstacleOptions = [
  { id: "lack-of-time", label: "Lack of time" },
  { id: "low-motivation", label: "Low motivation" },
  { id: "stress", label: "High stress" },
  { id: "inconsistent-routine", label: "Inconsistent routine" },
  { id: "poor-diet", label: "Poor diet" },
  { id: "other", label: "Other limitations" },
];

const advantageOptions = [
  { id: "gym-access", label: "Gym access" },
  { id: "home-equipment", label: "Home equipment" },
  { id: "time-flexibility", label: "Time flexibility" },
  { id: "previous-experience", label: "Previous experience" },
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
    <div className="space-y-8">
      <div className="space-y-3">
        <Label>What obstacles do you face?</Label>
        <MultiSelect items={obstacleOptions} selected={data.obstacles} onToggle={toggleObstacle} />
      </div>
      <div className="space-y-3">
        <Label>What advantages do you have?</Label>
        <MultiSelect items={advantageOptions} selected={data.advantages} onToggle={toggleAdvantage} />
      </div>
    </div>
  );
}
