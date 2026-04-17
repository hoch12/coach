import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingData } from "@/types/onboarding";
import { generatePlan } from "@/lib/planGenerator";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Check, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/utils";

const Profile = () => {
    const { user, token, logout, updateUser } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<OnboardingData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<OnboardingData>>({});
    const [isLoading, setIsLoading] = useState(true);



    useEffect(() => {
        fetchProfile();
    }, [token]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(getApiUrl("/api/profile"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data && data.age) {
                setProfile(data);
                setEditForm({ weight: data.weight, age: data.age, height: data.height, bodyFat: data.bodyFat, trainingFrequency: data.trainingFrequency, trainingDuration: data.trainingDuration });
            } else {
                setProfile(null);
            }
        } catch (e) {
            toast.error("Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!profile) return;
        try {
            const updated = { ...profile, ...editForm };
            // Save updated profile
            await fetch(getApiUrl("/api/profile"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updated)
            });

            // Regenerate plan with new data
            const newPlan = generatePlan(updated as OnboardingData);

            // Save new plan to backend
            await fetch(getApiUrl("/api/plan"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ plan_data: newPlan })
            });

            // Update local storage
            localStorage.setItem("fitforge-onboarding-data", JSON.stringify(updated));
            localStorage.setItem("fitforge-plan", JSON.stringify(newPlan));

            setProfile(updated as OnboardingData);
            setIsEditing(false);
            toast.success("Profile & Plan updated!");
        } catch (e) {
            toast.error("Failed to update profile");
        }
    };

    const [passwordForm, setPasswordForm] = useState({ old: "", new: "", confirm: "" });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.new !== passwordForm.confirm) {
            toast.error("New passwords do not match");
            return;
        }
        try {
            const res = await fetch(getApiUrl("/api/auth/change-password"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ oldPassword: passwordForm.old, newPassword: passwordForm.new })
            });
            if (res.ok) {
                toast.success("Password changed successfully");
                setIsChangingPassword(false);
                setPasswordForm({ old: "", new: "", confirm: "" });
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to change password");
            }
        } catch (e) {
            toast.error("Network error");
        }
    };

    // Profile editing features removed as per user request to ensure platform stability
    // Removed public profile editing features as per user request to ensure platform stability
    const handleUpdateSettings = () => {
        toast.info(t('updateSettingsDisabled', 'profile'));
    };

    if (user?.role === "admin" || user?.role === "trainer") {
        return (
            <div className="min-h-screen bg-background p-4 sm:p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-6">
                    <header className="flex items-center justify-between">
                        <Button variant="ghost" onClick={() => navigate(user.role === 'admin' ? "/admin" : "/trainer")} className="pl-0 text-muted-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('backToDashboard', 'profile')}
                        </Button>
                        <Button variant="destructive" onClick={() => { logout(); navigate("/login"); }}>
                            {t('logout', 'profile')}
                        </Button>
                    </header>
                    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>{user.role === 'admin' ? 'Admin' : 'Trainer'} Profile: {user.username}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-muted-foreground">{t('adminTrainerNoPlan', 'profile')}</p>

                            <div className="pt-4 border-t border-border/50">
                                <h3 className="text-lg font-bold mb-4">{t('accountSecurity', 'profile')}</h3>
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>{t('currentPassword', 'profile')}</Label>
                                        <Input type="password" value={passwordForm.old} onChange={e => setPasswordForm({ ...passwordForm, old: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('newPassword', 'profile')}</Label>
                                        <Input type="password" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('confirmPassword', 'profile')}</Label>
                                        <Input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} required />
                                    </div>
                                    <Button type="submit" className="w-full">{t('updatePassword', 'profile') || "Update Password"}</Button>
                                </form>
                            </div>

                            <div className="pt-4 border-t border-border/50">
                                <h3 className="text-lg font-bold mb-4">{t('avatar', 'profile')}</h3>
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/30">
                                        {user?.profile_image ? (
                                            <img src={user.profile_image} alt="Avatar" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-primary">{user?.username?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {user.role === "admin" && (
                                <Button variant="outline" onClick={() => navigate("/admin")} className="w-full">
                                    {t('goToAdmin', 'profile')}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;

    if (!profile) return (
        <div className="min-h-screen bg-background p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-6">
                <header className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate("/dashboard")} className="pl-0 text-muted-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('backToDashboard', 'profile')}
                    </Button>
                    <Button variant="destructive" onClick={() => { logout(); navigate("/login"); }}>
                        {t('logout', 'profile')}
                    </Button>
                </header>
                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{t('myProfile', 'sidebar')} ({user?.username})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center gap-6 py-6 border-b border-border/50">
                            <div className="relative group">
                                <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/30">
                                    {user?.profile_image ? (
                                        <img src={user.profile_image} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-primary">{user?.username?.[0]?.toUpperCase()}</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-display font-bold">{user?.username}</h3>
                                <p className="text-sm text-muted-foreground mt-2">{t('notCompleted', 'profile')}</p>
                            </div>
                        </div>

                        <div className="pt-4 pb-2">
                            <h3 className="text-lg font-bold mb-4">{t('siteLanguage', 'profile')}</h3>
                            <div className="flex gap-4">
                                <Button 
                                    variant={language === 'en' ? 'default' : 'outline'} 
                                    onClick={() => setLanguage('en')}
                                    className="flex-1"
                                >
                                    English
                                </Button>
                                <Button 
                                    variant={language === 'cs' ? 'default' : 'outline'} 
                                    onClick={() => setLanguage('cs')}
                                    className="flex-1"
                                >
                                    Čeština
                                </Button>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border/50">
                            <h3 className="text-lg font-bold mb-4">{t('accountSecurity', 'profile')}</h3>
                            {!isChangingPassword ? (
                                <Button variant="outline" onClick={() => setIsChangingPassword(true)} className="w-full">
                                    {t('changePassword', 'profile')}
                                </Button>
                            ) : (
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>{t('currentPassword', 'profile')}</Label>
                                        <Input type="password" value={passwordForm.old} onChange={e => setPasswordForm({ ...passwordForm, old: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('newPassword', 'profile')}</Label>
                                        <Input type="password" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('confirmPassword', 'profile')}</Label>
                                        <Input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} required />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" type="button" onClick={() => setIsChangingPassword(false)}>{t('cancel', 'common')}</Button>
                                        <Button type="submit" className="flex-1">{t('updatePassword', 'profile') || "Update Password"}</Button>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <Button
                                variant="hero"
                                className="w-full transition-colors"
                                onClick={() => navigate("/onboarding")}
                            >
                                {t('startOnboarding', 'dashboard')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-6">
                <header className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate("/dashboard")} className="pl-0 text-muted-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('backToDashboard', 'profile')}
                    </Button>
                    <Button variant="destructive" onClick={() => { logout(); navigate("/login"); }}>
                        {t('logout', 'profile')}
                    </Button>
                </header>

                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{t('myProfile', 'sidebar')} ({user?.username})</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}>
                            {isEditing ? <><Check className="mr-2 h-4 w-4" /> {t('save', 'common')}</> : <><Edit2 className="mr-2 h-4 w-4" /> {t('edit', 'common')}</>}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center gap-6 py-6 border-b border-border/50">
                            <div className="relative group">
                                <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/30">
                                    {user?.profile_image ? (
                                        <img src={user.profile_image} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-primary">{user?.username?.[0]?.toUpperCase()}</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-display font-bold">{user?.username}</h3>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{t('managedByTrainer', 'profile')}</p>
                            </div>
                        </div>

                        {profile.appVersion !== "1.3.0" && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3 mb-4 text-destructive">
                                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-sm">{t('actionRequired', 'profile')}</h4>
                                    <p className="text-sm opacity-90">{t('retakeNotice', 'profile')}</p>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">{t('age', 'onboarding')}</Label>
                                {isEditing ? (
                                    <Input type="number" value={editForm.age || ""} onChange={e => setEditForm({ ...editForm, age: e.target.value })} />
                                ) : (
                                    <p className="font-medium text-lg">{profile.age}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">{t('weight', 'onboarding')} (kg)</Label>
                                {isEditing ? (
                                    <Input type="number" value={editForm.weight || ""} onChange={e => setEditForm({ ...editForm, weight: e.target.value })} />
                                ) : (
                                    <p className="font-medium text-lg">{profile.weight}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">{t('bodyFatShort', 'profile')}</Label>
                                {isEditing ? (
                                    <Input type="number" placeholder="Optional" value={editForm.bodyFat || ""} onChange={e => setEditForm({ ...editForm, bodyFat: e.target.value })} />
                                ) : (
                                    <p className="font-medium text-lg">{profile.bodyFat ? `${profile.bodyFat}%` : t('notSet', 'common')}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">{t('height', 'onboarding')} (cm)</Label>
                                {isEditing ? (
                                    <Input type="number" value={editForm.height || ""} onChange={e => setEditForm({ ...editForm, height: e.target.value })} />
                                ) : (
                                    <p className="font-medium text-lg">{profile.height}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">{t('gender', 'profile')}</Label>
                                <p className="font-medium text-lg capitalize">{t(profile.gender as any, 'onboarding')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="glass-card p-4 rounded-xl">
                                <Label className="text-muted-foreground mb-2 block">{t('goalsAndExperience', 'profile')}</Label>
                                <div className="space-y-2">
                                    <p className="text-sm"><span className="font-medium">{t('level', 'profile')}:</span> <span className="capitalize">{t(profile.fitnessLevel as any, 'onboarding')}</span></p>
                                    <p className="text-sm"><span className="font-medium">{t('goals', 'onboarding')}:</span> {profile.fitnessGoals?.length > 0 ? profile.fitnessGoals.map(g => t(g as any, 'onboarding')).join(", ") : t('none', 'common')}</p>

                                    {isEditing ? (
                                        <>
                                            <div className="pt-2">
                                                <Label className="text-xs text-muted-foreground mb-1 block">{t('frequency', 'profile')}</Label>
                                                <select
                                                    className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    value={editForm.trainingFrequency || "3-4 days"}
                                                    onChange={e => setEditForm({ ...editForm, trainingFrequency: e.target.value })}
                                                >
                                                    <option value="1-2 days">{t('1-2 days', 'onboarding')}</option>
                                                    <option value="3-4 days">{t('3-4 days', 'onboarding')}</option>
                                                    <option value="5-6 days">{t('5-6 days', 'onboarding')}</option>
                                                </select>
                                            </div>
                                            <div className="pt-2">
                                                <Label className="text-xs text-muted-foreground mb-1 block">{t('duration', 'profile')}</Label>
                                                <select
                                                    className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    value={editForm.trainingDuration || "45-60"}
                                                    onChange={e => setEditForm({ ...editForm, trainingDuration: e.target.value })}
                                                >
                                                    <option value="under-30">{t('under-30', 'onboarding')}</option>
                                                    <option value="30-45">{t('30-45', 'onboarding')}</option>
                                                    <option value="45-60">{t('45-60', 'onboarding')}</option>
                                                    <option value="over-60">{t('over-60', 'onboarding')}</option>
                                                </select>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm"><span className="font-medium">{t('frequency', 'profile')}:</span> {t(profile.trainingFrequency as any, 'onboarding')}</p>
                                            <p className="text-sm"><span className="font-medium">{t('duration', 'profile')}:</span> {t(profile.trainingDuration as any, 'onboarding')}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="glass-card p-4 rounded-xl">
                                <Label className="text-muted-foreground mb-2 block">{t('nutritionInfo', 'profile')}</Label>
                                <div className="space-y-2">
                                    <p className="text-sm"><span className="font-medium">Diet:</span> <span className="capitalize">{t(profile.dietaryPreference as any, 'onboarding') || "Omnivore"}</span></p>
                                    <p className="text-sm"><span className="font-medium">Allergies:</span> {profile.allergies || t('none', 'common')}</p>
                                    <p className="text-sm"><span className="font-medium">{t('favorites', 'profile')}:</span> {profile.favoriteFoods || t('none', 'common')}</p>
                                    <p className="text-sm"><span className="font-medium">{t('dislikes', 'profile')}:</span> {profile.dislikedFoods || t('none', 'common')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border/50">
                            <h3 className="text-lg font-bold mb-4">{t('accountSecurity', 'profile')}</h3>
                            {!isChangingPassword ? (
                                <Button variant="outline" onClick={() => setIsChangingPassword(true)} className="w-full">
                                    {t('changePassword', 'profile')}
                                </Button>
                            ) : (
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>{t('currentPassword', 'profile')}</Label>
                                        <Input type="password" value={passwordForm.old} onChange={e => setPasswordForm({ ...passwordForm, old: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('newPassword', 'profile')}</Label>
                                        <Input type="password" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('confirmPassword', 'profile')}</Label>
                                        <Input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} required />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" type="button" onClick={() => setIsChangingPassword(false)}>{t('cancel', 'common')}</Button>
                                        <Button type="submit" className="flex-1">{t('updatePassword', 'profile') || "Update Password"}</Button>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <Button
                                variant={profile.appVersion !== "1.3.0" ? "destructive" : "secondary"}
                                className={`w-full transition-colors ${profile.appVersion !== "1.3.0" ? "" : "text-foreground hover:bg-primary hover:text-primary-foreground"}`}
                                onClick={() => navigate("/onboarding")}
                            >
                                {profile.appVersion !== "1.3.0" && <AlertCircle className="mr-2 h-4 w-4" />}
                                {t('retakeOnboarding', 'profile')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
