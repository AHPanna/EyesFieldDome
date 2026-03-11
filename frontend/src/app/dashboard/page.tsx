"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, PlusCircle, TrendingUp, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Alert, PROCEDURE_LABELS } from "@/lib/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function DashboardPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Alert[]>("/alerts").then((r) => { setAlerts(r.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const activeCount = alerts.filter((a) => a.is_active).length;
    const inactiveCount = alerts.length - activeCount;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold">Bonjour, {user?.full_name?.split(" ")[0]} 👋</h1>
                <p className="text-muted-foreground mt-1">Voici un aperçu de vos alertes de surveillance</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total alertes", value: alerts.length, icon: Bell, color: "text-primary" },
                    { label: "Alertes actives", value: activeCount, icon: TrendingUp, color: "text-green-400" },
                    { label: "Alertes inactives", value: inactiveCount, icon: Clock, color: "text-yellow-400" },
                    { label: "Créneaux trouvés", value: "—", icon: CheckCircle2, color: "text-blue-400" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <Card key={label} className="border-border bg-card hover:border-primary/20 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                            <Icon className={`w-4 h-4 ${color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "…" : value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent alerts */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Alertes récentes</h2>
                    <Link href="/dashboard/alerts/new">
                        <Button variant="outline" size="sm">
                            <PlusCircle className="w-4 h-4 mr-2" />Nouvelle alerte
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="text-muted-foreground text-sm">Chargement…</div>
                ) : alerts.length === 0 ? (
                    <Card className="border-dashed border-border bg-card/50">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
                            <p className="font-semibold">Aucune alerte configurée</p>
                            <p className="text-muted-foreground text-sm mb-6">Créez votre première alerte pour être notifié dès qu&apos;un créneau se libère</p>
                            <Button className="gradient-primary" onClick={() => router.push("/dashboard/alerts/new")}>
                                <PlusCircle className="w-4 h-4 mr-2" />Créer une alerte
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {alerts.slice(0, 5).map((alert) => (
                            <Card key={alert.id} className="border-border bg-card hover:border-primary/20 transition-colors">
                                <CardContent className="flex items-center gap-4 py-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm">{alert.prefecture.name}</span>
                                            <Badge variant={alert.is_active ? "default" : "secondary"} className={alert.is_active ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
                                                {alert.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {PROCEDURE_LABELS[alert.procedure_type]} • {format(new Date(alert.date_from), "dd MMM", { locale: fr })} → {format(new Date(alert.date_to), "dd MMM yyyy", { locale: fr })}
                                        </p>
                                    </div>
                                    <Link href="/dashboard/alerts">
                                        <Button variant="ghost" size="sm">Voir</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
