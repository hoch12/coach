import { OnboardingData } from "@/types/onboarding";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
}

export function StepPersonal({ data, onChange }: Props) {
  const { t } = useLanguage();
  const genderKeys = ["male", "female", "other"];
  const levelKeys = ["beginner", "intermediate", "advanced"];

  const bodyTypeOptions = [
    { id: "v-skinny", key: "skinny", description: t('skinnyDesc', 'onboarding') },
    { id: "skinny", key: "lean", description: t('leanDesc', 'onboarding') },
    { id: "normal", key: "normal", description: t('normalDesc', 'onboarding') },
    { id: "athletic", key: "athletic", description: t('athleticDesc', 'onboarding') },
    { id: "shredded", key: "shredded", description: t('shreddedDesc', 'onboarding') },
    { id: "overweight", key: "mildOverweight", description: t('mildOverweightDesc', 'onboarding') },
    { id: "obese", key: "obese", description: t('obeseDesc', 'onboarding') },
    { id: "v-obese", key: "extremelyObese", description: t('extremelyObeseDesc', 'onboarding') },
  ];

  const healthOptions = [
    { id: "none", label: t('none', 'common') },
    { id: "lower-back", label: t('lowerBackPain', 'onboarding') },
    { id: "knee-issues", label: t('kneeIssues', 'onboarding') },
    { id: "missing-knee", label: t('missingKnee', 'onboarding') },
    { id: "shoulder-issues", label: t('shoulderIssues', 'onboarding') },
    { id: "limited-mobility", label: t('limitedMobility', 'onboarding') },
    { id: "neck-pain", label: t('neckPain', 'onboarding') },
    { id: "wrist-issues", label: t('wristIssues', 'onboarding') },
    { id: "elbow-issues", label: t('elbowIssues', 'onboarding') },
    { id: "hip-issues", label: t('hipIssues', 'onboarding') },
    { id: "asthma", label: t('asthma', 'onboarding') },
  ];

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
          <Label htmlFor="age">{t('age', 'onboarding')}</Label>
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
          <Label htmlFor="gender">{t('gender', 'onboarding')}</Label>
          <div className="flex gap-2">
            {genderKeys.map((g) => (
              <button
                key={g}
                onClick={() => onChange({ gender: g })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${data.gender === g
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                  }`}
              >
                {t(g, 'onboarding')}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">{t('height', 'onboarding')}</Label>
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
          <Label htmlFor="weight">{t('weight', 'onboarding')}</Label>
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

      <div className="space-y-4">
        <Label>{t('bodyType', 'onboarding')}</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {bodyTypeOptions.map((bt) => (
            <button
              key={bt.id}
              onClick={() => onChange({ bodyType: bt.id })}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 text-center gap-1 ${data.bodyType === bt.id
                ? "bg-primary/20 border-primary text-foreground scale-[1.02] shadow-lg shadow-primary/10"
                : "bg-secondary/40 border-border/50 text-muted-foreground hover:border-primary/30 hover:bg-secondary/60"
                }`}
            >
              <span className="text-xs font-bold uppercase tracking-tight">{t(bt.key, 'onboarding')}</span>
            </button>
          ))}
        </div>
        <div className="min-h-[20px] mt-2">
          <p className="text-[10px] text-muted-foreground italic px-1 animate-in fade-in slide-in-from-top-1 duration-300">
            {bodyTypeOptions.find(b => b.id === data.bodyType)?.description || ""}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Label>{t('fitnessLevel', 'onboarding')}</Label>
        <div className="flex gap-3">
          {levelKeys.map((l) => (
            <button
              key={l}
              onClick={() => onChange({ fitnessLevel: l })}
              className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors ${data.fitnessLevel === l
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                }`}
            >
              {t(l, 'onboarding')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>{t('healthLimitations', 'onboarding')}</Label>
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
