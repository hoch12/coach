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

const allergyOptions = [
  { id: "none", label: "None" },
  { id: "lactose", label: "Lactose / Dairy" },
  { id: "gluten", label: "Gluten" },
  { id: "nuts", label: "Nuts" },
  { id: "soy", label: "Soy" },
  { id: "seafood", label: "Seafood" },
];

export function StepNutrition({ data, onChange }: Props) {
  const toggleAllergy = (id: string) => {
    let current = data.allergies ? data.allergies.split(',').map(s => s.trim()).filter(Boolean) : [];

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

    onChange({ allergies: current.join(',') });
  };

  const currentAllergies = data.allergies ? data.allergies.split(',').map(s => s.trim()).filter(Boolean) : ["none"];

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

      <div className="space-y-3">
        <Label>Allergies or Intolerances</Label>
        <div className="flex flex-wrap gap-2">
          {allergyOptions.map((item) => {
            const isSelected = currentAllergies.includes(item.id) || (item.id === "none" && currentAllergies.length === 0);
            return (
              <button
                key={item.id}
                onClick={() => toggleAllergy(item.id)}
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
        <Label>Eating Habits</Label>
        {selectBtn(
          [
            { id: "structured", label: "Structured/Planned" },
            { id: "intuitive", label: "Intuitive/Spontaneous" },
            { id: "social", label: "Frequent Social Dining" },
            { id: "emotional", label: "Emotional/Stress Eater" },
          ],
          data.eatingHabits,
          (id) => onChange({ eatingHabits: id })
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

      <div className="space-y-2">
        <Label htmlFor="favoriteFoods">Favorite Foods (Optional)</Label>
        <Input
          id="favoriteFoods"
          placeholder="e.g. steak, pasta, sushi..."
          value={data.favoriteFoods || ""}
          onChange={(e) => onChange({ favoriteFoods: e.target.value })}
          className="bg-secondary border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dislikedFoods">Disliked Foods (Optional)</Label>
        <Input
          id="dislikedFoods"
          placeholder="e.g. mushrooms, olives, liver..."
          value={data.dislikedFoods || ""}
          onChange={(e) => onChange({ dislikedFoods: e.target.value })}
          className="bg-secondary border-border"
        />
      </div>
    </div>
  );
}
