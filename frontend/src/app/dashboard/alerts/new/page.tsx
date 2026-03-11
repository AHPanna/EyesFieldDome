"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { ArrowLeft, Loader2, Bell, MessageSquare, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { Prefecture, PROCEDURE_LABELS, ProcedureType } from "@/lib/types";

export default function NewAlertPage() {
    const router = useRouter();
    const { user, setAuth, token } = useAuthStore();
    const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
    const [loading, setLoading] = useState(false);
    const [prefectureId, setPrefectureId] = useState<string>("");
    const [procedureType, setProcedureType] = useState<string>("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifSms, setNotifSms] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");

    useEffect(() => {
        api.get<Prefecture[]>("/prefectures").then((r) => setPrefectures(r.data));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prefectureId || !procedureType) { toast.error("Veuillez remplir tous les champs"); return; }
        if (new Date(dateFrom) > new Date(dateTo)) { toast.error("La date de début doit être avant la date de fin"); return; }

        if ((user?.credits ?? 0) < 1) {
            toast.error("Vous n'avez pas assez de crédits");
            router.push("/dashboard/credits");
            return;
        }

        setLoading(true);
        try {
            await api.post("/alerts", {
                prefecture_id: parseInt(prefectureId),
                procedure_type: procedureType as ProcedureType,
                date_from: dateFrom,
                date_to: dateTo,
                notif_email: notifEmail,
                notif_sms: notifSms,
                phone_number: phoneNumber || null,
            });
            toast.success("Alerte créée ! -1 crédit");

            // Refresh user data (credits)
            if (token) {
                const userRes = await api.get("/users/me");
                setAuth(userRes.data, token);
            }

            router.push("/dashboard/alerts");
        } catch (err) {
            type ApiErr = { response?: { data?: { detail?: string }; status?: number } };
            const error = err as ApiErr;
            if (error.response?.status === 402) {
                toast.error("Crédits insuffisants");
                router.push("/dashboard/credits");
                return;
            }
            const msg = error.response?.data?.detail ?? "Erreur lors de la création";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl animate-fade-in-up">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />Retour
            </Button>

            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Nouvelle alerte</h1>
                    <p className="text-muted-foreground mt-1">Configurez votre surveillance de créneaux</p>
                </div>
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="py-2 px-4 flex items-center gap-2">
                        <Coins className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold">{user?.credits ?? 0}</span>
                        <span className="text-xs text-muted-foreground">crédits</span>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Paramètres de l&apos;alerte
                        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">-1 crédit</span>
                    </CardTitle>
                    <CardDescription>Vous serez notifié dès qu&apos;un créneau correspondant se libère</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Prefecture */}
                        <div className="space-y-2">
                            <Label>Préfecture</Label>
                            <Select value={prefectureId} onValueChange={(v: string | null) => setPrefectureId(v ?? "")}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Choisir une préfecture" /></SelectTrigger>
                                <SelectContent>
                                    {prefectures.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.department} — {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Procedure */}
                        <div className="space-y-2">
                            <Label>Type de démarche</Label>
                            <Select value={procedureType} onValueChange={(v: string | null) => setProcedureType(v ?? "")}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Choisir une démarche" /></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(PROCEDURE_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date_from">Date de début</Label>
                                <Input id="date_from" type="date" value={dateFrom}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setDateFrom(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_to">Date de fin</Label>
                                <Input id="date_to" type="date" value={dateTo}
                                    min={dateFrom || new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setDateTo(e.target.value)} required />
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="space-y-3">
                            <Label>Modes de notification</Label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:border-primary/30 transition-colors">
                                    <input type="checkbox" checked={notifEmail} onChange={(e) => setNotifEmail(e.target.checked)} className="w-4 h-4 accent-purple-500" />
                                    <Bell className="w-4 h-4 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <p className="text-xs text-muted-foreground">Notification à votre adresse email</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:border-primary/30 transition-colors">
                                    <input type="checkbox" checked={notifSms} onChange={(e) => setNotifSms(e.target.checked)} className="w-4 h-4 accent-purple-500" />
                                    <MessageSquare className="w-4 h-4 text-blue-400" />
                                    <div>
                                        <p className="text-sm font-medium">SMS</p>
                                        <p className="text-xs text-muted-foreground">Alerte par SMS (numéro requis)</p>
                                    </div>
                                </label>
                                {notifSms && (
                                    <Input placeholder="+33 6 XX XX XX XX" value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)} />
                                )}
                            </div>
                        </div>

                        <Button type="submit" className="w-full gradient-primary glow-sm" disabled={loading}>
                            {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                            Créer l&apos;alerte
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
