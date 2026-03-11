"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";
import api from "@/lib/api";
import { ArrowLeft, Send, User, ShieldCheck, Clock, CheckCircle2, RotateCcw, AlertTriangle, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminTicketDetailPage() {
    const { id } = useParams();
    const router = useRouter();
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
            router.push("/admin/support");
        }
    };

    useEffect(() => {
        fetchTicket();
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
            toast.success("Réponse envoyée");
        } catch (error) {
            toast.error("Erreur lors de l'envoi");
        } finally {
            setSending(false);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            await api.patch(`/support/admin/tickets/${id}`, { status: newStatus });
            toast.success(`Statut mis à jour: ${newStatus}`);
            fetchTicket();
        } catch (error) {
            toast.error("Erreur lors de la mise à jour du statut");
        }
    };

    if (!ticket) return <div className="p-8 text-center text-muted-foreground">Chargement...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] p-8 pt-6 max-w-6xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h2 className="text-2xl font-bold tracking-tight">{ticket.subject}</h2>
                            <Badge variant="outline">ID: #{ticket.id}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Utilisateur ID: {ticket.user_id} • Ouvert le {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {ticket.status === 'closed' ? (
                        <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('open')}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Réouvrir le ticket
                        </Button>
                    ) : (
                        <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus('closed')}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Clôturer le ticket
                        </Button>
                    )}
                    <Badge className={
                        ticket.status === 'open' ? 'bg-blue-500' :
                            ticket.status === 'pending' ? 'bg-orange-500' : 'bg-slate-500'
                    }>
                        {ticket.status === 'open' ? 'En attente admin' : ticket.status === 'pending' ? 'Réponse envoyée' : 'Fermé'}
                    </Badge>
                </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                <Card className="flex-[3] flex flex-col overflow-hidden border-2">
                    <CardHeader className="bg-muted/30 pb-4">
                        <CardTitle className="text-sm font-semibold flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Historique de la conversation
                        </CardTitle>
                    </CardHeader>
                    <CardContent
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/20"
                    >
                        {ticket.messages.map((msg: any) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.is_admin_reply ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex flex-col max-w-[85%] ${msg.is_admin_reply ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center space-x-2 mb-1 px-1">
                                        {msg.is_admin_reply ? (
                                            <>
                                                <span className="text-[10px] font-bold text-primary italic">VOUS (ADMIN)</span>
                                                <ShieldCheck className="w-3 h-3 text-primary" />
                                            </>
                                        ) : (
                                            <>
                                                <User className="w-3 h-3" />
                                                <span className="text-[10px] font-bold">CLIENT (Utilisateur {ticket.user_id})</span>
                                            </>
                                        )}
                                    </div>
                                    <div className={`p-3 rounded-2xl shadow-sm ${msg.is_admin_reply
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-white dark:bg-slate-800 rounded-tl-none border border-slate-200 dark:border-slate-700'
                                        }`}>
                                        <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                                    </div>
                                    <span className="text-[9px] text-muted-foreground mt-1 px-1">
                                        {format(new Date(msg.created_at), "dd MMM HH:mm", { locale: fr })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    {ticket.status !== 'closed' && (
                        <CardFooter className="p-4 bg-background border-t">
                            <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
                                <Textarea
                                    placeholder="Répondre à l'utilisateur..."
                                    className="flex-1 min-h-[50px] max-h-[150px] py-3 rounded-xl resize-none"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <Button type="submit" size="icon" className="h-full px-4 rounded-xl" disabled={sending || !newMessage.trim()}>
                                    <Send className="w-5 h-5 text-white" />
                                </Button>
                            </form>
                        </CardFooter>
                    )}
                </Card>

                <div className="flex-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Détails de la demande</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Priorité</p>
                                <Badge variant={ticket.priority === 'high' ? 'destructive' : 'secondary'}>
                                    {ticket.priority.toUpperCase()}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Créé par</p>
                                <p className="font-medium">Utilisateur #{ticket.user_id}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Date d'ouverture</p>
                                <p className="font-medium">{format(new Date(ticket.created_at), "dd/MM/yyyy", { locale: fr })}</p>
                            </div>
                            <div className="pt-4 border-t flex flex-col space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <User className="w-4 h-4 mr-2" />
                                    Voir profil utilisateur
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start text-red-500 hover:text-red-600">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Signaler un abus
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
