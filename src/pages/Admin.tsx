import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Users, Eye, LogOut, User, MessageCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OnboardingData, GeneratedPlan } from "@/types/onboarding";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminUser {
    id: number;
    username: string;
    role: string;
    trainer_id: number | null;
    profile_image: string | null;
}

interface SupportTicket {
    id: number;
    user_id: number;
    username: string;
    message: string;
    status: "open" | "closed";
    created_at: string;
    sender_id: number;
    replied_at: string | null;
    user_role: string;
}

const AdminPanel = () => {
    const { token, user, logout, updateUser } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("clients");

    // User Management State
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSendingChat, setIsSendingChat] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<OnboardingData | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<GeneratedPlan | null>(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);

    // Support Inbox State
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [replyText, setReplyText] = useState("");
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [tickets, replyingTo]);

    const [trainers, setTrainers] = useState<AdminUser[]>([]);
    const [selectedTrainerId, setSelectedTrainerId] = useState<string>("");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ old: "", new: "", confirm: "" });

    useEffect(() => {
        if (activeTab === "clients" || activeTab === "trainers") {
            fetchUsers();
            fetchTrainers();
        } else if (activeTab === "messages") {
            fetchTickets();
        }
    }, [token, activeTab]);

    const fetchTrainers = async () => {
        try {
            const res = await fetch(getApiUrl("/api/admin/trainers"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) setTrainers(await res.json());
        } catch (e) { }
    };

    const assignTrainer = async (userId: number, trainerId: number) => {
        if (!trainerId) return;
        try {
            const res = await fetch(getApiUrl("/api/admin/assign-trainer"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ userId, trainerId })
            });
            if (res.ok) {
                toast.success("Trainer assigned");
                fetchUsers();
            }
        } catch (e) {
            toast.error("Failed to assign trainer");
        }
    };

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(getApiUrl("/api/admin/support"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setTickets(await res.json());
            }
        } catch (e) {
            toast.error("Failed to load tickets");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReply = async (ticketId: number) => {
        if (!replyText.trim()) return;
        try {
            const res = await fetch(getApiUrl(`/api/admin/support/${ticketId}/reply`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ reply: replyText })
            });

            if (res.ok) {
                toast.success(t('msgSentSuccess', 'admin') || "Reply sent successfully");
                setReplyText("");
                // Removed setReplyingTo(null) to keep chat persistent
                fetchTickets();
            } else {
                toast.error(t('msgSentError', 'admin') || "Failed to send reply");
            }
        } catch (e) {
            toast.error(t('networkError', 'common') || "Network error");
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(getApiUrl("/api/admin/users"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                toast.error("Failed to load users");
            }
        } catch (e) {
            toast.error("Network error");
        } finally {
            setIsLoading(false);
        }
    };

    const viewUserDetails = async (u: AdminUser) => {
        setSelectedUser(u);
        setIsDetailsLoading(true);
        setSelectedProfile(null);
        setSelectedPlan(null);

        try {
            const [profileRes, planRes] = await Promise.all([
                fetch(getApiUrl(`/api/admin/users/${u.id}/profile`), { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(getApiUrl(`/api/admin/users/${u.id}/plan`), { headers: { "Authorization": `Bearer ${token}` } })
            ]);

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setSelectedProfile(profileData);
            }
            if (planRes.ok) {
                const planData = await planRes.json();
                if (planData && planData.plan_data) {
                    setSelectedPlan(JSON.parse(planData.plan_data));
                }
            }
        } catch (e) {
            toast.error("Failed to load user details");
        } finally {
            setIsDetailsLoading(false);
        }
    };

    const deleteUser = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(getApiUrl(`/api/admin/users/${id}`), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setUsers(users.filter(u => u.id !== id));
                toast.success("User deleted");
            } else {
                toast.error("Failed to delete user");
            }
        } catch (e) {
            toast.error("Network error");
        }
    };

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
                setIsProfileOpen(false);
                setPasswordForm({ old: "", new: "", confirm: "" });
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to change password");
            }
        } catch (e) {
            toast.error("Network error");
        }
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Button variant="ghost" onClick={() => navigate("/dashboard")} className="pl-0 text-muted-foreground self-start">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <div className="flex items-center gap-2 mr-2">
                            <Users className="h-4 w-4 text-accent" />
                            <span className="font-semibold text-accent text-xs sm:text-sm hidden xs:inline">Admin Mode</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setIsProfileOpen(true)} className="text-muted-foreground hover:bg-secondary px-2">
                            <User className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">My Profile</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/login"); }} className="text-destructive hover:bg-destructive/10 px-2 transition-colors">
                            <LogOut className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">{t('logout', 'common')}</span>
                        </Button>
                    </div>
                </header>

                <div className="flex space-x-2 border-b border-border/50 pb-2">
                    <button
                        onClick={() => setActiveTab("clients")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "clients" ? "bg-accent/20 text-accent" : "text-muted-foreground hover:bg-secondary"}`}
                    >
                        {t('manageClients', 'admin') || "Manage Clients"}
                    </button>
                    <button
                        onClick={() => setActiveTab("trainers")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "trainers" ? "bg-accent/20 text-accent" : "text-muted-foreground hover:bg-secondary"}`}
                    >
                        {t('manageTrainers', 'admin') || "Manage Trainers"}
                    </button>
                    <button
                        onClick={() => setActiveTab("messages")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "messages" ? "bg-accent/20 text-accent" : "text-muted-foreground hover:bg-secondary"}`}
                    >
                        {t('messaging', 'admin') || "Messaging"}
                        {tickets.filter(t => t.status === 'open').length > 0 && (
                            <span className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                                {tickets.filter(t => t.status === 'open').length}
                            </span>
                        )}
                    </button>
                </div>

                {activeTab === "trainers" && (
                    <div className="space-y-6">
                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm border-t-2 border-t-accent/50">
                            <CardHeader>
                                <CardTitle className="text-xl font-display font-bold">{t('onboardNewTrainer', 'admin') || "Onboard New Trainer"}</CardTitle>
                                <CardDescription>{t('onboardTrainerDesc', 'admin') || "Grant professional access to a new team member"}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget;
                                    const username = (form.elements.namedItem('trainer_username') as HTMLInputElement).value;
                                    const password = (form.elements.namedItem('trainer_password') as HTMLInputElement).value;
                                    try {
                                        const res = await fetch(getApiUrl("/api/admin/create-trainer"), {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                                "Authorization": `Bearer ${token}`
                                            },
                                            body: JSON.stringify({ username, password })
                                        });
                                        if (res.ok) {
                                            toast.success(t('trainerCreated', 'admin') || "Trainer profile created successfully");
                                            form.reset();
                                            fetchTrainers();
                                        } else {
                                            const data = await res.json();
                                            toast.error(data.error || t('failedToCreateTrainer', 'admin') || "Failed to create trainer");
                                        }
                                    } catch (e) {
                                        toast.error(t('networkError', 'common') || "Network error");
                                    }
                                }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                                    <div className="space-y-2">
                                        <Label htmlFor="trainer_username" className="text-[10px] uppercase font-bold tracking-wider opacity-60">{t('username', 'onboarding')}</Label>
                                        <Input id="trainer_username" name="trainer_username" required className="bg-background/30 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="trainer_password" className="text-[10px] uppercase font-bold tracking-wider opacity-60">{t('password', 'onboarding')}</Label>
                                        <Input id="trainer_password" name="trainer_password" type="password" required className="bg-background/30 rounded-xl" />
                                    </div>
                                    <Button type="submit" variant="hero" className="rounded-xl shadow-lg shadow-accent/10">{t('authorizeTrainer', 'admin') || "Authorize Trainer"}</Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-display font-bold">{t('theTeam', 'admin') || "The Team"}</CardTitle>
                                <CardDescription>{t('managingTrainers', 'admin') || "Managing"} {trainers.length} {t('activeProfessionalTrainers', 'admin') || "active professional trainers"}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6">
                                {/* Desktop View */}
                                <div className="hidden md:block rounded-xl border border-border/50 overflow-hidden bg-background/30 shadow-inner">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-secondary/80 text-muted-foreground text-[10px] uppercase tracking-widest px-6 py-4 border-b border-border/50">
                                            <tr>
                                                <th className="px-6 py-4 font-bold">{t('trainer', 'admin') || "Trainer"}</th>
                                                <th className="px-6 py-4 font-bold text-right">{t('actions', 'admin') || "Actions"}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {trainers.map(t_item => (
                                                <tr key={t_item.id} className="hover:bg-accent/5 transition-colors group">
                                                    <td className="px-6 py-4 font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center overflow-hidden border border-border/50 shadow-sm group-hover:rotate-3 transition-transform">
                                                                {t_item.profile_image ? <img src={t_item.profile_image} className="h-full w-full object-cover" /> : <span className="text-sm font-bold text-muted-foreground">{t_item.username[0].toUpperCase()}</span>}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-foreground">{t_item.username}</p>
                                                                <p className="text-[10px] text-muted-foreground opacity-70">{t('professionalCoach', 'admin') || "Professional Coach"}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => deleteUser(t_item.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-lg">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Mobile View */}
                                <div className="md:hidden space-y-4 px-4 pb-4">
                                    {trainers.map(t_item => (
                                        <div key={t_item.id} className="p-4 rounded-2xl bg-secondary/20 border border-border/50 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border border-border/50 shadow-inner">
                                                    {t_item.profile_image ? <img src={t_item.profile_image} className="h-full w-full object-cover" /> : <span className="text-lg font-bold">{t_item.username[0].toUpperCase()}</span>}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{t_item.username}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-50">#T-{t_item.id}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => deleteUser(t_item.id)} className="text-destructive h-10 w-10 p-0 rounded-xl bg-destructive/5">
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))}
                                    {trainers.length === 0 && <p className="text-center py-12 text-muted-foreground italic text-sm">{t('noTrainersFound', 'admin') || "No trainers found"}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === "clients" && (
                    <Card className="bg-card/50 border-border/50 backdrop-blur-sm border-t-2 border-t-primary/50">
                        <CardHeader>
                            <CardTitle className="text-2xl font-display font-bold">{t('manageClients', 'admin') || "Manage Clients"}</CardTitle>
                            <CardDescription>{t('manageClientsDesc', 'admin') || "View and manage all active users on the platform"}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6">
                            {/* Desktop View */}
                            <div className="hidden md:block rounded-xl border border-border/50 overflow-hidden bg-background/30 shadow-inner">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-secondary/80 text-muted-foreground text-[10px] uppercase tracking-widest px-6 py-4 border-b border-border/50">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">{t('clientHeader', 'admin') || "Client"}</th>
                                            <th className="px-6 py-4 font-bold">{t('trainerAssignmentHeader', 'admin') || "Trainer Assignment"}</th>
                                            <th className="px-6 py-4 font-bold text-right">{t('actionsHeader', 'admin') || "Actions"}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {users.filter(u => u.role === 'user').map((u) => (
                                            <tr key={u.id} className="hover:bg-primary/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center overflow-hidden border border-border/50 shadow-sm group-hover:scale-105 transition-transform">
                                                            {u.profile_image ? (
                                                                <img src={u.profile_image} alt="U" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <span className="text-sm font-bold text-muted-foreground">{u.username[0].toUpperCase()}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-foreground">{u.username}</p>
                                                            <p className="text-[10px] text-muted-foreground font-mono">ID: #{u.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2 items-center">
                                                        <select
                                                            className={`text-xs bg-secondary/50 border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary transition-all ${u.trainer_id ? 'border-primary/30 text-primary font-bold' : 'border-border/50 text-muted-foreground italic'}`}
                                                            defaultValue={u.trainer_id || ""}
                                                            id={`trainer-select-${u.id}`}
                                                        >
                                                            <option value="">{t('noTrainerAssigned', 'admin') || "No Trainer Assigned"}</option>
                                                            {trainers.map(t_item => <option key={t_item.id} value={t_item.id}>{t_item.username}</option>)}
                                                        </select>
                                                        <Button
                                                            size="sm"
                                                            variant={u.trainer_id ? "outline" : "hero"}
                                                            className="h-8 px-3 text-[10px] uppercase font-bold"
                                                            onClick={() => {
                                                                const sel = document.getElementById(`trainer-select-${u.id}`) as HTMLSelectElement;
                                                                assignTrainer(u.id, parseInt(sel.value));
                                                            }}
                                                        >
                                                            {u.trainer_id ? t('change', 'common') || "Change" : t('assign', 'admin') || "Assign"}
                                                        </Button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 items-center">
                                                        <Button variant="ghost" size="sm" onClick={() => viewUserDetails(u)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-lg">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => deleteUser(u.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-lg">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Mobile View */}
                            <div className="md:hidden space-y-4 px-4 pb-4">
                                {users.filter(u => u.role === 'user').map(u => (
                                    <div key={u.id} className="p-4 rounded-2xl bg-secondary/20 border border-border/50 space-y-4 shadow-sm backdrop-blur-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border border-border/50 shadow-inner">
                                                {u.profile_image ? <img src={u.profile_image} className="h-full w-full object-cover" /> : <span className="text-lg font-bold">{u.username[0].toUpperCase()}</span>}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-bold text-foreground">{u.username}</p>
                                                    <span className="text-[10px] text-muted-foreground font-mono">#{u.id}</span>
                                                </div>
                                                <div className="flex gap-1 mt-1">
                                                    <span className="bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">{t('client', 'admin') || "Client"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-background/40 p-3 rounded-xl border border-border/20 space-y-2">
                                            <Label className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">{t('assignProfessionalTrainer', 'admin') || "Assign Professional Trainer"}</Label>
                                            <div className="flex gap-2">
                                                <select
                                                    className={`flex-1 text-xs bg-secondary/50 border rounded-lg px-2 py-1.5 outline-none ${u.trainer_id ? 'border-primary/30 text-primary font-bold' : 'border-border/50'}`}
                                                    defaultValue={u.trainer_id || ""}
                                                    id={`trainer-select-mob-${u.id}`}
                                                >
                                                    <option value="">{t('none', 'common') || "None"}</option>
                                                    {trainers.map(t_item => <option key={t_item.id} value={t_item.id}>{t_item.username}</option>)}
                                                </select>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-3 text-[10px] font-black uppercase tracking-tighter"
                                                    onClick={() => {
                                                        const sel = document.getElementById(`trainer-select-mob-${u.id}`) as HTMLSelectElement;
                                                        assignTrainer(u.id, parseInt(sel.value));
                                                    }}
                                                >
                                                    {t('set', 'admin') || "Set"}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2 border-t border-border/20">
                                            <Button variant="secondary" className="flex-1 h-9 text-[10px] font-bold uppercase" onClick={() => viewUserDetails(u)}>{t('openDetails', 'admin') || "Open Details"}</Button>
                                            <Button variant="ghost" className="h-9 w-9 p-0 text-destructive/50 hover:text-destructive hover:bg-destructive/10" onClick={() => deleteUser(u.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {users.filter(u => u.role === 'user').length === 0 && (
                                    <div className="text-center py-12 space-y-3 grayscale opacity-50">
                                        <Users className="h-10 w-10 mx-auto" />
                                        <p className="text-sm font-medium">{t('noClientsFound', 'admin') || "No active clients found in the system"}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === "messages" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
                        {/* Conversations List */}
                        <Card className="md:col-span-1 bg-card/50 border-border/50 backdrop-blur-sm flex flex-col overflow-hidden">
                            <CardHeader className="py-4 border-b border-border/30">
                                <CardTitle className="text-lg font-display font-bold">Inbox</CardTitle>
                                <CardDescription className="text-[10px]">Recent communications</CardDescription>
                            </CardHeader>
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                {tickets.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground grayscale opacity-40">
                                        <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">No messages</p>
                                    </div>
                                ) : tickets.length > 0 ? (
                                    [...new Set(tickets.map(t => t.user_id))]
                                        .sort((a, b) => {
                                            const timesA = tickets.filter(t => t.user_id === a).map(t => new Date(t.created_at).getTime());
                                            const timesB = tickets.filter(t => t.user_id === b).map(t => new Date(t.created_at).getTime());
                                            const latestA = timesA.length > 0 ? Math.max(...timesA) : 0;
                                            const latestB = timesB.length > 0 ? Math.max(...timesB) : 0;
                                            return latestB - latestA;
                                        })
                                        .map(uid => {
                                            const userTickets = tickets.filter(t => t.user_id === uid);
                                            const lastMsg = userTickets[userTickets.length - 1];
                                            const unread = userTickets.filter(t => t.status === 'open' && t.sender_id !== Number(user?.id)).length;
                                            return (
                                                <button
                                                    key={uid}
                                                    onClick={() => setReplyingTo(lastMsg?.id || null)}
                                                    className={`w-full p-4 flex items-center gap-3 border-b border-border/10 hover:bg-primary/5 transition-colors text-left group ${replyingTo && tickets.find(t => t.id === replyingTo)?.user_id === uid ? 'bg-primary/10 border-r-2 border-r-primary' : ''}`}
                                                >
                                                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center font-bold text-xs shadow-inner">
                                                        {lastMsg?.username[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-center mb-0.5">
                                                            <div className="flex items-center gap-2 truncate">
                                                                <span className="font-bold text-sm truncate">{lastMsg?.username}</span>
                                                                <Badge variant={lastMsg?.user_role?.toLowerCase() === 'trainer' ? 'hero' : 'secondary'} className="text-[7px] px-1 py-0 h-3 leading-none uppercase font-black">
                                                                    {lastMsg?.user_role?.toLowerCase() === 'trainer' ? 'Trainer' : 'Client'}
                                                                </Badge>
                                                            </div>
                                                            {unread > 0 && <span className="bg-primary text-primary-foreground text-[8px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-primary/20">{unread}</span>}
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground truncate opacity-70 italic">"{lastMsg?.message}"</p>
                                                    </div>
                                                </button>
                                            );
                                        })
                                ) : null}
                            </div>
                        </Card>

                        {/* Chat Window */}
                        <Card className="md:col-span-2 bg-card/50 border-border/50 backdrop-blur-sm shadow-xl flex flex-col overflow-hidden">
                            {replyingTo ? (
                                <>
                                    <div className="p-4 border-b border-border/30 bg-primary/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-[10px] text-primary">
                                                {tickets.find(t => t.id === replyingTo)?.username[0].toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold leading-none">{tickets.find(t => t.id === replyingTo)?.username}</span>
                                                <span className="text-[8px] font-black uppercase tracking-tighter opacity-50">
                                                    {tickets.find(t => t.id === replyingTo)?.user_role?.toLowerCase() === 'trainer' ? 'Trainer Communication' : 'Client Communication'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest opacity-50">{t('supportChannel', 'admin') || "Support Channel"}</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-dots-pattern" ref={scrollRef}>
                                        {/* Unified Message Stream */}
                                        {tickets
                                            .filter(t => t.user_id === tickets.find(msg => msg.id === replyingTo)?.user_id)
                                            .map(ticket => {
                                                const isPritomnyAdmin = ticket.sender_id === Number(user?.id);
                                                return (
                                                    <div key={ticket.id} className={`flex flex-col ${isPritomnyAdmin ? 'items-end' : 'items-start'} w-full animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                                        <div className={`p-3 rounded-2xl ${isPritomnyAdmin ? 'bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/20 max-w-[85%] border border-primary-foreground/10' : 'bg-secondary/80 backdrop-blur-md rounded-tl-none border border-border/50 shadow-sm max-w-[85%]'} relative overflow-hidden`}>
                                                            <div className={`absolute top-0 ${isPritomnyAdmin ? 'right-0 w-1' : 'left-0 w-1'} h-full ${isPritomnyAdmin ? 'bg-white/20' : 'bg-muted-foreground/30'}`} />
                                                            <p className="text-xs leading-relaxed px-1">{ticket.message}</p>
                                                        </div>
                                                        <span className={`text-[9px] text-muted-foreground/50 mt-1 font-mono ${isPritomnyAdmin ? 'mr-1' : 'ml-1'}`}>
                                                            {isPritomnyAdmin ? (t('systemResponse', 'admin') || "System Response") : ticket.username} • {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                    {/* Input Area */}
                                    <div className="p-4 bg-background/50 border-t border-border/50">
                                        <div className="flex gap-2 relative group">
                                            <Input
                                                className="flex-1 bg-secondary/30 border-border/50 rounded-xl focus-visible:ring-primary h-12 text-sm pr-12 shadow-inner"
                                                placeholder={t('typeMessage', 'messenger') || "Type your response..."}
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleReply(replyingTo)}
                                            />
                                            <Button 
                                                onClick={() => handleReply(replyingTo)}
                                                className="absolute right-1 top-1 h-10 w-10 p-0 rounded-lg hover:rotate-12 transition-all active:scale-95"
                                                disabled={!replyText.trim()}
                                            >
                                                <ArrowLeft className="rotate-180 h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-50">
                                    <div className="h-20 w-20 rounded-3xl bg-secondary flex items-center justify-center grayscale border-4 border-dashed border-border/50">
                                        <MessageCircle className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-display font-bold text-lg">{t('commHub', 'admin') || "Communication Hub"}</p>
                                        <p className="text-xs text-muted-foreground max-w-xs">{t('commHubDesc', 'admin') || "Select a conversation from the sidebar to view thread history and respond to inquiries."}</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                )}



                <Dialog open={!!selectedUser} onOpenChange={(open: boolean) => !open && setSelectedUser(null)}>
                    <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="p-6 pb-2">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border border-border/50">
                                    {selectedUser?.profile_image ? (
                                        <img src={selectedUser.profile_image} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-muted-foreground">{selectedUser?.username?.[0]?.toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <DialogTitle>User Details: {selectedUser?.username}</DialogTitle>
                                    <DialogDescription>Role: {selectedUser?.role}</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto px-6 pb-6 mt-2">
                            {isDetailsLoading ? (
                                <p className="text-center py-8 text-muted-foreground">Loading specific data...</p>
                            ) : (
                                <div className="space-y-6 pb-6 mt-4">
                                    {selectedProfile && selectedProfile.age ? (
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg border-b pb-2">Profile Information</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><span className="text-muted-foreground">Age:</span> {selectedProfile.age}</div>
                                                <div><span className="text-muted-foreground">Gender:</span> {selectedProfile.gender}</div>
                                                <div><span className="text-muted-foreground">Weight:</span> {selectedProfile.weight} kg</div>
                                                <div><span className="text-muted-foreground">Height:</span> {selectedProfile.height} cm</div>
                                                <div><span className="text-muted-foreground">Level:</span> {selectedProfile.fitnessLevel}</div>
                                                <div><span className="text-muted-foreground">Diet:</span> {selectedProfile.dietaryPreference}</div>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <p><span className="text-muted-foreground">Goals:</span> {selectedProfile.fitnessGoals?.join(', ')}</p>
                                                <p><span className="text-muted-foreground">Limitations:</span> {selectedProfile.healthLimitations}</p>
                                                <p><span className="text-muted-foreground">Allergies:</span> {selectedProfile.allergies}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground italic">User hasn't completed onboarding.</p>
                                    )}

                                    {selectedPlan && (
                                        <div className="space-y-4 pt-4">
                                            <h3 className="font-semibold text-lg border-b pb-2">Training Plan</h3>
                                            <p className="text-sm"><span className="text-muted-foreground">Weekly Days:</span> {selectedPlan?.trainingSplit?.length || 0}</p>

                                            <h3 className="font-semibold text-lg border-b pb-2 mt-4">Nutrition Plan</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><span className="text-muted-foreground">Calories:</span> {selectedPlan?.nutrition?.calories || "-"} kcal</div>
                                                <div><span className="text-muted-foreground">Protein:</span> {selectedPlan?.nutrition?.protein || "-"}g</div>
                                                <div><span className="text-muted-foreground">Carbs:</span> {selectedPlan?.nutrition?.carbs || "-"}g</div>
                                                <div><span className="text-muted-foreground">Fat:</span> {selectedPlan?.nutrition?.fat || "-"}g</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle>Admin Profile: {user?.username}</DialogTitle>
                            <DialogDescription>Update your account security settings</DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                            <div className="space-y-6 pt-2">
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/20 shadow-lg">
                                        {user?.profile_image ? (
                                            <img src={user.profile_image} alt="Avatar" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-bold text-primary">{user?.username?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Uživatelské jméno</Label>
                                        <div className="p-2 border border-border/50 rounded-md bg-secondary/20 text-sm">
                                            {user?.username}
                                        </div>
                                    </div>

                                    <div className="border-t border-border/50 pt-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Změna hesla</h3>
                                        <form onSubmit={handleChangePassword} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Současné heslo</Label>
                                                <Input type="password" value={passwordForm.old} onChange={e => setPasswordForm({ ...passwordForm, old: e.target.value })} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Nové heslo</Label>
                                                <Input type="password" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Potvrdit nové heslo</Label>
                                                <Input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} required />
                                            </div>
                                            <Button type="submit" className="w-full">Aktualizovat heslo</Button>
                                        </form>
                                    </div>

                                    <div className="pt-4 border-t border-border/50">
                                        <Button variant="outline" className="w-full" onClick={() => setIsProfileOpen(false)}>Zavřít</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div >
        </div >
    );
};

export default AdminPanel;
