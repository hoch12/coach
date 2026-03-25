import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { getApiUrl } from "@/lib/utils";

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

const navItems = [
  { id: "training", label: "Training", icon: Dumbbell },
  { id: "nutrition", label: "Nutrition", icon: Utensils },
  { id: "lifestyle", label: "Lifestyle", icon: Brain },
  { id: "tracking", label: "Progress", icon: BarChart3 },
  { id: "sessions", label: "Sessions", icon: Calendar },
  { id: "support", label: "Coach Support", icon: MessageCircle },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [activeTab, setActiveTab] = useState("training");
  const [isPlanLoading, setIsPlanLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!token) {
        setIsPlanLoading(false);
        return;
      }

      try {
        const res = await fetch(getApiUrl("/api/plan"), {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data) {
            const actualPlan = data.plan_data ? JSON.parse(data.plan_data) : data;
            setPlan(actualPlan);
            try {
              localStorage.setItem("fitforge-plan", JSON.stringify(actualPlan));
            } catch (e) { }
          } else {
            navigate("/onboarding");
          }
        } else {
          const stored = localStorage.getItem("fitforge-plan");
          if (stored) {
            setPlan(JSON.parse(stored));
          } else {
            navigate("/onboarding");
          }
        }
      } catch (e) {
        const stored = localStorage.getItem("fitforge-plan");
        if (stored) {
          setPlan(JSON.parse(stored));
        } else {
          navigate("/onboarding");
        }
      } finally {
        setIsPlanLoading(false);
      }
    };

    fetchPlan();
  }, [token, navigate]);

  if (isPlanLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading your personalized plan...</div>;
  if (!plan) return null;

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
          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {user?.profile_image ? (
              <img src={user.profile_image} alt="Avatar" className="h-4 w-4 rounded-full object-cover" />
            ) : (
              <User className="h-4 w-4" />
            )}
            My Profile
          </button>

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
            Sign Out
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
                {navItems.find((n) => n.id === activeTab)?.label} Plan
              </h1>
              <p className="text-sm text-muted-foreground">Your personalized program</p>
            </div>

            {/* Desktop Logout/Profile */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="text-muted-foreground"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { logout(); navigate("/login"); }}
                className="text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="flex md:hidden items-center justify-between gap-2 px-6 py-2 border-t border-border/10 bg-secondary/10">
            <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`p-2 rounded-lg transition-colors flex-shrink-0 ${activeTab === item.id
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground"
                    }`}
                  title={item.label}
                >
                  <item.icon className="h-5 w-5" />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 border-l border-border/20 pl-2">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 pt-6">
          <QuickStat icon={Flame} label="Calories" value={`${plan.nutrition.calories}`} unit="kcal" />
          <QuickStat icon={TrendingUp} label="Protein" value={`${plan.nutrition.protein}`} unit="g" />
          <QuickStat icon={Dumbbell} label="Training Days" value={`${plan.trainingSplit.length}`} unit="/week" />
          <QuickStat icon={Moon} label="Habits" value={`${plan.lifestyle.habits.length}`} unit="daily" />
        </div>

        {/* Tab content */}
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "training" && <TrainingTab plan={plan} />}
            {activeTab === "nutrition" && <NutritionTab plan={plan} />}
            {activeTab === "lifestyle" && <LifestyleTab plan={plan} />}
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
                        <Calendar className="h-5 w-5 text-primary" /> My Schedule
                      </h3>
                      <UserBookingsList />
                    </div>
                  </div>
                ) : (
                  <div className="glass-card rounded-2xl p-12 text-center space-y-4 max-w-2xl mx-auto">
                    <Calendar className="h-12 w-12 text-primary mx-auto opacity-50" />
                    <h2 className="text-xl font-bold">No Trainer Assigned</h2>
                    <p className="text-muted-foreground">You need to have a personal trainer assigned to book gym sessions. Contact support to get started.</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === "support" && <SupportTab />}
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
