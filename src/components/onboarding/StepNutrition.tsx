import { OnboardingData } from "@/types/onboarding";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
}

const selectBtn = (
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

export function StepNutrition({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Dietary Preference</Label>
        {selectBtn(
          [
            { id: "omnivore", label: "Omnivore" },
            { id: "vegetarian", label: "Vegetarian" },
            { id: "vegan", label: "Vegan" },
            { id: "keto", label: "Keto" },
            { id: "other", label: "Other" },
          ],
          data.dietaryPreference,
          (id) => onChange({ dietaryPreference: id })
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="allergies">Allergies or Intolerances</Label>
        <Input
          id="allergies"
          placeholder="e.g. lactose, gluten, nuts, none..."
          value={data.allergies}
          onChange={(e) => onChange({ allergies: e.target.value })}
          className="bg-secondary border-border"
        />
      </div>

      <div className="space-y-3">
        <Label>Budget Limitations</Label>
        {selectBtn(
          [
            { id: "tight", label: "Tight Budget" },
            { id: "moderate", label: "Moderate" },
            { id: "flexible", label: "Flexible" },
          ],
          data.budgetLimitation,
          (id) => onChange({ budgetLimitation: id })
        )}
      </div>

      <div className="space-y-3">
        <Label>Meal Frequency (per day)</Label>
        {selectBtn(
          [
            { id: "2", label: "2 meals" },
            { id: "3", label: "3 meals" },
            { id: "4", label: "4 meals" },
            { id: "5", label: "5+ meals" },
          ],
          data.mealFrequency,
          (id) => onChange({ mealFrequency: id })
        )}
      </div>

      <div className="space-y-3">
        <Label>Calorie Awareness</Label>
        {selectBtn(
          [
            { id: "none", label: "None" },
            { id: "basic", label: "Basic" },
            { id: "experienced", label: "Experienced" },
          ],
          data.calorieAwareness,
          (id) => onChange({ calorieAwareness: id })
        )}
      </div>
    </div>
  );
}
