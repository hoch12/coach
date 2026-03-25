import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/utils";
import { Send, MessageCircle, Clock, CheckCircle } from "lucide-react";

interface Ticket {
    id: number;
    message: string;
    reply: string | null;
    status: "open" | "closed";
    created_at: string;
    replied_at: string | null;
    trainer_id: number | null;
}

const SupportTab = () => {
    const { token, user } = useAuth();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recipient, setRecipient] = useState<"coach" | "admin">("coach");

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
        try {
            console.log("[Support] Sending message:", { message: newMessage, toAdmin: recipient === "admin" });
            const res = await fetch(getApiUrl("/api/support"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: newMessage,
                    toAdmin: recipient === "admin"
                }),
            });

            if (res.ok) {
                console.log("[SupportTab] Message sent successfully");
                toast.success(recipient === "admin" ? "Zpráva odeslána administrátorovi!" : "Zpráva odeslána trenérovi!");
                setNewMessage("");
                fetchTickets();
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error("[SupportTab] Send message failed:", res.status, errData);
                toast.error(`Chyba při odesílání: ${errData.error || res.statusText}`);
            }
        } catch (e) {
            console.error(e);
            toast.error("Network error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-display font-bold tracking-tight">Coach Support</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Have a question about your plan, diet, or training progress? Ask our coaching team directly.
                </p>
            </div>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        Send a Message
                    </CardTitle>
                    <CardDescription>We typically reply within 24 hours.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-4">
                        <Label className="text-sm font-semibold">Komu chcete zprávu odeslat?</Label>
                        <div className="flex p-1 bg-secondary/50 rounded-xl w-full sm:w-fit border border-border/50">
                            <button
                                type="button"
                                onClick={() => {
                                    console.log("[SupportTab] Switching recipient to: coach");
                                    setRecipient("coach");
                                }}
                                disabled={!user?.trainer_id}
                                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${recipient === "coach" ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 disabled:opacity-30"}`}
                            >
                                Můj trenér
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    console.log("[SupportTab] Switching recipient to: admin");
                                    setRecipient("admin");
                                }}
                                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${recipient === "admin" ? "bg-accent text-accent-foreground shadow-lg scale-[1.02]" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
                            >
                                Administrátor
                            </button>
                        </div>

                        {recipient === "admin" && (
                            <p className="text-xs bg-accent/10 text-accent-foreground p-3 rounded-lg border border-accent/20 animate-in fade-in slide-in-from-top-1">
                                {!user?.trainer_id
                                    ? "Nemáte přiřazeného trenéra. Zpráva bude automaticky směřována na centrální podporu."
                                    : "Zpráva bude odeslána přímo administrátorovi systému (mimo Vašeho trenéra)."}
                            </p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <Input
                            placeholder={recipient === "admin" ? "Napište zprávu podpoře..." : "Napište zprávu trenérovi..."}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 bg-background"
                            disabled={isSubmitting}
                        />
                        <Button type="submit" variant="hero" disabled={isSubmitting || !newMessage.trim()}>
                            {isSubmitting ? "Odesílám..." : "Odeslat"}
                            <Send className="ml-2 h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-bold font-display flex items-center gap-2">
                    Your Messages
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({tickets.length})
                    </span>
                </h2>

                {tickets.length === 0 ? (
                    <div className="text-center py-12 glass-card rounded-xl border border-dashed border-border text-muted-foreground">
                        <MessageCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
                        <p>You haven't sent any messages yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map((ticket) => (
                            <Card key={ticket.id} className="overflow-hidden border-border/40 transition-all hover:bg-accent/5">
                                <div className="p-5 flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-sm rounded-full bg-secondary text-secondary-foreground px-3 py-0.5">
                                                You
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(ticket.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-foreground">{ticket.message}</p>
                                    </div>

                                    <div className="hidden md:block w-px bg-border/50"></div>

                                    <div className="flex-1 space-y-2">
                                        {ticket.status === "closed" ? (
                                            <>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-sm rounded-full bg-primary/20 text-primary px-3 py-0.5 border border-primary/20 flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" /> {ticket.trainer_id === null ? "Admin Reply" : "Coach Reply"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {ticket.replied_at ? new Date(ticket.replied_at).toLocaleString() : ""}
                                                    </span>
                                                </div>
                                                <p className="text-foreground/90 whitespace-pre-wrap">{ticket.reply}</p>
                                            </>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 bg-muted/20 rounded-lg border border-dashed border-border/50">
                                                <Clock className="h-6 w-6 mb-2 opacity-50 animate-pulse" />
                                                <p className="text-sm">Awaiting reply...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export { SupportTab };
