"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";
import api from "@/lib/api";
import { PlusCircle, MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function SupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewTicket, setShowNewTicket] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: "", message: "", priority: "medium" });

    const fetchTickets = async () => {
        try {
            const response = await api.get("/support/tickets");
            setTickets(response.data);
        } catch (error) {
            toast.error("Erreur lors de la récupération des tickets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTicket.subject || !newTicket.message) return;

        try {
            await api.post("/support/tickets", {
                subject: newTicket.subject,
                initial_message: newTicket.message,
                priority: newTicket.priority
            });
            toast.success("Ticket créé avec succès");
            setShowNewTicket(false);
            setNewTicket({ subject: "", message: "", priority: "medium" });
            fetchTickets();
        } catch (error) {
            toast.error("Erreur lors de la création du ticket");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "open":
                return <Badge variant="default" className="bg-blue-500">Ouvert</Badge>;
            case "pending":
                return <Badge variant="secondary" className="bg-orange-500 text-white">En attente</Badge>;
            case "closed":
                return <Badge variant="outline" className="border-green-500 text-green-500">Fermé</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Assistance client</h2>
                    <p className="text-muted-foreground">Consultez vos tickets ou ouvrez une nouvelle demande.</p>
                </div>
                {!showNewTicket && (
                    <Button onClick={() => setShowNewTicket(true)}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Nouveau ticket
                    </Button>
                )}
            </div>

            {showNewTicket ? (
                <Card className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle>Ouvrir un ticket</CardTitle>
                        <CardDescription>Expliquez-nous votre problème en détail.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Sujet</Label>
                                <Input
                                    id="subject"
                                    placeholder="Ex: Problème de paiement, Bug sur le scraper..."
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Décrivez votre demande..."
                                    rows={5}
                                    value={newTicket.message}
                                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="ghost" onClick={() => setShowNewTicket(false)}>Annuler</Button>
                                <Button type="submit">Envoyer la demande</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {loading ? (
                        <div className="text-center py-20 text-muted-foreground">Chargement des tickets...</div>
                    ) : tickets.length === 0 ? (
                        <Card className="border-dashed py-20 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="bg-muted p-4 rounded-full">
                                <MessageSquare className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div className="max-w-[300px] space-y-1">
                                <p className="font-semibold text-lg">Aucun ticket pour le moment</p>
                                <p className="text-sm text-muted-foreground">Si vous avez besoin d'aide, n'hésitez pas à nous contacter.</p>
                            </div>
                            <Button variant="secondary" onClick={() => setShowNewTicket(true)}>
                                Ouvrir mon premier ticket
                            </Button>
                        </Card>
                    ) : (
                        tickets.map((ticket) => (
                            <Link key={ticket.id} href={`/dashboard/support/${ticket.id}`}>
                                <Card className="hover:bg-muted/50 transition-colors cursor-pointer group">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-bold text-lg group-hover:text-primary transition-colors">#{ticket.id} - {ticket.subject}</span>
                                                    {getStatusBadge(ticket.status)}
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Créé le {format(new Date(ticket.created_at), "dd MMM yyyy", { locale: fr })}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Priorité: {ticket.priority}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon">
                                                <MessageSquare className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
