import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Users, Eye, LogOut, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OnboardingData, GeneratedPlan } from "@/types/onboarding";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/utils";

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
    username: string; // Joined from DB
    message: string;
    reply: string | null;
    status: "open" | "closed";
    created_at: string;
    replied_at: string | null;
}

const AdminPanel = () => {
    const { token, user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("users");

    // User Management State
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<OnboardingData | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<GeneratedPlan | null>(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);

    // Support Inbox State
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [replyText, setReplyText] = useState("");
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

    const [trainers, setTrainers] = useState<AdminUser[]>([]);
    const [selectedTrainerId, setSelectedTrainerId] = useState<string>("");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ old: "", new: "", confirm: "" });

    useEffect(() => {
        if (activeTab === "users") {
            fetchUsers();
            fetchTrainers();
        } else if (activeTab === "support") {
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
                toast.success("Reply sent successfully");
                setReplyText("");
                setReplyingTo(null);
                fetchTickets();
            } else {
                toast.error("Failed to send reply");
            }
        } catch (e) {
            toast.error("Network error");
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
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </header>

                <div className="flex space-x-2 border-b border-border/50 pb-2">
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "users" ? "bg-accent/20 text-accent" : "text-muted-foreground hover:bg-secondary"}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab("trainers")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "trainers" ? "bg-accent/20 text-accent" : "text-muted-foreground hover:bg-secondary"}`}
                    >
                        Manage Trainers
                    </button>
                    <button
                        onClick={() => setActiveTab("support")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "support" ? "bg-accent/20 text-accent" : "text-muted-foreground hover:bg-secondary"}`}
                    >
                        Support Inbox
                        {tickets.filter(t => t.status === 'open').length > 0 && (
                            <span className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                                {tickets.filter(t => t.status === 'open').length}
                            </span>
                        )}
                    </button>
                </div>

                {activeTab === "trainers" && (
                    <div className="space-y-6">
                        <Card className="bg-card/50 border-accent/30 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Create New Trainer</CardTitle>
                                <CardDescription>Register a new fitness professional to the platform</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const username = (form.elements.namedItem("trainer_username") as HTMLInputElement).value;
                                    const password = (form.elements.namedItem("trainer_password") as HTMLInputElement).value;

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
                                            toast.success("Trainer created successfully");
                                            form.reset();
                                            fetchTrainers();
                                        } else {
                                            const data = await res.json();
                                            toast.error(data.error || "Failed to create trainer");
                                        }
                                    } catch (e) {
                                        toast.error("Network error");
                                    }
                                }} className="flex gap-4 items-end">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="trainer_username">Username</Label>
                                        <Input id="trainer_username" name="trainer_username" required />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="trainer_password">Password</Label>
                                        <Input id="trainer_password" name="trainer_password" type="password" required />
                                    </div>
                                    <Button type="submit">Create Trainer</Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 border-accent/30 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Existing Trainers</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6">
                                {/* Desktop View */}
                                <div className="hidden md:block rounded-md border border-border/50 overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase px-4 py-3 border-b border-border/50">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Username</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {trainers.map(t => (
                                                <tr key={t.id} className="hover:bg-secondary/30 transition-colors">
                                                    <td className="px-4 py-3 font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border/50">
                                                                {t.profile_image ? <img src={t.profile_image} className="h-full w-full object-cover" /> : <span className="text-xs font-bold text-muted-foreground">{t.username[0].toUpperCase()}</span>}
                                                            </div>
                                                            {t.username}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => deleteUser(t.id)} className="text-destructive transition-colors">
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
                                    {trainers.map(t => (
                                        <div key={t.id} className="p-4 rounded-xl bg-secondary/20 border border-border/50 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border/50 shadow-sm">
                                                    {t.profile_image ? <img src={t.profile_image} className="h-full w-full object-cover" /> : <span className="font-bold">{t.username[0].toUpperCase()}</span>}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{t.username}</p>
                                                    <p className="text-xs text-muted-foreground">ID: {t.id}</p>
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t border-border/50 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => deleteUser(t.id)} className="text-destructive font-bold text-xs uppercase">Delete</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === "users" && (
                    <Card className="bg-card/50 border-accent/30 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>View and manage all registered accounts on the platform</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6">
                            {/* Desktop View */}
                            <div className="hidden md:block rounded-md border border-border/50 overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase px-4 py-3 border-b border-border/50">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">ID</th>
                                            <th className="px-4 py-3 font-medium">Username</th>
                                            <th className="px-4 py-3 font-medium">Role</th>
                                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                                                <td className="px-4 py-3 font-medium">{u.id}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border/50">
                                                            {u.profile_image ? (
                                                                <img src={u.profile_image} alt="U" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <span className="text-xs font-bold text-muted-foreground">{u.username[0].toUpperCase()}</span>
                                                            )}
                                                        </div>
                                                        {u.username}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-accent/20 text-accent' : u.role === 'trainer' ? 'bg-purple-500/20 text-purple-500' : 'bg-primary/20 text-primary'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2 items-center">
                                                        {u.role === 'user' && (
                                                            <div className="flex gap-1 items-center mr-4">
                                                                <select
                                                                    className={`text-xs bg-background border rounded px-2 py-1 ${u.trainer_id ? 'border-primary/50 text-primary font-medium' : 'border-border'}`}
                                                                    defaultValue={u.trainer_id || ""}
                                                                    id={`trainer-select-${u.id}`}
                                                                >
                                                                    <option value="">No Trainer</option>
                                                                    {trainers.map(t => <option key={t.id} value={t.id}>{t.username}</option>)}
                                                                </select>
                                                                <Button
                                                                    size="sm"
                                                                    variant={u.trainer_id ? "outline" : "default"}
                                                                    className="h-7 px-2"
                                                                    onClick={() => {
                                                                        const sel = document.getElementById(`trainer-select-${u.id}`) as HTMLSelectElement;
                                                                        assignTrainer(u.id, parseInt(sel.value));
                                                                    }}
                                                                >
                                                                    {u.trainer_id ? "Update" : "Assign"}
                                                                </Button>
                                                            </div>
                                                        )}
                                                        <Button variant="ghost" size="sm" onClick={() => viewUserDetails(u)} className="text-muted-foreground hover:bg-secondary transition-colors">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {u.id !== user?.id && (
                                                            <Button variant="ghost" size="sm" onClick={() => deleteUser(u.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Mobile View */}
                            <div className="md:hidden space-y-4 px-4 pb-4">
                                {users.map(u => (
                                    <div key={u.id} className="p-4 rounded-xl bg-secondary/20 border border-border/50 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border/50 shadow-sm">
                                                {u.profile_image ? <img src={u.profile_image} className="h-full w-full object-cover" /> : <span className="font-bold">{u.username[0].toUpperCase()}</span>}
                                            </div>
                                            <div>
                                                <p className="font-bold">{u.username}</p>
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{u.role}</p>
                                            </div>
                                        </div>

                                        {u.role === 'user' && (
                                            <div className="flex flex-col gap-2 pt-2 border-t border-border/20">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Assign Trainer</p>
                                                <div className="flex gap-2">
                                                    <select
                                                        className={`flex-1 text-xs bg-background border rounded px-2 py-1 ${u.trainer_id ? 'border-primary/50 text-primary' : 'border-border'}`}
                                                        defaultValue={u.trainer_id || ""}
                                                        id={`trainer-select-mob-${u.id}`}
                                                    >
                                                        <option value="">No Trainer</option>
                                                        {trainers.map(t => <option key={t.id} value={t.id}>{t.username}</option>)}
                                                    </select>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 px-3 text-xs"
                                                        onClick={() => {
                                                            const sel = document.getElementById(`trainer-select-mob-${u.id}`) as HTMLSelectElement;
                                                            assignTrainer(u.id, parseInt(sel.value));
                                                        }}
                                                    >
                                                        Set
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center pt-2 border-t border-border/50">
                                            <span className="text-[10px] text-muted-foreground font-mono">ID: {u.id}</span>
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="ghost" onClick={() => viewUserDetails(u)} className="h-8 text-accent font-bold text-xs uppercase">Details</Button>
                                                {u.id !== user?.id && (
                                                    <Button size="sm" variant="ghost" className="h-8 text-destructive font-bold text-xs uppercase" onClick={() => deleteUser(u.id)}>Delete</Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {users.length === 0 && <p className="text-center py-8 text-muted-foreground">No users found</p>}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === "support" && (
                    <Card className="bg-card/50 border-accent/30 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Support Inbox</CardTitle>
                            <CardDescription>Respond to user questions and support requests.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {tickets.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No support tickets found.</p>
                            ) : (
                                tickets.map(ticket => (
                                    <div key={ticket.id} className="border border-border/50 rounded-lg p-4 space-y-3 bg-secondary/10">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold">{ticket.username}</span>
                                                    <span className="text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleString()}</span>
                                                    {ticket.status === 'open' ? (
                                                        <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">Open</span>
                                                    ) : (
                                                        <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">Closed</span>
                                                    )}
                                                </div>
                                                <p className="text-sm">{ticket.message}</p>
                                            </div>
                                        </div>

                                        {ticket.status === 'closed' ? (
                                            <div className="bg-muted/30 p-3 rounded-md border border-border/30 mt-3">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-xs font-semibold text-accent">Your Reply</span>
                                                    <span className="text-xs text-muted-foreground">{ticket.replied_at ? new Date(ticket.replied_at).toLocaleString() : ''}</span>
                                                </div>
                                                <p className="text-sm text-foreground/80">{ticket.reply}</p>
                                            </div>
                                        ) : (
                                            <div className="mt-4">
                                                {replyingTo === ticket.id ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            className="w-full h-24 p-2 text-sm bg-background border border-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                                                            placeholder="Write your response..."
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="sm" onClick={() => { setReplyingTo(null); setReplyText(''); }}>Cancel</Button>
                                                            <Button size="sm" onClick={() => handleReply(ticket.id)}>Send Reply</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Button variant="outline" size="sm" onClick={() => setReplyingTo(ticket.id)}>
                                                        Reply to User
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                )}

                <Dialog open={!!selectedUser} onOpenChange={(open: boolean) => !open && setSelectedUser(null)}>
                    <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border border-border/50">
                                    {selectedUser?.profile_image ? (
                                        <img src={selectedUser.profile_image} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-muted-foreground">{selectedUser?.username[0].toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <DialogTitle>User Details: {selectedUser?.username}</DialogTitle>
                                    <DialogDescription>Role: {selectedUser?.role}</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <ScrollArea className="flex-1 pr-4">
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
                                            <p className="text-sm"><span className="text-muted-foreground">Weekly Days:</span> {selectedPlan.trainingSplit.length}</p>

                                            <h3 className="font-semibold text-lg border-b pb-2 mt-4">Nutrition Plan</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><span className="text-muted-foreground">Calories:</span> {selectedPlan.nutrition.calories} kcal</div>
                                                <div><span className="text-muted-foreground">Protein:</span> {selectedPlan.nutrition.protein}g</div>
                                                <div><span className="text-muted-foreground">Carbs:</span> {selectedPlan.nutrition.carbs}g</div>
                                                <div><span className="text-muted-foreground">Fat:</span> {selectedPlan.nutrition.fat}g</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ScrollArea>
                    </DialogContent>
                </Dialog>

                <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle>Admin Profile: {user?.username}</DialogTitle>
                            <DialogDescription>Update your account security settings</DialogDescription>
                        </DialogHeader>

                        <ScrollArea className="flex-1 px-6 pb-6">
                            <div className="space-y-6 pt-2">
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/20 shadow-lg">
                                        {user?.profile_image ? (
                                            <img src={user.profile_image} alt="Avatar" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-bold text-primary">{user?.username[0].toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            id="admin-avatar-upload"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                if (file.size > 10 * 1024 * 1024) {
                                                    toast.error("Obrázek je příliš velký (max 10MB)");
                                                    return;
                                                }
                                                const reader = new FileReader();
                                                reader.onloadend = async () => {
                                                    const base64 = reader.result as string;
                                                    try {
                                                        const res = await fetch(getApiUrl("/api/user/settings"), {
                                                            method: "PUT",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                                "Authorization": `Bearer ${token}`
                                                            },
                                                            body: JSON.stringify({ profile_image: base64 })
                                                        });
                                                        if (res.ok) {
                                                            const data = await res.json();
                                                            updateUser(data.user);
                                                            toast.success("Profilová fotka aktualizována");
                                                        }
                                                    } catch (e) {
                                                        toast.error("Chyba při nahrávání");
                                                    }
                                                };
                                                reader.readAsDataURL(file);
                                            }}
                                        />
                                        <Label htmlFor="admin-avatar-upload" className="cursor-pointer">
                                            <Button variant="outline" size="sm" asChild>
                                                <span>Změnit fotku</span>
                                            </Button>
                                        </Label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Uživatelské jméno</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="admin_username_edit_field"
                                                defaultValue={user?.username}
                                            />
                                            <Button size="sm" onClick={async () => {
                                                const val = (document.getElementById("admin_username_edit_field") as HTMLInputElement).value;
                                                if (!val || val === user?.username) return;
                                                try {
                                                    const res = await fetch(getApiUrl("/api/user/settings"), {
                                                        method: "PUT",
                                                        headers: {
                                                            "Content-Type": "application/json",
                                                            "Authorization": `Bearer ${token}`
                                                        },
                                                        body: JSON.stringify({ username: val })
                                                    });
                                                    if (res.ok) {
                                                        const data = await res.json();
                                                        updateUser(data.user);
                                                        toast.success("Uživatelské jméno změněno");
                                                    } else {
                                                        const data = await res.json();
                                                        toast.error(data.error || "Chyba při změně");
                                                    }
                                                } catch (e) {
                                                    toast.error("Chyba sítě");
                                                }
                                            }}>Uložit</Button>
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
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div >
        </div >
    );
};

export default AdminPanel;
