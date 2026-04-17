import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Utensils, Plus, History } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface WorkoutLog {
    id: number;
    date: string;
    exercise: string;
    sets: number;
    reps: number;
    weight: number;
}

interface NutritionLog {
    id: number;
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export function TrackingTab() {
    const { token } = useAuth();
    const { t } = useLanguage();
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Workout State
    const [exercise, setExercise] = useState("");
    const [sets, setSets] = useState("");
    const [reps, setReps] = useState("");
    const [weight, setWeight] = useState("");
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

    // Nutrition State
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fat, setFat] = useState("");
    const [nutritionLog, setNutritionLog] = useState<NutritionLog | null>(null);

    const fetchLogs = async () => {
        try {
            // Fetch workouts
            const wRes = await fetch(getApiUrl(`/api/logs/workout?date=${date}`), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (wRes.ok) setWorkoutLogs(await wRes.json());

            // Fetch nutrition
            const nRes = await fetch(getApiUrl(`/api/logs/nutrition?date=${date}`), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (nRes.ok) setNutritionLog(await nRes.json());
        } catch (e) {
            console.error("Failed to fetch logs", e);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [date, token]);

    const handleAddWorkout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!exercise || !sets || !reps || !weight) {
            toast.error("Please fill all workout fields");
            return;
        }

        try {
            const res = await fetch(getApiUrl("/api/logs/workout"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    date,
                    exercise,
                    sets: parseInt(sets),
                    reps: parseInt(reps),
                    weight: parseFloat(weight)
                })
            });

            if (res.ok) {
                toast.success("Workout logged!");
                setExercise("");
                setSets("");
                setReps("");
                setWeight("");
                fetchLogs();
            } else {
                toast.error("Failed to log workout");
            }
        } catch (e) {
            toast.error("Network error");
        }
    };

    const handleSaveCalories = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!calories) {
            toast.error("Please enter calories");
            return;
        }

        try {
            const res = await fetch(getApiUrl("/api/logs/nutrition"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    date,
                    calories: parseInt(calories),
                    protein: parseInt(protein) || 0,
                    carbs: parseInt(carbs) || 0,
                    fat: parseInt(fat) || 0
                })
            });

            if (res.ok) {
                toast.success("Nutrition saved!");
                setCalories("");
                setProtein("");
                setCarbs("");
                setFat("");
                fetchLogs();
            } else {
                toast.error("Failed to save nutrition");
            }
        } catch (e) {
            toast.error("Network error");
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between glass-card p-4 rounded-xl">
                <div className="space-y-1">
                    <Label className="text-muted-foreground">{t('logDate', 'tabs')}</Label>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-40 bg-background"
                    />
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">{t('totalLogsToday', 'tabs')}</p>
                    <p className="text-2xl font-display font-bold text-gradient">{workoutLogs.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Workout Tracker */}
                <div className="glass-card p-6 rounded-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Dumbbell className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-display font-semibold">{t('logExercise', 'tabs')}</h2>
                    </div>

                    <form onSubmit={handleAddWorkout} className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t('exerciseName', 'tabs')}</Label>
                            <Input
                                placeholder="e.g. Bench Press"
                                value={exercise}
                                onChange={(e) => setExercise(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label>{t('sets', 'tabs')}</Label>
                                <Input type="number" min="1" placeholder="3" value={sets} onChange={(e) => setSets(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('reps', 'tabs')}</Label>
                                <Input type="number" min="1" placeholder="10" value={reps} onChange={(e) => setReps(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('weight', 'tabs')}</Label>
                                <Input type="number" step="0.5" min="0" placeholder="60" value={weight} onChange={(e) => setWeight(e.target.value)} />
                            </div>
                        </div>
                        <Button type="submit" className="w-full">
                            <Plus className="h-4 w-4 mr-2" /> {t('addSet', 'tabs')}
                        </Button>
                    </form>

                    {workoutLogs.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <History className="h-4 w-4" /> {t('todaysLog', 'tabs')}
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {workoutLogs.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 text-sm">
                                        <span className="font-medium text-foreground">{log.exercise}</span>
                                        <span className="text-muted-foreground">
                                            {log.sets}x{log.reps} @ {log.weight}kg
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Nutrition Tracker */}
                <div className="glass-card p-6 rounded-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                        <div className="p-2 rounded-lg bg-accent/10">
                            <Utensils className="h-5 w-5 text-accent" />
                        </div>
                        <h2 className="text-xl font-display font-semibold">{t('dailyCalories', 'tabs')}</h2>
                    </div>

                    <form onSubmit={handleSaveCalories} className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t('totalCaloriesConsumed', 'tabs')}</Label>
                            <Input
                                type="number"
                                min="0"
                                placeholder="e.g. 2500"
                                value={calories}
                                onChange={(e) => setCalories(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label>{t('protein', 'tabs')} (g)</Label>
                                <Input type="number" min="0" placeholder="150" value={protein} onChange={(e) => setProtein(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('carbs', 'tabs')} (g)</Label>
                                <Input type="number" min="0" placeholder="200" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('fat', 'tabs')} (g)</Label>
                                <Input type="number" min="0" placeholder="70" value={fat} onChange={(e) => setFat(e.target.value)} />
                            </div>
                        </div>
                        <Button type="submit" variant="secondary" className="w-full">
                            {t('saveNutrition', 'tabs')}
                        </Button>
                    </form>

                    {nutritionLog && (
                        <div className="mt-6 p-4 rounded-xl bg-accent/5 border border-accent/20 text-center space-y-2">
                            <p className="text-sm text-muted-foreground mb-1">{t('recordedFor', 'tabs')} {date}</p>
                            <p className="text-3xl font-display font-bold text-accent">{nutritionLog.calories} <span className="text-sm font-normal">kcal</span></p>
                            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                                <span>P: {nutritionLog.protein}g</span>
                                <span>C: {nutritionLog.carbs}g</span>
                                <span>F: {nutritionLog.fat}g</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
