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

    const navItems = [
        { id: "clients", label: "My Clients", icon: Users },
        { id: "schedule", label: "Schedule", icon: Calendar },
        { id: "chat", label: "Messages", icon: MessageCircle },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/50">
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
                <div className="p-3 border-t border-border/50">
                    <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => { logout(); navigate("/login"); }}>
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
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user?.username[0].toUpperCase()}
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
                                                <Button variant="ghost" size="icon" onClick={() => navigate(`/admin`)} title="View full details (Admin only)">
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
            </main>
        </div>
    );
}
