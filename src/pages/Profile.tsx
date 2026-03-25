import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
    const navigate = useNavigate();
    const [profile, setProfile] = useState<OnboardingData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<OnboardingData>>({});

    const [publicSettings, setPublicSettings] = useState({
        username: user?.username || "",
        profile_image: user?.profile_image || ""
    });
    const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

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
            }
        } catch (e) {
            toast.error("Failed to load profile");
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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error("Image too large (max 10MB)");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPublicSettings(prev => ({ ...prev, profile_image: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleUpdateSettings = async () => {
        setIsUpdatingSettings(true);
        try {
            const res = await fetch(getApiUrl("/api/user/settings"), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(publicSettings)
            });

            if (res.ok) {
                const data = await res.json();
                updateUser(data.user);
                toast.success("Public profile updated!");
            } else {
                const data = await res.json();
                toast.error(data.error || "Update failed");
            }
        } catch (e) {
            toast.error("Network error");
        } finally {
            setIsUpdatingSettings(false);
        }
    };

    if (user?.role === "admin" || user?.role === "trainer") {
        return (
            <div className="min-h-screen bg-background p-4 sm:p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-6">
                    <header className="flex items-center justify-between">
                        <Button variant="ghost" onClick={() => navigate(user.role === 'admin' ? "/admin" : "/trainer")} className="pl-0 text-muted-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                        <Button variant="destructive" onClick={() => { logout(); navigate("/login"); }}>
                            Logout
                        </Button>
                    </header>
                    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>{user.role === 'admin' ? 'Admin' : 'Trainer'} Profile: {user.username}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-muted-foreground">You are a {user.role}. Your account does not have a personal fitness plan.</p>

                            <div className="pt-4 border-t border-border/50">
                                <h3 className="text-lg font-bold mb-4">Account Security</h3>
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Current Password</Label>
                                        <Input type="password" value={passwordForm.old} onChange={e => setPasswordForm({ ...passwordForm, old: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>New Password</Label>
                                        <Input type="password" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirm New Password</Label>
                                        <Input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} required />
                                    </div>
                                    <Button type="submit" className="w-full">Update Password</Button>
                                </form>
                            </div>

                            <div className="pt-4 border-t border-border/50">
                                <h3 className="text-lg font-bold mb-4">Public Profile</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/30">
                                            {publicSettings.profile_image ? (
                                                <img src={publicSettings.profile_image} alt="Avatar" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-bold text-primary">{user?.username?.[0]?.toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor="avatar-upload" className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm transition-colors">
                                                Change Photo
                                            </Label>
                                            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                            <p className="text-[10px] text-muted-foreground uppercase">Recommended: Square image, max 10MB</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Username</Label>
                                        <Input value={publicSettings.username} onChange={e => setPublicSettings({ ...publicSettings, username: e.target.value })} />
                                    </div>
                                    <Button className="w-full bg-primary/20 text-primary hover:bg-primary/30" onClick={handleUpdateSettings} disabled={isUpdatingSettings}>
                                        {isUpdatingSettings ? "Updating..." : "Save Public Settings"}
                                    </Button>
                                </div>
                            </div>

                            {user.role === "admin" && (
                                <Button variant="outline" onClick={() => navigate("/admin")} className="w-full">
                                    Go to Admin Panel
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!profile) return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-6">
                <header className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate("/dashboard")} className="pl-0 text-muted-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <Button variant="destructive" onClick={() => { logout(); navigate("/login"); }}>
                        Logout
                    </Button>
                </header>

                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>My Profile ({user?.username})</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}>
                            {isEditing ? <><Check className="mr-2 h-4 w-4" /> Save</> : <><Edit2 className="mr-2 h-4 w-4" /> Edit</>}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4 py-4 border-b border-border/50">
                            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/30">
                                {publicSettings.profile_image ? (
                                    <img src={publicSettings.profile_image} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-bold text-primary">{user?.username?.[0]?.toUpperCase()}</span>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="client-avatar-upload" className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm transition-colors">
                                    Change Photo
                                </Label>
                                <input id="client-avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Username</Label>
                                    <div className="flex gap-2">
                                        <Input size={1} className="h-8 max-w-[200px]" value={publicSettings.username} onChange={e => setPublicSettings({ ...publicSettings, username: e.target.value })} />
                                        <Button size="sm" className="h-8" onClick={handleUpdateSettings} disabled={isUpdatingSettings}>
                                            {isUpdatingSettings ? "Wait..." : "Save"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {profile.appVersion !== "1.3.0" && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3 mb-4 text-destructive">
                                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-sm">Action Required: App Update</h4>
                                    <p className="text-sm opacity-90">We've released a major update (v1.3.0) with more detailed training duration and frequency options, plus advanced health limitation mappings. Please retake the full questionnaire to improve your generated plan.</p>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Age</Label>
                                {isEditing ? (
                                    <Input type="number" value={editForm.age || ""} onChange={e => setEditForm({ ...editForm, age: e.target.value })} />
                                ) : (
                                    <p className="font-medium text-lg">{profile.age}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Weight (kg)</Label>
                                {isEditing ? (
                                    <Input type="number" value={editForm.weight || ""} onChange={e => setEditForm({ ...editForm, weight: e.target.value })} />
                                ) : (
                                    <p className="font-medium text-lg">{profile.weight}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Body Fat (%)</Label>
                                {isEditing ? (
                                    <Input type="number" placeholder="Optional" value={editForm.bodyFat || ""} onChange={e => setEditForm({ ...editForm, bodyFat: e.target.value })} />
                                ) : (
                                    <p className="font-medium text-lg">{profile.bodyFat ? `${profile.bodyFat}%` : "Not set"}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Height (cm)</Label>
                                {isEditing ? (
                                    <Input type="number" value={editForm.height || ""} onChange={e => setEditForm({ ...editForm, height: e.target.value })} />
                                ) : (
                                    <p className="font-medium text-lg">{profile.height}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Gender</Label>
                                <p className="font-medium text-lg capitalize">{profile.gender}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="glass-card p-4 rounded-xl">
                                <Label className="text-muted-foreground mb-2 block">Goals & Experience</Label>
                                <div className="space-y-2">
                                    <p className="text-sm"><span className="font-medium">Level:</span> <span className="capitalize">{profile.fitnessLevel}</span></p>
                                    <p className="text-sm"><span className="font-medium">Goals:</span> {profile.fitnessGoals?.length > 0 ? profile.fitnessGoals.join(", ") : "None"}</p>

                                    {isEditing ? (
                                        <>
                                            <div className="pt-2">
                                                <Label className="text-xs text-muted-foreground mb-1 block">Frequency</Label>
                                                <select
                                                    className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    value={editForm.trainingFrequency || "3-4 days"}
                                                    onChange={e => setEditForm({ ...editForm, trainingFrequency: e.target.value })}
                                                >
                                                    <option value="1-2 days">1-2 Days / Week</option>
                                                    <option value="3-4 days">3-4 Days / Week</option>
                                                    <option value="5-6 days">5-6 Days / Week</option>
                                                </select>
                                            </div>
                                            <div className="pt-2">
                                                <Label className="text-xs text-muted-foreground mb-1 block">Duration</Label>
                                                <select
                                                    className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    value={editForm.trainingDuration || "45-60"}
                                                    onChange={e => setEditForm({ ...editForm, trainingDuration: e.target.value })}
                                                >
                                                    <option value="under-30">Under 30 mins</option>
                                                    <option value="30-45">30-45 mins</option>
                                                    <option value="45-60">45-60 mins</option>
                                                    <option value="over-60">60+ mins</option>
                                                </select>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm"><span className="font-medium">Frequency:</span> {profile.trainingFrequency}</p>
                                            <p className="text-sm"><span className="font-medium">Duration:</span> {profile.trainingDuration === "under-30" ? "Under 30 mins" : profile.trainingDuration === "30-45" ? "30-45 mins" : profile.trainingDuration === "45-60" ? "45-60 mins" : "60+ mins"}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="glass-card p-4 rounded-xl">
                                <Label className="text-muted-foreground mb-2 block">Nutrition Info</Label>
                                <div className="space-y-2">
                                    <p className="text-sm"><span className="font-medium">Diet:</span> <span className="capitalize">{profile.dietaryPreference || "Omnivore"}</span></p>
                                    <p className="text-sm"><span className="font-medium">Allergies:</span> {profile.allergies || "None"}</p>
                                    <p className="text-sm"><span className="font-medium">Favorites:</span> {profile.favoriteFoods || "None"}</p>
                                    <p className="text-sm"><span className="font-medium">Dislikes:</span> {profile.dislikedFoods || "None"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border/50">
                            <h3 className="text-lg font-bold mb-4">Account Security</h3>
                            {!isChangingPassword ? (
                                <Button variant="outline" onClick={() => setIsChangingPassword(true)} className="w-full">
                                    Change Password
                                </Button>
                            ) : (
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Current Password</Label>
                                        <Input type="password" value={passwordForm.old} onChange={e => setPasswordForm({ ...passwordForm, old: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>New Password</Label>
                                        <Input type="password" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirm New Password</Label>
                                        <Input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} required />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" type="button" onClick={() => setIsChangingPassword(false)}>Cancel</Button>
                                        <Button type="submit" className="flex-1">Update Password</Button>
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
                                Retake Full Questionnaire
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
