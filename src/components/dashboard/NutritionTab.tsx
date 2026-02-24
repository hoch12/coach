import { GeneratedPlan } from "@/types/onboarding";

interface Props {
  plan: GeneratedPlan;
}

export function NutritionTab({ plan }: Props) {
  const { nutrition } = plan;
  const totalMacroGrams = nutrition.protein + nutrition.carbs + nutrition.fat;

  return (
    <div className="space-y-6">
      {/* Macro overview */}
      <div>
        <h2 className="text-lg font-display font-semibold mb-4">Daily Targets</h2>
        <div className="grid grid-cols-3 gap-3">
          <MacroCard label="Protein" grams={nutrition.protein} color="bg-primary" percent={Math.round((nutrition.protein / totalMacroGrams) * 100)} />
          <MacroCard label="Carbs" grams={nutrition.carbs} color="bg-success" percent={Math.round((nutrition.carbs / totalMacroGrams) * 100)} />
          <MacroCard label="Fat" grams={nutrition.fat} color="bg-destructive" percent={Math.round((nutrition.fat / totalMacroGrams) * 100)} />
        </div>
      </div>

      {/* Macro bar */}
      <div className="glass-card rounded-xl p-5">
        <p className="text-sm text-muted-foreground mb-3">Macro Distribution</p>
        <div className="flex h-3 rounded-full overflow-hidden">
          <div className="bg-primary" style={{ width: `${Math.round((nutrition.protein * 4 / nutrition.calories) * 100)}%` }} />
          <div className="bg-success" style={{ width: `${Math.round((nutrition.carbs * 4 / nutrition.calories) * 100)}%` }} />
          <div className="bg-destructive" style={{ width: `${Math.round((nutrition.fat * 9 / nutrition.calories) * 100)}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> Protein</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success inline-block" /> Carbs</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive inline-block" /> Fat</span>
        </div>
      </div>

      {/* Meals */}
      <div>
        <h2 className="text-lg font-display font-semibold mb-4">Suggested Meals</h2>
        <div className="grid gap-3">
          {nutrition.meals.map((meal, i) => (
            <div key={i} className="glass-card rounded-xl p-5 flex items-start justify-between">
              <div>
                <h3 className="font-medium text-sm">{meal.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{meal.description}</p>
              </div>
              <span className="text-sm text-primary font-semibold whitespace-nowrap ml-4">
                ~{meal.calories} kcal
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MacroCard({ label, grams, color, percent }: {
  label: string;
  grams: number;
  color: string;
  percent: number;
}) {
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-display font-bold">{grams}g</p>
      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
