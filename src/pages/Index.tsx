import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Target, Utensils, Brain, ChevronRight, Flame, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-fitness.jpg";

const features = [
  {
    icon: Target,
    title: "Personalized Plans",
    description: "Training programs tailored to your goals, experience, and lifestyle.",
  },
  {
    icon: Utensils,
    title: "Nutrition Guidance",
    description: "Calorie targets, macro breakdowns, and sustainable meal structures.",
  },
  {
    icon: Brain,
    title: "Lifestyle Coaching",
    description: "Discipline, motivation, sleep, and habit-building strategies.",
  },
  {
    icon: Flame,
    title: "Progress Tracking",
    description: "Log workouts, track calories, and visualize your transformation.",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Athletic training in dramatic amber lighting"
            className="h-full w-full object-cover opacity-40"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
        </div>

        {/* Nav */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-4 md:px-12 md:py-5 backdrop-blur-sm bg-background/5 md:bg-transparent border-b border-border/10 md:border-none">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            <span className="text-lg md:text-xl font-display font-bold tracking-tight text-foreground">
              Coach-E
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center bg-background/50 backdrop-blur rounded-lg p-0.5 md:p-1 border border-border/50">
                <button 
                  onClick={() => setLanguage('en')} 
                  className={`px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-bold rounded-md transition-colors ${language === 'en' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:text-primary'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('cs')} 
                  className={`px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-bold rounded-md transition-colors ${language === 'cs' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:text-primary'}`}
                >
                  CS
                </button>
            </div>
            {user ? (
              <div className="flex items-center gap-1 md:gap-2">
                <Button variant="heroOutline" size="sm" onClick={() => navigate("/dashboard")} className="hidden sm:inline-flex h-8 text-xs">
                  {t('goToDashboard', 'landing')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/login"); }} className="text-foreground hover:bg-destructive/10 hover:text-destructive h-8 px-2 text-xs">
                  {t('logout', 'landing')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1 md:gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-foreground hover:bg-secondary h-8 px-2 text-xs">
                  {t('login', 'landing')}
                </Button>
                <Button variant="heroOutline" size="sm" onClick={() => navigate("/register")} className="h-8 text-xs px-3">
                  {t('getStarted', 'landing')}
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Hero content */}
        <div className="relative z-10 section-padding max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              {t('tags', 'landing')}
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6">
              {t('title1', 'landing')}{" "}
              <span className="text-gradient block sm:inline">{t('title2', 'landing')}</span>
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
              {t('subtitle', 'landing')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" onClick={() => navigate(user ? "/dashboard" : "/register")} className="w-full sm:w-auto">
                {user ? t('goToDashboard', 'landing') : t('startPlan', 'landing')}
                <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
              <Button variant="heroOutline" size="xl" onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }} className="w-full sm:w-auto">
                {t('learnMore', 'landing')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              {t('featTitle1', 'landing')}{" "}
              <span className="text-gradient">{t('featTitle2', 'landing')}</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('featSubtitle', 'landing')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass-card rounded-xl p-8 hover:border-primary/30 transition-colors duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-semibold mb-2">{t(`f${i+1}Title`, 'landing') || feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t(`f${i+1}Desc`, 'landing') || feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <motion.div
          className="max-w-3xl mx-auto text-center glass-card rounded-2xl p-12 md:p-16"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            {t('ctaTitle', 'landing')}
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            {t('ctaDesc', 'landing')}
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate(user ? "/dashboard" : "/register")}>
            {user ? t('goToDashboard', 'landing') : t('getFreePlan', 'landing')}
            <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 md:px-12 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold text-foreground">Coach-E</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('footerDesc', 'landing')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
