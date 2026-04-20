import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Users, Calendar, MessageCircle, LogOut, ArrowLeft,
    ChevronRight, User, CheckCircle2, Clock, Dumbbell, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    profile_image: string | null;
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
    status: string;
    created_at: string;
    trainer_id: number | null;
    user_id: number;
    sender_id: number;
}

export default function TrainerDashboard() {
    const { user, token, logout, updateUser } = useAuth();
    const { language, setLanguage, t } = useLanguage();
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
    const [isInitiating, setIsInitiating] = useState(false);
    const [messagingClient, setMessagingClient] = useState<Client | null>(null);
    const [initiateMessageText, setInitiateMessageText] = useState("");
    
    // Progress Tracking State
    const [clientWorkoutLogs, setClientWorkoutLogs] = useState<any[]>([]);
    const [clientNutritionLogs, setClientNutritionLogs] = useState<any[]>([]);
    const [clientDailyLogs, setClientDailyLogs] = useState<any[]>([]);
    const [isProgressLoading, setIsProgressLoading] = useState(false);
    
    // Chat state
    const [selectedChatUser, setSelectedChatUser] = useState<any>(null); // Can be Client | 'admin'
    const [isSendingChat, setIsSendingChat] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [tickets, selectedChatUser]);

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
                const [clientsRes, ticketsRes] = await Promise.all([
                    fetch(getApiUrl("/api/trainer/clients"), { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(getApiUrl("/api/support"), { headers: { Authorization: `Bearer ${token}` } })
                ]);
                if (clientsRes.ok) setClients(await clientsRes.json());
                if (ticketsRes.ok) setTickets(await ticketsRes.json());
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
                toast.success(t('replySent', 'trainer'));
                setReplyText("");
                setReplyingTo(null);
                fetchData();
            }
        } catch (e) {
            toast.error(t('errorSendingReply', 'trainer'));
        }
    };

    const handleInitiateMessage = async () => {
        if (!initiateMessageText.trim() || !messagingClient) return;
        setIsInitiating(true);
        try {
            const res = await fetch(getApiUrl("/api/support/trainer-initiate"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ clientId: messagingClient.id, message: initiateMessageText })
            });
            if (res.ok) {
                toast.success(t('msgSentCoach', 'tabs') || "Message sent!");
                setInitiateMessageText("");
                setMessagingClient(null);
                fetchData();
                setActiveTab("chat");
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(`${t('sendError', 'tabs')} ${errData.error || res.statusText}`);
            }
        } catch (e) {
            toast.error("Network error");
        } finally {
            setIsInitiating(false);
        }
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedChatUser) return;

        setIsSendingChat(true);
        try {
            const isAdminChat = selectedChatUser.id === 'admin';
            
            // Unify logic: both Admin and Client chats now look for an 'open' thread to reply to
            const relevantTickets = tickets.filter(t => {
                const t_userId = Number(t.user_id);
                const t_trainerId = t.trainer_id ? Number(t.trainer_id) : null;
                const currentUserId = Number(user?.id);

                if (isAdminChat) {
                    return t_userId === currentUserId && (t_trainerId === null || t_trainerId === 0);
                } else {
                    return t_userId === Number(selectedChatUser.id);
                }
            });

            const openTicket = relevantTickets.find(t => t.status === "open");

            if (openTicket) {
                // Reply to the open ticket (Universal for both Admin and Client)
                const res = await fetch(getApiUrl(`/api/support/${openTicket.id}/reply`), {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ reply: replyText })
                });
                if (res.ok) {
                    toast.success(isAdminChat ? (t('msgSentAdmin', 'trainer') || "Message sent to Admin!") : t('replySent', 'trainer'));
                    setReplyText("");
                    fetchData();
                } else {
                    toast.error(t('errorSendingReply', 'trainer'));
                }
            } else {
                // Initiate a new message
                let res;
                if (isAdminChat) {
                    // Trainer to Admin
                    res = await fetch(getApiUrl("/api/support"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ message: replyText, target: "admin" })
                    });
                } else {
                    // Trainer to Client
                    res = await fetch(getApiUrl("/api/support/trainer-initiate"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ clientId: selectedChatUser.id, message: replyText })
                    });
                }

                if (res?.ok) {
                    toast.success(isAdminChat ? (t('msgSentAdmin', 'trainer') || "Message sent to Admin!") : t('replySent', 'trainer'));
                    setReplyText("");
                    fetchData();
                } else {
                    toast.error("Failed to send message");
                }
            }
        } catch (e) {
            toast.error("Network error");
        } finally {
            setIsSendingChat(false);
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
        setIsProgressLoading(true);
        setSelectedProfile(null);
        setSelectedPlan(null);
        setClientWorkoutLogs([]);
        setClientNutritionLogs([]);
        setClientDailyLogs([]);

        try {
            const [profileRes, planRes, workoutRes, nutritionRes, dailyRes] = await Promise.all([
                fetch(getApiUrl(`/api/admin/users/${u.id}/profile`), { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(getApiUrl(`/api/admin/users/${u.id}/plan`), { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(getApiUrl(`/api/trainer/client/${u.id}/logs/workout`), { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(getApiUrl(`/api/trainer/client/${u.id}/logs/nutrition`), { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(getApiUrl(`/api/trainer/client/${u.id}/logs/daily`), { headers: { "Authorization": `Bearer ${token}` } })
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
            if (workoutRes.ok) {
                const logs = await workoutRes.json();
                setClientWorkoutLogs(logs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }
            if (nutritionRes.ok) {
                const logs = await nutritionRes.json();
                setClientNutritionLogs(logs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }
            if (dailyRes.ok) {
                const logs = await dailyRes.json();
                setClientDailyLogs(logs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }
        } catch (e) {
            toast.error("Failed to load user details");
        } finally {
            setIsDetailsLoading(false);
            setIsProgressLoading(false);
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
        { id: "clients", label: t('myClients', 'trainer'), icon: Users },
        { id: "schedule", label: t('schedule', 'trainer'), icon: Calendar },
        { id: "chat", label: t('messages', 'trainer'), icon: MessageCircle },
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
                <header className="px-4 md:px-8 py-3 md:py-6 border-b border-border/50 flex flex-col md:flex-row gap-3 justify-between items-center bg-card/30 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex w-full md:w-auto items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Dumbbell className="h-5 w-5 text-primary md:hidden" />
                           <h1 className="text-lg md:text-2xl font-display font-bold">{t('trainerDashboard', 'trainer')}</h1>
                        </div>
                        <div className="flex md:hidden gap-0.5 items-center bg-secondary/20 p-1 rounded-xl">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`p-2 rounded-lg transition-all ${activeTab === item.id ? "bg-primary text-primary-foreground shadow-lg scale-105" : "text-muted-foreground hover:bg-secondary/50"}`}
                                >
                                    <item.icon className="h-4 w-4" />
                                </button>
                            ))}
                            <div className="w-px h-4 bg-border/50 mx-1" />
                            <button
                                onClick={() => setIsProfileOpen(true)}
                                className={`p-2 rounded-lg transition-colors ${isProfileOpen ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}
                            >
                                <User className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => { logout(); navigate("/login"); }}
                                className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <div className="flex items-center bg-secondary/50 rounded-lg p-0.5 md:p-1 mr-1">
                            <button 
                                onClick={() => setLanguage('en')} 
                                className={`px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-bold rounded-md transition-colors ${language === 'en' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                EN
                            </button>
                            <button 
                                onClick={() => setLanguage('cs')} 
                                className={`px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-bold rounded-md transition-colors ${language === 'cs' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                CS
                            </button>
                        </div>
                        <div className="hidden sm:block text-right">
                            <p className="text-xs font-medium leading-none">{user?.username}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{user?.role}</p>
                        </div>
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/20">
                            {user?.profile_image ? (
                                <img src={user.profile_image} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-xs md:text-sm text-primary font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <div className="max-w-5xl mx-auto">
                        {activeTab === "clients" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {clients.map(client => (
                                    <Card key={client.id} className="glass-card overflow-hidden hover:border-primary/50 transition-colors">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center overflow-hidden border border-border/50">
                                                    {client.profile_image ? (
                                                        <img src={client.profile_image} alt="Avatar" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-xl font-bold">{client.username?.[0]?.toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => viewUserDetails(client)} title="View client details">
                                                    <User className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <CardTitle className="mt-4">{client.username}</CardTitle>
                                            <CardDescription>{t('activeClient', 'trainer')}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex gap-2 mt-2">
                                                <Button variant="outline" size="sm" className="flex-1 font-medium" onClick={() => setMessagingClient(client)}>
                                                    <MessageCircle className="h-4 w-4 mr-2" /> {t('messageClient', 'trainer')}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {clients.length === 0 && !isLoading && (
                                    <p className="col-span-full text-center py-12 text-muted-foreground bg-secondary/20 rounded-2xl border-2 border-dashed border-border">
                                        {t('noClientsAssigned', 'trainer')}
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
                                            <CheckCircle2 className="h-5 w-5 text-green-500" /> {t('confirmedSessions', 'trainer')}
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
                                        {bookings.length === 0 && <p className="text-sm text-muted-foreground">{t('noUpcomingSessions', 'trainer')}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "chat" && (
                            <div className="flex bg-card/50 border border-border/50 rounded-2xl overflow-hidden h-[600px] mt-4">
                                {/* Clients Sidebar */}
                                <div className="w-1/3 border-r border-border/50 flex flex-col bg-card/30">
                                    <div className="p-4 border-b border-border/50 font-bold bg-secondary/10 flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4" />
                                        {t('chats', 'trainer') || "Conversations"}
                                    </div>
                                    <div className="flex-1 overflow-y-auto w-full p-2 space-y-1">
                                        {(() => {
                                            const adminObj = { id: 'admin', username: t('systemAdmin', 'trainer') || 'System Admin', isAdmin: true };
                                            const allConvs = [adminObj, ...clients];
                                            
                                            const getLatestTime = (conv: any) => {
                                                const convTickets = tickets.filter(t => {
                                                    if (conv.isAdmin) {
                                                        const t_userId = Number(t.user_id);
                                                        const t_trainerId = t.trainer_id ? Number(t.trainer_id) : null;
                                                        const currentUserId = Number(user?.id);
                                                        return t_userId === currentUserId && (t_trainerId === null || t_trainerId === 0);
                                                    } else {
                                                        return Number((t as any).user_id) === Number(conv.id);
                                                    }
                                                });
                                                return convTickets.length > 0 ? Math.max(...convTickets.map(t => new Date(t.created_at).getTime())) : 0;
                                            };

                                            return allConvs
                                                .sort((a, b) => getLatestTime(b) - getLatestTime(a))
                                                .map(conv => {
                                                    const isConvAdmin = conv.id === 'admin';
                                                    const convTickets = tickets.filter(t => {
                                                        if (isConvAdmin) {
                                                            const t_userId = Number(t.user_id);
                                                            const t_trainerId = t.trainer_id ? Number(t.trainer_id) : null;
                                                            return t_userId === Number(user?.id) && (t_trainerId === null || t_trainerId === 0);
                                                        } else {
                                                            return Number((t as any).user_id) === Number(conv.id);
                                                        }
                                                    });
                                                    
                                                    const sorted = [...convTickets].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                                                    const lastMsg = sorted[sorted.length - 1];
                                                    const hasUnread = lastMsg && Number(lastMsg.sender_id) !== Number(user?.id) && lastMsg.status === 'open';

                                                    if (isConvAdmin) {
                                                        return (
                                                            <div 
                                                                key="admin"
                                                                onClick={() => setSelectedChatUser(conv)}
                                                                className={`p-3 rounded-xl cursor-pointer hover:bg-accent/10 transition-colors flex justify-between items-center border border-dashed mb-2 ${selectedChatUser?.id === 'admin' ? 'bg-accent/10 border-accent/40' : 'border-border/30'}`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    {hasUnread ? (
                                                                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(var(--accent),0.5)]" />
                                                                    ) : (
                                                                        <div className="w-2 h-2 rounded-full bg-accent/20" />
                                                                    )}
                                                                    <span className="font-bold text-sm text-accent">{t('administrator', 'trainer') || "Administrator"}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div 
                                                            key={conv.id}
                                                            onClick={() => setSelectedChatUser(conv)}
                                                            className={`p-3 rounded-xl cursor-pointer hover:bg-accent/10 transition-colors flex justify-between items-center mb-1 ${selectedChatUser?.id === conv.id ? 'bg-primary/10 border border-primary/20' : ''}`}
                                                        >
                                                            <span className="font-semibold text-sm">{conv.username}</span>
                                                            {hasUnread && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />}
                                                        </div>
                                                    );
                                                });
                                        })()}
                                    </div>
                                    {clients.length === 0 && <p className="text-xs text-muted-foreground p-2 text-center opacity-50">No clients assigned.</p>}
                                </div>
                                
                                {/* Chat Area */}
                                <div className="flex-1 flex flex-col h-full bg-background/50 relative">
                                    {selectedChatUser ? (() => {
                                        const isAdminChat = selectedChatUser.id === 'admin';
                                        const clientTickets = tickets.filter(t => {
                                            const t_userId = Number(t.user_id);
                                            const t_trainerId = t.trainer_id ? Number(t.trainer_id) : null;
                                            const currentUserId = Number(user?.id);

                                            if (isAdminChat) {
                                                // Trainer messaging Admin: user_id is the Trainer (me), trainer_id is null
                                                return t_userId === currentUserId && (t_trainerId === null || t_trainerId === 0);
                                            } else {
                                                // Trainer messaging Client: user_id is the Client, trainer_id is the Trainer (me)
                                                // OR viewing client messages: user_id is the Client
                                                return t_userId === Number(selectedChatUser.id);
                                            }
                                        });
                                        
                                        interface ChatMessage {
                                            id: string;
                                            text: string;
                                            sender: "other" | "me";
                                            timestamp: string;
                                            isOpen?: boolean;
                                        }
 
                                        const chatMessages: ChatMessage[] = clientTickets.map(t => ({
                                            id: String(t.id),
                                            text: t.message,
                                            sender: t.sender_id === Number(user?.id) ? "me" : "other",
                                            timestamp: t.created_at,
                                            isOpen: t.status === "open"
                                        }));
                                        chatMessages.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                                        return (
                                            <>
                                                <div className="p-4 border-b border-border/50 bg-secondary/10 font-bold flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex justify-center items-center font-bold text-sm">
                                                            {selectedChatUser.username.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <span>{selectedChatUser.username}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                                                    {chatMessages.length === 0 ? (
                                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 flex-col gap-2">
                                                            <MessageCircle className="h-10 w-10 mb-3" />
                                                            <p>No messages yet.</p>
                                                        </div>
                                                    ) : chatMessages.map(msg => (
                                                        <div key={msg.id} className={`flex ${msg.sender === 'other' ? 'justify-start' : 'justify-end'}`}>
                                                            <div className={`max-w-[75%] p-3 rounded-2xl ${msg.sender === 'me' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-secondary text-secondary-foreground border border-border/50 rounded-tl-sm'}`}>
                                                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                                                <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    {msg.isOpen && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">NEW</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="p-4 border-t border-border/50 bg-card/50">
                                                    <form onSubmit={handleChatSubmit} className="flex gap-2">
                                                        <Input
                                                            placeholder={t('typeYourReply', 'trainer') || "Write a message..."}
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            className="flex-1 bg-background"
                                                            disabled={isSendingChat}
                                                        />
                                                        <Button type="submit" variant="hero" disabled={isSendingChat || !replyText.trim()}>
                                                            {isSendingChat ? (t('sending', 'tabs') || "Sending...") : (t('send', 'tabs') || "Send")}
                                                        </Button>
                                                    </form>
                                                </div>
                                            </>
                                        );
                                    })() : (
                                        <div className="flex-1 flex items-center justify-center text-muted-foreground opacity-50 flex-col gap-2">
                                            <MessageCircle className="h-10 w-10" />
                                            <p>{t('selectAClient', 'trainer') || "Select a client to start chatting"}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <Dialog open={!!selectedUser} onOpenChange={(open: boolean) => !open && setSelectedUser(null)}>
                    <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle>{t('clientDetails', 'trainer') || "Client Details"}: {selectedUser?.username}</DialogTitle>
                            <DialogDescription>{t('clientDetailsDesc', 'trainer') || "Personalized fitness data and program"}</DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto px-6 pb-6 mt-2">
                            {isDetailsLoading ? (
                                <p className="text-center py-8 text-muted-foreground">Loading client data...</p>
                            ) : (
                                <div className="space-y-6 pb-6 mt-4">
                                     {selectedProfile && selectedProfile.age ? (
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg border-b pb-2">{t('profileInfo', 'profile') || "Profile Information"}</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><span className="text-muted-foreground font-medium">{t('age', 'onboarding')}:</span> {selectedProfile.age}</div>
                                                <div><span className="text-muted-foreground font-medium">{t('gender', 'onboarding')}:</span> {t(selectedProfile.gender as any, 'onboarding')}</div>
                                                <div><span className="text-muted-foreground font-medium">{t('weight', 'onboarding')}:</span> {selectedProfile.weight} kg</div>
                                                <div><span className="text-muted-foreground font-medium">{t('height', 'onboarding')}:</span> {selectedProfile.height} cm</div>
                                                <div><span className="text-muted-foreground font-medium">{t('level', 'onboarding')}:</span> {t(selectedProfile.fitnessLevel as any, 'onboarding')}</div>
                                                <div><span className="text-muted-foreground font-medium">{t('diet', 'onboarding')}:</span> {t(selectedProfile.dietaryPreference as any, 'onboarding')}</div>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <p><span className="text-muted-foreground font-medium">{t('fitnessGoals', 'onboarding')}:</span> {selectedProfile.fitnessGoals?.map((g: string) => t(g.toLowerCase().replace(/ /g, '-'), 'onboarding')).join(', ')}</p>
                                                <p><span className="text-muted-foreground font-medium">{t('healthLimitations', 'onboarding')}:</span> {selectedProfile.healthLimitations || t('none', 'common')}</p>
                                                <p><span className="text-muted-foreground font-medium">{t('allergies', 'onboarding')}:</span> {selectedProfile.allergies || t('none', 'common')}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground italic">{t('notCompleted', 'profile')}</p>
                                    )}

                                    {selectedPlan && (
                                        <div className="space-y-4 pt-4 border-t border-border/50">
                                            <h3 className="font-semibold text-lg border-b pb-2">{t('training', 'sidebar')}</h3>
                                            <p className="text-sm"><span className="text-muted-foreground">{t('trainingDays', 'dashboard')}:</span> {selectedPlan?.trainingSplit?.length || 0}</p>

                                            <h3 className="font-semibold text-lg border-b pb-2 mt-4">{t('nutrition', 'sidebar')}</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><span className="text-muted-foreground">{t('calories', 'dashboard')}:</span> {selectedPlan?.nutrition?.calories || "-"} kcal</div>
                                                <div><span className="text-muted-foreground">{t('protein', 'dashboard')}:</span> {selectedPlan?.nutrition?.protein || "-"}g</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Client Progress Logs */}
                                    <div className="space-y-4 pt-4 border-t border-border/50">
                                        <h3 className="font-semibold text-lg border-b pb-2 flex justify-between items-center text-accent">
                                            {t('clientTrackingHistory', 'trainer') || "Client Tracking History"}
                                            <Activity className="h-4 w-4" />
                                        </h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">{t('recentWorkouts', 'dashboard')}</h4>
                                                <div className="space-y-2">
                                                    {clientWorkoutLogs.slice(0, 5).map((log: any) => (
                                                        <div key={log.id} className="text-xs p-2 bg-secondary/20 rounded-lg border border-border/10 flex justify-between items-center">
                                                            <div>
                                                                <span className="font-bold">{log.exercise}</span>
                                                                <span className="ml-2 opacity-60">{log.sets}x{log.reps} @ {log.weight}kg</span>
                                                            </div>
                                                            <span className="text-[10px] font-mono opacity-40">{new Date(log.date).toLocaleDateString()}</span>
                                                        </div>
                                                    ))}
                                                    {clientWorkoutLogs.length === 0 && <p className="text-[10px] italic opacity-40">{t('noRecentWorkouts', 'dashboard') || "No recent workouts recorded."}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">{t('nutritionSummary', 'dashboard') || "Nutrition Summary"}</h4>
                                                <div className="space-y-2">
                                                    {clientNutritionLogs.slice(0, 3).map((log: any) => (
                                                        <div key={log.id} className="text-xs p-2 bg-secondary/20 rounded-lg border border-border/10">
                                                            <div className="flex justify-between mb-1">
                                                                <span className="font-bold">{log.meal_name}</span>
                                                                <span className="text-[10px] font-mono opacity-40">{new Date(log.date).toLocaleDateString()}</span>
                                                            </div>
                                                            <div className="flex gap-2 opacity-70 scale-90 origin-left">
                                                                <span className="bg-primary/10 px-1.5 rounded">{log.calories} kcal</span>
                                                                <span className="bg-primary/10 px-1.5 rounded">P: {log.protein}g</span>
                                                                <span className="bg-primary/10 px-1.5 rounded">C: {log.carbs}g</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {clientNutritionLogs.length === 0 && <p className="text-[10px] italic opacity-40">{t('noNutritionLogs', 'dashboard') || "No nutrition logs recorded."}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 mt-4 border-t border-border/50">
                                        <Button 
                                            variant="hero" 
                                            className="w-full"
                                            onClick={() => navigate(`/onboarding?client_id=${selectedUser?.id}`)}
                                        >
                                            {selectedProfile ? t('editClientPlan', 'trainer') : t('createClientPlan', 'trainer')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle>{t('myProfile', 'trainer')}: {user?.username}</DialogTitle>
                            <DialogDescription>{t('updateProfileDesc', 'trainer')}</DialogDescription>
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
                                        <Label>{t('username', 'onboarding')}</Label>
                                        <div className="p-2 border border-border/50 rounded-md bg-secondary/20 text-sm">
                                            {user?.username}
                                        </div>
                                    </div>

                                    <div className="border-t border-border/50 pt-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">{t('changePassword', 'profile')}</h3>
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
                                                <Label>{t('confirmNewPassword', 'profile')}</Label>
                                                <Input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} required />
                                            </div>
                                            <Button type="submit" className="w-full">{t('updatePassword', 'profile')}</Button>
                                        </form>
                                    </div>

                                    <div className="pt-4 border-t border-border/50">
                                        <Button variant="outline" className="w-full" onClick={() => setIsProfileOpen(false)}>{t('close', 'common')}</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!messagingClient} onOpenChange={(open: boolean) => !open && setMessagingClient(null)}>
                    <DialogContent className="max-w-md p-6">
                        <DialogHeader>
                            <DialogTitle>{t('messageClient', 'trainer')}: {messagingClient?.username}</DialogTitle>
                            <DialogDescription>{t('sendMessageDesc', 'trainer')}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <textarea
                                className="w-full bg-background border border-border/50 rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[100px]"
                                placeholder={t('typeMessage', 'tabs')}
                                value={initiateMessageText}
                                onChange={(e) => setInitiateMessageText(e.target.value)}
                                disabled={isInitiating}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setMessagingClient(null)} disabled={isInitiating}>{t('cancel', 'common')}</Button>
                                <Button onClick={handleInitiateMessage} disabled={isInitiating || !initiateMessageText.trim()}>
                                    {isInitiating ? t('sending', 'tabs') : t('send', 'tabs')}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
