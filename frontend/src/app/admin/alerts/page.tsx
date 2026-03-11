"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { Alert, PROCEDURE_LABELS } from "@/lib/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export interface AlertAdmin extends Alert {
    user: {
        id: number;
        full_name: string;
        email: string;
    }
}

export default function AdminAlertsPage() {
    const [alerts, setAlerts] = useState<AlertAdmin[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<AlertAdmin[]>("/admin/alerts").then((r) => { setAlerts(r.data); setLoading(false); });
    }, []);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold">Toutes les alertes</h1>
                <p className="text-muted-foreground mt-1">{alerts.length} alerte(s) au total</p>
            </div>

            <Card className="border-border bg-card">
                <CardHeader><CardTitle>Vue globale</CardTitle></CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-muted-foreground text-sm">Chargement…</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border">
                                    <TableHead>ID</TableHead>
                                    <TableHead>Utilisateur</TableHead>
                                    <TableHead>Préfecture</TableHead>
                                    <TableHead>Démarche</TableHead>
                                    <TableHead>Période</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Notifs</TableHead>
                                    <TableHead>Créée le</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {alerts.map((alert) => (
                                    <TableRow key={alert.id} className="border-border hover:bg-muted/20">
                                        <TableCell className="text-muted-foreground text-sm">#{alert.id}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-sm">{alert.user.full_name}</p>
                                                <p className="text-xs text-muted-foreground">{alert.user.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-sm">{alert.prefecture.name}</p>
                                                <p className="text-xs text-muted-foreground">{alert.prefecture.city}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">{PROCEDURE_LABELS[alert.procedure_type]}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(alert.date_from), "dd/MM/yy")} → {format(new Date(alert.date_to), "dd/MM/yy")}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={alert.is_active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-muted"}>
                                                {alert.is_active ? (
                                                    <><Bell className="w-3 h-3 mr-1 inline" />Active</>
                                                ) : (
                                                    <><BellOff className="w-3 h-3 mr-1 inline" />Inactive</>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {alert.notif_email && <Badge variant="outline" className="text-[10px] py-0">Email</Badge>}
                                                {alert.notif_sms && <Badge variant="outline" className="text-[10px] py-0">SMS</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(alert.created_at), "dd MMM yyyy", { locale: fr })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
