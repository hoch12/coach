import { OnboardingData } from "@/types/onboarding";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
}

const genderOptions = ["Male", "Female", "Other"];
const levelOptions = ["Beginner", "Intermediate", "Advanced"];

export function StepPersonal({ data, onChange }: Props) {
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
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  data.gender === g.toLowerCase()
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
      </div>

      <div className="space-y-2">
        <Label>Fitness Experience Level</Label>
        <div className="flex gap-3">
          {levelOptions.map((l) => (
            <button
              key={l}
              onClick={() => onChange({ fitnessLevel: l.toLowerCase() })}
              className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors ${
                data.fitnessLevel === l.toLowerCase()
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="health">Health Limitations or Injuries</Label>
        <Input
          id="health"
          placeholder="e.g. lower back pain, knee injury, none..."
          value={data.healthLimitations}
          onChange={(e) => onChange({ healthLimitations: e.target.value })}
          className="bg-secondary border-border"
        />
      </div>
    </div>
  );
}
