import { OnboardingData } from "@/types/onboarding";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
}

const genderOptions = ["Male", "Female", "Other"];
const levelOptions = ["Beginner", "Intermediate", "Advanced"];

const healthOptions = [
  { id: "none", label: "None" },
  { id: "lower-back", label: "Lower Back Pain" },
  { id: "knee-issues", label: "Knee Issues" },
  { id: "missing-knee", label: "Missing Knee" },
  { id: "shoulder-issues", label: "Shoulder Issues" },
  { id: "limited-mobility", label: "Limited Mobility" },
  { id: "neck-pain", label: "Neck Pain" },
  { id: "wrist-issues", label: "Wrist Issues" },
  { id: "elbow-issues", label: "Elbow Issues" },
  { id: "hip-issues", label: "Hip Issues" },
  { id: "asthma", label: "Asthma" },
];

export function StepPersonal({ data, onChange }: Props) {
  const toggleHealthIssue = (id: string) => {
    let current = data.healthLimitations ? data.healthLimitations.split(',').map(s => s.trim()).filter(Boolean) : [];

    if (id === "none") {
      current = ["none"];
    } else {
      current = current.filter(i => i !== "none");
      if (current.includes(id)) {
        current = current.filter(i => i !== id);
      } else {
        current.push(id);
      }
    }

    if (current.length === 0) current = ["none"];

    onChange({ healthLimitations: current.join(',') });
  };

  const currentHealth = data.healthLimitations ? data.healthLimitations.split(',').map(s => s.trim()).filter(Boolean) : ["none"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="25"
            value={data.age}
            onChange={(e) => onChange({ age: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <div className="flex gap-2">
            {genderOptions.map((g) => (
              <button
                key={g}
                onClick={() => onChange({ gender: g.toLowerCase() })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${data.gender === g.toLowerCase()
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                  }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="175"
            value={data.height}
            onChange={(e) => onChange({ height: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="75"
            value={data.weight}
            onChange={(e) => onChange({ weight: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bodyFat">Est. Body Fat (%) <span className="text-muted-foreground text-xs font-normal">Optional</span></Label>
          <Input
            id="bodyFat"
            type="number"
            placeholder="e.g. 20"
            value={data.bodyFat}
            onChange={(e) => onChange({ bodyFat: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Fitness Experience Level</Label>
        <div className="flex gap-3">
          {levelOptions.map((l) => (
            <button
              key={l}
              onClick={() => onChange({ fitnessLevel: l.toLowerCase() })}
              className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors ${data.fitnessLevel === l.toLowerCase()
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Health Limitations or Injuries</Label>
        <div className="flex flex-wrap gap-2">
          {healthOptions.map((item) => {
            const isSelected = currentHealth.includes(item.id) || (item.id === "none" && currentHealth.length === 0);
            return (
              <button
                key={item.id}
                onClick={() => toggleHealthIssue(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isSelected
                  ? "bg-primary/10 border-primary text-foreground"
                  : "bg-secondary border-border text-secondary-foreground hover:border-primary/40"
                  }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
