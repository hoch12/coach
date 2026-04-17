import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/utils";
import { Send, MessageCircle, Clock, CheckCircle } from "lucide-react";
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
        if (t.sender_id !== user?.id) {
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
    }, [user]);

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
        const targetRecipient = recipient; // Capture current state to avoid race conditions

        try {
            console.log(`[SupportTab] Submitting message to ${targetRecipient}:`, newMessage);

            const res = await fetch(getApiUrl("/api/support"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: newMessage,
                    target: targetRecipient // Explicitly send 'admin' or 'coach'
                }),
            });

            if (res.ok) {
                const data = await res.json();
                console.log("[SupportTab] Message sent successfully. Server response:", data);

                const successMsg = data.recipient === "admin"
                    ? t('msgSentAdmin', 'tabs')
                    : t('msgSentCoach', 'tabs');

                toast.success(successMsg);
                setNewMessage("");
                fetchTickets();
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error("[SupportTab] Send message failed:", res.status, errData);
                toast.error(`${t('sendError', 'tabs')} ${errData.error || res.statusText}`);
            }
        } catch (e) {
            console.error("[SupportTab] Network error:", e);
            toast.error("Network error - could not send message.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-display font-bold tracking-tight">{t('coachSupportTitle', 'tabs')}</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    {t('coachSupportDesc', 'tabs')}
                </p>
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
                    {chatMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <MessageCircle className="h-8 w-8 mb-3" />
                            <p>{t('noMessagesYet', 'tabs')}</p>
                        </div>
                    ) : (
                        chatMessages.map(msg => (
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
                        <Button type="submit" variant="hero" disabled={isSubmitting || !newMessage.trim()}>
                            {isSubmitting ? t('sending', 'tabs') : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export { SupportTab };
