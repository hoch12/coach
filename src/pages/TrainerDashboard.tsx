import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Users, Calendar, MessageCircle, LogOut, ArrowLeft,
    ChevronRight, User, CheckCircle2, Clock, Dumbbell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OnboardingData, GeneratedPlan } from "@/types/onboarding";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/utils";
import { BookingCalendar } from "@/components/BookingCalendar";

interface Client {
    id: number;
    username: string;
}

interface Booking {
    id: number;
    client_name: string;
    start_time: string;
    duration_minutes: number;
    status: string;
}

interface Ticket {
    id: number;
    username: string;
    message: string;
    reply: string | null;
    status: string;
    created_at: string;
}

export default function TrainerDashboard() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("clients");
    const [clients, setClients] = useState<Client[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyText, setReplyText] = useState("");
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<Client | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<OnboardingData | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<GeneratedPlan | null>(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ old: "", new: "", confirm: "" });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === "clients") {
                const res = await fetch(getApiUrl("/api/trainer/clients"), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setClients(await res.json());
            } else if (activeTab === "schedule") {
                const res = await fetch(getApiUrl("/api/bookings"), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(await res.json());
            } else if (activeTab === "chat") {
                const res = await fetch(getApiUrl("/api/support"), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTickets(await res.json());
            }
        } catch (e) {
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReply = async (ticketId: number) => {
        if (!replyText.trim()) return;
        try {
            const res = await fetch(getApiUrl(`/api/support/${ticketId}/reply`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reply: replyText })
            });
            if (res.ok) {
                toast.success("Reply sent");
                setReplyText("");
                setReplyingTo(null);
                fetchData();
            }
        } catch (e) {
            toast.error("Error sending reply");
        }
    };
    const handleBookingStatus = async (bookingId: number, action: 'accept' | 'decline') => {
        try {
            const res = await fetch(getApiUrl(`/api/bookings/${bookingId}/${action}`), {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success(`Booking ${action === 'accept' ? 'approved' : 'declined'}`);
                fetchData();
            }
        } catch (e) {
            toast.error("Error updating booking");
        }
    };

    const viewUserDetails = async (u: Client) => {
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
                    Authorization: `Bearer ${token}`
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

    const navItems = [
        { id: "clients", label: "My Clients", icon: Users },
        { id: "schedule", label: "Schedule", icon: Calendar },
        { id: "chat", label: "Messages", icon: MessageCircle },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/50 h-screen sticky top-0">
                <div className="p-5 border-b border-border/50 flex items-center gap-2">
                    <Dumbbell className="h-6 w-6 text-primary" />
                    <span className="font-display font-bold text-lg">Coach-E</span>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
                                }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="p-3 border-t border-border/50 space-y-1">
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" onClick={() => setIsProfileOpen(true)}>
                        {user?.profile_image ? (
                            <img src={user.profile_image} alt="Avatar" className="h-4 w-4 rounded-full object-cover mr-2" />
                        ) : (
                            <User className="h-4 w-4 mr-2" />
                        )}
                        My Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 transition-colors" onClick={() => { logout(); navigate("/login"); }}>
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="px-8 py-6 border-b border-border/50 flex justify-between items-center bg-card/30 backdrop-blur-md">
                    <h1 className="text-2xl font-display font-bold">Trainer Dashboard</h1>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-medium">{user?.username}</p>
                            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/20">
                            {user?.profile_image ? (
                                <img src={user.profile_image} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-primary font-bold">{user?.username[0].toUpperCase()}</span>
                            )}
                        </div>
                    </div>
                </header>

                <ScrollArea className="flex-1 p-8">
                    <div className="max-w-5xl mx-auto">
                        {activeTab === "clients" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {clients.map(client => (
                                    <Card key={client.id} className="glass-card overflow-hidden hover:border-primary/50 transition-colors">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-xl font-bold">
                                                    {client.username[0].toUpperCase()}
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => viewUserDetails(client)} title="View client details">
                                                    <User className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <CardTitle className="mt-4">{client.username}</CardTitle>
                                            <CardDescription>Active Client</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex gap-2 mt-2">
                                                <Button variant="outline" size="sm" className="flex-1 font-medium" onClick={() => setActiveTab("chat")}>
                                                    <MessageCircle className="h-4 w-4 mr-2" /> Chat
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {clients.length === 0 && !isLoading && (
                                    <p className="col-span-full text-center py-12 text-muted-foreground bg-secondary/20 rounded-2xl border-2 border-dashed border-border">
                                        No clients assigned to you yet.
                                    </p>
                                )}
                            </div>
                        )}

                        {activeTab === "schedule" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2">
                                        <BookingCalendar trainerId={user!.id} />
                                    </div>
                                    <div className="space-y-4">
                                        {bookings.filter(b => b.status === 'pending').map(booking => (
                                            <div key={booking.id} className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col gap-3">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-bold">{booking.client_name}</p>
                                                        <p className="text-xs text-muted-foreground">{new Date(booking.start_time).toLocaleString()}</p>
                                                        <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full font-bold">PENDING APPROVAL</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="flex-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/30" onClick={() => handleBookingStatus(booking.id, 'accept')}>Approve</Button>
                                                    <Button size="sm" variant="outline" className="flex-1 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/30" onClick={() => handleBookingStatus(booking.id, 'decline')}>Decline</Button>
                                                </div>
                                            </div>
                                        ))}

                                        <h3 className="text-lg font-bold flex items-center gap-2 mt-6">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" /> Confirmed Sessions
                                        </h3>
                                        {bookings.filter(b => b.status === 'scheduled').map(booking => (
                                            <div key={booking.id} className="p-4 rounded-xl bg-card border border-border/50 flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold">{booking.client_name}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(booking.start_time).toLocaleString()}</p>
                                                </div>
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            </div>
                                        ))}
                                        {bookings.length === 0 && <p className="text-sm text-muted-foreground">No upcoming sessions.</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "chat" && (
                            <div className="space-y-4">
                                {tickets.map(ticket => (
                                    <div key={ticket.id} className={`p-4 rounded-2xl border ${ticket.status === 'open' ? 'bg-primary/5 border-primary/20' : 'bg-card border-border/50'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{ticket.username}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                            </div>
                                            {ticket.status === 'open' && <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">NEW</span>}
                                        </div>
                                        <p className="text-sm mb-4">{ticket.message}</p>

                                        {ticket.reply ? (
                                            <div className="pl-4 border-l-2 border-primary/30 mt-2">
                                                <p className="text-xs font-bold text-primary mb-1">Your response:</p>
                                                <p className="text-sm italic text-muted-foreground">{ticket.reply}</p>
                                            </div>
                                        ) : (
                                            replyingTo === ticket.id ? (
                                                <div className="mt-2 space-y-2">
                                                    <textarea
                                                        className="w-full bg-background border border-border/50 rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                                        placeholder="Type your reply..."
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
                                                        <Button size="sm" onClick={() => handleReply(ticket.id)}>Send Reply</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button size="sm" onClick={() => setReplyingTo(ticket.id)}>Reply</Button>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <Dialog open={!!selectedUser} onOpenChange={(open: boolean) => !open && setSelectedUser(null)}>
                    <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Client Details: {selectedUser?.username}</DialogTitle>
                            <DialogDescription>Personalized fitness data and program</DialogDescription>
                        </DialogHeader>

                        <ScrollArea className="flex-1 pr-4">
                            {isDetailsLoading ? (
                                <p className="text-center py-8 text-muted-foreground">Loading client data...</p>
                            ) : (
                                <div className="space-y-6 pb-6 mt-4">
                                    {selectedProfile && selectedProfile.age ? (
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg border-b pb-2">Profile Information</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><span className="text-muted-foreground font-medium">Age:</span> {selectedProfile.age}</div>
                                                <div><span className="text-muted-foreground font-medium">Gender:</span> {selectedProfile.gender}</div>
                                                <div><span className="text-muted-foreground font-medium">Weight:</span> {selectedProfile.weight} kg</div>
                                                <div><span className="text-muted-foreground font-medium">Height:</span> {selectedProfile.height} cm</div>
                                                <div><span className="text-muted-foreground font-medium">Level:</span> {selectedProfile.fitnessLevel}</div>
                                                <div><span className="text-muted-foreground font-medium">Diet:</span> {selectedProfile.dietaryPreference}</div>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <p><span className="text-muted-foreground font-medium">Goals:</span> {selectedProfile.fitnessGoals?.join(', ')}</p>
                                                <p><span className="text-muted-foreground font-medium">Limitations:</span> {selectedProfile.healthLimitations || 'None'}</p>
                                                <p><span className="text-muted-foreground font-medium">Allergies:</span> {selectedProfile.allergies || 'None'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground italic">Client hasn't completed onboarding yet.</p>
                                    )}

                                    {selectedPlan && (
                                        <div className="space-y-4 pt-4 border-t border-border/50">
                                            <h3 className="font-semibold text-lg border-b pb-2">Training Plan</h3>
                                            <p className="text-sm"><span className="text-muted-foreground font-medium">Weekly Training Days:</span> {selectedPlan.trainingSplit.length}</p>

                                            <h3 className="font-semibold text-lg border-b pb-2 mt-4">Nutrition Plan</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><span className="text-muted-foreground font-medium">Daily Calories:</span> {selectedPlan.nutrition.calories} kcal</div>
                                                <div><span className="text-muted-foreground font-medium">Protein:</span> {selectedPlan.nutrition.protein}g</div>
                                                <div><span className="text-muted-foreground font-medium">Carbohydrates:</span> {selectedPlan.nutrition.carbs}g</div>
                                                <div><span className="text-muted-foreground font-medium">Fats:</span> {selectedPlan.nutrition.fat}g</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ScrollArea>
                    </DialogContent>
                </Dialog>

                <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Trainer Profile: {user?.username}</DialogTitle>
                            <DialogDescription>Update your account security settings</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 pt-4">
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Change Password</h3>
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
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
