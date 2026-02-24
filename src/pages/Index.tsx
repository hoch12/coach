import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Target, Utensils, Brain, ChevronRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 md:px-12">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-7 w-7 text-primary" />
            <span className="text-xl font-display font-bold tracking-tight text-foreground">
              FitForge
            </span>
          </div>
          <Button variant="heroOutline" size="sm" onClick={() => navigate("/onboarding")}>
            Get Started
          </Button>
        </header>

        {/* Hero content */}
        <div className="relative z-10 section-padding max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              Free · Science-Based · Sustainable
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6">
              Your body deserves{" "}
              <span className="text-gradient">a real plan.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
              No gimmicks. No overpriced subscriptions. Just honest, personalized training,
              nutrition, and lifestyle plans built on real experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" onClick={() => navigate("/onboarding")}>
                Start Your Plan
                <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
              <Button variant="heroOutline" size="xl" onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}>
                Learn More
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
              Everything you need.{" "}
              <span className="text-gradient">Nothing you don't.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete system that covers training, nutrition, and the mindset
              shifts that actually make lasting change.
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
                    <h3 className="text-lg font-display font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
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
            Ready to build a better version of yourself?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Complete a detailed onboarding and get your personalized plan in minutes. No credit card. No catches.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate("/onboarding")}>
            Get Your Free Plan
            <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 md:px-12 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold text-foreground">FitForge</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built on real experience. No gimmicks, no shortcuts.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
