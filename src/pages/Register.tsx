import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Dumbbell, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login, user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(getApiUrl("/api/auth/register"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Auto-login after registration
                const loginResponse = await fetch(getApiUrl("/api/auth/login"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });

                const loginData = await loginResponse.json();
                if (loginResponse.ok) {
                    login(loginData.token, loginData.user);
                    toast.success("Account created successfully!");
                    navigate("/dashboard");
                }
            } else {
                toast.error(data.error || "Failed to register");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate("/")} 
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group backdrop-blur-sm md:backdrop-blur-none"
                >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm md:text-base">{t('backToHome', 'common')}</span>
                </Button>
            </div>
            <Card className="w-full max-w-md shadow-2xl animate-fade-in border-accent/20 bg-card/80 backdrop-blur-sm z-10 mt-12 md:mt-0">
                <CardHeader className="space-y-3 items-center text-center">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-2">
                        <Dumbbell className="w-8 h-8 text-accent" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                        Start Your Journey
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-base">
                        Create an account to start your personalized coaching plan
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-md h-12 mt-4 rounded-xl bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity"
                        >
                            {isLoading ? "Creating account..." : "Sign Up"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-border pt-6 mt-2">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="text-accent hover:underline font-semibold">
                            Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register;
