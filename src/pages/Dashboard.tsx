import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Dumbbell, Utensils, Brain, BarChart3, User, LogOut,
  Flame, TrendingUp, Moon, Calendar, MessageCircle, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedPlan } from "@/types/onboarding";
import { TrainingTab } from "@/components/dashboard/TrainingTab";
import { NutritionTab } from "@/components/dashboard/NutritionTab";
import { LifestyleTab } from "@/components/dashboard/LifestyleTab";
import { TrackingTab } from "@/components/dashboard/TrackingTab";
import { SupportTab } from "@/components/dashboard/SupportTab";
import { BookingCalendar } from "@/components/BookingCalendar";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/utils";
import { generateTrainingSplit } from "@/lib/generators/trainingGenerator";
import { generateNutritionPlan } from "@/lib/generators/nutritionGenerator";
import { generateLifestylePlan } from "@/lib/generators/lifestyleGenerator";

const UserBookingsList = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetch(getApiUrl("/api/bookings"), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBookings(data));
  }, [token]);

  const cancelBooking = async (id: number) => {
    const res = await fetch(getApiUrl(`/api/bookings/${id}/cancel`), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      toast.success("Booking cancelled");
      setBookings(prev => prev.filter(b => b.id !== id));
    }
  };

  return (
    <div className="space-y-3">
      {bookings.map(b => (
        <div key={b.id} className={`p-4 rounded-xl border ${b.status === 'pending' ? 'bg-yellow-500/5 border-yellow-500/20' : b.status === 'declined' ? 'bg-destructive/5 border-destructive/20' : 'bg-card border-border/50'}`}>
          <div className="flex justify-between items-start mb-1">
            <p className="font-medium text-sm">{new Date(b.start_time).toLocaleString()}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${b.status === 'pending' ? 'bg-yellow-500 text-yellow-900' :
              b.status === 'scheduled' ? 'bg-green-500 text-green-900' :
                'bg-destructive text-destructive-foreground'
              }`}>
              {b.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Coach: {b.trainer_name}</p>
          {b.status !== 'cancelled' && b.status !== 'declined' && (
            <Button variant="ghost" size="sm" className="w-full text-xs h-8 text-destructive hover:bg-destructive/10" onClick={() => cancelBooking(b.id)}>
              Cancel Booking
            </Button>
          )}
        </div>
      ))}
      {bookings.length === 0 && <p className="text-sm text-muted-foreground italic">No sessions scheduled.</p>}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [basePlan, setBasePlan] = useState<GeneratedPlan | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("training");
  const [isPlanLoading, setIsPlanLoading] = useState(true);

  const navItems = [
    { id: "training", label: t('training', 'sidebar'), icon: Dumbbell },
    { id: "nutrition", label: t('nutrition', 'sidebar'), icon: Utensils },
    { id: "lifestyle", label: t('lifestyle', 'sidebar'), icon: Brain },
    { id: "tracking", label: t('progress', 'sidebar'), icon: BarChart3 },
    { id: "sessions", label: t('sessions', 'sidebar'), icon: Calendar },
    { id: "support", label: t('support', 'sidebar'), icon: MessageCircle },
  ];

  // Re-generate plan locally based on current language
  const plan = useMemo(() => {
    if (!basePlan || !profile) return basePlan;

    // Always re-generate to ensure tips, exercises, and descriptions are translated 
    // to the currently selected UI language.
    try {
      return {
        ...basePlan,
        trainingSplit: generateTrainingSplit(profile, language),
        nutrition: generateNutritionPlan(profile, language),
        lifestyle: generateLifestylePlan(profile, language),
      };
    } catch (e) {
      console.error("Local plan re-generation failed:", e);
      return basePlan;
    }
  }, [basePlan, profile, language]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setIsPlanLoading(false);
        return;
      }

      try {
        // Fetch Plan
        const planRes = await fetch(getApiUrl("/api/plan"), {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (planRes.ok) {
          const data = await planRes.json();
          if (data) {
            const actualPlan = data.plan_data ? JSON.parse(data.plan_data) : data;
            setBasePlan(actualPlan);
            try {
              localStorage.setItem("fitforge-plan", JSON.stringify(actualPlan));
            } catch (e) { }
          }
        } else {
          const stored = localStorage.getItem("fitforge-plan");
          if (stored) setBasePlan(JSON.parse(stored));
        }

        // Fetch Profile for dynamic re-generation
        const profileRes = await fetch(getApiUrl("/api/profile"), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }
      } catch (e) {
        console.error("Dashboard data fetch failed:", e);
      } finally {
        setIsPlanLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  if (isPlanLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading your personalized plan...</div>;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/50 h-screen sticky top-0">
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-lg">Coach-E</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
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
          <div className="flex items-center gap-3 w-full p-3 mb-1 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-all cursor-pointer" onClick={() => navigate("/profile")}>
            {user?.profile_image ? (
              <img src={user.profile_image} alt="Avatar" className="h-4 w-4 rounded-full object-cover" />
            ) : (
              <User className="h-4 w-4" />
            )}
            {t('myProfile', 'sidebar')}
          </div>

          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-accent hover:bg-accent/10 transition-colors mt-1"
            >
              <Users className="h-4 w-4" />
              Admin Panel
            </button>
          )}

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 mt-1 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t('signOut', 'sidebar')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="flex flex-col border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-display font-bold">
                {navItems.find((n) => n.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-muted-foreground">{t('personalizedProgram', 'tabs')}</p>
            </div>

            {/* Desktop Logout/Profile */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center bg-secondary/50 rounded-lg p-1 mr-2">
                <button 
                  onClick={() => setLanguage('en')} 
                  className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${language === 'en' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('cs')} 
                  className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${language === 'cs' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  CS
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="text-muted-foreground"
              >
                <User className="h-4 w-4 mr-2" />
                {t('profile', 'common')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { logout(); navigate("/login"); }}
                className="text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout', 'common')}
              </Button>
            </div>

            {/* Mobile Lang Toggle (visible only on mobile) */}
            <div className="flex md:hidden items-center bg-secondary/50 rounded-lg p-0.5">
              <button 
                onClick={() => setLanguage('en')} 
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${language === 'en' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('cs')} 
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${language === 'cs' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'}`}
              >
                CS
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="flex md:hidden items-center justify-between px-4 py-2 border-t border-border/10 bg-secondary/5 overflow-hidden">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 flex-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 flex items-center gap-2 text-[10px] font-bold ${activeTab === item.id
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {activeTab === item.id && item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 border-l border-border/20 pl-2 ml-2">
              <button
                onClick={() => navigate("/profile")}
                className="p-2 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                title="Profile"
              >
                <User className="h-5 w-5" />
              </button>
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Quick stats */}
        {plan && (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 px-4 md:px-6 pt-6">
            <QuickStat icon={Flame} label={t('calories', 'dashboard')} value={plan?.nutrition?.calories ? `${plan.nutrition.calories}` : "-"} unit="kcal" />
            <QuickStat icon={TrendingUp} label={t('protein', 'dashboard')} value={plan?.nutrition?.protein ? `${plan.nutrition.protein}` : "-"} unit="g" />
            <QuickStat icon={Dumbbell} label={t('trainingDays', 'dashboard')} value={plan?.trainingSplit?.length ? `${plan.trainingSplit.length}` : "-"} unit={t('perWeek', 'dashboard')} />
            <QuickStat icon={Moon} label={t('habits', 'dashboard')} value={plan?.lifestyle?.habits?.length ? `${plan.lifestyle.habits.length}` : "-"} unit={t('daily', 'dashboard')} />
          </div>
        )}

        {/* Tab content */}
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          {!plan && activeTab !== "support" && activeTab !== "sessions" ? (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-6 pt-12">
                <Dumbbell className="h-16 w-16 text-primary opacity-50" />
                <h2 className="text-3xl font-bold font-display">{t('noPlan', 'dashboard')}</h2>
                <p className="text-muted-foreground max-w-md">{t('noPlanDesc', 'dashboard')}</p>
                <Button variant="hero" onClick={() => navigate("/onboarding")} className="mt-4">{t('startOnboarding', 'dashboard')}</Button>
             </div>
          ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "training" && plan && <TrainingTab plan={plan} />}
            {activeTab === "nutrition" && plan && <NutritionTab plan={plan} />}
            {activeTab === "lifestyle" && plan && <LifestyleTab plan={plan} />}
            {activeTab === "tracking" && <TrackingTab />}
            {activeTab === "sessions" && (
              <div className="space-y-6">
                {user?.trainer_id ? (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                      <BookingCalendar trainerId={user.trainer_id} />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" /> {t('mySchedule', 'sessions')}
                      </h3>
                      <UserBookingsList />
                    </div>
                  </div>
                ) : (
                  <div className="glass-card rounded-2xl p-12 text-center space-y-4 max-w-2xl mx-auto">
                    <Calendar className="h-12 w-12 text-primary mx-auto opacity-50" />
                    <h2 className="text-xl font-bold">{t('noTrainerTitle', 'sessions')}</h2>
                    <p className="text-muted-foreground">{t('noTrainerDesc', 'sessions')}</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === "support" && <SupportTab />}
          </motion.div>
          )}
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
