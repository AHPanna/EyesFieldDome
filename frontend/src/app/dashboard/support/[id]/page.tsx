"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";
import api from "@/lib/api";
import { ArrowLeft, Send, User, ShieldCheck, Clock, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuthStore } from "@/store/authStore";

export default function TicketDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuthStore();
    const [ticket, setTicket] = useState<any>(null);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchTicket = async () => {
        try {
            const response = await api.get(`/support/tickets/${id}`);
            setTicket(response.data);
        } catch (error) {
            toast.error("Erreur lors de la récupération du ticket");
            router.push("/dashboard/support");
        }
    };

    useEffect(() => {
        fetchTicket();
        // Refresh interval if it's still open
        const interval = setInterval(() => {
            if (ticket?.status !== 'closed') fetchTicket();
        }, 5000);
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [ticket?.messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await api.post(`/support/tickets/${id}/messages`, { message: newMessage });
            setNewMessage("");
            fetchTicket();
        } catch (error) {
            toast.error("Erreur lors de l'envoi du message");
        } finally {
            setSending(false);
        }
    };

    if (!ticket) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] p-8 pt-6 max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{ticket.subject}</h2>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>Ticket #{ticket.id}</span>
                            <span>•</span>
                            <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {format(new Date(ticket.created_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant={ticket.status === 'closed' ? 'outline' : 'default'} className={
                        ticket.status === 'open' ? 'bg-blue-500' :
                            ticket.status === 'pending' ? 'bg-orange-500' : ''
                    }>
                        {ticket.status === 'open' ? 'Ouvert' : ticket.status === 'pending' ? 'Réponse reçue' : 'Fermé'}
                    </Badge>
                    <Badge variant="outline">Priorité: {ticket.priority}</Badge>
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden border-2">
                <CardContent
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-50/30 dark:bg-slate-900/10"
                >
                    {ticket.messages.map((msg: any) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}
                        >
                            <div className={`flex flex-col max-w-[80%] ${msg.is_admin_reply ? 'items-start' : 'items-end'}`}>
                                <div className="flex items-center space-x-2 mb-1">
                                    {msg.is_admin_reply ? (
                                        <>
                                            <ShieldCheck className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-bold text-primary">Support RDV Préfecture</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xs font-semibold">{currentUser?.full_name}</span>
                                            <User className="w-4 h-4" />
                                        </>
                                    )}
                                </div>
                                <div className={`p-4 rounded-2xl shadow-sm ${msg.is_admin_reply
                                    ? 'bg-white dark:bg-slate-800 rounded-tl-none border border-slate-200 dark:border-slate-700'
                                    : 'bg-primary text-primary-foreground rounded-tr-none'
                                    }`}>
                                    <p className="whitespace-pre-wrap">{msg.message}</p>
                                </div>
                                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                    {format(new Date(msg.created_at), "HH:mm", { locale: fr })}
                                </span>
                            </div>
                        </div>
                    ))}
                </CardContent>
                {ticket.status !== 'closed' && (
                    <CardFooter className="p-4 bg-background border-t">
                        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
                            <Textarea
                                placeholder="Votre message..."
                                className="flex-1 min-h-[50px] max-h-[150px] py-3 rounded-xl resize-none"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e as any);
                                    }
                                }}
                            />
                            <Button type="submit" size="icon" className="h-full px-4 rounded-xl" disabled={sending || !newMessage.trim()}>
                                <Send className="w-5 h-5 text-white" />
                            </Button>
                        </form>
                    </CardFooter>
                )}
            </Card>
            {ticket.status === 'closed' && (
                <div className="text-center p-4 bg-muted rounded-xl border border-dashed text-muted-foreground">
                    Ce ticket a été clôturé. Si vous avez une autre question, merci d'ouvrir un nouveau ticket.
                </div>
            )}
        </div>
    );
}
