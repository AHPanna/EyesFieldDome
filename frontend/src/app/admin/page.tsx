"use client";

import { useEffect, useState } from "react";
import { Users, Bell, MapPin, Search, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { AdminStats } from "@/lib/types";

export default function AdminPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<AdminStats>("/admin/stats").then((r) => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const statCards = stats
        ? [
            { label: "Utilisateurs inscrits", value: stats.total_users, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Alertes actives", value: stats.active_alerts, icon: Bell, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Créneaux détectés", value: stats.total_slots_detected, icon: Search, color: "text-purple-400", bg: "bg-purple-500/10" },
            { label: "Créneaux disponibles", value: stats.available_slots, icon: BarChart3, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Préfectures actives", value: stats.total_prefectures, icon: MapPin, color: "text-pink-400", bg: "bg-pink-500/10" },
        ]
        : [];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold">Administration</h1>
                <p className="text-muted-foreground mt-1">Vue d&apos;ensemble de la plateforme</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <Card key={i} className="border-border bg-card animate-pulse">
                            <CardHeader className="pb-2"><div className="h-4 bg-muted rounded w-3/4" /></CardHeader>
                            <CardContent><div className="h-8 bg-muted rounded w-1/4" /></CardContent>
                        </Card>
                    ))
                    : statCards.map(({ label, value, icon: Icon, color, bg }) => (
                        <Card key={label} className="border-border bg-card hover:border-primary/20 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{value}</div>
                            </CardContent>
                        </Card>
                    ))}
            </div>

            <Card className="border-border bg-card">
                <CardHeader><CardTitle>Activité récente</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">Les graphiques d&apos;activité seront disponibles dans la Phase 2 (après intégration du scraper).</p>
                </CardContent>
            </Card>
        </div>
    );
}
