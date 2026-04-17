import { OnboardingData } from "@/types/onboarding";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

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

export function StepNutrition({ data, onChange }: Props) {
  const { t } = useLanguage();

  const allergyOptions = [
    { id: "none", label: t('none', 'common') },
    { id: "lactose", label: t('lactose', 'onboarding') },
    { id: "gluten", label: t('gluten', 'onboarding') },
    { id: "nuts", label: t('nuts', 'onboarding') },
    { id: "soy", label: t('soy', 'onboarding') },
    { id: "seafood", label: t('seafood', 'onboarding') },
  ];

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
    <div className="space-y-10">
      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('dietaryPreference', 'onboarding')}</Label>
        {selectBtn(
          [
            { id: "omnivore", label: t('omnivore', 'onboarding') },
            { id: "vegetarian", label: t('vegetarian', 'onboarding') },
            { id: "vegan", label: t('vegan', 'onboarding') },
            { id: "keto", label: t('keto', 'onboarding') },
            { id: "other", label: t('other', 'onboarding') },
          ],
          data.dietaryPreference,
          (id) => onChange({ dietaryPreference: id })
        )}
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('allergiesIntolerances', 'onboarding')}</Label>
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

      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('budgetLimitations', 'onboarding')}</Label>
        {selectBtn(
          [
            { id: "tight", label: t('tightBudget', 'onboarding') },
            { id: "moderate", label: t('moderate', 'onboarding') },
            { id: "flexible", label: t('flexible', 'onboarding') },
          ],
          data.budgetLimitation,
          (id) => onChange({ budgetLimitation: id })
        )}
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('eatingHabits', 'onboarding')}</Label>
        {selectBtn(
          [
            { id: "structured", label: t('structuredHabit', 'onboarding') },
            { id: "intuitive", label: t('intuitiveHabit', 'onboarding') },
            { id: "social", label: t('socialHabit', 'onboarding') },
            { id: "emotional", label: t('emotionalHabit', 'onboarding') },
          ],
          data.eatingHabits,
          (id) => onChange({ eatingHabits: id })
        )}
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('mealFrequency', 'onboarding')}</Label>
        {selectBtn(
          [
            { id: "2", label: t('2meals', 'onboarding') },
            { id: "3", label: t('3meals', 'onboarding') },
            { id: "4", label: t('4meals', 'onboarding') },
            { id: "5", label: t('5plusMeals', 'onboarding') },
          ],
          data.mealFrequency,
          (id) => onChange({ mealFrequency: id })
        )}
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('calorieAwarenessLabel', 'onboarding')}</Label>
        {selectBtn(
          [
            { id: "none", label: t('none', 'common') },
            { id: "basic", label: t('basic', 'onboarding') },
            { id: "experienced", label: t('experienced', 'onboarding') },
          ],
          data.calorieAwareness,
          (id) => onChange({ calorieAwareness: id })
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="favoriteFoods" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('favoriteFoods', 'onboarding')}</Label>
        <Input
          id="favoriteFoods"
          placeholder={t('favoriteFoodsPlaceholder', 'onboarding')}
          value={data.favoriteFoods || ""}
          onChange={(e) => onChange({ favoriteFoods: e.target.value })}
          className="bg-secondary border-border h-11"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="dislikedFoods" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">{t('dislikedFoods', 'onboarding')}</Label>
        <Input
          id="dislikedFoods"
          placeholder={t('dislikedFoodsPlaceholder', 'onboarding')}
          value={data.dislikedFoods || ""}
          onChange={(e) => onChange({ dislikedFoods: e.target.value })}
          className="bg-secondary border-border h-11"
        />
      </div>
    </div>
  );
}
