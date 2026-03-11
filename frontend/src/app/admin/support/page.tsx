"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";
import api from "@/lib/api";
import { Search, Filter, MessageSquare, Clock, User, AlertCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const statusParam = filter !== "all" ? `?status=${filter}` : "";
            const response = await api.get(`/support/admin/tickets${statusParam}`);
            setTickets(response.data);
        } catch (error) {
            toast.error("Erreur lors de la récupération des tickets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [filter]);

    const filteredTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toString().includes(search)
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "open":
                return <Badge variant="default" className="bg-blue-500">Ouvert</Badge>;
            case "pending":
                return <Badge variant="secondary" className="bg-orange-500 text-white">Réponse envoyée</Badge>;
            case "closed":
                return <Badge variant="outline" className="border-green-500 text-green-500">Fermé</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "high":
                return <Badge variant="destructive" className="bg-red-500">Haute</Badge>;
            case "medium":
                return <Badge variant="secondary" className="bg-yellow-500 text-black">Moyenne</Badge>;
            case "low":
                return <Badge variant="outline">Basse</Badge>;
            default:
                return <Badge>{priority}</Badge>;
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Support Client</h2>
                    <p className="text-muted-foreground">Gérez les demandes d'assistance des utilisateurs.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un ticket..."
                            className="pl-9 w-[250px]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" onClick={fetchTickets}>
                        Rafraîchir
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
                <TabsList>
                    <TabsTrigger value="all">Tous</TabsTrigger>
                    <TabsTrigger value="open">Ouverts</TabsTrigger>
                    <TabsTrigger value="pending">En attente</TabsTrigger>
                    <TabsTrigger value="closed">Fermés</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-20 text-muted-foreground">Chargement des données...</div>
                ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-20 bg-muted/50 rounded-xl border-2 border-dashed">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">Aucun ticket trouvé</p>
                        <p className="text-sm text-muted-foreground">Bravo ! Tous les tickets sont traités.</p>
                    </div>
                ) : (
                    filteredTickets.map((ticket) => (
                        <Link key={ticket.id} href={`/admin/support/${ticket.id}`}>
                            <Card className="hover:bg-muted/50 transition-all cursor-pointer group border-l-4" style={{
                                borderLeftColor: ticket.priority === 'high' ? '#ef4444' : ticket.priority === 'medium' ? '#eab308' : '#e2e8f0'
                            }}>
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-primary/10 p-3 rounded-full">
                                                <User className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-bold text-lg group-hover:text-primary transition-colors">#{ticket.id} - {ticket.subject}</span>
                                                    {getStatusBadge(ticket.status)}
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center">
                                                        Utilisateur ID: {ticket.user_id}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Mis à jour {format(new Date(ticket.updated_at), "dd MMM HH:mm", { locale: fr })}
                                                    </span>
                                                    {getPriorityBadge(ticket.priority)}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
