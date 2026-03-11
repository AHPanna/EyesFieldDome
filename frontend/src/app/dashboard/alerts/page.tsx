"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PlusCircle, Trash2, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from "@/lib/api";
import { Alert, PROCEDURE_LABELS } from "@/lib/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        try {
            const { data } = await api.get<Alert[]>("/alerts");
            setAlerts(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAlerts(); }, []);

    const toggleActive = async (alert: Alert) => {
        try {
            await api.put(`/alerts/${alert.id}`, { is_active: !alert.is_active });
            toast.success(alert.is_active ? "Alerte désactivée" : "Alerte activée");
            fetchAlerts();
        } catch {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const deleteAlert = async (id: number) => {
        try {
            await api.delete(`/alerts/${id}`);
            toast.success("Alerte supprimée");
            setAlerts((prev) => prev.filter((a) => a.id !== id));
        } catch {
            toast.error("Erreur lors de la suppression");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Mes alertes</h1>
                    <p className="text-muted-foreground mt-1">{alerts.length} alerte(s) configurée(s)</p>
                </div>
                <Link href="/dashboard/alerts/new">
                    <Button className="gradient-primary glow-sm">
                        <PlusCircle className="w-4 h-4 mr-2" />Nouvelle alerte
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="text-muted-foreground">Chargement…</div>
            ) : alerts.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center py-16 text-center">
                        <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="font-semibold">Aucune alerte</p>
                        <p className="text-muted-foreground text-sm mb-4">Créez votre première alerte de surveillance</p>
                        <Link href="/dashboard/alerts/new">
                            <Button className="gradient-primary">Créer une alerte</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <Card key={alert.id} className="border-border bg-card hover:border-primary/20 transition-all">
                            <CardContent className="flex items-start gap-4 py-5">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${alert.is_active ? "gradient-primary" : "bg-muted"}`}>
                                    {alert.is_active ? <Bell className="w-5 h-5 text-white" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="font-semibold">{alert.prefecture.name}</span>
                                        <Badge className={alert.is_active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-muted"}>
                                            {alert.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">{PROCEDURE_LABELS[alert.procedure_type]}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Période : {format(new Date(alert.date_from), "dd MMM yyyy", { locale: fr })} → {format(new Date(alert.date_to), "dd MMM yyyy", { locale: fr })}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Notif: {[alert.notif_email && "Email", alert.notif_sms && "SMS"].filter(Boolean).join(", ")} •
                                        Créée le {format(new Date(alert.created_at), "dd/MM/yyyy")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button variant="ghost" size="sm" onClick={() => toggleActive(alert)}
                                        className={alert.is_active ? "text-yellow-400 hover:text-yellow-300" : "text-green-400 hover:text-green-300"}>
                                        {alert.is_active ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Supprimer cette alerte ?</AlertDialogTitle>
                                                <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction className="bg-destructive hover:bg-red-700" onClick={() => deleteAlert(alert.id)}>
                                                    Supprimer
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
