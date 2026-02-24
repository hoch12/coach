import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Dumbbell, Utensils, Brain, BarChart3, User, LogOut,
  ChevronRight, Flame, Droplets, Moon, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedPlan } from "@/types/onboarding";
import { TrainingTab } from "@/components/dashboard/TrainingTab";
import { NutritionTab } from "@/components/dashboard/NutritionTab";
import { LifestyleTab } from "@/components/dashboard/LifestyleTab";

const navItems = [
  { id: "training", label: "Training", icon: Dumbbell },
  { id: "nutrition", label: "Nutrition", icon: Utensils },
  { id: "lifestyle", label: "Lifestyle", icon: Brain },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [activeTab, setActiveTab] = useState("training");

  useEffect(() => {
    const stored = localStorage.getItem("fitforge-plan");
    if (!stored) {
      navigate("/onboarding");
      return;
    }
    setPlan(JSON.parse(stored));
  }, [navigate]);

  if (!plan) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/50">
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-lg">FitForge</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border/50">
          <button
            onClick={() => {
              localStorage.removeItem("fitforge-plan");
              localStorage.removeItem("fitforge-onboarding");
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Start Over
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div>
            <h1 className="text-xl font-display font-bold">
              {navItems.find((n) => n.id === activeTab)?.label} Plan
            </h1>
            <p className="text-sm text-muted-foreground">Your personalized program</p>
          </div>

          {/* Mobile nav */}
          <div className="flex md:hidden gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-2.5 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </header>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 pt-6">
          <QuickStat icon={Flame} label="Calories" value={`${plan.nutrition.calories}`} unit="kcal" />
          <QuickStat icon={TrendingUp} label="Protein" value={`${plan.nutrition.protein}`} unit="g" />
          <QuickStat icon={Dumbbell} label="Training Days" value={`${plan.trainingSplit.length}`} unit="/week" />
          <QuickStat icon={Moon} label="Habits" value={`${plan.lifestyle.habits.length}`} unit="daily" />
        </div>

        {/* Tab content */}
        <div className="flex-1 px-6 py-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "training" && <TrainingTab plan={plan} />}
            {activeTab === "nutrition" && <NutritionTab plan={plan} />}
            {activeTab === "lifestyle" && <LifestyleTab plan={plan} />}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

function QuickStat({ icon: Icon, label, value, unit }: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-display font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

export default Dashboard;
