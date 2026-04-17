import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO, isAfter, startOfToday } from "date-fns";
import { cs, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/utils";

interface Booking {
    start_time: string;
    duration_minutes: number;
}

export function BookingCalendar({ trainerId }: { trainerId: number }) {
    const { token, user } = useAuth();
    const { language, t } = useLanguage();
    const locale = language === 'cs' ? cs : enUS;
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [busySlots, setBusySlots] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchBusySlots();
    }, [trainerId, currentMonth]);

    const fetchBusySlots = async () => {
        try {
            const res = await fetch(getApiUrl(`/api/bookings/trainer/${trainerId}`), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setBusySlots(data);
        } catch (e) {
            console.error(e);
        }
    };

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale })}
                </h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-center text-xs font-semibold text-muted-foreground uppercase py-2">
                    {format(addDays(startOfWeek(currentMonth), i), "E", { locale })}
                </div>
            );
        }
        return <div className="grid grid-cols-7 border-b border-border/50">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d");
                const cloneDay = day;
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());
                const isPast = !isAfter(day, startOfToday()) && !isToday;

                days.push(
                    <div
                        key={day.toString()}
                        className={`relative h-14 border-r border-b border-border/50 p-1 transition-all ${!isCurrentMonth ? "bg-muted/30 text-muted-foreground/50" : "hover:bg-accent/50 cursor-pointer"
                            } ${isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary" : ""}`}
                        onClick={() => isCurrentMonth && setSelectedDate(cloneDay)}
                    >
                        <span className={`text-xs font-medium ${isToday ? "bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center" : ""}`}>
                            {formattedDate}
                        </span>
                        {isCurrentMonth && busySlots.some(b => isSameDay(parseISO(b.start_time), day)) && (
                            <div className="absolute bottom-1 right-1 h-1.5 w-1.5 bg-destructive rounded-full" />
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7">
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="border-t border-l border-border/50">{rows}</div>;
    };

    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [clients, setClients] = useState<any[]>([]);

    useEffect(() => {
        if (user?.role === 'trainer') {
            fetch(getApiUrl("/api/trainer/clients"), { headers: { Authorization: `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => setClients(data));
        }
    }, [user, token]);

    const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

    const handleBook = async (time: string) => {
        if (user?.role === 'trainer' && !selectedClientId) {
            toast.error(t('selectClientFirst', 'tabs') || "Please select a client first");
            return;
        }

        setIsLoading(true);
        const startTime = format(selectedDate, "yyyy-MM-dd") + "T" + time + ":00";

        try {
            const res = await fetch(getApiUrl("/api/bookings"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    trainerId,
                    startTime,
                    clientId: user?.role === 'trainer' ? selectedClientId : undefined
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success(t('sessionBooked', 'tabs') || "Session booked successfully!");
                fetchBusySlots();
            } else {
                toast.error(data.error || t('failedToBook', 'tabs') || "Failed to book");
            }
        } catch (e) {
            toast.error("Network error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                {renderHeader()}
                {renderDays()}
                {renderCells()}
            </div>

            <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    {t('availableSlots', 'tabs')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 capitalize">
                    {format(selectedDate, "MMMM do, yyyy", { locale })}
                </p>

                {user?.role === 'trainer' && (
                    <div className="mb-4 space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">{t('selectClient', 'tabs')}</label>
                        <select
                            className="w-full bg-secondary/50 border border-border/50 rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                            value={selectedClientId || ""}
                            onChange={(e) => setSelectedClientId(Number(e.target.value))}
                        >
                            <option value="">{t('chooseClient', 'tabs')}</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.username}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map(time => {
                        const fullTime = format(selectedDate, "yyyy-MM-dd") + "T" + time + ":00";
                        const isBusy = busySlots.some(b => b.start_time === fullTime);
                        const isPast = !isAfter(parseISO(fullTime), new Date());

                        return (
                            <Button
                                key={time}
                                variant={isBusy ? "ghost" : "outline"}
                                disabled={isBusy || isPast || isLoading}
                                className={`h-12 ${isBusy ? "opacity-50 cursor-not-allowed bg-muted" : "hover:border-primary hover:text-primary"}`}
                                onClick={() => handleBook(time)}
                            >
                                {time}
                                {isBusy && <span className="ml-2 text-[10px] uppercase font-bold text-destructive">{t('busy', 'tabs')}</span>}
                            </Button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
