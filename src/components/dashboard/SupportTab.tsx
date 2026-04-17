import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/utils";
import { Send, MessageCircle, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Ticket {
    id: number;
    message: string;
    status: "open" | "closed";
    created_at: string;
    sender_id: number;
    trainer_id: number | null;
}

const SupportTab = () => {
    const { token, user } = useAuth();
    const { t } = useLanguage();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recipient, setRecipient] = useState<"coach" | "admin">("coach");
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [tickets]);

    interface ChatMessage {
        id: string;
        text: string;
        sender: "me" | "coach" | "admin";
        timestamp: string;
        isOpen?: boolean;
    }

    const chatMessages: ChatMessage[] = tickets.map(t => {
        let sender: "me" | "coach" | "admin" = "me";
        if (Number(t.sender_id) !== Number(user?.id)) {
            sender = t.trainer_id ? "coach" : "admin";
        }
        return {
            id: String(t.id),
            text: t.message,
            sender,
            timestamp: t.created_at,
            isOpen: t.status === "open"
        };
    });

    chatMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    useEffect(() => {
        if (user && !user.trainer_id) {
            setRecipient("admin");
        }
    }, [user, user?.trainer_id]);

    useEffect(() => {
        fetchTickets();
    }, [token]);

    const fetchTickets = async () => {
        try {
            const res = await fetch(getApiUrl("/api/support"), {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setTickets(await res.json());
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to load your support tickets.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsSubmitting(true);
        const targetRecipient = recipient;

        try {
            // Messenger Logic: Find an 'open' ticket to reply to
            const relevantTickets = tickets.filter(t => {
                if (targetRecipient === 'admin') return t.trainer_id === null || t.trainer_id === 0;
                return t.trainer_id !== null && t.trainer_id !== 0;
            });
            
            const openTicket = relevantTickets.find(t => t.status === 'open');

            if (openTicket) {
                // Reply to the open ticket
                const res = await fetch(getApiUrl(`/api/support/${openTicket.id}/reply`), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ reply: newMessage }),
                });
                if (res.ok) {
                    toast.success(targetRecipient === "admin" ? t('msgSentAdmin', 'tabs') : t('msgSentCoach', 'tabs'));
                    setNewMessage("");
                    fetchTickets();
                }
            } else {
                // Initiate new ticket
                const res = await fetch(getApiUrl("/api/support"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        message: newMessage,
                        target: targetRecipient
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    toast.success(data.recipient === "admin" ? t('msgSentAdmin', 'tabs') : t('msgSentCoach', 'tabs'));
                    setNewMessage("");
                    fetchTickets();
                }
            }
        } catch (e) {
            console.error(e);
            toast.error("Network error - could not send message.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight">{t('coachSupportTitle', 'tabs')}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {t('coachSupportDesc', 'tabs')}
                    </p>
                </div>
                
                <div className="flex gap-2 p-1 bg-secondary/20 rounded-xl w-fit h-fit">
                    <Button 
                        variant={recipient === "coach" ? "hero" : "ghost"} 
                        size="sm" 
                        onClick={() => setRecipient("coach")}
                        className="rounded-lg px-6"
                    >
                        {t('coachSupport', 'tabs')}
                    </Button>
                    <Button 
                        variant={recipient === "admin" ? "hero" : "ghost"} 
                        size="sm" 
                        onClick={() => setRecipient("admin")}
                        className="rounded-lg px-6"
                    >
                        System Admin
                    </Button>
                </div>
            </div>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm flex flex-col h-[600px] overflow-hidden">
                <CardHeader className="border-b bg-secondary/20 py-4">
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        {t('yourMessages', 'tabs')} ({chatMessages.length})
                    </CardTitle>
                    <CardDescription>{t('weReplyWithin24h', 'tabs')}</CardDescription>
                </CardHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    {recipient === "coach" && !user?.trainer_id ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertCircle className="h-8 w-8 text-destructive" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{t('noTrainerAssigned', 'tabs')}</h3>
                                <p className="text-muted-foreground max-w-sm mt-2">{t('noTrainerDesc', 'tabs')}</p>
                            </div>
                        </div>
                    ) : chatMessages.filter(m => (recipient === 'admin' ? m.sender === 'admin' || (m.sender === 'me' && !tickets.find(t => String(t.id) === m.id)?.trainer_id) : m.sender === 'coach' || (m.sender === 'me' && !!tickets.find(t => String(t.id) === m.id)?.trainer_id))).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <MessageCircle className="h-8 w-8 mb-3" />
                            <p>{t('noMessagesYet', 'tabs')}</p>
                        </div>
                    ) : (
                        chatMessages
                            .filter(m => {
                                // Filter messages based on active recipient channel
                                const originalTicket = tickets.find(t => String(t.id) === m.id);
                                const t_trainerId = originalTicket?.trainer_id;
                                
                                if (recipient === "admin") {
                                    // Admin channel: no trainer_id
                                    return m.sender === "admin" || (m.sender === "me" && (!t_trainerId || t_trainerId === 0));
                                } else {
                                    // Coach channel: has trainer_id
                                    return m.sender === "coach" || (m.sender === "me" && t_trainerId && t_trainerId !== 0);
                                }
                            })
                            .map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] p-3 rounded-2xl ${msg.sender === 'me' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-secondary text-secondary-foreground border border-border/50 rounded-tl-sm'}`}>
                                        {msg.sender !== 'me' && (
                                            <p className="text-[10px] font-bold opacity-50 mb-1 uppercase flex items-center gap-1">
                                                {msg.sender === 'coach' ? t('coachReply', 'tabs') : t('adminReply', 'tabs')}
                                            </p>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                        <div className={`flex items-center gap-1 mt-1 text-[10px] ${msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {msg.isOpen && <Clock className="h-3 w-3 ml-1" />}
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>

                <div className="p-4 border-t bg-card/50">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            placeholder={recipient === "admin" ? t('typeMessageAdmin', 'tabs') : t('typeMessageCoach', 'tabs')}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 bg-background"
                            disabled={isSubmitting}
                        />
                        <Button type="submit" variant="hero" disabled={isSubmitting || !newMessage.trim() || (recipient === "coach" && !user?.trainer_id)}>
                            {isSubmitting ? t('sending', 'tabs') : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export { SupportTab };
